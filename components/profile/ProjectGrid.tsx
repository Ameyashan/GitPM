"use client";

import { useState, useCallback } from "react";
import type { Project, User } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

interface ProjectGridProps {
  projects: Project[];
  user: Pick<User, "display_name" | "username" | "avatar_url">;
}

export function ProjectGrid({ projects, user }: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleClose = useCallback(() => setSelectedProject(null), []);

  if (projects.length === 0) {
    return (
      <div
        data-testid="public-project-grid-empty"
        className="rounded-[14px] py-16 text-center"
        style={{ border: "1px dashed var(--border-light)" }}
      >
        <p className="text-text-muted text-sm">No published projects yet.</p>
      </div>
    );
  }

  return (
    <>
      <div
        data-testid="public-project-grid"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-[14px] pb-12"
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          user={user}
          onClose={handleClose}
        />
      )}
    </>
  );
}
