"use client";

import { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SignInButtonProps {
  size?: "default" | "lg";
  className?: string;
  label?: string;
}

export function SignInButton({
  size = "default",
  className,
  label = "Sign up with GitHub",
}: SignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "read:user repo",
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "bg-purple text-white hover:bg-purple/90 disabled:opacity-50 disabled:pointer-events-none",
        size === "lg"
          ? "h-12 px-8 text-base"
          : "h-8 px-3 text-sm",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Github className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
