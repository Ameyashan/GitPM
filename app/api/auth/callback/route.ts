import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
