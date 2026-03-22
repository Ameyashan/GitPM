// Puppeteer thumbnail generation helper
// Called by the Vercel cron job at /api/cron/thumbnails

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ThumbnailResult {
  url: string;
  generatedAt: string;
}

/**
 * Returns true only for public http(s) URLs that are safe to screenshot
 * (rejects localhost, non-http schemes, and common private/reserved hosts).
 */
export function isValidLiveUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return false;
  }

  const host = u.hostname.toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost")) {
    return false;
  }

  if (host === "127.0.0.1" || host === "[::1]" || host === "::1") {
    return false;
  }

  const octets = host.split(".").map((p) => parseInt(p, 10));
  if (octets.length === 4 && octets.every((n) => !Number.isNaN(n))) {
    const [a, b] = octets;
    if (a === 10) return false;
    if (a === 127) return false;
    if (a === 192 && b === 168) return false;
    if (a === 172 && b !== undefined && b >= 16 && b <= 31) return false;
    if (a === 100 && b !== undefined && b >= 64 && b <= 127) return false;
  }

  return true;
}

async function ensureThumbnailBucket(
  adminClient: SupabaseClient<Database>
): Promise<void> {
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  const bucketExists = buckets.some((bucket) => bucket.name === "thumbnails");
  if (bucketExists) {
    return;
  }

  const { error: createError } = await adminClient.storage.createBucket(
    "thumbnails",
    { public: true }
  );

  if (createError) {
    throw new Error(`Failed to create thumbnails bucket: ${createError.message}`);
  }
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
  if (!isValidLiveUrl(liveUrl)) {
    throw new Error("Invalid or non-public live URL for thumbnail capture");
  }

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

  await ensureThumbnailBucket(adminClient);

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

export async function generateAndStoreProjectThumbnail(
  projectId: string,
  liveUrl: string,
  adminClient: SupabaseClient<Database>
): Promise<string> {
  const result = await generateThumbnail(liveUrl, projectId, adminClient);

  const { error: updateError } = await adminClient
    .from("projects")
    .update({ thumbnail_url: result.url })
    .eq("id", projectId);

  if (updateError) {
    throw new Error(`Failed to save thumbnail URL: ${updateError.message}`);
  }

  return result.url;
}
