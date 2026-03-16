"use client";

import { Play } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  title?: string;
  /** Renders a static play-button overlay instead of the live iframe — used on project cards */
  cardOverlay?: boolean;
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;

  return null;
}

export function VideoEmbed({ url, title = "Demo video", cardOverlay = false }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="aspect-video bg-surface-dark rounded-lg flex items-center justify-center">
        <p className="text-white/40 text-sm">Invalid video URL</p>
      </div>
    );
  }

  if (cardOverlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-navy/40">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Play className="h-5 w-5 text-navy fill-navy ml-0.5" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
