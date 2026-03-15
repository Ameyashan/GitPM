import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "username query param is required", code: "MISSING_PARAM" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      return NextResponse.json({ data: { available: false } });
    }

    // Admin client bypasses RLS so we can check across all users
    const admin = createAdminClient();
    const { data } = await admin
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    return NextResponse.json({ data: { available: !data } });
  } catch (err) {
    console.error("check-username error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
