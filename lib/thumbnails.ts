// Puppeteer thumbnail generation helper
// Called by the Vercel cron job at /api/cron/thumbnails

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ThumbnailResult {
  url: string;
  generatedAt: string;
}

/**
 * Screenshots a live URL using headless Chromium and uploads the result to
 * Supabase Storage under the `thumbnails` bucket at path `{projectId}.jpg`.
 *
 * Uses @sparticuz/chromium-min for serverless compatibility (Vercel Functions).
 * In local development, falls back to a locally installed Chrome/Chromium if
 * the CHROME_EXECUTABLE_PATH env var is set.
 */
export async function generateThumbnail(
  liveUrl: string,
  projectId: string,
  adminClient: SupabaseClient<Database>
): Promise<ThumbnailResult> {
  // Dynamic imports keep the heavy packages out of the default bundle
  const puppeteer = await import("puppeteer-core");
  const chromium = await import("@sparticuz/chromium-min");

  const executablePath =
    process.env.CHROME_EXECUTABLE_PATH ??
    (await chromium.default.executablePath(
      // This remote URL is the recommended public CDN for chromium-min
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    ));

  const browser = await puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 1280, height: 800 },
    executablePath,
    headless: true,
  });

  let screenshotBuffer: Buffer;
  try {
    const page = await browser.newPage();
    await page.goto(liveUrl, {
      waitUntil: "networkidle2",
      timeout: 25_000,
    });
    screenshotBuffer = (await page.screenshot({
      type: "jpeg",
      quality: 85,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })) as Buffer;
  } finally {
    await browser.close();
  }

  const storagePath = `${projectId}.jpg`;

  const { error: uploadError } = await adminClient.storage
    .from("thumbnails")
    .upload(storagePath, screenshotBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from("thumbnails").getPublicUrl(storagePath);

  return {
    url: publicUrl,
    generatedAt: new Date().toISOString(),
  };
}
