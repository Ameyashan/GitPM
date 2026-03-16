"use client";

import { Github } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectionCardProps {
  provider: "github" | "vercel";
  isConnected: boolean;
  username?: string;
  connectedAt?: string;
}

function VercelIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2L22 20H2L12 2z" />
    </svg>
  );
}

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  vercel: "Vercel",
};

export function ConnectionCard({
  provider,
  isConnected,
  username,
  connectedAt,
}: ConnectionCardProps) {
  const label = PROVIDER_LABELS[provider] ?? provider;

  return (
    <div className="rounded-xl bg-surface-dark border border-gitpm-border/30 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-gitpm-border/30 text-white/70">
          {provider === "github" ? (
            <Github className="h-4 w-4" />
          ) : (
            <VercelIcon className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {isConnected && username ? (
            <p className="text-xs text-white/40 font-mono">@{username}</p>
          ) : (
            <p className="text-xs text-white/30">Not connected</p>
          )}
          {isConnected && connectedAt && (
            <p className="text-[10px] text-white/25 mt-0.5">
              Connected {new Date(connectedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isConnected ? (
          <>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
              Connected
            </span>
            <button
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-7 px-2 text-xs text-white/30 hover:text-destructive"
              )}
              aria-label={`Disconnect ${label}`}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-7 px-3 text-xs bg-purple hover:bg-purple/90 text-white"
            )}
            aria-label={`Connect ${label}`}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
