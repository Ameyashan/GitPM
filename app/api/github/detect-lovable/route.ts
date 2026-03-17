import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRepos, getGitHubToken } from "@/lib/github";
import { filterLovableRepos } from "@/lib/lovable";

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
        { error: "GitHub token unavailable — please sign in again", code: "no_github_token" },
        { status: 400 }
      );
    }

    const repos = await getUserRepos(token);
    const lovableRepos = filterLovableRepos(repos);

    return NextResponse.json({ data: lovableRepos });
  } catch (err) {
    console.error("[GET /api/github/detect-lovable] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 }
    );
  }
}
