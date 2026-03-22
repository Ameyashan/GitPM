import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getGitHubToken,
  getUserRepos,
  GitHubApiError,
  GitHubRateLimitError,
} from "@/lib/github";

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
          error: "GitHub not connected. Please sign out and sign in again with GitHub.",
          code: "github_not_connected",
        },
        { status: 401 }
      );
    }

    const repos = await getUserRepos(token);

    return NextResponse.json({ data: repos });
  } catch (err) {
    if (err instanceof GitHubRateLimitError) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded", code: "github_rate_limit" },
        { status: 429 }
      );
    }
    if (err instanceof GitHubApiError && err.status === 503) {
      return NextResponse.json(
        { error: "GitHub is temporarily unavailable", code: "github_unavailable" },
        { status: 503 }
      );
    }
    console.error("[GET /api/github/repos] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories", code: "github_error" },
      { status: 500 }
    );
  }
}
