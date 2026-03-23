import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/users/check-username/route";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

function mockUsersLookup(row: { id: string } | null): void {
  vi.mocked(createAdminClient).mockReturnValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: row, error: null })),
        })),
      })),
    })),
  } as never);
}

describe("GET /api/users/check-username", () => {
  beforeEach(() => {
    vi.mocked(createAdminClient).mockReset();
    vi.mocked(createClient).mockReset();
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

  it("returns available: true when no user row has the username", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })),
      },
    } as never);
    mockUsersLookup(null);

    const res = await GET(
      new Request("http://localhost/api/users/check-username?username=valid_name")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { available: boolean } };
    expect(body.data.available).toBe(true);
  });

  it("returns available: true when the username belongs to the current user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "same-id" } } })),
      },
    } as never);
    mockUsersLookup({ id: "same-id" });

    const res = await GET(
      new Request("http://localhost/api/users/check-username?username=their_handle")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { available: boolean } };
    expect(body.data.available).toBe(true);
  });

  it("returns available: false when the username belongs to another user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "u-new" } } })),
      },
    } as never);
    mockUsersLookup({ id: "u-existing" });

    const res = await GET(
      new Request("http://localhost/api/users/check-username?username=taken_elsewhere")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { available: boolean } };
    expect(body.data.available).toBe(false);
  });

  it("returns available: false when logged out and the username exists", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null } })),
      },
    } as never);
    mockUsersLookup({ id: "someone" });

    const res = await GET(
      new Request("http://localhost/api/users/check-username?username=reserved")
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { available: boolean } };
    expect(body.data.available).toBe(false);
  });
});
