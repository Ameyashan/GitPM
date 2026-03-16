import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { RefreshGitHubButton } from "@/components/dashboard/RefreshGitHubButton";
import type { Project } from "@/types/project";

export const metadata: Metadata = { title: "Edit Project — GitPM" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: projectRow } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const project = projectRow as Project | null;

  if (!project) {
    notFound();
  }

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
        <p className="text-xs font-mono text-teal uppercase tracking-widest mb-1">
          Edit Project
        </p>
        <h1 className="text-2xl font-display font-bold text-white">
          {project.name}
        </h1>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-sm text-white/40 font-mono">/{project.slug}</p>
          {project.github_repo_url && (
            <RefreshGitHubButton projectId={project.id} />
          )}
        </div>
      </div>

      <ProjectForm mode="edit" initialData={project} />
    </div>
  );
}
