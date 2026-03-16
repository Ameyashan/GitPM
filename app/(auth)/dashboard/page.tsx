import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { DashboardProjectActions } from "@/components/dashboard/DashboardProjectActions";
import { PlusCircle, ExternalLink, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard — GitPM" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, display_name, headline, avatar_url, github_username")
    .eq("id", user.id)
    .single();

  if (!profile?.headline) {
    redirect("/onboarding");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, slug, is_published, thumbnail_url, live_url, display_order, created_at"
    )
    .eq("user_id", user.id)
    .order("display_order", { ascending: true });

  const publishedCount = projects?.filter((p) => p.is_published).length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <main>
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-teal mb-1 uppercase tracking-widest">
              Dashboard
            </p>
            <h1 className="text-2xl font-display font-bold text-white">
              Hey, {profile.display_name?.split(" ")[0] ?? profile.username} 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">{profile.headline}</p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className={cn(
              buttonVariants(),
              "bg-purple hover:bg-purple/90 text-white gap-2 self-start sm:self-auto"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            Add project
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          <div className="rounded-lg border border-gitpm-border/40 bg-surface-dark/40 px-4 py-3">
            <p className="text-2xl font-display font-bold text-white">
              {projects?.length ?? 0}
            </p>
            <p className="text-xs text-white/40 mt-0.5">Total projects</p>
          </div>
          <div className="rounded-lg border border-gitpm-border/40 bg-surface-dark/40 px-4 py-3">
            <p className="text-2xl font-display font-bold text-teal">
              {publishedCount}
            </p>
            <p className="text-xs text-white/40 mt-0.5">Published</p>
          </div>
          {profile.username && (
            <div className="rounded-lg border border-gitpm-border/40 bg-surface-dark/40 px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-sm font-mono text-purple truncate">
                gitpm.dev/{profile.username}
              </p>
              <Link
                href={`/${profile.username}`}
                className="text-xs text-white/40 mt-0.5 flex items-center gap-1 hover:text-white/70 transition-colors"
              >
                View public profile
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Projects list or empty state */}
        {!projects || projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gitpm-border/40 bg-surface-dark/20 p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple/10 flex items-center justify-center">
              <Layers className="h-6 w-6 text-purple/60" />
            </div>
            <h2 className="text-lg font-display font-semibold text-white mb-2">
              No projects yet
            </h2>
            <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">
              Add your first shipped project and start building your verified
              portfolio.
            </p>
            <Link
              href="/dashboard/projects/new"
              className={cn(
                buttonVariants(),
                "bg-purple hover:bg-purple/90 text-white gap-2"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              Add your first project
            </Link>
          </div>
        ) : (
          <DashboardProjectActions projects={projects} />
        )}
      </main>
    </div>
  );
}
