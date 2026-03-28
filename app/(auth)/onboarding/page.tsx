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
    <div style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}>
      {STEPS.map((step, i) => (
        <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
          {/* Step pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              transition: "all 0.15s",
              ...(step.status === "done"
                ? { background: "var(--teal-bg)", color: "var(--teal)" }
                : step.status === "current"
                ? {
                    background: "var(--surface-light)",
                    color: "var(--text-primary)",
                    border: "0.5px solid var(--border-light)",
                  }
                : { background: "transparent", color: "var(--text-muted)" }),
            }}
          >
            {step.status === "done" ? (
              <CheckCircle size={13} />
            ) : (
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  border: `1.5px solid ${
                    step.status === "current"
                      ? "var(--text-secondary)"
                      : "var(--border-light)"
                  }`,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
            )}
            {step.label}
          </div>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              style={{
                height: "1px",
                width: "24px",
                margin: "0 4px",
                background:
                  i === 0 ? "var(--teal-bg)" : "var(--border-light)",
              }}
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
    <div style={{ maxWidth: "560px", padding: "40px 32px", width: "100%", margin: "0 auto" }}>
      <div>
        <StepIndicator />
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 500,
            letterSpacing: "-0.3px",
            color: "var(--text-primary)",
            margin: "0 0 6px",
          }}
        >
          One line to get started
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            margin: "0 0 32px",
          }}
        >
          Pick a username and write your headline. You&apos;ll appear on the homepage right away — bio and links can wait.
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
