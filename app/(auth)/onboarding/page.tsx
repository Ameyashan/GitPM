import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = { title: "Set Up Your Profile" };

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, display_name, headline, bio, linkedin_url, website_url, github_username, avatar_url")
    .eq("id", user.id)
    .single();

  // Already completed onboarding — go to dashboard
  if (profile?.headline) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 w-full">
      <div className="mb-10">
        <p className="text-sm font-mono text-teal mb-2">Step 1 of 1</p>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Set up your profile
        </h1>
        <p className="text-white/50 text-sm">
          This is your public portfolio. Keep it sharp.
        </p>
      </div>

      <OnboardingForm
        initialUsername={profile?.username ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
        initialGithubUsername={profile?.github_username ?? null}
        initialAvatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
