import { describe, expect, it } from "vitest";

import { COMMIT_ACTIVITY_WEEKS, parseTechStack, weeklyCommitCounts } from "@/lib/github";
import type { GitHubCommit } from "@/types/github";

function commitAt(date: string): GitHubCommit {
  return {
    sha: date,
    commit: { author: { name: "x", email: "x@x.dev", date }, message: "m" },
    author: { login: "x" },
  } as GitHubCommit;
}

describe("parseTechStack", () => {
  it("returns recognized frameworks from dependencies and devDependencies", () => {
    expect(
      parseTechStack({
        dependencies: { next: "14.0.0", react: "18.0.0", "unknown-lib": "1.0.0" },
        devDependencies: { tailwindcss: "3.0.0" },
      })
    ).toEqual(expect.arrayContaining(["next", "react", "tailwindcss"]));
  });

  it("matches scoped packages like @radix-ui/react via @next/ pattern for next", () => {
    expect(
      parseTechStack({
        dependencies: { "@next/something": "1.0.0" },
      })
    ).toContain("next");
  });

  it("returns empty array for empty package object", () => {
    expect(parseTechStack({})).toEqual([]);
  });

  it("handles missing dependencies and devDependencies", () => {
    expect(parseTechStack({ dependencies: undefined, devDependencies: undefined })).toEqual([]);
  });

  it("ignores unknown dependency names", () => {
    expect(
      parseTechStack({
        dependencies: { "my-private-package": "1.0.0" },
      })
    ).toEqual([]);
  });
});

describe("weeklyCommitCounts", () => {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  it("returns one bucket per trailing week, most recent last", () => {
    const result = weeklyCommitCounts([]);
    expect(result).toHaveLength(COMMIT_ACTIVITY_WEEKS);
    expect(result.every((c) => c === 0)).toBe(true);
  });

  it("counts a recent commit in the most recent bucket", () => {
    const result = weeklyCommitCounts([commitAt(new Date(now - DAY).toISOString())]);
    expect(result).toHaveLength(COMMIT_ACTIVITY_WEEKS);
    expect(result[result.length - 1]).toBe(1);
    expect(result.slice(0, -1).every((c) => c === 0)).toBe(true);
  });

  it("buckets an older commit into an earlier week", () => {
    // ~3 weeks ago lands in an earlier (not the last) bucket.
    const result = weeklyCommitCounts([commitAt(new Date(now - 21 * DAY).toISOString())]);
    expect(result.reduce((a, c) => a + c, 0)).toBe(1);
    expect(result[result.length - 1]).toBe(0);
  });

  it("ignores commits older than the window", () => {
    const result = weeklyCommitCounts([commitAt(new Date(now - 400 * DAY).toISOString())]);
    expect(result.every((c) => c === 0)).toBe(true);
  });

  it("ignores commits with missing or invalid dates", () => {
    const bad = { sha: "x", commit: { author: { date: "" }, message: "" }, author: null } as unknown as GitHubCommit;
    expect(weeklyCommitCounts([bad]).every((c) => c === 0)).toBe(true);
  });
});
