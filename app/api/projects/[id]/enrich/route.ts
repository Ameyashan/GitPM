import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enrichRepoData, parseRepoFromUrl, GitHubRateLimitError, GitHubAuthError } from "@/lib/github";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
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

    // Load project and verify ownership
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("id, user_id, github_repo_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("[POST /api/projects/[id]/enrich] DB error:", fetchError.message);
      return NextResponse.json(
        { error: "Failed to fetch project", code: "db_error" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found", code: "not_found" },
        { status: 404 }
      );
    }

    if (!project.github_repo_url) {
      return NextResponse.json(
        {
          error: "Project has no linked GitHub repository",
          code: "no_github_repo",
        },
        { status: 400 }
      );
    }

    const parsed = parseRepoFromUrl(project.github_repo_url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL", code: "invalid_repo_url" },
        { status: 400 }
      );
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.provider_token;

    if (!token) {
      return NextResponse.json(
        {
          error: "GitHub token unavailable. Please sign out and sign in again.",
          code: "github_not_connected",
        },
        { status: 401 }
      );
    }

    let enrichment;
    try {
      enrichment = await enrichRepoData(token, parsed.owner, parsed.repo);
    } catch (err) {
      if (err instanceof GitHubRateLimitError) {
        const resetMsg = err.resetAt
          ? ` Try again after ${err.resetAt.toUTCString()}.`
          : "";
        return NextResponse.json(
          {
            error: `GitHub API rate limit exceeded.${resetMsg}`,
            code: "github_rate_limited",
          },
          { status: 429 }
        );
      }
      if (err instanceof GitHubAuthError) {
        return NextResponse.json(
          {
            error: "GitHub token is invalid or expired. Please sign out and sign in again.",
            code: "github_auth_error",
          },
          { status: 401 }
        );
      }
      throw err;
    }

    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({
        commit_count: enrichment.commit_count,
        first_commit_at: enrichment.first_commit_at,
        is_solo: enrichment.is_solo,
        tech_stack: enrichment.tech_stack,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("[POST /api/projects/[id]/enrich] Update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to save enrichment data", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedProject });
  } catch (err) {
    console.error("[POST /api/projects/[id]/enrich] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
