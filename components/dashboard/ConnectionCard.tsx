"use client";
// OAuth connection card (GitHub, Vercel) — implemented in Ticket 6

interface ConnectionCardProps {
  provider: "github" | "vercel";
  isConnected: boolean;
  username?: string;
}

export function ConnectionCard({
  provider,
  isConnected,
  username,
}: ConnectionCardProps) {
  return (
    <div className="rounded-lg bg-surface-dark border border-gitpm-border/50 p-4 flex items-center justify-between">
      <div>
        <p className="text-white font-medium capitalize">{provider}</p>
        {isConnected && username && (
          <p className="text-sm text-white/50 font-mono">@{username}</p>
        )}
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          isConnected
            ? "bg-teal/10 text-teal"
            : "bg-surface-dark text-white/40 border border-gitpm-border/50"
        }`}
      >
        {isConnected ? "Connected" : "Not connected"}
      </span>
    </div>
  );
}
