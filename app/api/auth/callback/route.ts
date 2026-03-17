import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData.user) {
    console.error("OAuth callback error:", sessionError?.message);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  const user = sessionData.user;

  // Persist the GitHub provider token to connected_accounts so it survives
  // Supabase session refreshes (provider_token is lost after the first refresh).
  const githubToken = sessionData.session?.provider_token;
  if (githubToken) {
    try {
      const admin = createAdminClient();
      const githubUsername =
        (user.user_metadata?.user_name as string | undefined) ?? null;
      const githubUserId =
        (user.user_metadata?.sub as string | undefined) ??
        user.identities?.[0]?.id ??
        user.id;

      await admin.from("connected_accounts").upsert(
        {
          user_id: user.id,
          provider: "github",
          provider_user_id: String(githubUserId),
          access_token: encrypt(githubToken),
          refresh_token: null,
          token_expires_at: null,
          provider_username: githubUsername,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );
    } catch (err) {
      // Non-fatal — the session provider_token will still work for this request
      console.error("[auth/callback] Failed to persist GitHub token:", err);
    }
  }

  // Check whether this user has completed onboarding (has a username set).
  // The DB trigger auto-inserts the users row on first sign-up using GitHub
  // metadata, but username may be a GitHub handle that could conflict, and
  // the headline/bio are still empty — so we always send new users through
  // onboarding to confirm their username and fill in their profile.
  const { data: profile } = await supabase
    .from("users")
    .select("username, headline")
    .eq("id", user.id)
    .single();

  // A user is considered "new" if they have no headline yet (the DB trigger
  // sets username from GitHub handle but leaves headline empty).
  const isNewUser = !profile?.headline;

  if (isNewUser) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
