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

  const stats: { value: string | number; label: string; accent?: "purple" }[] = [];

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
    <div
      className="grid gap-px bg-gitpm-border-light rounded-[14px] overflow-hidden relative z-10 shadow-[0_1px_3px_rgba(13,27,42,0.08)]"
      style={{
        marginTop: "-28px",
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      }}
    >
      {stats.map((stat, i) => (
        <div key={i} className="bg-white py-4 px-3 text-center">
          <div
            className={`text-[22px] font-medium font-mono ${
              stat.accent === "purple" ? "text-purple" : "text-text-primary"
            }`}
            style={{ letterSpacing: "-0.5px" }}
          >
            {stat.value}
          </div>
          <div
            className="text-[10px] text-text-muted uppercase font-medium mt-[3px]"
            style={{ letterSpacing: "0.07em" }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
