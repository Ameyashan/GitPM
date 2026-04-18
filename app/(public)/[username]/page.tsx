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
import { TierCard } from "@/components/profile/TierCard";
import { ToolsUsed } from "@/components/profile/ToolsUsed";
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

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const admin = createAdminClient();

  const user = await getUserByUsername(admin, username);

  if (!user) {
    notFound();
  }

  const publishedProjects = await getPublishedProjects(admin, user.id);

  // Increment view count — awaited so the serverless function doesn't exit before the DB write.
  // Revalidate both this public page and the owner's dashboard so neither serves a stale count
  // (the displayed value is read before the increment, so without revalidation it trails the DB).
  await admin.rpc("increment_profile_view", { p_user_id: user.id });
  revalidatePath(`/${username}`);
  revalidatePath("/dashboard");

  // Aggregate stats
  const totalCommits = publishedProjects.reduce(
    (sum, p) => sum + (p.commit_count ?? 0),
    0
  );
  const verifiedCount = publishedProjects.filter((p) => p.is_verified).length;

  // Tools used with counts
  const toolCounts: Record<string, number> = {};
  for (const project of publishedProjects) {
    for (const tool of project.build_tools) {
      toolCounts[tool] = (toolCounts[tool] ?? 0) + 1;
    }
  }
  const toolsUsed = Object.entries(toolCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

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

  return (
    <main className="min-h-screen bg-page-bg">
      {/* ─── Profile Hero (dark navy) ─── */}
      <div className="bg-navy">
        <div
          className="mx-auto max-w-[880px] px-10 pt-9 pb-12 max-md:px-5 max-md:pt-7 max-md:pb-10"
        >
          <ProfileHeader user={user} />
        </div>
      </div>

      {/* ─── Content area (pmain) ─── */}
      <div className="mx-auto max-w-[880px] px-10 max-md:px-5">
        {/* Floating stats bar — overlaps hero via negative margin */}
        <AggregateStats
          totalProjects={publishedProjects.length}
          totalCommits={totalCommits}
          verifiedCount={verifiedCount}
          profileViews={user.profile_view_count}
        />

        {/* Tier card */}
        <TierCard
          verifiedCount={verifiedCount}
          heatmapData={
            Array.isArray(user.github_contributions)
              ? (user.github_contributions as number[])
              : null
          }
        />

        {/* Tools section */}
        {toolsUsed.length > 0 && (
          <>
            <SectionHead label="Tools used" />
            <ToolsUsed tools={toolsUsed} />
          </>
        )}

        {/* Projects section */}
        <SectionHead
          label="Projects"
          right={
            publishedProjects.length > 0
              ? `${publishedProjects.length} project${publishedProjects.length !== 1 ? "s" : ""}`
              : undefined
          }
        />
        <ProjectGrid projects={publishedProjects} user={user} />

        {/* Footer */}
        <footer
          className="text-center py-5 text-[12px] text-text-muted"
          style={{ borderTop: "0.5px solid var(--border-light)" }}
        >
          Profile last updated {lastUpdatedLabel} · Member since {memberSince}
        </footer>
      </div>
    </main>
  );
}

// ─── Inline section head component ───────────────────────────────────────────

function SectionHead({
  label,
  right,
}: {
  label: string;
  right?: string;
}) {
  return (
    <div className="flex items-center gap-3 mt-7 mb-[14px]">
      <span
        className="text-[12px] font-medium text-text-muted uppercase whitespace-nowrap"
        style={{ letterSpacing: "0.07em" }}
      >
        {label}
      </span>
      <div className="flex-1 h-[0.5px] bg-gitpm-border-light" />
      {right && (
        <span className="text-[12px] text-text-muted whitespace-nowrap">
          {right}
        </span>
      )}
    </div>
  );
}
