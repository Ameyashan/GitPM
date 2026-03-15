// Project detail hero — implemented in Ticket 4
import type { Project } from "@/types/project";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <div className="aspect-video bg-surface-dark rounded-lg overflow-hidden">
      {project.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.thumbnail_url}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
