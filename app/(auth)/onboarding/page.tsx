import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = { title: "Set Up Your Profile — GitPM" };

const STEPS = [
  { label: "GitHub", status: "done" as const },
  { label: "Profile", status: "current" as const },
  { label: "First project", status: "upcoming" as const },
];

function StepIndicator() {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center">
          {/* Step pill */}
          <div
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors",
              step.status === "done"
                ? "bg-teal/15 text-teal"
                : step.status === "current"
                ? "bg-white/10 text-white"
                : "bg-transparent text-white/25",
            ].join(" ")}
          >
            {step.status === "done" ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <span
                className={[
                  "h-3.5 w-3.5 rounded-full border flex-shrink-0",
                  step.status === "current"
                    ? "border-white/50"
                    : "border-white/20",
                ].join(" ")}
              />
            )}
            {step.label}
          </div>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              className={[
                "h-px w-6 mx-1",
                i === 0 ? "bg-teal/40" : "bg-white/10",
              ].join(" ")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

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
    .select(
      "username, display_name, headline, bio, linkedin_url, website_url, github_username, avatar_url"
    )
    .eq("id", user.id)
    .single();

  // Already completed onboarding — go to dashboard
  if (profile?.headline) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 w-full">
      <div className="mb-10">
        <StepIndicator />
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
