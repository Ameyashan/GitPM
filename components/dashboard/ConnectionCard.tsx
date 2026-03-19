"use client";

import { Github, Loader2, RefreshCw } from "lucide-react";

interface ConnectionCardProps {
  provider: "github" | "vercel" | "lovable" | "netlify";
  isConnected: boolean;
  statusText?: string;
  infoText?: string;
  actionLabel?: string;
  actionVariant?: "disconnect" | "connect" | "rescan" | "disabled";
  connectHref?: string;
  onAction?: () => void | Promise<void>;
  isLoading?: boolean;
  dimmed?: boolean;
}

function VercelIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2L22 20H2L12 2z" />
    </svg>
  );
}

function LovableIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </svg>
  );
}

function NetlifyIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.934 8.519a1.044 1.044 0 0 1 .303.23l2.349-1.045-2.192-2.193-.460 3.008zM12.06 6.546a1.305 1.305 0 0 1 .209.574l3.497 1.482-.07-.369-2.695-2.695c-.38.22-.711.501-.941.81v.198zM9.07 18.578l.033-.012-.05-.05.017.062zm4.027-11.3a1.305 1.305 0 0 1 1.249.164l3.55-1.579L14.979 3h-.71l-.428 2.77.427.254-.342.34 1.172.914zM12.42 7.45a1.298 1.298 0 0 1 .157.59l3.287 1.39-.09-.568-3.354-.412zm-7.955 5.482H2v2.78l.524.524 1.941-3.304zM2 10.94v2.31l2.35-2.31H2zm9.968 6.543a1.305 1.305 0 0 1-1.745-.115l-3.42 1.265 2.102 2.102 4.111-1.967-.107-.08a1.305 1.305 0 0 1-.94-.205zM8.049 14.579a1.305 1.305 0 0 1 .627-1.126l-.42-5.924-3.978 3.604 3.771 3.446zm-.289.707l-3.671.376 2.1 2.1 1.571-2.476zm1.957-8.232l.15 2.122c.044.013.087.028.13.045l2.792-2.771-3.072.604zm.428 3.476a1.305 1.305 0 0 1 .456-.172l-.145-2.045-2.561 2.541 2.25-.324zm4.005 3.482l3.908-1.738-3.64-1.54a1.305 1.305 0 0 1-.978.547l-.672 3.507 1.382-.776zm-5.798.541a1.305 1.305 0 0 1 .144-.56l-2.22-2.029-.162 2.836 2.238-.247zm1.53 1.069a1.305 1.305 0 0 1-.47-.482l-2.439.27-1.617 2.547 4.526-2.335zm.967.437a1.305 1.305 0 0 1-.343-.072l-4.367 2.254 1.068 1.068 3.642-3.25zm.696-.39a1.305 1.305 0 0 1-.648.345l-.622 3.245 4.27-2.042-3-.548zm.757-1.31c0-.256.073-.496.201-.699l-3.768-3.444-.419 5.916a1.305 1.305 0 0 1 .664.482l3.322-2.255zm.428-1.08a1.305 1.305 0 0 1 .66-.148l.647-3.38-2.896 2.875 1.589.653zm1.394 1.99l2.976.543.38-6.39-3.974 1.766.618 4.081zm.376.78l-3.075 2.088 2.917.532 2.117-2.117-1.959-.503z" />
    </svg>
  );
}

const ICON_COLORS: Record<string, string> = {
  github: "var(--text-primary)",
  vercel: "var(--text-primary)",
  lovable: "var(--purple)",
  netlify: "#00AD9F",
};

const PROVIDER_NAMES: Record<string, string> = {
  github: "GitHub",
  vercel: "Vercel",
  lovable: "Lovable",
  netlify: "Netlify",
};

