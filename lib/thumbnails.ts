// Puppeteer thumbnail generation helper — implemented in Ticket 7
// Called by the Vercel cron job at /api/cron/thumbnails

export interface ThumbnailResult {
  url: string;
  generatedAt: string;
}

export async function generateThumbnail(
  _liveUrl: string
): Promise<ThumbnailResult> {
  // TODO (Ticket 7): Launch headless Chromium via puppeteer-core,
  // screenshot the live_url, upload to Supabase Storage, return the storage URL.
  throw new Error("generateThumbnail not yet implemented — see Ticket 7");
}
