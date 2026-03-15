// 2-column project grid for public profile — implemented in Ticket 4
import type { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  username: string;
}

export function ProjectGrid({ projects, username }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} username={username} />
      ))}
    </div>
  );
}
