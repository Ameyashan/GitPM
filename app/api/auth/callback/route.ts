import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  // Capture cookies Supabase wants to set so we can attach them directly to
  // the redirect response. Using `createClient()` from lib/supabase/server
  // (which writes via next/headers) risks losing the session cookies when the
  // handler returns a NextResponse — Next.js does not guarantee that cookies
  // set via next/headers are forwarded to an explicit NextResponse object.
  const cookiesToSet: Array<{ name: string; value: string; options: Parameters<NextResponse["cookies"]["set"]>[2] }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(incoming) {
          cookiesToSet.push(...incoming);
        },
      },
    }
  );

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

  // Check whether this user has completed onboarding (has a headline set).
  // The DB trigger auto-inserts the users row on first sign-up using GitHub
  // metadata, but headline is always empty — so new users go to onboarding.
  const { data: profile } = await supabase
    .from("users")
    .select("username, headline")
    .eq("id", user.id)
    .single();

  const isNewUser = !profile?.headline;
  const destination = isNewUser
    ? `${origin}/onboarding`
    : `${origin}/dashboard`;

  const response = NextResponse.redirect(destination);

  // Apply the session cookies directly to the redirect response so the browser
  // receives them and the middleware can authenticate the next request.
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
