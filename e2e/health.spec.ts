import { expect, test } from "@playwright/test";

test.describe("API health", () => {
  test("returns ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
