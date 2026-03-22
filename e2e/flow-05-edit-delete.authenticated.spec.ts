import { expect, test } from "@playwright/test";

const projectId = process.env.E2E_PROJECT_ID ?? "";

test.describe("Flow 5: dashboard, load project via API (edit/delete flows)", () => {
  test("dashboard shows projects section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Your projects")).toBeVisible();
    await expect(page.getByText(/Welcome back/)).toBeVisible();
  });

  test("GET own project succeeds when E2E_PROJECT_ID is set", async ({ page }) => {
    test.skip(!projectId, "Set E2E_PROJECT_ID to a project owned by the E2E user.");

    const res = await page.request.get(`/api/projects/${projectId}`);

    expect(res.ok(), await res.text()).toBeTruthy();
    const json = (await res.json()) as { data?: { id?: string } };
    expect(json.data?.id).toBe(projectId);
  });
});
