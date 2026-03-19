import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ConnectionsManager } from "@/components/dashboard/ConnectionsManager";

export const metadata: Metadata = { title: "Connected Accounts — GitPM" };

export default async function ConnectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("github_username, created_at")
    .eq("id", user.id)
    .single();

  const { data: vercelAccount } = await supabase
    .from("connected_accounts")
    .select("provider_username, connected_at")
    .eq("user_id", user.id)
    .eq("provider", "vercel")
    .maybeSingle();

  // Count Lovable-detected projects
  const { count: lovableCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("hosting_platform", "lovable");

  const initialVercel = vercelAccount
    ? {
        username: vercelAccount.provider_username,
        connectedAt: vercelAccount.connected_at,
      }
    : null;

  return (
    <div style={{ maxWidth: "680px", padding: "40px 32px", width: "100%" }}>
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
          Connected accounts
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginTop: "6px",
            marginBottom: 0,
          }}
        >
          Connect your deployment platforms to verify project ownership and
          auto-populate project data.
        </p>
      </div>

      {/* Connection cards — 2-column grid */}
      <Suspense fallback={<ConnectionsSkeleton />}>
        <ConnectionsManager
          githubUsername={profile?.github_username ?? null}
          githubConnectedAt={profile?.created_at ?? null}
          initialVercel={initialVercel}
          lovableCount={lovableCount ?? 0}
        />
      </Suspense>
    </div>
  );
}

function ConnectionsSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: "110px",
            border: "0.5px solid var(--border-light)",
            borderRadius: "10px",
            background: "var(--surface-light)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}
