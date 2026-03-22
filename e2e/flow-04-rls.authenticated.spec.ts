import { expect, test } from "@playwright/test";

const foreignProjectId = "00000000-0000-4000-8000-000000000002";
const otherUserProjectId = process.env.E2E_OTHER_USER_PROJECT_ID ?? "";

test.describe("Flow 4: cannot open another user's project editor", () => {
  test("edit page for unknown project id shows 404", async ({ page }) => {
    await page.goto(`/dashboard/projects/${foreignProjectId}/edit`);
    await expect(page.getByText("Page not found", { exact: true })).toBeVisible();
  });

  test("GET another user's project id returns 404", async ({ page }) => {
    test.skip(!otherUserProjectId, "Set E2E_OTHER_USER_PROJECT_ID to a project not owned by the E2E user.");

    const res = await page.request.get(`/api/projects/${otherUserProjectId}`);
    expect(res.status()).toBe(404);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("not_found");
  });
});
