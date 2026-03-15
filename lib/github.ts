// GitHub API helpers — implemented in Ticket 5
// Uses OAuth token from Supabase Auth session (provider_token)

import type { GitHubCommit, GitHubLanguages, GitHubRepo, GitHubUser } from "@/types/github";

const GITHUB_API = "https://api.github.com";

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json() as Promise<GitHubUser>;
}

export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated`, {
    headers: githubHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json() as Promise<GitHubRepo[]>;
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
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
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
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json() as Promise<GitHubLanguages>;
}
