import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

import { generateThumbnail, isValidLiveUrl } from "@/lib/thumbnails";

vi.mock("puppeteer-core", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(undefined),
        screenshot: vi.fn().mockResolvedValue(Buffer.from("jpeg-bytes")),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock("@sparticuz/chromium-min", () => ({
  default: {
    args: [],
    executablePath: vi.fn().mockResolvedValue("/bin/chromium"),
  },
}));

describe("isValidLiveUrl", () => {
  it("accepts public https URLs", () => {
    expect(isValidLiveUrl("https://example.com/path")).toBe(true);
  });

  it("rejects localhost", () => {
    expect(isValidLiveUrl("http://localhost:3000")).toBe(false);
  });

  it("rejects non-http(s) schemes", () => {
    expect(isValidLiveUrl("ftp://example.com")).toBe(false);
  });

  it("rejects loopback and common private ranges", () => {
    expect(isValidLiveUrl("http://127.0.0.1")).toBe(false);
    expect(isValidLiveUrl("http://10.0.0.1")).toBe(false);
    expect(isValidLiveUrl("http://192.168.1.1")).toBe(false);
    expect(isValidLiveUrl("http://172.16.0.1")).toBe(false);
  });
});

describe("generateThumbnail", () => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({
    data: { publicUrl: "https://cdn.example/storage/v1/object/public/thumbnails/p1.jpg" },
  }));

  const admin = {
    storage: {
      listBuckets: vi.fn().mockResolvedValue({ data: [{ name: "thumbnails" }], error: null }),
      from: vi.fn(() => ({
        upload,
        getPublicUrl,
      })),
    },
  } as unknown as SupabaseClient<Database>;

  beforeEach(() => {
    upload.mockClear();
    getPublicUrl.mockClear();
  });

  it("throws for invalid live URLs", async () => {
    await expect(
      generateThumbnail("http://localhost:3000", "p1", admin)
    ).rejects.toThrow(/Invalid or non-public/);
  });

  it("uploads to thumbnails bucket at {projectId}.jpg", async () => {
    const result = await generateThumbnail("https://example.com", "proj-abc", admin);

    expect(upload).toHaveBeenCalledWith(
      "proj-abc.jpg",
      expect.any(Buffer),
      expect.objectContaining({ contentType: "image/jpeg", upsert: true })
    );
    expect(result.url).toContain("thumbnails");
  });
});
