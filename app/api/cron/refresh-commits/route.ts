import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import {
  getRepoCommitCount,
  parseRepoFromUrl,
  GitHubAuthError,
  GitHubRateLimitError,
} from "@/lib/github";

// Vercel cron: refreshes commit counts for published projects with a linked
// GitHub repo. Uses the project owner's encrypted OAuth token.
export const maxDuration = 60;

const BATCH_SIZE = 25;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized", code: "unauthorized" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();

  // Oldest-updated first so every project rotates through over successive runs.
  const { data: projects, error: fetchError } = await admin
    .from("projects")
    .select("id, user_id, github_repo_url")
    .eq("is_published", true)
    .not("github_repo_url", "is", null)
    .order("updated_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error("[CRON refresh-commits] Fetch error:", fetchError.message);
    return NextResponse.json(
      { error: "Failed to fetch projects", code: "db_error" },
      { status: 500 }
    );
  }

  if (!projects || projects.length === 0) {
    return NextResponse.json({ data: { processed: 0, errors: 0 } });
  }

  // Cache decrypted tokens per user_id so we don't re-decrypt for each project.
  const tokenByUser = new Map<string, string | null>();
  async function tokenFor(userId: string): Promise<string | null> {
    if (tokenByUser.has(userId)) return tokenByUser.get(userId) ?? null;
    const { data } = await admin
      .from("connected_accounts")
      .select("access_token")
      .eq("user_id", userId)
      .eq("provider", "github")
      .maybeSingle();
    let token: string | null = null;
    if (data?.access_token) {
      try {
        token = decrypt(data.access_token);
      } catch {
        token = null;
      }
    }
    tokenByUser.set(userId, token);
    return token;
  }

  let processed = 0;
  let errors = 0;
  let skipped = 0;

  for (const project of projects) {
    if (!project.github_repo_url) continue;
    const parsed = parseRepoFromUrl(project.github_repo_url);
    if (!parsed) {
      skipped++;
      continue;
    }

    const token = await tokenFor(project.user_id);
    if (!token) {
      skipped++;
      continue;
    }

    try {
      const commit_count = await getRepoCommitCount(token, parsed.owner, parsed.repo);
      const { error: updateError } = await admin
        .from("projects")
        .update({ commit_count, updated_at: new Date().toISOString() })
        .eq("id", project.id);
      if (updateError) {
        errors++;
      } else {
        processed++;
      }
    } catch (err) {
      if (err instanceof GitHubRateLimitError) {
        // Stop early — no point burning more requests this run.
        console.warn("[CRON refresh-commits] Rate limited, stopping batch");
        break;
      }
      if (err instanceof GitHubAuthError) {
        // Invalidate the cached token so later projects for this user don't retry.
        tokenByUser.set(project.user_id, null);
        skipped++;
        continue;
      }
      console.error(`[CRON refresh-commits] ${project.id}`, err);
      errors++;
    }
  }

  return NextResponse.json({
    data: { processed, errors, skipped, total: projects.length },
  });
}
