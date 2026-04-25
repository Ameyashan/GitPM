// Always fetch fresh data — profile and project edits must be
// visible immediately without waiting for a cache revalidation cycle.
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublishedProjects, getUserByUsername } from "@/lib/supabase/profile-queries";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AggregateStats } from "@/components/profile/AggregateStats";
import { TrustTierCard } from "@/components/profile/TrustTierCard";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { ProjectGrid } from "@/components/profile/ProjectGrid";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const admin = createAdminClient();

  const user = await getUserByUsername(admin, username);

  if (!user) {
    return { title: "Profile not found — GitPM" };
  }

  const displayName = user.display_name ?? username;
  const description = user.headline ?? `${displayName}'s project portfolio on GitPM`;

  return {
    title: `${displayName} — GitPM`,
    description,
    openGraph: {
      title: `${displayName} — GitPM`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} — GitPM`,
      description,
    },
  };
}

function tierFor(verifiedCount: number): string {
  if (verifiedCount >= 5) return "Verified Builder";
  if (verifiedCount >= 1) return "Active Builder";
  return "Getting Started";
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const admin = createAdminClient();

  const user = await getUserByUsername(admin, username);

  if (!user) {
    notFound();
  }

  const publishedProjects = await getPublishedProjects(admin, user.id);

  await admin.rpc("increment_profile_view", { p_user_id: user.id });
  revalidatePath(`/${username}`);
  revalidatePath("/dashboard");

  // Aggregate stats
  const totalCommits = publishedProjects.reduce(
    (sum, p) => sum + (p.commit_count ?? 0),
    0
  );
  const verifiedCount = publishedProjects.filter((p) => p.is_verified).length;
  const tierLabel = tierFor(verifiedCount);

  // Projects added in the last 90 days
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const newProjectsThisQuarter = publishedProjects.filter(
    (p) => new Date(p.created_at).getTime() >= ninetyDaysAgo
  ).length;

  // Skill pills aggregated from project category_tags (top 5 by frequency)
  const tagCounts: Record<string, number> = {};
  for (const project of publishedProjects) {
    for (const tag of project.category_tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const skillPills = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  // Verification sources for hero ribbon
  const hasVercelProjects = publishedProjects.some(
    (p) =>
      p.hosting_platform === "vercel" || p.verification_method === "vercel_oauth"
  );
  const verifiedSources: string[] = [];
  if (user.github_username) verifiedSources.push("GitHub");
  if (hasVercelProjects) verifiedSources.push("Vercel");

  const lastUpdated = user.updated_at
    ? new Date(user.updated_at)
    : new Date(user.created_at);
  const daysSinceUpdate = Math.floor(
    (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );
  const lastUpdatedLabel =
    daysSinceUpdate === 0
      ? "today"
      : daysSinceUpdate === 1
      ? "yesterday"
      : `${daysSinceUpdate} days ago`;

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.created_at));

  const heatmapData =
    Array.isArray(user.github_contributions)
      ? (user.github_contributions as number[])
      : null;

  return (
    <main className="min-h-screen bg-page-bg">
      {/* ─── Profile Hero (dark navy) ─── */}
      <div className="bg-navy">
        <div className="mx-auto max-w-[1080px] px-10 pt-10 pb-16 max-md:px-5 max-md:pt-7 max-md:pb-12">
          <ProfileHeader
            user={user}
            tierLabel={tierLabel}
            skillPills={skillPills}
            verifiedSources={verifiedSources}
          />
        </div>
      </div>

      {/* ─── Content area ─── */}
      <div className="mx-auto max-w-[1080px] px-10 max-md:px-5">
        {/* Floating stats bar */}
        <AggregateStats
          totalProjects={publishedProjects.length}
          totalCommits={totalCommits}
          verifiedCount={verifiedCount}
          profileViews={user.profile_view_count}
          newProjectsThisQuarter={newProjectsThisQuarter}
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7 mt-9">
          {/* Left: projects */}
          <div>
            <div className="flex items-baseline gap-3 mb-[14px]">
              <h2 className="text-[18px] font-medium text-text-primary" style={{ letterSpacing: "-0.3px" }}>
                Projects
              </h2>
              <span className="text-[12px] text-text-muted font-mono">
                {publishedProjects.length} · {verifiedCount} verified
              </span>
            </div>
            <ProjectGrid projects={publishedProjects} user={user} />
          </div>

          {/* Right: sidebar */}
          <aside className="flex flex-col gap-4">
            <TrustTierCard
              verifiedCount={verifiedCount}
              totalProjects={publishedProjects.length}
              tierLabel={tierLabel}
            />
            <ConnectedAccounts user={user} hasVercelProjects={hasVercelProjects} />
          </aside>
        </div>

        {/* Activity heatmap (full-width) */}
        <ActivityHeatmap data={heatmapData} totalCommits={totalCommits} />

        {/* Footer */}
        <footer
          className="text-center py-6 mt-9 text-[12px] text-text-muted"
          style={{ borderTop: "0.5px solid var(--border-light)" }}
        >
          Profile last updated {lastUpdatedLabel} · Member since {memberSince}
        </footer>
      </div>
    </main>
  );
}
