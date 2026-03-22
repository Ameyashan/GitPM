import { expect, test } from "@playwright/test";

const fakeProjectId = "00000000-0000-4000-8000-000000000001";

test.describe("Flow 4: API access without session (RLS / auth gate)", () => {
  test("GET /api/projects/[id] returns 401 when unauthenticated", async ({
    request,
  }) => {
    const res = await request.get(`/api/projects/${fakeProjectId}`);
    expect(res.status()).toBe(401);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("unauthorized");
  });
});
