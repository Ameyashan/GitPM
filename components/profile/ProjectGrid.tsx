import type { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  username: string;
}

export function ProjectGrid({ projects, username }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gitpm-border/30 bg-surface-dark/20 py-16 text-center">
        <p className="text-white/30 text-sm">No published projects yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} username={username} />
      ))}
    </div>
  );
}
