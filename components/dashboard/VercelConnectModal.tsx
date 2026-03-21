"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Loader2, Lock, Triangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VercelConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (username: string) => void;
}

export function VercelConnectModal({
  open,
  onOpenChange,
  onSuccess,
}: VercelConnectModalProps) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isConnecting) return;
    setToken("");
    setError(null);
    setShowToken(false);
    onOpenChange(false);
  }

  async function handleConnect() {
    if (!token.trim() || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/connected-accounts/vercel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const json = (await res.json()) as { data?: { username: string }; error?: string };

      if (!res.ok || !json.data) {
        setError(json.error ?? "Connection failed. Please try again.");
        return;
      }

      onSuccess(json.data.username);
      setToken("");
      setError(null);
      setShowToken(false);
      onOpenChange(false);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsConnecting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && token.trim() && !isConnecting) {
      void handleConnect();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={!isConnecting}
        style={{
          background: "var(--surface-card)",
          border: "0.5px solid var(--border-light)",
          maxWidth: "420px",
          padding: "0",
          gap: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 0" }}>
          <DialogHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--navy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Triangle
                  style={{ width: "14px", height: "14px", fill: "white", color: "white" }}
                />
              </div>
              <DialogTitle
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Connect Vercel
              </DialogTitle>
            </div>
            <DialogDescription
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Use a personal access token to link your Vercel account. Your projects
              will be auto-verified against your deployments.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Steps */}
        <div style={{ padding: "20px 24px 0" }}>
          <Step number={1}>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Open your Vercel token settings
            </span>
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--purple)",
                textDecoration: "none",
                marginTop: "4px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")
              }
            >
              vercel.com/account/tokens
              <ExternalLink style={{ width: "10px", height: "10px" }} />
            </a>
          </Step>

          <Step number={2}>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Click{" "}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: "var(--surface-light)",
                  color: "var(--text-primary)",
                }}
              >
                Create
              </span>{" "}
              and set the scope to{" "}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: "var(--surface-light)",
                  color: "var(--text-primary)",
                }}
              >
                Full Account
              </span>
            </span>
          </Step>

          <Step number={3} isLast>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Paste your token below
            </span>
            {/* Token input */}
            <div style={{ marginTop: "8px", position: "relative" }}>
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="••••••••••••••••••••••••••••••"
                disabled={isConnecting}
                autoComplete="off"
                spellCheck={false}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  padding: "9px 36px 9px 12px",
                  borderRadius: "7px",
                  border: error
                    ? "1px solid rgba(226,75,74,0.6)"
                    : "0.5px solid var(--border-light)",
                  background: "var(--surface-light)",
                  color: "var(--text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                  opacity: isConnecting ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (!error)
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "var(--border)";
                }}
                onBlur={(e) => {
                  if (!error)
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "var(--border-light)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                disabled={isConnecting}
                aria-label={showToken ? "Hide token" : "Show token"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showToken ? (
                  <EyeOff style={{ width: "13px", height: "13px" }} />
                ) : (
                  <Eye style={{ width: "13px", height: "13px" }} />
                )}
              </button>
            </div>

            {/* Inline error */}
            {error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#E24B4A",
                  marginTop: "6px",
                  marginBottom: 0,
                }}
              >
                {error}
              </p>
            )}

            {/* Security note */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "8px",
              }}
            >
              <Lock style={{ width: "10px", height: "10px", color: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Encrypted at rest. Never shared or logged.
              </span>
            </div>
          </Step>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "20px 24px",
            borderTop: "0.5px solid var(--border-light)",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isConnecting}
            style={{
              fontSize: "13px",
              padding: "7px 14px",
              borderRadius: "6px",
              border: "none",
              background: "var(--surface-light)",
              color: "var(--text-secondary)",
              cursor: isConnecting ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              opacity: isConnecting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={!token.trim() || isConnecting}
            style={{
              fontSize: "13px",
              padding: "7px 16px",
              borderRadius: "6px",
              border: "none",
              background: "var(--navy)",
              color: "#fff",
              cursor: !token.trim() || isConnecting ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              opacity: !token.trim() || isConnecting ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {isConnecting && <Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" />}
            {isConnecting ? "Connecting…" : "Connect →"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step({
  number,
  isLast = false,
  children,
}: {
  number: number;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        paddingBottom: isLast ? 0 : "16px",
        position: "relative",
      }}
    >
      {/* Number circle + connector line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "0.5px solid var(--border)",
            background: "var(--surface-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: "var(--text-secondary)",
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            style={{
              width: "1px",
              flex: 1,
              background: "var(--border-light)",
              marginTop: "4px",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: "1px", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
