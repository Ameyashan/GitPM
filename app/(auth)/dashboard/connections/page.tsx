import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ConnectionsManager } from "@/components/dashboard/ConnectionsManager";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Connected Accounts — GitPM" };

export default async function ConnectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get the GitHub username from the user's profile (populated during onboarding)
  const { data: profile } = await supabase
    .from("users")
    .select("github_username, created_at")
    .eq("id", user.id)
    .single();

  // Check if Vercel is connected
  const { data: vercelAccount } = await supabase
    .from("connected_accounts")
    .select("provider_username, connected_at")
    .eq("user_id", user.id)
    .eq("provider", "vercel")
    .maybeSingle();

  const initialVercel = vercelAccount
    ? {
        username: vercelAccount.provider_username,
        connectedAt: vercelAccount.connected_at,
      }
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono text-teal mb-1 uppercase tracking-widest">
          Settings
        </p>
        <h1 className="text-2xl font-display font-bold text-white">
          Connected Accounts
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Connect platforms to verify ownership of your deployed projects.
        </p>
      </div>

      {/* Info callout */}
      <div className="mb-6 flex gap-3 rounded-lg border border-teal/20 bg-teal/5 px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-teal mt-0.5 shrink-0" />
        <p className="text-sm text-white/60 leading-relaxed">
          Connecting Vercel lets GitPM verify that you own the projects you list.
          Verified projects display a{" "}
          <span className="text-teal font-medium">Verified Owner</span> badge on
          your public profile.
        </p>
      </div>

      {/* Connection cards */}
      <Suspense fallback={<ConnectionsSkeleton />}>
        <ConnectionsManager
          githubUsername={profile?.github_username ?? null}
          githubConnectedAt={profile?.created_at ?? null}
          initialVercel={initialVercel}
        />
      </Suspense>

      {/* Help text */}
      <div className="mt-8 rounded-lg border border-gitpm-border/20 bg-surface-dark/30 px-4 py-4">
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-2">
          How verification works
        </p>
        <ol className="text-sm text-white/40 space-y-1.5 list-decimal list-inside">
          <li>Connect your Vercel account using OAuth above.</li>
          <li>
            GitPM compares each project&apos;s live URL against your Vercel
            deployments.
          </li>
          <li>
            Matched projects are automatically marked as{" "}
            <span className="text-teal">Verified Owner</span>.
          </li>
          <li>
            Disconnecting Vercel removes verified badges from affected projects.
          </li>
        </ol>
      </div>
    </div>
  );
}

function ConnectionsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[68px] w-full rounded-xl bg-surface-dark/50" />
      <Skeleton className="h-[68px] w-full rounded-xl bg-surface-dark/50" />
    </div>
  );
}
