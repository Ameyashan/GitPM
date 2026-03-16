import { StatCard } from "@/components/shared/StatCard";
import type { Project } from "@/types/project";

interface ProjectStatsProps {
  project: Project;
}

function calcBuildDuration(
  firstCommit: string | null,
  latestDeploy: string | null
): string | null {
  if (!firstCommit || !latestDeploy) return null;
  const start = new Date(firstCommit).getTime();
  const end = new Date(latestDeploy).getTime();
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const weeks = Math.round(days / 7);
  return `${weeks}w`;
}

export function ProjectStats({ project }: ProjectStatsProps) {
  const duration = calcBuildDuration(
    project.first_commit_at,
    project.latest_deploy_at
  );

  const stats: { value: string | number; label: string; accent?: "teal" | "purple" }[] = [];

  if (project.commit_count !== null && project.commit_count > 0) {
    stats.push({ value: project.commit_count, label: "Commits" });
  }
  if (duration) {
    stats.push({ value: duration, label: "Build time" });
  }
  stats.push({
    value: project.is_solo ? "Solo" : "Collab",
    label: "Team size",
    accent: project.is_solo ? undefined : "purple",
  });

  if (stats.length === 0) return null;

  return (
    <div className="flex items-center gap-8 flex-wrap">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-8">
          <StatCard value={stat.value} label={stat.label} accent={stat.accent} />
          {i < stats.length - 1 && (
            <div className="h-8 w-px bg-gitpm-border/30" />
          )}
        </div>
      ))}
    </div>
  );
}
