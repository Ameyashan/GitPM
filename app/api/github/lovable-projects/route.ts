import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRepos, getGitHubToken, getLovableCommitRepos } from "@/lib/github";
import { isLovableRepo } from "@/lib/lovable";

export interface LovableProjectSummary {
  id: number;
  name: string;
  fullName: string;
  liveUrl: string | null;
  githubRepoUrl: string;
  isPrivate: boolean;
  lovableDetected: boolean;
  alreadyImported: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    const token = await getGitHubToken(supabase);

    if (!token) {
      return NextResponse.json(
        {
          error: "GitHub token unavailable. Please sign out and sign in again.",
          code: "github_not_connected",
        },
        { status: 401 }
      );
    }

    // Get the GitHub username from connected_accounts (stored at sign-in)
    const { data: githubAccount } = await supabase
      .from("connected_accounts")
      .select("provider_username")
      .eq("user_id", user.id)
      .eq("provider", "github")
      .maybeSingle();

    const githubUsername = githubAccount?.provider_username ?? null;

    // Run all three fetches in parallel: repos, Lovable commit search, existing projects
    const [allRepos, lovableCommitRepos, existingProjectsResult] =
      await Promise.all([
        getUserRepos(token),
        githubUsername
          ? getLovableCommitRepos(token, githubUsername)
          : Promise.resolve(new Set<string>()),
        supabase
          .from("projects")
          .select("github_repo_url, live_url")
          .eq("user_id", user.id),
      ]);

    const { data: existingProjects } = existingProjectsResult;

    const importedRepoUrls = new Set(
      (existingProjects ?? [])
        .map((p) => p.github_repo_url?.toLowerCase().replace(/\/$/, ""))
        .filter(Boolean)
    );
    const importedLiveUrls = new Set(
      (existingProjects ?? [])
        .map((p) => p.live_url?.toLowerCase().replace(/\/$/, ""))
        .filter(Boolean)
    );

    const summaries: LovableProjectSummary[] = allRepos.map((repo) => {
      const liveUrl = repo.homepage ?? null;
      const repoNorm = repo.html_url.toLowerCase().replace(/\/$/, "");
      const liveNorm = liveUrl?.toLowerCase().replace(/\/$/, "") ?? "";

      const alreadyImported =
        importedRepoUrls.has(repoNorm) ||
        (liveNorm ? importedLiveUrls.has(liveNorm) : false);

      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        liveUrl,
        githubRepoUrl: repo.html_url,
        isPrivate: repo.private,
        // Detected via metadata (name/topic/description) OR via commit author search
        lovableDetected:
          isLovableRepo(repo) || lovableCommitRepos.has(repo.full_name),
        alreadyImported,
      };
    });

    // Sort: Lovable-detected first, then alphabetically within each group
    summaries.sort((a, b) => {
      if (a.lovableDetected !== b.lovableDetected) {
        return a.lovableDetected ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ data: summaries });
  } catch (err) {
    console.error("[GET /api/github/lovable-projects] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Lovable projects", code: "github_error" },
      { status: 500 }
    );
  }
}
