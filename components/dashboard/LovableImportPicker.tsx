"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  GitBranch,
  Loader2,
  CheckCircle2,
  ArrowRight,
  TriangleAlert,
  Sparkles,
  Lock,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LovableProjectSummary } from "@/app/api/github/lovable-projects/route";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function LovableImportPicker() {
  const router = useRouter();
  const [projects, setProjects] = useState<LovableProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/github/lovable-projects")
      .then((r) => r.json())
      .then((json: { data?: LovableProjectSummary[]; error?: string }) => {
        if (json.data) {
          setProjects(json.data);
        } else {
          setError(json.error ?? "Failed to load projects.");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(project: LovableProjectSummary) {
    const params = new URLSearchParams({
      name: project.name,
      slug: generateSlug(project.name),
      github_repo_url: project.githubRepoUrl,
      hosting_platform: "lovable",
      build_tools: "lovable",
      source: "lovable",
    });
    if (project.liveUrl) params.set("live_url", project.liveUrl);
    router.push(`/dashboard/projects/new?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
        <p className="text-sm text-white/40">Scanning your GitHub repos…</p>
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

  const q = search.toLowerCase().trim();

  const allDetected = projects.filter((p) => p.lovableDetected && !p.alreadyImported);
  const allOthers = projects.filter((p) => !p.lovableDetected && !p.alreadyImported);
  const allImported = projects.filter((p) => p.alreadyImported);

  // Apply search within the relevant pool
  const applySearch = (list: LovableProjectSummary[]) =>
    q
      ? list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.fullName.toLowerCase().includes(q)
        )
      : list;

  const detected = applySearch(allDetected);
  const others = applySearch(allOthers);
  const imported = applySearch(allImported);

  // If no Lovable repos were detected at all (not just after searching), nudge the user
  const noneDetectedAtAll = allDetected.length === 0;

  return (
    <div className="space-y-5">
      {/* Search — only show when there's something to search */}
      {(allDetected.length > 0 || showAll) && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories…"
            className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 h-9 pl-9 font-mono text-sm"
          />
        </div>
      )}

      {/* No Lovable repos detected at all */}
      {noneDetectedAtAll && !showAll && (
        <div className="rounded-xl border border-gitpm-border/30 bg-surface-dark/20 p-8 text-center space-y-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-purple/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">
              No Lovable projects auto-detected
            </p>
            <p className="text-xs text-white/35 max-w-sm mx-auto leading-relaxed">
              GitPM looks for repos with a{" "}
              <span className="font-mono text-white/50">lovable</span> GitHub
              topic, a <span className="font-mono text-white/50">.lovable.app</span>{" "}
              homepage, or &ldquo;Lovable&rdquo; in the description. If your
              project doesn&apos;t match, use the button below to pick it
              manually.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1.5 text-xs text-purple hover:text-purple/80 transition-colors font-mono"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Browse all {allOthers.length + allImported.length} repositories
          </button>
        </div>
      )}

      {/* Detected Lovable repos */}
      {detected.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-3.5 w-3.5 text-purple" />
            <p className="text-xs font-mono text-purple uppercase tracking-widest">
              Lovable detected — {detected.length} repo{detected.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-xl border border-purple/20 overflow-hidden divide-y divide-gitpm-border/20">
            {detected.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onSelect={handleSelect}
                highlight
              />
            ))}
          </div>
        </div>
      )}

      {/* No search results within detected */}
      {!noneDetectedAtAll && q && detected.length === 0 && (
        <p className="text-sm text-white/30 text-center py-2">
          No Lovable projects match &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Show all repos toggle (when some were detected, offer as secondary section) */}
      {!noneDetectedAtAll && !showAll && allOthers.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors font-mono mx-auto"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Don&apos;t see your project? Browse all {allOthers.length} other repos
        </button>
      )}

      {/* All other repos — only shown when expanded */}
      {showAll && others.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest px-1">
            All other repos — {others.length}
          </p>
          <div className="rounded-xl border border-gitpm-border/40 overflow-hidden divide-y divide-gitpm-border/20">
            {others.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collapse all repos */}
      {showAll && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/45 transition-colors font-mono mx-auto"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Show fewer
        </button>
      )}

      {/* Already imported */}
      {showAll && imported.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-white/25 uppercase tracking-widest px-1">
            {imported.length} already in GitPM
          </p>
          <div className="rounded-xl border border-gitpm-border/20 overflow-hidden divide-y divide-gitpm-border/10 opacity-40">
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
  highlight = false,
}: {
  project: LovableProjectSummary;
  onSelect: (p: LovableProjectSummary) => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 transition-colors",
        highlight ? "bg-purple/5 hover:bg-purple/10" : "bg-surface-dark/30 hover:bg-white/[0.02]",
        disabled && "cursor-default"
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-white truncate">{project.name}</p>
          {project.isPrivate && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-white/40 border border-white/10 px-1.5 py-0.5 rounded-full shrink-0">
              <Lock className="h-2.5 w-2.5" />
              Private
            </span>
          )}
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
              className="flex items-center gap-1 text-xs font-mono text-white/30 hover:text-white/60 transition-colors truncate max-w-[200px]"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {project.liveUrl.replace("https://", "")}
            </a>
          )}
          <a
            href={project.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
          >
            <GitBranch className="h-3 w-3 shrink-0" />
            {project.fullName}
          </a>
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
