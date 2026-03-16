import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  exchangeCodeForToken,
  getVercelUser,
  verifyProjectsAgainstDeployments,
} from "@/lib/vercel";
import { encrypt } from "@/lib/crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // User denied access on Vercel
  if (errorParam) {
    console.warn("[vercel/callback] User denied Vercel authorization:", errorParam);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/connections?error=access_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${APP_URL}/dashboard/connections?error=missing_params`
    );
  }

  // Validate CSRF state against the cookie
  const supabase = await createClient();

  // Read the state cookie from the incoming request headers
  const cookieHeader = request.headers.get("cookie") ?? "";
  const stateCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("vercel_oauth_state="))
    ?.split("=")[1];

  if (!stateCookie || stateCookie !== state) {
    console.error("[vercel/callback] State mismatch — possible CSRF");
    return NextResponse.redirect(
      `${APP_URL}/dashboard/connections?error=state_mismatch`
    );
  }

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/dashboard/connections?error=unauthorized`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);

    // Fetch Vercel user profile
    const vercelUser = await getVercelUser(tokenResponse.access_token);

    // Encrypt the token before storing
    const encryptedToken = encrypt(tokenResponse.access_token);

    // Upsert into connected_accounts (one row per provider per user)
    const admin = createAdminClient();
    const { error: upsertError } = await admin
      .from("connected_accounts")
      .upsert(
        {
          user_id: user.id,
          provider: "vercel",
          provider_user_id: vercelUser.id,
          access_token: encryptedToken,
          refresh_token: null,
          token_expires_at: null,
          provider_username: vercelUser.username,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      console.error("[vercel/callback] Failed to store token:", upsertError.message);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/connections?error=token_storage_failed`
      );
    }

    // Auto-verify all existing projects against Vercel deployments
    await autoVerifyProjects(user.id, tokenResponse.access_token, admin);

    // Clear the state cookie and redirect to connections page
    const response = NextResponse.redirect(
      `${APP_URL}/dashboard/connections?connected=vercel`
    );
    response.cookies.set("vercel_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[vercel/callback] Unexpected error:", err);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/connections?error=callback_failed`
    );
  }
}

async function autoVerifyProjects(
  userId: string,
  plainToken: string,
  admin: ReturnType<typeof createAdminClient>
): Promise<void> {
  try {
    const { data: projects } = await admin
      .from("projects")
      .select("id, live_url")
      .eq("user_id", userId)
      .not("live_url", "is", null);

    if (!projects || projects.length === 0) return;

    const matches = await verifyProjectsAgainstDeployments(plainToken, projects);

    for (const [projectId, deployData] of Array.from(matches.entries())) {
      await admin
        .from("projects")
        .update({
          is_verified: true,
          verification_method: "vercel_oauth",
          hosting_platform: "vercel",
          latest_deploy_at: deployData.latestDeployAt,
        })
        .eq("id", projectId)
        .eq("user_id", userId);
    }

    console.info(
      `[vercel/callback] Auto-verified ${matches.size}/${projects.length} projects for user ${userId}`
    );
  } catch (err) {
    // Non-fatal — verification can be retried manually
    console.error("[vercel/callback] Auto-verification failed:", err);
  }
}
