"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import type { Project, Screenshot } from "@/types/project";

interface ProjectHeroProps {
  project: Project;
  screenshots?: Screenshot[];
}

export function ProjectHero({ project, screenshots = [] }: ProjectHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Priority: video > screenshot gallery > single thumbnail > placeholder
  if (project.demo_video_url) {
    return <VideoEmbed url={project.demo_video_url} title={`${project.name} demo`} />;
  }

  if (screenshots.length > 0) {
    const current = screenshots[currentIndex];
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < screenshots.length - 1;

    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-dark group">
        <Image
          src={current.image_url}
          alt={`${project.name} screenshot ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority={currentIndex === 0}
        />

        {screenshots.length > 1 && (
          <>
            {/* Left arrow */}
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={!hasPrev}
              aria-label="Previous screenshot"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-navy/70 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 hover:bg-navy/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Right arrow */}
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!hasNext}
              aria-label="Next screenshot"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-navy/70 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 hover:bg-navy/90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (project.thumbnail_url) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-dark">
        <Image
          src={project.thumbnail_url}
          alt={project.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-purple/10 via-surface-dark to-teal/10 flex items-center justify-center">
      <span className="text-white/20 text-sm font-mono">{project.name}</span>
    </div>
  );
}
