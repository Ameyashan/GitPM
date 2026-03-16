import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOAuthAuthorizeUrl } from "@/lib/vercel";
import { randomUUID } from "crypto";

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

    const state = randomUUID();
    const authorizeUrl = await getOAuthAuthorizeUrl(state);

    const response = NextResponse.redirect(authorizeUrl);

    // Store state in a short-lived httpOnly cookie to validate on callback
    response.cookies.set("vercel_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[GET /api/auth/vercel/connect] Error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connections?error=connect_failed`
    );
  }
}
