"use client";

import Image from "next/image";
import { GitCommitHorizontal, User, Users, Play } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const MAX_VISIBLE_PILLS = 3;

interface PillData {
  label: string;
  variant: "purple" | "teal" | "default";
}

function getPillStyle(variant: "purple" | "teal" | "default"): string {
  switch (variant) {
    case "purple":
      return "text-purple";
    case "teal":
      return "text-teal";
    default:
      return "text-text-secondary";
  }
}

function getPillBg(variant: "purple" | "teal" | "default"): string {
  switch (variant) {
    case "purple":
      return "var(--purple-bg)";
    case "teal":
      return "var(--teal-bg)";
    default:
      return "var(--surface-light)";
  }
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group block bg-white rounded-[14px] overflow-hidden transition-all duration-200 hover:-translate-y-px [border:0.5px_solid_var(--border-light)] hover:[border:0.5px_solid_var(--border)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple/40"
    >
      {/* Card hero */}
      <div className="relative h-[120px] bg-dark-surface overflow-hidden flex items-center justify-center">
        {/* Mesh blobs — always in background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute w-[120px] h-[120px] rounded-full bg-teal blur-[30px] -top-5 right-5" />
          <div className="absolute w-20 h-20 rounded-full bg-purple blur-[30px] -bottom-2.5 left-[30px]" />
          <div className="absolute w-[60px] h-[60px] rounded-full bg-forest blur-[30px] top-[30px] left-1/2" />
        </div>

        {/* Thumbnail if available */}
        {hasThumbnail && (
          <Image
            src={project.thumbnail_url!}
            alt={project.name}
            fill
            className="object-cover z-[1]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}

        {/* Wireframe placeholder (when no thumbnail) */}
        {!hasThumbnail && (
          <div
            className="relative z-[1] w-4/5 h-[90px] rounded-[6px] grid gap-1 p-2"
            style={{
              border: "0.5px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              gridTemplateColumns: "1fr 2fr",
            }}
          >
            <div className="rounded-[3px]" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="rounded-[3px]" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        )}

        {/* Play button overlay */}
        {hasVideo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div
              className="w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-[0_1px_8px_rgba(0,0,0,0.2)] transition-all duration-150 opacity-[0.85] group-hover:scale-105 group-hover:opacity-100"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <Play className="h-4 w-4 fill-navy text-navy ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-4 pt-[14px] pb-4">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-[3px]">
          <h3
            className="text-[15px] font-medium text-text-primary flex-1 truncate"
            style={{ letterSpacing: "-0.2px" }}
          >
            {project.name}
          </h3>
          {project.is_verified && (
            <span
              className="inline-flex items-center gap-[3px] text-[10px] font-medium px-2 py-0.5 rounded-[4px] text-teal whitespace-nowrap shrink-0"
              style={{ background: "var(--teal-bg)" }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-[10px] h-[10px]">
                <path
                  d="M3 8.5L6.5 12L13 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p
            className="text-[13px] text-text-secondary line-clamp-2 mb-3"
            style={{ lineHeight: 1.45 }}
          >
            {project.description}
          </p>
        )}

        {/* Pills row */}
        {allPills.length > 0 && (
          <div className="flex flex-wrap gap-[5px] mb-[14px]">
            {visiblePills.map((pill, i) => (
              <span
                key={`${pill.variant}-${i}`}
                className={`text-[11px] font-medium px-[10px] py-[3px] rounded-[4px] ${getPillStyle(pill.variant)}`}
                style={{ background: getPillBg(pill.variant) }}
              >
                {pill.label}
              </span>
            ))}
            {overflowCount > 0 && (
              <span
                className="text-[11px] text-text-muted px-[10px] py-[3px] rounded-[4px]"
                style={{ border: "0.5px solid var(--border)" }}
              >
                +{overflowCount}
              </span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-[14px] text-[11px] text-text-muted font-mono">
          {project.commit_count !== null && project.commit_count > 0 && (
            <span className="flex items-center gap-1">
              <GitCommitHorizontal className="h-3 w-3 shrink-0" />
              {project.commit_count}
            </span>
          )}
          <span className="flex items-center gap-1">
            {project.is_solo ? (
              <>
                <User className="h-3 w-3 shrink-0" />
                Solo
              </>
            ) : (
              <>
                <Users className="h-3 w-3 shrink-0" />
                Collab
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
