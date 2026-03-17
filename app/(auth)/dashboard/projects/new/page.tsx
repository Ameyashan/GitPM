import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Triangle } from "lucide-react";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import type { Project } from "@/types/project";

export const metadata: Metadata = { title: "Add Project — GitPM" };

interface NewProjectPageProps {
  searchParams: Promise<{
    name?: string;
    slug?: string;
    live_url?: string;
    github_repo_url?: string;
    hosting_platform?: string;
  }>;
}

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const params = await searchParams;

  const isPreFilled = Boolean(params.name || params.live_url);

  // Build initialData only from validated URL params — never trust raw input beyond type coercion
  const initialData: Partial<Project> = {};
  if (params.name) initialData.name = params.name;
  if (params.slug) initialData.slug = params.slug;
  if (params.live_url) initialData.live_url = params.live_url;
  if (params.github_repo_url) initialData.github_repo_url = params.github_repo_url;
  if (params.hosting_platform) initialData.hosting_platform = params.hosting_platform;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 w-full">
      <Link
        href={isPreFilled ? "/dashboard/projects/import" : "/dashboard"}
        className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-8 font-mono"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {isPreFilled ? "Back to Import" : "Back to Dashboard"}
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono text-purple uppercase tracking-widest mb-1">
          New Project
        </p>
        <h1 className="text-2xl font-display font-bold text-white">
          Add a project
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Document what you built, why you built it, and how.
        </p>
      </div>

      {isPreFilled && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-purple/20 bg-purple/5 px-4 py-3">
          <Triangle className="h-4 w-4 text-purple shrink-0 mt-0.5" />
          <p className="text-xs text-white/50">
            Pre-filled from your Vercel deployment. Review the details and complete the PM context below.
          </p>
        </div>
      )}

      <ProjectForm mode="create" initialData={initialData} />
    </div>
  );
}
