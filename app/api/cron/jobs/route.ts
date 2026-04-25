import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPANIES } from "@/lib/jobs/companies";
import { fetchGreenhouse, fetchAshby, ParsedJob } from "@/lib/jobs/ats";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const allJobs: ParsedJob[] = [];
  const errors: string[] = [];

  await Promise.allSettled(
    COMPANIES.map(async (company) => {
      try {
        const jobs =
          company.source === "greenhouse"
            ? await fetchGreenhouse(company)
            : await fetchAshby(company);
        allJobs.push(...jobs);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${company.name}: ${msg}`);
        console.error(`[CRON jobs] ${company.name}`, err);
      }
    })
  );

  if (allJobs.length === 0) {
    return NextResponse.json({
      data: { upserted: 0, errors: errors.length, errorDetails: errors },
    });
  }

  // Mark all currently active jobs as inactive; we'll re-activate any that
  // still appear in this fetch (handled by the upsert below).
  await admin.from("jobs").update({ is_active: false }).eq("is_active", true);

  // Upsert in batches of 100 to stay within payload limits
  const BATCH = 100;
  let upserted = 0;

  for (let i = 0; i < allJobs.length; i += BATCH) {
    const batch = allJobs.slice(i, i + BATCH).map((j) => ({
      ...j,
      is_active: true,
      fetched_at: new Date().toISOString(),
    }));

    const { error } = await admin
      .from("jobs")
      .upsert(batch, { onConflict: "source,source_id", ignoreDuplicates: false });

    if (error) {
      console.error("[CRON jobs] upsert error:", error.message);
      errors.push(`upsert batch ${i / BATCH}: ${error.message}`);
    } else {
      upserted += batch.length;
    }
  }

  return NextResponse.json({
    data: { upserted, errors: errors.length, errorDetails: errors },
  });
}
