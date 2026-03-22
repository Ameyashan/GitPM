import { describe, expect, it } from "vitest";

import { parseVideoUrl } from "@/lib/video";

describe("parseVideoUrl", () => {
  it("parses youtube.com watch URLs", () => {
    const r = parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(r?.provider).toBe("youtube");
    expect(r?.id).toBe("dQw4w9WgXcQ");
    expect(r?.embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("parses youtu.be short links", () => {
    const r = parseVideoUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(r?.provider).toBe("youtube");
    expect(r?.id).toBe("dQw4w9WgXcQ");
  });

  it("parses loom.com share URLs", () => {
    const r = parseVideoUrl("https://www.loom.com/share/abc123def456");
    expect(r?.provider).toBe("loom");
    expect(r?.id).toBe("abc123def456");
    expect(r?.embedUrl).toBe("https://www.loom.com/embed/abc123def456");
  });

  it("returns null for invalid URLs", () => {
    expect(parseVideoUrl("not-a-url")).toBeNull();
    expect(parseVideoUrl("https://example.com")).toBeNull();
  });
});
