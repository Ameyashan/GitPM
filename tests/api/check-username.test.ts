import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/users/check-username/route";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("GET /api/users/check-username", () => {
  beforeEach(() => {
    vi.mocked(createAdminClient).mockReset();
  });

  it("returns 400 when username query param is missing", async () => {
    const res = await GET(new Request("http://localhost/api/users/check-username"));
    expect(res.status).toBe(400);
  });

  it("returns available: false for invalid username format without hitting DB", async () => {
    const res = await GET(
      new Request("http://localhost/api/users/check-username?username=ab")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { available: boolean } };
    expect(body.data.available).toBe(false);
    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
