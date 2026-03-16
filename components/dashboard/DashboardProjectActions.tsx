"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pencil,
  ExternalLink,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  thumbnail_url: string | null;
  live_url: string;
  display_order: number;
}

interface DashboardProjectActionsProps {
  projects: ProjectRow[];
}

export function DashboardProjectActions({
  projects: initialProjects,
}: DashboardProjectActionsProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (projects.length === 0) return null;

  async function handlePublishToggle(project: ProjectRow) {
    setLoadingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !project.is_published }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to update project");
        return;
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? { ...p, is_published: !p.is_published }
            : p
        )
      );
      toast.success(
        !project.is_published ? "Project published" : "Project set to draft"
      );
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(project: ProjectRow) {
    setLoadingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to delete project");
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast.success(`"${project.name}" deleted`);
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReorder(projectId: string, direction: "up" | "down") {
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === projects.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newProjects = [...projects];
    [newProjects[idx], newProjects[swapIdx]] = [
      newProjects[swapIdx],
      newProjects[idx],
    ];
    // Reassign display_order
    const reordered = newProjects.map((p, i) => ({ ...p, display_order: i }));
    setProjects(reordered);

    setLoadingId(projectId);
    try {
      // Update both swapped projects
      await Promise.all([
        fetch(`/api/projects/${reordered[idx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: reordered[idx].display_order }),
        }),
        fetch(`/api/projects/${reordered[swapIdx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_order: reordered[swapIdx].display_order,
          }),
        }),
      ]);

      router.refresh();
    } catch {
      toast.error("Failed to reorder projects");
      setProjects(initialProjects);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gitpm-border/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-gitpm-border/30 bg-surface-dark/40 flex items-center justify-between">
        <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest">
          Projects
        </h2>
        <span className="text-xs font-mono text-white/25">
          {projects.length} total
        </span>
      </div>

      <ul className="divide-y divide-gitpm-border/20">
        {projects.map((project, idx) => {
          const isLoading = loadingId === project.id;
          return (
            <li
              key={project.id}
              className="flex items-center justify-between px-4 py-3 gap-4 hover:bg-white/[0.02] transition-colors"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleReorder(project.id, "up")}
                  disabled={idx === 0 || isLoading}
                  className="p-0.5 text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(project.id, "down")}
                  disabled={idx === projects.length - 1 || isLoading}
                  className="p-0.5 text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Thumbnail + name */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
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
                  <p className="text-sm text-white font-medium truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-white/30 font-mono truncate">
                    /{project.slug}
                  </p>
                </div>
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full mr-1",
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
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      "text-white/30 hover:text-white"
                    )}
                    aria-label="View live site"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => handlePublishToggle(project)}
                  disabled={isLoading}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "text-white/30 hover:text-white disabled:opacity-50"
                  )}
                  aria-label={
                    project.is_published ? "Unpublish project" : "Publish project"
                  }
                  title={project.is_published ? "Unpublish" : "Publish"}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : project.is_published ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>

                <Link
                  href={`/dashboard/projects/${project.id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-7 px-2 text-white/40 hover:text-white gap-1 text-xs"
                  )}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>

                <Dialog>
                  <DialogTrigger
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      "text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                    )}
                    aria-label="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </DialogTrigger>
                  <DialogContent className="bg-surface-dark border border-gitpm-border/50 max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-white text-base">
                        Delete &ldquo;{project.name}&rdquo;?
                      </DialogTitle>
                      <DialogDescription className="text-white/50 text-sm">
                        This will permanently remove the project and all its
                        data. This cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="border-t border-gitpm-border/30 bg-transparent flex-row gap-2 justify-end">
                      <DialogClose
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "text-white/50 hover:text-white"
                        )}
                      >
                        Cancel
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(project)}
                        disabled={isLoading}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                      >
                        {isLoading && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        Delete Project
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
