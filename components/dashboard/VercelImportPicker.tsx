"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, GitBranch, Loader2, CheckCircle2, ArrowRight, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VercelProjectSummary } from "@/app/api/vercel/projects/route";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function VercelImportPicker() {
  const router = useRouter();
  const [projects, setProjects] = useState<VercelProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vercel/projects")
      .then((r) => r.json())
      .then((json: { data?: VercelProjectSummary[]; error?: string }) => {
        if (json.data) {
          setProjects(json.data);
        } else {
          setError(json.error ?? "Failed to load Vercel projects.");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(project: VercelProjectSummary) {
    const params = new URLSearchParams({
      name: project.name,
      slug: generateSlug(project.name),
      hosting_platform: "vercel",
    });
    if (project.liveUrl) params.set("live_url", project.liveUrl);
    if (project.githubRepoUrl) params.set("github_repo_url", project.githubRepoUrl);
    router.push(`/dashboard/projects/new?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
        <p className="text-sm text-white/40">Loading your Vercel projects…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <TriangleAlert className="h-6 w-6 text-red-400/60" />
        <p className="text-sm text-red-400/80">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-sm text-white/40">No Vercel projects found on your account.</p>
      </div>
    );
  }

  const available = projects.filter((p) => !p.alreadyImported);
  const imported = projects.filter((p) => p.alreadyImported);

  return (
    <div className="space-y-6">
      {available.length === 0 && imported.length > 0 && (
        <p className="text-sm text-white/40 text-center py-4">
          All your Vercel projects are already in GitPM.
        </p>
      )}

      {available.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest px-1">
            {available.length} project{available.length !== 1 ? "s" : ""} available to import
          </p>
          <div className="rounded-xl border border-gitpm-border/40 overflow-hidden divide-y divide-gitpm-border/20">
            {available.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {imported.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest px-1">
            {imported.length} already in GitPM
          </p>
          <div className="rounded-xl border border-gitpm-border/20 overflow-hidden divide-y divide-gitpm-border/10 opacity-50">
            {imported.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onSelect={handleSelect}
                disabled
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  onSelect,
  disabled = false,
}: {
  project: VercelProjectSummary;
  onSelect: (p: VercelProjectSummary) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 bg-surface-dark/30 hover:bg-white/[0.02] transition-colors",
        disabled && "cursor-default"
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{project.name}</p>
          {disabled && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-teal border border-teal/20 bg-teal/10 px-1.5 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="h-2.5 w-2.5" />
              In GitPM
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-mono text-white/30 hover:text-white/60 transition-colors truncate max-w-[240px]"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {project.liveUrl.replace("https://", "")}
            </a>
          )}
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
            >
              <GitBranch className="h-3 w-3 shrink-0" />
              {project.githubRepoUrl.replace("https://github.com/", "")}
            </a>
          )}
        </div>
      </div>

      {!disabled && (
        <Button
          size="sm"
          onClick={() => onSelect(project)}
          className="bg-purple hover:bg-purple/90 text-white gap-1.5 shrink-0 h-7 px-3 text-xs"
        >
          Start
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
