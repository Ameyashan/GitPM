export type VideoProvider = "youtube" | "loom";

export interface ParsedVideoUrl {
  embedUrl: string;
  provider: VideoProvider;
  /** Provider-specific embed id (YouTube 11-char id or Loom hex id). */
  id: string;
}

/**
 * Parses a demo video URL into an embeddable URL and stable id.
 * Supports youtube.com/watch, youtu.be, and loom.com/share.
 */
export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      provider: "youtube",
      id: ytMatch[1],
    };
  }

  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      provider: "loom",
      id: loomMatch[1],
    };
  }

  return null;
}
