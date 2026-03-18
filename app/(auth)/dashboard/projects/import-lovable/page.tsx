import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LovableImportPicker } from "@/components/dashboard/LovableImportPicker";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Import from Lovable — GitPM" };

export default async function ImportFromLovablePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Check if GitHub token is stored — users who haven't signed in since the
  // token-persistence fix was deployed will see a prompt to re-authenticate.
  const { data: githubAccount } = await supabase
    .from("connected_accounts")
    .select("provider_username")
    .eq("user_id", user.id)
    .eq("provider", "github")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 w-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-8 font-mono"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono text-purple uppercase tracking-widest mb-1">
          Import Projects
        </p>
        <h1 className="text-2xl font-display font-bold text-white">
          Import from Lovable
        </h1>
        <p className="text-sm text-white/40 mt-1">
          GitPM scans your GitHub repos for Lovable projects and pre-fills your
          project form. You&apos;ll still add the PM context that makes your
          portfolio stand out.
        </p>
      </div>

      {!githubAccount ? (
        <div className="rounded-xl border border-gitpm-border/40 bg-surface-dark/30 p-8 text-center space-y-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-purple/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple/60" />
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">
              GitHub access needed
            </p>
            <p className="text-xs text-white/40 max-w-xs mx-auto">
              Sign out and sign back in with GitHub to grant GitPM access to
              scan your repositories.
            </p>
          </div>
          <Link
            href="/api/auth/signout"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-purple hover:bg-purple/90 text-white"
            )}
          >
            Sign out &amp; reconnect
          </Link>
        </div>
      ) : (
        <>
          {githubAccount.provider_username && (
            <p className="text-xs font-mono text-white/30 mb-4">
              Scanning repos for{" "}
              <span className="text-white/50">@{githubAccount.provider_username}</span>
            </p>
          )}
          <LovableImportPicker />
        </>
      )}
    </div>
  );
}