export function ConnectionCard({
  provider,
  isConnected,
  statusText,
  infoText,
  actionLabel,
  actionVariant = "connect",
  connectHref,
  onAction,
  isLoading = false,
  dimmed = false,
}: ConnectionCardProps) {
  const name = PROVIDER_NAMES[provider] ?? provider;
  const iconColor = ICON_COLORS[provider] ?? "var(--text-primary)";

  const derivedStatus =
    statusText ?? (isConnected ? "Connected" : "Not connected");

  const isStatusConnected = isConnected || (statusText ?? "").includes("detected");
  const isComingSoon = actionVariant === "disabled";

  function renderIcon() {
    const color = dimmed ? "var(--text-muted)" : iconColor;
    switch (provider) {
      case "github":
        return <Github width={18} height={18} style={{ color }} aria-hidden />;
      case "vercel":
        return (
          <span style={{ color }}>
            <VercelIcon size={18} />
          </span>
        );
      case "lovable":
        return (
          <span style={{ color }}>
            <LovableIcon size={18} />
          </span>
        );
      case "netlify":
        return (
          <span style={{ color }}>
            <NetlifyIcon size={18} />
          </span>
        );
    }
  }

  function renderButton() {
    if (actionVariant === "disconnect") {
      return (
        <button
          onClick={onAction}
          disabled={isLoading}
          style={{
            marginTop: "12px",
            fontSize: "12px",
            padding: "7px 14px",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            border: "none",
            background: "var(--surface-light)",
            color: "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            opacity: isLoading ? 0.6 : 1,
          }}
          aria-label={`Disconnect ${name}`}
        >
          {isLoading && (
            <Loader2 width={12} height={12} className="animate-spin" />
          )}
          {actionLabel ?? "Disconnect"}
        </button>
      );
    }

    if (actionVariant === "rescan") {
      return (
        <button
          onClick={onAction}
          disabled={isLoading}
          style={{
            marginTop: "12px",
            fontSize: "12px",
            padding: "7px 14px",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            border: "none",
            background: "var(--teal)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            opacity: isLoading ? 0.6 : 1,
          }}
          aria-label="Re-scan repos"
        >
          {isLoading ? (
            <Loader2 width={12} height={12} className="animate-spin" />
          ) : (
            <RefreshCw width={12} height={12} />
          )}
          {actionLabel ?? "Re-scan repos"}
        </button>
      );
    }

    if (actionVariant === "disabled") {
      return (
        <button
          disabled
          style={{
            marginTop: "12px",
            fontSize: "12px",
            padding: "7px 14px",
            borderRadius: "6px",
            cursor: "not-allowed",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            border: "none",
            background: "var(--navy)",
            color: "#fff",
            opacity: 0.4,
          }}
        >
          Connect
        </button>
      );
    }

    if (connectHref) {
      return (
        <a
          href={connectHref}
          style={{
            marginTop: "12px",
            display: "inline-block",
            fontSize: "12px",
            padding: "7px 14px",
            borderRadius: "6px",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            background: "var(--navy)",
            color: "#fff",
            textDecoration: "none",
          }}
          aria-label={`Connect ${name}`}
        >
          {actionLabel ?? "Connect"}
        </a>
      );
    }

    return null;
  }

  return (
    <div
      style={{
        padding: "18px",
        border: "0.5px solid var(--border-light)",
        borderRadius: "10px",
        background: "var(--surface-card)",
        opacity: dimmed ? 0.6 : 1,
      }}
    >
      {/* Top row: name + status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: dimmed ? "var(--text-secondary)" : "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {renderIcon()}
          {name}
        </div>

        <span
          style={{
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "4px",
            fontWeight: 500,
            background: isStatusConnected
              ? "var(--teal-bg)"
              : "var(--surface-light)",
            color: isStatusConnected
              ? "var(--teal)"
              : "var(--text-muted)",
          }}
        >
          {derivedStatus}
        </span>
      </div>

      {/* User / info text */}
      {infoText && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {infoText}
        </div>
      )}

      {isComingSoon && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Phase 2
        </div>
      )}

      {renderButton()}
    </div>
  );
}
