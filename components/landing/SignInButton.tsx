"use client";

import { useState, useEffect } from "react";
import { Loader2, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const GITHUB_ICON_PATH =
  "M8 1C4.13 1 1 4.13 1 8c0 3.1 2 5.7 4.8 6.6.35.07.48-.15.48-.34v-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.82-.78-1.04-.78-1.04-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.56-.18-3.2-.78-3.2-3.48 0-.77.28-1.4.72-1.89-.07-.18-.31-.9.07-1.87 0 0 .59-.19 1.92.72a6.6 6.6 0 013.5 0c1.33-.91 1.92-.72 1.92-.72.38.97.14 1.69.07 1.87.45.49.72 1.12.72 1.89 0 2.71-1.65 3.3-3.22 3.48.25.22.48.65.48 1.31v1.94c0 .19.13.41.48.34C13 13.7 15 11.1 15 8c0-3.87-3.13-7-7-7z";

const WHITE_BTN_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background: "var(--white)",
  color: "var(--navy)",
  border: "none",
  padding: "13px 28px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  letterSpacing: "-0.1px",
  textDecoration: "none",
};

interface SignInButtonProps {
  size?: "default" | "lg";
  variant?: "default" | "white";
  className?: string;
  label?: string;
}

export function SignInButton({
  size = "default",
  variant = "default",
  className,
  label = "Sign up with GitHub",
}: SignInButtonProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  async function handleSignIn() {
    setSigningIn(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "read:user repo",
      },
    });
  }

  if (variant === "white") {
    // Still resolving auth state — render a same-sized skeleton
    if (isLoggedIn === null) {
      return (
        <div
          className={cn("landing-cta-btn", className)}
          style={{ ...WHITE_BTN_STYLE, opacity: 0, pointerEvents: "none" }}
          aria-hidden
        >
          Dashboard
        </div>
      );
    }

    // Logged in → link to dashboard
    if (isLoggedIn) {
      return (
        <Link
          href="/dashboard"
          className={cn("landing-cta-btn", className)}
          style={WHITE_BTN_STYLE}
        >
          <LayoutDashboard style={{ width: "16px", height: "16px" }} />
          Dashboard
        </Link>
      );
    }

    // Logged out → GitHub OAuth
    return (
      <button
        type="button"
        onClick={handleSignIn}
        disabled={signingIn}
        className={cn("landing-cta-btn disabled:opacity-50 disabled:pointer-events-none", className)}
        style={WHITE_BTN_STYLE}
      >
        {signingIn ? (
          <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
        ) : (
          <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: "16px", height: "16px" }}>
            <path d={GITHUB_ICON_PATH} />
          </svg>
        )}
        {label}
      </button>
    );
  }

  // ── default purple variant (nav / other usages) ──────────────
  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={signingIn}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "bg-purple text-white hover:bg-purple/90 disabled:opacity-50 disabled:pointer-events-none",
        size === "lg" ? "h-12 px-8 text-base" : "h-8 px-3 text-sm",
        className
      )}
    >
      {signingIn ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
          <path d={GITHUB_ICON_PATH} />
        </svg>
      )}
      {label}
    </button>
  );
}
