import Link from "next/link";
import Image from "next/image";
import { GitCommitHorizontal, User, Users } from "lucide-react";
import { BadgePill } from "@/components/shared/BadgePill";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import { VerifiedBadge } from "@/components/project/VerifiedBadge";
import type { Project } from "@/types/project";
import type { VerificationMethod } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  username: string;
}

const MAX_VISIBLE_PILLS = 3;

interface PillData {
  label: string;
  variant: "purple" | "teal" | "default";
}

export function ProjectCard({ project, username }: ProjectCardProps) {
  const allPills: PillData[] = [
    ...project.build_tools.map((t) => ({ label: t, variant: "purple" as const })),
    ...(project.hosting_platform
      ? [{ label: project.hosting_platform, variant: "teal" as const }]
      : []),
    ...project.tech_stack.map((t) => ({ label: t, variant: "default" as const })),
  ];
  const visiblePills = allPills.slice(0, MAX_VISIBLE_PILLS);
  const overflowCount = Math.max(0, allPills.length - MAX_VISIBLE_PILLS);

  const hasVideo = Boolean(project.demo_video_url);
  const hasThumbnail = Boolean(project.thumbnail_url);

  return (
    <Link
      href={`/${username}/${project.slug}`}
      className="group block rounded-xl bg-surface-dark border border-gitpm-border/30 overflow-hidden hover:border-gitpm-border/70 hover:shadow-xl hover:shadow-navy/50 transition-all duration-200"
    >
      {/* Thumbnail / Video area */}
      <div className="relative aspect-video bg-navy/60 overflow-hidden">
        {hasThumbnail ? (
          <Image
            src={project.thumbnail_url!}
            alt={project.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple/10 via-navy/80 to-teal/10" />
        )}
        {hasVideo && <VideoEmbed url={project.demo_video_url!} cardOverlay />}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Title + verified */}
        <div className="flex items-start gap-2">
          <h3 className="font-display font-semibold text-white text-[15px] leading-snug flex-1 truncate">
            {project.name}
          </h3>
          {project.is_verified && project.verification_method && (
            <VerifiedBadge
              method={project.verification_method as VerificationMethod}
              size="inline"
            />
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-white/55 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Pills row */}
        <div className="flex flex-wrap gap-1.5">
          {visiblePills.map((pill, i) => (
            <BadgePill key={`${pill.variant}-${i}`} label={pill.label} variant={pill.variant} />
          ))}
          {overflowCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-surface-dark border border-gitpm-border/40 px-2 py-0.5 text-[10px] font-mono text-white/40">
              +{overflowCount}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 pt-0.5 text-xs text-white/35 font-mono">
          {project.commit_count !== null && project.commit_count > 0 && (
            <span className="flex items-center gap-1">
              <GitCommitHorizontal className="h-3 w-3" />
              {project.commit_count}
            </span>
          )}
          <span className="flex items-center gap-1">
            {project.is_solo ? (
              <>
                <User className="h-3 w-3" />
                Solo
              </>
            ) : (
              <>
                <Users className="h-3 w-3" />
                Collab
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
