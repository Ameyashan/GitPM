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

  const { data: projectMeta } = await admin
    .from("projects")
    .select("name, description, thumbnail_url, user_id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const meta = projectMeta as {
    name: string;
    description: string;
    thumbnail_url: string | null;
    user_id: string;
  } | null;

  if (!meta) {
    return { title: "Project not found — GitPM" };
  }

  const { data: userMeta } = await admin
    .from("users")
    .select("display_name")
    .eq("id", meta.user_id)
    .maybeSingle();

  const author = userMeta as { display_name: string | null } | null;
  const authorName = author?.display_name ?? username;
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

  const { data: projectRow } = await admin
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const project = projectRow as Project | null;

  if (!project) {
    notFound();
  }

  // Verify the username in the URL matches the project owner
  const { data: ownerRow } = await admin
    .from("users")
    .select("username, display_name, avatar_url")
    .eq("id", project.user_id)
    .maybeSingle();

  const owner = ownerRow as Pick<User, "username" | "display_name" | "avatar_url"> | null;

  if (!owner || owner.username !== username) {
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
