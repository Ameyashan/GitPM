import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateThumbnail } from "@/lib/thumbnails";

// Vercel cron: runs every 6 hours (configured in vercel.json)
// Processes up to 10 published projects that lack a thumbnail per run.
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized", code: "unauthorized" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();

  const { data: projects, error: fetchError } = await admin
    .from("projects")
    .select("id, live_url, name")
    .is("thumbnail_url", null)
    .not("live_url", "is", null)
    .eq("is_published", true)
    .limit(10);

  if (fetchError) {
    console.error("[CRON /api/cron/thumbnails] Fetch error:", fetchError.message);
    return NextResponse.json(
      { error: "Failed to fetch projects", code: "db_error" },
      { status: 500 }
    );
  }

  if (!projects || projects.length === 0) {
    return NextResponse.json({ data: { processed: 0, errors: 0, message: "No projects need thumbnails" } });
  }

  let processed = 0;
  let errors = 0;

  for (const project of projects) {
    if (!project.live_url) continue;

    try {
      const result = await generateThumbnail(project.live_url, project.id, admin);

      const { error: updateError } = await admin
        .from("projects")
        .update({ thumbnail_url: result.url })
        .eq("id", project.id);

      if (updateError) {
        console.error(`[CRON thumbnails] DB update failed for project ${project.id}:`, updateError.message);
        errors++;
      } else {
        processed++;
      }
    } catch (err) {
      console.error(`[CRON thumbnails] generateThumbnail failed for project ${project.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({
    data: { processed, errors, total: projects.length },
  });
}
