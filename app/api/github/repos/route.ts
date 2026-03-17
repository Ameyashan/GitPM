import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRepos, getGitHubToken } from "@/lib/github";

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
    console.error("[GET /api/github/repos] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories", code: "github_error" },
      { status: 500 }
    );
  }
}
