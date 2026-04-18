// GitHub API helpers
// Uses OAuth token from Supabase Auth session (provider_token),
// with fallback to the encrypted token stored in connected_accounts.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GitHubCommit, GitHubLanguages, GitHubRepo, GitHubUser } from "@/types/github";
import type { Database } from "@/types/database";
import { decrypt } from "@/lib/crypto";

const GITHUB_API = "https://api.github.com";

// Key dependency names to detect from package.json
const KNOWN_FRAMEWORKS = [
  "next",
  "react",
  "vue",
  "svelte",
  "angular",
  "nuxt",
  "remix",
  "astro",
  "vite",
  "express",
  "fastify",
  "nestjs",
  "prisma",
  "drizzle-orm",
  "tailwindcss",
  "supabase",
  "trpc",
  "graphql",
  "stripe",
  "openai",
  "langchain",
];

export interface RepoEnrichment {
  commit_count: number;
  first_commit_at: string | null;
  is_solo: boolean;
  tech_stack: string[];
}

export class GitHubRateLimitError extends Error {
  constructor(public readonly resetAt: Date | null) {
    super("GitHub API rate limit exceeded");
    this.name = "GitHubRateLimitError";
  }
}

export class GitHubAuthError extends Error {
  constructor() {
    super("GitHub token is invalid or expired");
    this.name = "GitHubAuthError";
  }
}

/** Non-auth GitHub API failure (e.g. 5xx) — callers may map to HTTP status. */
export class GitHubApiError extends Error {
  constructor(public readonly status: number) {
    super(`GitHub API error: ${status}`);
    this.name = "GitHubApiError";
  }
}

/**
 * Maps package.json dependencies to recognized framework/tool names (same rules as
 * {@link getPackageJsonTechStack}).
 */
export function parseTechStack(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): string[] {
  const allDeps = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ];

  return KNOWN_FRAMEWORKS.filter((fw) =>
    allDeps.some((dep) => dep === fw || dep.startsWith(`@${fw}/`) || dep === `@${fw}`)
  );
}

/**
 * Resolves the GitHub OAuth token for the authenticated user.
 * Tries session.provider_token first (available right after sign-in),
 * then falls back to the encrypted token stored in connected_accounts
 * (persisted at every sign-in to survive Supabase session refreshes).
 * Returns null if no token is available.
 */
export async function getGitHubToken(
  supabase: SupabaseClient<Database>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("provider", "github")
    .maybeSingle();

  if (account?.access_token) {
    try {
      return decrypt(account.access_token);
    } catch {
      // fall through to session provider_token
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.provider_token ?? null;
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function assertOk(res: Response): void {
  if (res.ok) return;
  if (res.status === 401) throw new GitHubAuthError();
  if (res.status === 403 || res.status === 429) {
    const resetHeader = res.headers.get("x-ratelimit-reset");
    const resetAt = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000) : null;
    throw new GitHubRateLimitError(resetAt);
  }
  throw new GitHubApiError(res.status);
}

export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(token),
  });
  assertOk(res);
  return res.json() as Promise<GitHubUser>;
}

export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=pushed&affiliation=owner`, {
    headers: githubHeaders(token),
  });
  assertOk(res);
  return res.json() as Promise<GitHubRepo[]>;
}

/**
 * Uses GitHub's commit search API to find repos that have commits by the
 * Lovable bot ("lovable-dev[bot]" / committer-name "Lovable").
 * Returns a Set of full repo names ("owner/repo") for O(1) lookup.
 * Non-fatal — returns an empty set on any API error.
 */
export async function getLovableCommitRepos(
  token: string,
  username: string
): Promise<Set<string>> {
  try {
    // Search by committer-name catches both "Lovable" and "lovable-dev[bot]" display names.
    // We scope to the authenticated user's repos with user: qualifier.
    const query = encodeURIComponent(`committer-name:Lovable user:${username}`);
    const res = await fetch(
      `${GITHUB_API}/search/commits?q=${query}&per_page=100`,
      { headers: githubHeaders(token) }
    );

    if (!res.ok) return new Set();

    const data = (await res.json()) as {
      items: Array<{ repository: { full_name: string } }>;
    };

    return new Set(data.items.map((item) => item.repository.full_name));
  } catch {
    return new Set();
  }
}

export async function getRepoCommits(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubCommit[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=100`,
    { headers: githubHeaders(token) }
  );
  assertOk(res);
  return res.json() as Promise<GitHubCommit[]>;
}

/**
 * Returns the total number of commits on the repo's default branch via
 * GitHub's GraphQL API — accurate for repos with >100 commits, unlike
 * counting a paginated REST response.
 * Throws {@link GitHubAuthError} / {@link GitHubApiError} on failures.
 */
