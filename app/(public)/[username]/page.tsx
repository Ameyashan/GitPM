import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AggregateStats } from "@/components/profile/AggregateStats";
import { ToolsUsed } from "@/components/profile/ToolsUsed";
import { ProjectGrid } from "@/components/profile/ProjectGrid";
import { SectionLabel } from "@/components/shared/SectionLabel";
import type { User, Project } from "@/types/project";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const admin = createAdminClient();

  const { data: userMeta } = await admin
    .from("users")
    .select("display_name, headline, avatar_url")
    .eq("username", username)
    .maybeSingle();

  const user = userMeta as { display_name: string | null; headline: string | null; avatar_url: string | null } | null;

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
      images: user.avatar_url ? [{ url: user.avatar_url }] : [],
    },
    twitter: {
      card: "summary",
      title: `${displayName} — GitPM`,
      description,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const admin = createAdminClient();

  const { data: userRow } = await admin
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  const user = userRow as User | null;

  if (!user) {
    notFound();
  }

  const { data: projectRows } = await admin
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  const publishedProjects = (projectRows ?? []) as Project[];

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

  return (
    <main className="min-h-screen bg-navy">
      {/* Dark hero header */}
      <div className="bg-navy border-b border-gitpm-border/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <ProfileHeader user={user} />

          <div className="mt-8 space-y-4">
            <AggregateStats
              totalProjects={publishedProjects.length}
              totalCommits={totalCommits}
              verifiedCount={verifiedCount}
            />

            {toolsUsed.length > 0 && (
              <div className="space-y-2">
                <SectionLabel>Built with</SectionLabel>
                <ToolsUsed tools={toolsUsed} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {publishedProjects.length > 0 && (
          <div className="mb-6">
            <SectionLabel>Projects</SectionLabel>
          </div>
        )}
        <ProjectGrid projects={publishedProjects} username={username} />

        <p className="mt-10 text-center text-xs text-white/20 font-mono">
          Profile last updated {lastUpdatedLabel}
        </p>
      </div>
    </main>
  );
}
