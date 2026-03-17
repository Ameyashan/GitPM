import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Triangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VercelImportPicker } from "@/components/dashboard/VercelImportPicker";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Import from Vercel — GitPM" };

export default async function ImportFromVercelPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("id, provider_username")
    .eq("user_id", user.id)
    .eq("provider", "vercel")
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
          Import from Vercel
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Select a deployment to pre-fill your project form. You&apos;ll still
          add the PM context that makes your portfolio stand out.
        </p>
      </div>

      {!account ? (
        <div className="rounded-xl border border-gitpm-border/40 bg-surface-dark/30 p-8 text-center space-y-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-purple/10 flex items-center justify-center">
            <Triangle className="h-5 w-5 text-purple/60" />
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Vercel not connected
            </p>
            <p className="text-xs text-white/40">
              Connect your Vercel account first to import deployments.
            </p>
          </div>
          <Link
            href="/dashboard/connections"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-purple hover:bg-purple/90 text-white"
            )}
          >
            Connect Vercel
          </Link>
        </div>
      ) : (
        <>
          {account.provider_username && (
            <p className="text-xs font-mono text-white/30 mb-4">
              Connected as{" "}
              <span className="text-white/50">{account.provider_username}</span>
            </p>
          )}
          <VercelImportPicker />
        </>
      )}
    </div>
  );
}
