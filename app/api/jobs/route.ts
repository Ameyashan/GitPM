import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const roleType = searchParams.get("role_type"); // e.g. "Senior PM"
  const search = searchParams.get("search")?.trim() ?? "";

  let query = supabase
    .from("jobs")
    .select(
      "id, company_name, company_logo_url, role_title, role_type, location, remote, salary_min, salary_max, stack_tags, tools_tags, apply_url, posted_at"
    )
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .limit(200);

  if (roleType && roleType !== "All") {
    query = query.eq("role_type", roleType);
  }

  if (search) {
    query = query.or(
      `role_title.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[GET /api/jobs]", error.message);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
