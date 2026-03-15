"use client";
// Dashboard project list with drag-to-reorder — implemented in Ticket 4

import type { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li
          key={project.id}
          className="rounded-lg bg-surface-dark border border-gitpm-border/50 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-medium">{project.name}</p>
            <p className="text-xs text-white/40 font-mono">/{project.slug}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              project.is_published
                ? "bg-teal/10 text-teal"
                : "bg-surface-dark text-white/40 border border-gitpm-border/50"
            }`}
          >
            {project.is_published ? "Published" : "Draft"}
          </span>
        </li>
      ))}
    </ul>
  );
}
