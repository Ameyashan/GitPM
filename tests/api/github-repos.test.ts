import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/github/repos/route";
import * as github from "@/lib/github";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return {
    ...actual,
    getGitHubToken: vi.fn(),
    getUserRepos: vi.fn(),
  };
});

describe("GET /api/github/repos", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    vi.mocked(github.getGitHubToken).mockReset();
    vi.mocked(github.getUserRepos).mockReset();
  });

  it("returns 401 when there is no session user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null } })),
      },
    } as never);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 when GitHub token is missing", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })),
      },
    } as never);
    vi.mocked(github.getGitHubToken).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 429 when GitHub rate limit is hit", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })),
      },
    } as never);
    vi.mocked(github.getGitHubToken).mockResolvedValue("token");
    vi.mocked(github.getUserRepos).mockRejectedValue(new github.GitHubRateLimitError(null));

    const res = await GET();
    expect(res.status).toBe(429);
  });

  it("returns 503 when GitHub API returns 503", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })),
      },
    } as never);
    vi.mocked(github.getGitHubToken).mockResolvedValue("token");
    vi.mocked(github.getUserRepos).mockRejectedValue(new github.GitHubApiError(503));

    const res = await GET();
    expect(res.status).toBe(503);
  });
});
