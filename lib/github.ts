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
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.provider_token) {
    return session.provider_token;
  }

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

  if (!account?.access_token) return null;

  try {
    return decrypt(account.access_token);
  } catch {
    return null;
  }
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
  throw new Error(`GitHub API error: ${res.status}`);
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

    const allDeps = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ];

    return KNOWN_FRAMEWORKS.filter((fw) =>
      allDeps.some((dep) => dep === fw || dep.startsWith(`@${fw}/`) || dep === `@${fw}`)
    );
  } catch {
    return [];
  }
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
  const [commits, languages, pkgStack] = await Promise.all([
    getRepoCommits(token, owner, repo).catch(() => [] as GitHubCommit[]),
    getRepoLanguages(token, owner, repo).catch(() => ({} as GitHubLanguages)),
    getPackageJsonTechStack(token, owner, repo),
  ]);

  const commit_count = commits.length;

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
