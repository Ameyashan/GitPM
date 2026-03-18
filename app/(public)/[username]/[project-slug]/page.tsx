// Always fetch fresh data — project edits (build tools, screenshots, etc.)
// must appear immediately without waiting for a cache revalidation cycle.
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProjectHero } from "@/components/project/ProjectHero";
import { TechStackPills } from "@/components/project/TechStackPills";
import { ProjectStats } from "@/components/project/ProjectStats";
import { ProductContext } from "@/components/project/ProductContext";
import { VerifiedBadge } from "@/components/project/VerifiedBadge";
import { Separator } from "@/components/ui/separator";
import type { Project, User, Screenshot, VerificationMethod } from "@/types/project";

interface Props {
  params: Promise<{ username: string; "project-slug": string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, "project-slug": slug } = await params;
  const admin = createAdminClient();

  const { data: ownerMeta } = await admin
    .from("users")
    .select("id, display_name")
    .eq("username", username)
    .maybeSingle();

  const owner = ownerMeta as { id: string; display_name: string | null } | null;

  if (!owner) {
    return { title: "Project not found — GitPM" };
  }

  const { data: projectMeta } = await admin
    .from("projects")
    .select("name, description, thumbnail_url")
    .eq("user_id", owner.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const meta = projectMeta as {
    name: string;
    description: string;
    thumbnail_url: string | null;
  } | null;

  if (!meta) {
    return { title: "Project not found — GitPM" };
  }
  const authorName = owner.display_name ?? username;
  const title = `${meta.name} by ${authorName} — GitPM`;
  const description =
    meta.description || `${meta.name} — a project by ${authorName} on GitPM`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: meta.thumbnail_url ? [{ url: meta.thumbnail_url }] : [],
    },
    twitter: {
      card: meta.thumbnail_url ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { username, "project-slug": slug } = await params;
  const admin = createAdminClient();

  const { data: ownerRow } = await admin
    .from("users")
    .select("id, username, display_name, avatar_url")
    .eq("username", username)
    .maybeSingle();

  const owner = ownerRow as Pick<User, "id" | "username" | "display_name" | "avatar_url"> | null;

  if (!owner) {
    notFound();
  }

  const { data: projectRow } = await admin
    .from("projects")
    .select("*")
    .eq("user_id", owner.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const project = projectRow as Project | null;

  if (!project) {
    notFound();
  }

  // Fetch screenshots ordered by display_order
  const { data: screenshotRows } = await admin
    .from("screenshots")
    .select("id, project_id, image_url, display_order, created_at")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });

  const screenshots = (screenshotRows ?? []) as Screenshot[];

  const hasStats = project.commit_count !== null || project.first_commit_at !== null;

  return (
    <main className="min-h-screen bg-navy">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <Link
          href={`/${username}`}
          className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-8 font-mono"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {owner.display_name ?? username}
        </Link>

        {/* Hero */}
        <div className="mb-8">
          <ProjectHero project={project} screenshots={screenshots} />
        </div>

        {/* Title + verified */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-white leading-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-white/55 mt-1.5 text-[15px] leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          {project.is_verified && project.verification_method && (
            <div className="shrink-0 mt-0.5">
              <VerifiedBadge
                method={project.verification_method as VerificationMethod}
                size="full"
              />
            </div>
          )}
        </div>

        {/* Pills */}
        <TechStackPills
          buildTools={project.build_tools}
          hosting={project.hosting_platform}
          stack={project.tech_stack}
          categories={project.category_tags}
          verificationMethod={
            project.verification_method as VerificationMethod | null
          }
        />

        {/* Live URL */}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-mono text-white/40 hover:text-teal transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {project.live_url}
          </a>
        )}

        <Separator className="my-8 bg-gitpm-border/20" />

        {/* Stats */}
        <ProjectStats project={project} />

        {hasStats && <Separator className="my-8 bg-gitpm-border/20" />}

        {/* Product context */}
        <ProductContext project={project} />
      </div>
    </main>
  );
}