export async function getRepoCommitCount(
  token: string,
  owner: string,
  repo: string
): Promise<number> {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        defaultBranchRef {
          target { ... on Commit { history { totalCount } } }
        }
      }
    }
  `;
  const res = await fetch(`${GITHUB_API}/graphql`, {
    method: "POST",
    headers: { ...githubHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { owner, repo } }),
  });
  assertOk(res);
  const payload = (await res.json()) as {
    data?: {
      repository?: {
        defaultBranchRef?: {
          target?: { history?: { totalCount?: number } };
        } | null;
      } | null;
    };
  };
  return payload.data?.repository?.defaultBranchRef?.target?.history?.totalCount ?? 0;
}

export async function getRepoLanguages(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubLanguages> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers: githubHeaders(token),
  });
  assertOk(res);
  return res.json() as Promise<GitHubLanguages>;
}

/**
 * Extracts { owner, repo } from a GitHub repository URL.
 * Handles https://github.com/owner/repo and https://github.com/owner/repo.git
 */
export function parseRepoFromUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

/**
 * Fetches package.json from the repo's default branch and returns
 * an array of recognized framework/library names found in dependencies.
 * Returns an empty array if the file doesn't exist or can't be parsed.
 */
export async function getPackageJsonTechStack(
  token: string,
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`, {
      headers: githubHeaders(token),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as { content?: string; encoding?: string };
    if (!data.content || data.encoding !== "base64") return [];

    const decoded = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const pkg = JSON.parse(decoded) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return parseTechStack(pkg);
  } catch {
    return [];
  }
}

const CONTRIBUTION_LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function utcDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Fetches the user's daily commit contributions for the past 12 weeks via
 * GitHub's GraphQL contributionsCollection API and returns an 84-cell grid
 * (12 columns × 7 rows, newest column on the right) with levels 0–4
 * matching GitHub's own heatmap quantiles.
 *
 * Requires any user's OAuth token (does not need to match the queried user).
 * Returns an all-zero grid on failure so callers can render a placeholder.
 */
export async function getWeeklyActivityGrid(
  token: string,
  username: string
): Promise<number[]> {
  const WEEKS = 12;
  const DAYS = 7;
  const TOTAL_CELLS = WEEKS * DAYS; // 84
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Anchor the window to UTC midnight of "today" so the grid is stable
  // regardless of the server's local timezone, and matches the UTC dates
  // GitHub returns in the contributionCalendar.
  const todayMs = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  const fromMs = todayMs - (TOTAL_CELLS - 1) * DAY_MS;

  const byDate = new Map<string, number>();
  for (let i = 0; i < TOTAL_CELLS; i++) {
    byDate.set(utcDateKey(fromMs + i * DAY_MS), 0);
  }

  try {
    const query = `
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;
    const res = await fetch(`${GITHUB_API}/graphql`, {
      method: "POST",
      headers: { ...githubHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: new Date(fromMs).toISOString(),
          to: new Date(todayMs + DAY_MS - 1).toISOString(),
        },
      }),
    });

    if (res.ok) {
      const payload = (await res.json()) as {
        data?: {
          user?: {
            contributionsCollection?: {
              contributionCalendar?: {
                weeks?: Array<{
                  contributionDays?: Array<{ date: string; contributionLevel: string }>;
                }>;
              };
            };
          } | null;
        };
      };
      const weeks =
        payload.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
      for (const week of weeks) {
        for (const day of week.contributionDays ?? []) {
          if (!byDate.has(day.date)) continue;
          byDate.set(day.date, CONTRIBUTION_LEVELS[day.contributionLevel] ?? 0);
        }
      }
    }
  } catch {
    // Non-fatal — return all zeros; caller will fall back to placeholder
  }

  return Array.from(byDate.values());
}

/**
 * Fetches commits, languages, and package.json in parallel and returns
 * enrichment data for a project. Commit count is capped at 100 (MVP).
 */
export async function enrichRepoData(
  token: string,
  owner: string,
  repo: string
): Promise<RepoEnrichment> {
  const [commits, commitCount, languages, pkgStack] = await Promise.all([
    getRepoCommits(token, owner, repo).catch(() => [] as GitHubCommit[]),
    getRepoCommitCount(token, owner, repo).catch(() => null),
    getRepoLanguages(token, owner, repo).catch(() => ({} as GitHubLanguages)),
    getPackageJsonTechStack(token, owner, repo),
  ]);

  // Prefer the GraphQL total (accurate for >100 commits); fall back to the
  // paginated REST length only if the GraphQL call failed.
  const commit_count = commitCount ?? commits.length;

  // Oldest commit is last in the array (GitHub returns newest first)
  const oldestCommit = commits[commits.length - 1];
  const first_commit_at = oldestCommit?.commit?.author?.date ?? null;

  // Solo if every commit with a known author login shares the same login
  const authorLogins = commits
    .map((c) => c.author?.login)
    .filter((login): login is string => Boolean(login));
  const uniqueAuthors = new Set(authorLogins);
  const is_solo = uniqueAuthors.size <= 1;

  // Tech stack: top languages + framework deps from package.json
  const languageNames = Object.keys(languages).slice(0, 5);
  const tech_stack = Array.from(new Set([...languageNames, ...pkgStack]));

  return { commit_count, first_commit_at, is_solo, tech_stack };
}
