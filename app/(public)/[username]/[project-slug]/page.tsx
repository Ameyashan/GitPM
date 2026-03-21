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
    <main className="min-h-screen bg-page-bg">
      {/* ── Dark hero section ── */}
      <div className="bg-navy">
        <div className="mx-auto max-w-[880px] px-10 max-md:px-5 pt-8 pb-0">
          {/* Breadcrumb */}
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-6 font-mono"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {owner.display_name ?? username}
          </Link>

          {/* Hero image — sits flush at the bottom of the dark section */}
          <ProjectHero project={project} screenshots={screenshots} />
        </div>
      </div>

      {/* ── Light content section ── */}
      <div className="mx-auto max-w-[880px] px-10 max-md:px-5 pb-16">
        {/* Stats bar — floats over the hero/content boundary */}
        {hasStats && <ProjectStats project={project} />}

        {/* Title + verified */}
        <div className={`flex flex-col sm:flex-row sm:items-start gap-3 mb-4 ${hasStats ? "mt-6" : "mt-8"}`}>
          <div className="flex-1 min-w-0">
            <h1
              className="text-[24px] font-medium text-text-primary leading-tight"
              style={{ letterSpacing: "-0.5px" }}
            >
              {project.name}
            </h1>
            {project.description && (
              <p className="text-text-secondary mt-1.5 text-[15px] leading-relaxed">
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
          verificationMethod={project.verification_method as VerificationMethod | null}
          mode="light"
        />

        {/* Live URL */}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-mono text-text-muted hover:text-teal transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {project.live_url}
          </a>
        )}

        {/* Product context sections */}
        <ProductContext project={project} />

        {/* Footer rule */}
        <div className="mt-12 pt-5" style={{ borderTop: "0.5px solid var(--border-light)" }} />
      </div>
    </main>
  );
}
