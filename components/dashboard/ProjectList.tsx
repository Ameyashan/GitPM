"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) return null;

  return (
    <div className="rounded-xl border border-gitpm-border/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-gitpm-border/30 bg-surface-dark/40">
        <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest">
          Projects
        </h2>
      </div>

      <ul className="divide-y divide-gitpm-border/20">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex items-center justify-between px-4 py-3 gap-4 hover:bg-white/[0.02] transition-colors"
          >
            {/* Thumbnail + name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-9 w-14 rounded bg-surface-dark border border-gitpm-border/30 shrink-0 overflow-hidden">
                {project.thumbnail_url ? (
                  <Image
                    src={project.thumbnail_url}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple/10 to-teal/10" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{project.name}</p>
                <p className="text-xs text-white/30 font-mono truncate">/{project.slug}</p>
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full",
                  project.is_published
                    ? "bg-teal/10 text-teal border border-teal/20"
                    : "bg-white/5 text-white/30 border border-gitpm-border/30"
                )}
              >
                {project.is_published ? "Published" : "Draft"}
              </span>

              {project.live_url && (
                <Link
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-7 w-7 p-0 text-white/30 hover:text-white"
                  )}
                  aria-label="View live site"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}

              <Link
                href={`/dashboard/projects/${project.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-7 px-2 text-white/40 hover:text-white gap-1.5 text-xs"
                )}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
