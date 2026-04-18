import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGitHubToken, getWeeklyActivityGrid } from "@/lib/github";

export async function POST(): Promise<NextResponse> {
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

  // Load the authenticated user's row to get their github_username
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("github_username")
    .eq("id", user.id)
    .maybeSingle();

  if (userError) {
    return NextResponse.json(
      { error: "Failed to load user", code: "db_error" },
      { status: 500 }
    );
  }

  if (!userRow?.github_username) {
    return NextResponse.json(
      { error: "No GitHub username on record", code: "no_github_username" },
      { status: 400 }
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

  try {
    const grid = await getWeeklyActivityGrid(token, userRow.github_username);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        github_contributions: grid,
        github_contributions_synced_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save activity", code: "db_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { grid } });
  } catch (err) {
    console.error("[sync-activity]", err);
    return NextResponse.json(
      { error: "Failed to fetch GitHub activity", code: "github_error" },
      { status: 500 }
    );
  }
}
