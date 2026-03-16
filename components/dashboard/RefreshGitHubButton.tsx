"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface RefreshGitHubButtonProps {
  projectId: string;
}

export function RefreshGitHubButton({ projectId }: RefreshGitHubButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/enrich`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(json.error ?? "Failed to refresh GitHub data");
        return;
      }

      toast.success("GitHub data refreshed");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono text-white/35 hover:text-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      )}
      title="Re-fetch commit count, tech stack, and collaborator info from GitHub"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
      {loading ? "Refreshing…" : "Refresh GitHub data"}
    </button>
  );
}
