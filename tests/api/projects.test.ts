import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/projects/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/thumbnails", () => ({
  generateAndStoreProjectThumbnail: vi.fn(),
}));

vi.mock("@/lib/vercel", () => ({
  verifyProjectsAgainstDeployments: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock("@/lib/crypto", () => ({
  decrypt: vi.fn(),
}));

describe("GET /api/projects", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null } })),
      },
    } as never);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/projects", () => {
  it("returns 422 when body fails validation", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: null })),
            })),
          })),
        })),
      })),
    } as never);

    const res = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    expect(res.status).toBe(422);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("validation_error");
  });
});
