import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export const metadata: Metadata = { title: "Profile Settings — GitPM" };

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, display_name, headline, bio, linkedin_url, website_url, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ maxWidth: "680px", padding: "40px 32px", width: "100%", margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 500,
            letterSpacing: "-0.3px",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Profile settings
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginTop: "6px",
            marginBottom: 0,
          }}
        >
          Update your public profile information.
        </p>
      </div>

      <SettingsForm
        username={profile?.username ?? ""}
        displayName={profile?.display_name ?? ""}
        headline={profile?.headline ?? ""}
        bio={profile?.bio ?? ""}
        linkedinUrl={profile?.linkedin_url ?? ""}
        websiteUrl={profile?.website_url ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
