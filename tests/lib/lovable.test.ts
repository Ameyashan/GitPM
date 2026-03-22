import { describe, expect, it } from "vitest";
import type { GitHubRepo } from "@/types/github";

import { isLovableRepo, matchesLovableDeployment } from "@/lib/lovable";

function baseRepo(overrides: Partial<GitHubRepo>): GitHubRepo {
  return {
    id: 1,
    name: "my-app",
    full_name: "owner/my-app",
    description: null,
    html_url: "https://github.com/owner/my-app",
    homepage: null,
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    private: false,
    default_branch: "main",
    topics: [],
    created_at: "",
    updated_at: "",
    pushed_at: "",
    ...overrides,
  };
}

describe("isLovableRepo", () => {
  it("matches repo names prefixed with lovable-", () => {
    expect(isLovableRepo(baseRepo({ name: "lovable-foo" }))).toBe(true);
  });

  it("matches homepage on *.lovable.app", () => {
    expect(
      isLovableRepo(
        baseRepo({
          name: "other",
          homepage: "https://foo-bar.lovable.app",
        })
      )
    ).toBe(true);
  });

  it("matches topic lovable", () => {
    expect(isLovableRepo(baseRepo({ name: "x", topics: ["lovable", "react"] }))).toBe(true);
  });

  it("matches description containing lovable (case-insensitive)", () => {
    expect(
      isLovableRepo(baseRepo({ name: "x", description: "Built with Lovable" }))
    ).toBe(true);
  });

  it("rejects unrelated repos without signals", () => {
    expect(
      isLovableRepo(
        baseRepo({
          name: "my-product",
          description: "A CRM",
          homepage: "https://example.com",
          topics: ["saas"],
        })
      )
    ).toBe(false);
  });
});

describe("matchesLovableDeployment", () => {
  it("returns false when live URL is not on lovable.app", () => {
    const repo = baseRepo({ name: "lovable-x", homepage: "https://x.lovable.app" });
    expect(matchesLovableDeployment(repo, "https://evil.com")).toBe(false);
  });

  it("matches exact homepage", () => {
    const url = "https://proj.lovable.app/";
    const repo = baseRepo({ name: "lovable-proj", homepage: url });
    expect(matchesLovableDeployment(repo, url)).toBe(true);
  });
});
