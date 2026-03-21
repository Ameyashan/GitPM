"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ConnectionCard } from "./ConnectionCard";
import { VercelConnectModal } from "./VercelConnectModal";

interface VercelConnection {
  username: string | null;
  connectedAt: string;
}

interface ConnectionsManagerProps {
  githubUsername: string | null;
  githubConnectedAt: string | null;
  initialVercel: VercelConnection | null;
  lovableCount: number;
}

export function ConnectionsManager({
  githubUsername,
  githubConnectedAt: _githubConnectedAt,
  initialVercel,
  lovableCount,
}: ConnectionsManagerProps) {
  const [vercelConnection, setVercelConnection] =
    useState<VercelConnection | null>(initialVercel);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [vercelModalOpen, setVercelModalOpen] = useState(false);

  const handleVercelConnectSuccess = useCallback((username: string) => {
    setVercelConnection({ username, connectedAt: new Date().toISOString() });
    toast.success("Vercel connected", {
      description:
        "Your projects are being verified against your Vercel deployments.",
    });
  }, []);

  const handleDisconnectVercel = useCallback(async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);

    try {
      const res = await fetch("/api/connected-accounts/vercel", {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to disconnect");
      }

      setVercelConnection(null);
      toast.success("Vercel disconnected", {
        description:
          "Verified badges from Vercel deployments have been removed from your projects.",
      });
    } catch (err) {
      console.error("Disconnect error:", err);
      toast.error("Failed to disconnect Vercel. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  }, [isDisconnecting]);

  const lovableStatusText =
    lovableCount > 0
      ? `${lovableCount} project${lovableCount === 1 ? "" : "s"} detected`
      : "Connected";

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .conn-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="conn-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {/* GitHub */}
        <ConnectionCard
          provider="github"
          isConnected={true}
          statusText="Connected"
          infoText={githubUsername ? `@${githubUsername}` : undefined}
          actionVariant="disconnect"
          actionLabel="Disconnect"
          onAction={() => {
            toast.info(
              "GitHub is connected via Supabase Auth and cannot be disconnected here."
            );
          }}
        />

        {/* Vercel */}
        <ConnectionCard
          provider="vercel"
          isConnected={vercelConnection !== null}
          statusText={vercelConnection ? "Connected" : "Not connected"}
          infoText={vercelConnection?.username ?? undefined}
          actionVariant={vercelConnection ? "disconnect" : "connect"}
          actionLabel={vercelConnection ? "Disconnect" : "Connect"}
          onAction={
            vercelConnection
              ? handleDisconnectVercel
              : () => setVercelModalOpen(true)
          }
          isLoading={isDisconnecting}
        />

        {/* Lovable */}
        <ConnectionCard
          provider="lovable"
          isConnected={true}
          statusText={lovableStatusText}
          infoText="Auto-detected via GitHub repos"
          actionVariant="rescan"
          actionLabel="Re-scan repos"
          onAction={() => {
            toast.info("Re-scanning GitHub repos for Lovable projects…");
          }}
        />

        {/* Netlify — coming soon */}
        <ConnectionCard
          provider="netlify"
          isConnected={false}
          statusText="Coming soon"
          actionVariant="disabled"
          dimmed={true}
        />
      </div>

      <VercelConnectModal
        open={vercelModalOpen}
        onOpenChange={setVercelModalOpen}
        onSuccess={handleVercelConnectSuccess}
      />
    </>
  );
}
