import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProjectForm } from "@/components/dashboard/ProjectForm";

export const metadata: Metadata = { title: "Add Project — GitPM" };

export default function NewProjectPage() {
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
          New Project
        </p>
        <h1 className="text-2xl font-display font-bold text-white">
          Add a project
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Document what you built, why you built it, and how.
        </p>
      </div>

      <ProjectForm mode="create" />
    </div>
  );
}
