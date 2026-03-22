import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 and ok: true", async () => {
    const response = GET();
    expect(response.status).toBe(200);

    const body: unknown = await response.json();
    expect(body).toEqual({ ok: true });
  });
});
