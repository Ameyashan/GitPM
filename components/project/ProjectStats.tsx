// Project stats row — implemented in Ticket 4
import type { Project } from "@/types/project";

interface ProjectStatsProps {
  project: Project;
}

export function ProjectStats({ project }: ProjectStatsProps) {
  return (
    <div className="flex flex-wrap gap-6 text-sm text-white/60">
      {project.commit_count !== null && (
        <span>
          <strong className="text-white">{project.commit_count}</strong> commits
        </span>
      )}
      <span>
        {project.is_solo ? "Solo build" : "Collaborative build"}
      </span>
    </div>
  );
}
