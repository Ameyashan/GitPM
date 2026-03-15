// Lovable repo detection logic — implemented in Ticket 7
// Detects Lovable projects via GitHub repos (no extra OAuth needed)

import type { GitHubRepo } from "@/types/github";

const LOVABLE_PATTERNS = {
  repoNamePrefix: "lovable-",
  configFiles: ["lovable.config.ts", ".lovable/config.json"],
  deploymentDomain: ".lovable.app",
};

export function isLovableRepo(repo: GitHubRepo): boolean {
  return (
    repo.name.startsWith(LOVABLE_PATTERNS.repoNamePrefix) ||
    (repo.homepage?.includes(LOVABLE_PATTERNS.deploymentDomain) ?? false)
  );
}

export function matchesLovableDeployment(
  repo: GitHubRepo,
  liveUrl: string
): boolean {
  if (!liveUrl.includes(LOVABLE_PATTERNS.deploymentDomain)) return false;
  return (
    repo.homepage === liveUrl ||
    liveUrl.includes(repo.name.replace(LOVABLE_PATTERNS.repoNamePrefix, ""))
  );
}

export function filterLovableRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos.filter(isLovableRepo);
}
