import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardProjectActions } from "@/components/dashboard/DashboardProjectActions";
import { AddProjectButton } from "@/components/dashboard/AddProjectButton";
import { ExternalLink, Layers } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — GitPM" };

interface DashboardPageProps {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await searchParams; // consume to avoid unused warning
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, display_name, headline, avatar_url, github_username")
    .eq("id", user.id)
    .single();

  if (!profile?.headline) {
    redirect("/onboarding");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, slug, is_published, is_verified, thumbnail_url, live_url, github_repo_url, build_tools, hosting_platform, commit_count, latest_deploy_at, display_order, created_at"
    )
    .eq("user_id", user.id)
    .order("display_order", { ascending: true });

  // Read connected accounts for the modal source picker
  const { data: connectedAccounts } = await supabase
    .from("connected_accounts")
    .select("provider, provider_username")
    .eq("user_id", user.id);

  const vercelAccount = connectedAccounts?.find((a) => a.provider === "vercel");
  const githubAccount = connectedAccounts?.find((a) => a.provider === "github");

  const firstName = profile.display_name?.split(" ")[0] ?? profile.username ?? "there";
  const totalProjects = projects?.length ?? 0;
  const totalCommits = projects?.reduce((sum, p) => sum + (p.commit_count ?? 0), 0) ?? 0;
  const verifiedCount = projects?.filter((p) => p.is_verified).length ?? 0;

  return (
    <div className="w-full max-w-[880px] mx-auto px-5 py-8 sm:px-10">
      {/* Welcome banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "20px 24px",
          background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--white)" }}>
            Welcome back, {firstName}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-inverse-muted)", marginTop: "3px" }}>
            {totalProjects === 0
              ? "Add your first project to start building your verified portfolio."
              : `You have ${totalProjects} project${totalProjects !== 1 ? "s" : ""} and ${verifiedCount} are verified.`}
          </div>
        </div>
        {profile.username && (
          <Link
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--white)",
              color: "var(--navy)",
              border: "none",
              padding: "9px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <ExternalLink style={{ width: "13px", height: "13px" }} />
            View public profile
          </Link>
        )}
      </div>

      {/* Quick stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "28px",
        }}
      >
        {[
          { value: totalProjects, label: "Projects", teal: false },
          { value: totalCommits, label: "Commits", teal: false },
          { value: verifiedCount, label: "Verified", teal: true },
          { value: 0, label: "Views (7d)", teal: false },
        ].map(({ value, label, teal }) => (
          <div
            key={label}
            style={{
              padding: "16px",
              background: "var(--surface-light)",
              borderRadius: "var(--radius)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: teal ? "var(--teal)" : "var(--text-primary)",
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "2px",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Projects section */}
      <div
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          paddingBottom: "8px",
          borderBottom: "0.5px solid var(--border-light)",
          marginBottom: "12px",
        }}
      >
        Your projects
      </div>

      {/* Project list or empty state */}
      {!projects || projects.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            border: "0.5px solid var(--border-light)",
            borderRadius: "var(--radius)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--purple-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <Layers style={{ width: "20px", height: "20px", color: "var(--purple)" }} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>
            No projects yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", maxWidth: "280px" }}>
            Add your first shipped project to start building your verified portfolio.
          </p>
        </div>
      ) : (
        <DashboardProjectActions projects={projects} username={profile.username ?? ""} />
      )}

      {/* Add project button — opens unified modal */}
      <AddProjectButton
        vercelConnected={!!vercelAccount}
        vercelUsername={vercelAccount?.provider_username}
        githubUsername={githubAccount?.provider_username ?? profile.github_username}
      />
    </div>
  );
}
