// Project card for public profile grid — implemented in Ticket 4
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  username: string;
}

export function ProjectCard({ project, username }: ProjectCardProps) {
  return (
    <article className="rounded-lg bg-surface-dark border border-gitpm-border/50 overflow-hidden hover:border-gitpm-border transition-colors">
      <div className="aspect-video bg-navy/50" />
      <div className="p-4">
        <h3 className="font-display font-semibold text-white truncate">
          {project.name}
        </h3>
        <p className="mt-1 text-sm text-white/60 line-clamp-2">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {project.build_tools.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-purple/10 text-purple px-2 py-0.5 text-xs font-mono"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
      <span className="sr-only">{username}</span>
    </article>
  );
}
