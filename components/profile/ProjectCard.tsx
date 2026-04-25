"use client";

import { User, Users, Rocket } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const MAX_VISIBLE_PILLS = 2;

function Sparkline({ seed }: { seed: number }) {
  const points = Array.from({ length: 16 }, (_, i) => {
    const v = (Math.sin(seed * 0.7 + i * 0.9) + 1) / 2;
    const noise = ((seed * (i + 1)) % 7) / 14;
    return Math.max(0.1, Math.min(0.95, v * 0.7 + noise * 0.3));
  });
  const w = 100;
  const h = 24;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(h - p * h).toFixed(2)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[24px]">
      <path d={path} fill="none" stroke="var(--teal)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const tagPills = [
    ...project.category_tags.slice(0, MAX_VISIBLE_PILLS),
    ...(project.category_tags.length < MAX_VISIBLE_PILLS
      ? project.tech_stack.slice(0, MAX_VISIBLE_PILLS - project.category_tags.length)
      : []),
  ];

  // Deterministic seed for the sparkline so it doesn't reshuffle between renders
  const seed = project.id
    ? project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : (project.commit_count ?? 7) + project.name.length;

  const commits = project.commit_count ?? 0;
  const deploysIndicator = project.latest_deploy_at ? "Deployed" : null;

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
      className="group bg-white rounded-[14px] p-[18px] transition-all duration-200 hover:-translate-y-px [border:0.5px_solid_var(--border-light)] hover:[border:0.5px_solid_var(--border)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple/40"
    >
      {/* Title row */}
      <div className="flex items-center gap-2 mb-[6px]">
        <h3
          className="text-[15px] font-medium text-text-primary flex-1 truncate font-mono"
          style={{ letterSpacing: "-0.2px" }}
        >
          {project.name}
        </h3>
        {project.is_verified && (
          <span
            className="inline-flex items-center gap-[3px] text-[10px] font-medium px-2 py-0.5 rounded-[4px] text-teal whitespace-nowrap shrink-0 uppercase"
            style={{ background: "var(--teal-bg)", letterSpacing: "0.06em" }}
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
          className="text-[13px] text-text-secondary line-clamp-2"
          style={{ lineHeight: 1.5 }}
        >
          {project.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-[14px] text-[11px] text-text-muted font-mono mt-[12px]">
        <span className="flex items-center gap-[5px]">
          <span className="font-medium text-text-secondary">{commits}</span>
          commits
        </span>
        <span className="flex items-center gap-[5px]">
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
        {deploysIndicator && (
          <span className="flex items-center gap-[5px]">
            <Rocket className="h-3 w-3 shrink-0" />
            {deploysIndicator}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {commits > 0 && (
        <div className="mt-[10px] opacity-80">
          <Sparkline seed={seed} />
        </div>
      )}

      {/* Tags */}
      {tagPills.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mt-[12px]">
          {tagPills.map((p) => (
            <span
              key={p}
              className="text-[11px] text-text-secondary px-[8px] py-[2px] rounded-[4px]"
              style={{ background: "var(--surface-light)" }}
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
