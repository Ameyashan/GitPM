import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRepos } from "@/lib/github";
import { filterLovableRepos } from "@/lib/lovable";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    const token = session.provider_token;
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
