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
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshGitHubButton } from "@/components/dashboard/RefreshGitHubButton";
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
  is_verified: boolean;
  thumbnail_url: string | null;
  live_url: string;
  github_repo_url: string | null;
  build_tools: string[] | null;
  hosting_platform: string | null;
  commit_count: number | null;
  latest_deploy_at: string | null;
  display_order: number;
}

interface DashboardProjectActionsProps {
  projects: ProjectRow[];
  username: string;
  vercelConnected: boolean;
}

function shortUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function DashboardProjectActions({
  projects: initialProjects,
  username,
  vercelConnected,
}: DashboardProjectActionsProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

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
          p.id === project.id ? { ...p, is_published: !p.is_published } : p
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
    const reordered = newProjects.map((p, i) => ({ ...p, display_order: i }));
    setProjects(reordered);

    setLoadingId(projectId);
    try {
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

  async function handleVerify(project: ProjectRow) {
    setVerifyingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}/verify`, {
        method: "POST",
      });
      const json = (await res.json()) as { data?: { verified: boolean }; error?: string };

      if (!res.ok) {
        toast.error(json.error ?? "Verification failed");
        return;
      }

      if (json.data?.verified) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, is_verified: true } : p))
        );
        toast.success("Project verified with Vercel");
        router.refresh();
      } else {
        toast.error("No matching Vercel deployment found for this project's URL");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div>
      {projects.map((project, idx) => {
        const isLoading = loadingId === project.id;
        const tools = project.build_tools ?? [];
        const metaParts: string[] = [];
        if (project.commit_count != null) metaParts.push(`${project.commit_count} commits`);
        metaParts.push(`/${project.slug}`);
        if (project.live_url) metaParts.push(shortUrl(project.live_url));

        return (
          <div
            key={project.id}
            className="dash-project-row"
            onClick={() => router.push(`/${username}/${project.slug}`)}
          >
            {/* Reorder buttons */}
            <div
              className="flex flex-col gap-0.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => handleReorder(project.id, "up")}
                disabled={idx === 0 || isLoading}
                className="p-0.5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleReorder(project.id, "down")}
                disabled={idx === projects.length - 1 || isLoading}
                className="p-0.5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Move down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Thumbnail */}
            <div
              className="shrink-0 relative overflow-hidden"
              style={{
                width: "56px",
                height: "38px",
                borderRadius: "5px",
                background: "var(--dark-surface)",
              }}
            >
              {project.thumbnail_url ? (
                <Image
                  src={project.thumbnail_url}
                  alt={project.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <>
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: "30px",
                      height: "30px",
                      background: "var(--teal)",
                      top: "-8px",
                      right: "-4px",
                      filter: "blur(10px)",
                      opacity: 0.25,
                    }}
                  />
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "var(--purple)",
                      bottom: "-6px",
                      left: "4px",
                      filter: "blur(10px)",
                      opacity: 0.25,
                    }}
                  />
                </>
              )}
            </div>

            {/* Info column */}
            <div className="flex-1 min-w-0">
              {/* Name + verified badge */}
              <div
                className="flex items-center gap-2 truncate"
                style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}
              >
                <span className="truncate">{project.name}</span>
                {project.is_verified && (
                  <span
                    className="flex items-center gap-1 shrink-0"
                    style={{
                      fontSize: "10px",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "var(--teal-bg)",
                      color: "var(--teal)",
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle style={{ width: "10px", height: "10px" }} />
                    Verified
                  </span>
                )}
              </div>
              {/* Meta line */}
              <div
                className="truncate mt-0.5"
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {metaParts.join(" · ")}
              </div>
              {/* GitHub refresh button */}
              {project.github_repo_url && (
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <RefreshGitHubButton projectId={project.id} />
                </div>
              )}
            </div>

            {/* Tool pills */}
            {(tools.length > 0 || project.hosting_platform) && (
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {tools.slice(0, 2).map((tool) => (
                  <span
                    key={tool}
                    style={{
                      fontSize: "10px",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "var(--purple-bg)",
                      color: "var(--purple)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tool}
                  </span>
                ))}
                {project.hosting_platform && (
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "var(--teal-bg)",
                      color: "var(--teal)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {project.hosting_platform}
                  </span>
                )}
              </div>
            )}

            {/* Status badge + actions */}
            <div
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Status */}
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "4px",
                  fontWeight: 500,
                  background: project.is_published ? "var(--teal-bg)" : "var(--surface-light)",
                  color: project.is_published ? "var(--teal)" : "var(--text-muted)",
                }}
              >
                {project.is_published ? "Published" : "Draft"}
              </span>

              {/* View live */}
              {project.live_url && (
                <Link
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-action-btn"
                  style={{ padding: "6px 8px", lineHeight: 1 }}
                  aria-label="View live site"
                >
                  <ExternalLink style={{ width: "12px", height: "12px" }} />
                </Link>
              )}

              {/* Verify with Vercel */}
              {vercelConnected && !project.is_verified && (
                <button
                  type="button"
                  onClick={() => handleVerify(project)}
                  disabled={verifyingId === project.id}
                  className="dash-action-btn"
                  style={{ padding: "6px 8px", lineHeight: 1 }}
                  title="Verify with Vercel"
                >
                  {verifyingId === project.id ? (
                    <Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" />
                  ) : (
                    <ShieldCheck style={{ width: "12px", height: "12px" }} />
                  )}
                </button>
              )}

              {/* Publish toggle — Eye = visible/published, EyeOff = hidden/draft */}
              <button
                type="button"
                onClick={() => handlePublishToggle(project)}
                disabled={isLoading}
                className="dash-action-btn"
                style={{ padding: "6px 8px", lineHeight: 1 }}
                title={project.is_published ? "Unpublish" : "Publish"}
              >
                {isLoading ? (
                  <Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" />
                ) : project.is_published ? (
                  <Eye style={{ width: "12px", height: "12px" }} />
                ) : (
                  <EyeOff style={{ width: "12px", height: "12px" }} />
                )}
              </button>

              {/* Edit */}
              <Link
                href={`/dashboard/projects/${project.id}/edit`}
                className={cn("dash-action-btn flex items-center gap-1")}
              >
                <Pencil style={{ width: "11px", height: "11px" }} />
                Edit
              </Link>

              {/* Delete */}
              <Dialog>
                <DialogTrigger
                  className="dash-action-btn"
                  style={{
                    padding: "6px 8px",
                    lineHeight: 1,
                    color: "var(--text-muted)",
                  }}
                  aria-label="Delete project"
                >
                  <Trash2 style={{ width: "12px", height: "12px" }} />
                </DialogTrigger>
                <DialogContent
                  style={{
                    background: "var(--surface-card)",
                    border: "0.5px solid var(--border-light)",
                    maxWidth: "360px",
                  }}
                >
                  <DialogHeader>
                    <DialogTitle style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                      Delete &ldquo;{project.name}&rdquo;?
                    </DialogTitle>
                    <DialogDescription style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      This will permanently remove the project and all its data. This cannot
                      be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter
                    style={{
                      borderTop: "0.5px solid var(--border-light)",
                      paddingTop: "12px",
                    }}
                    className="flex-row gap-2 justify-end"
                  >
                    <DialogClose className="dash-action-btn">Cancel</DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(project)}
                      disabled={isLoading}
                      className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-200"
                      style={{ fontSize: "13px" }}
                    >
                      {isLoading && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      )}
                      Delete Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );
      })}
    </div>
  );
}
