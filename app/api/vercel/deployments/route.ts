import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVercelDeployments } from "@/lib/vercel";
import { decrypt } from "@/lib/crypto";

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

    const { data: account, error: accountError } = await supabase
      .from("connected_accounts")
      .select("access_token")
      .eq("user_id", user.id)
      .eq("provider", "vercel")
      .maybeSingle();

    if (accountError) {
      console.error("[GET /api/vercel/deployments] DB error:", accountError.message);
      return NextResponse.json(
        { error: "Failed to look up Vercel connection", code: "db_error" },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: "Vercel is not connected", code: "vercel_not_connected" },
        { status: 400 }
      );
    }

    const token = decrypt(account.access_token);
    const deployments = await getVercelDeployments(token);

    return NextResponse.json({ data: deployments });
  } catch (err) {
    console.error("[GET /api/vercel/deployments] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Vercel deployments", code: "vercel_error" },
      { status: 500 }
    );
  }
}
