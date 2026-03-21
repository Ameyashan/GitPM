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

  const [{ data: projectRow }, { data: profileRow }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const project = projectRow as Project | null;
  const username = (profileRow as { username: string | null } | null)?.username ?? null;

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 w-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-8 font-mono"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono text-teal uppercase tracking-widest mb-1">
          Edit Project
        </p>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          {project.name}
        </h1>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-sm text-text-muted font-mono">/{project.slug}</p>
          {project.github_repo_url && (
            <RefreshGitHubButton projectId={project.id} />
          )}
        </div>
      </div>

      <ProjectForm mode="edit" initialData={project} username={username} />
    </div>
  );
}
