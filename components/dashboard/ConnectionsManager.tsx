"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConnectionCard } from "./ConnectionCard";

interface VercelConnection {
  username: string | null;
  connectedAt: string;
}

interface ConnectionsManagerProps {
  githubUsername: string | null;
  githubConnectedAt: string | null;
  initialVercel: VercelConnection | null;
}

export function ConnectionsManager({
  githubUsername,
  githubConnectedAt,
  initialVercel,
}: ConnectionsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vercelConnection, setVercelConnection] = useState<VercelConnection | null>(
    initialVercel
  );
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Show success/error toasts based on redirect query params
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "vercel") {
      toast.success("Vercel connected successfully", {
        description: "Your projects are being verified against your Vercel deployments.",
      });
      // Clean up the URL
      router.replace("/dashboard/connections");
    } else if (error) {
      const messages: Record<string, string> = {
        access_denied: "You cancelled the Vercel connection.",
        state_mismatch: "Connection failed due to a security check. Please try again.",
        connect_failed: "Failed to start the Vercel connection. Please try again.",
        callback_failed: "Something went wrong during Vercel authorization.",
        missing_params: "Invalid callback from Vercel. Please try again.",
      };
      toast.error(messages[error] ?? "Connection failed. Please try again.");
      router.replace("/dashboard/connections");
    }
  }, [searchParams, router]);

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

  return (
    <div className="space-y-3">
      <ConnectionCard
        provider="github"
        isConnected={true}
        username={githubUsername ?? undefined}
        connectedAt={githubConnectedAt ?? undefined}
      />

      <ConnectionCard
        provider="vercel"
        isConnected={vercelConnection !== null}
        username={vercelConnection?.username ?? undefined}
        connectedAt={vercelConnection?.connectedAt}
        connectHref="/api/auth/vercel/connect"
        onDisconnect={handleDisconnectVercel}
        isDisconnecting={isDisconnecting}
      />
    </div>
  );
}
