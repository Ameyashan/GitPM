import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isValidUsername } from "@/lib/validation";

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

    if (!isValidUsername(username)) {
      return NextResponse.json({ data: { available: false } });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Admin client bypasses RLS so we can check across all users
    const admin = createAdminClient();
    const { data } = await admin
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    // New sign-ups get a users row from the DB trigger (GitHub handle as username)
    // before onboarding completes — treat "taken by me" as still available.
    const available =
      !data || (user !== null && data.id === user.id);

    return NextResponse.json({ data: { available } });
  } catch (err) {
    console.error("check-username error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
