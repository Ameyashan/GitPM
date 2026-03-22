import { describe, expect, it } from "vitest";

import { matchLiveUrlToDeployment } from "@/lib/vercel";

describe("matchLiveUrlToDeployment", () => {
  it("returns true for exact same HTTPS URL", () => {
    expect(
      matchLiveUrlToDeployment(
        "https://my-app.vercel.app",
        "https://my-app.vercel.app"
      )
    ).toBe(true);
  });

  it("normalizes trailing slashes", () => {
    expect(
      matchLiveUrlToDeployment(
        "https://my-app.vercel.app/",
        "https://my-app.vercel.app"
      )
    ).toBe(true);
  });

  it("treats http and https as the same host", () => {
    expect(
      matchLiveUrlToDeployment(
        "http://my-app.vercel.app",
        "https://my-app.vercel.app/path"
      )
    ).toBe(true);
  });

  it("treats www. as equivalent", () => {
    expect(
      matchLiveUrlToDeployment(
        "https://www.example.com",
        "https://example.com"
      )
    ).toBe(true);
  });

  it("returns false for different subdomains", () => {
    expect(
      matchLiveUrlToDeployment(
        "https://a.vercel.app",
        "https://b.vercel.app"
      )
    ).toBe(false);
  });
});
