import { expect, test } from "@playwright/test";

const emptyProfileUsername = process.env.E2E_EMPTY_PROFILE_USERNAME ?? "";

test.describe("Flow 6: edge cases", () => {
  test("global 404 page for path with no matching route", async ({ page }) => {
    // Single-segment paths resolve to (public)/[username]; use 3+ segments to hit app/not-found.tsx
    await page.goto("/e2e-no-route/segment/extra");
    await expect(page.getByText("Page not found", { exact: true })).toBeVisible();
  });

  test("empty public profile shows no projects copy", async ({ page }, testInfo) => {
    test.skip(!emptyProfileUsername, "Set E2E_EMPTY_PROFILE_USERNAME (user with no published projects).");

    await page.goto(`/${emptyProfileUsername}`);
    await expect(page.getByTestId("public-project-grid-empty")).toBeVisible({
      timeout: 15_000,
    });
  });
});
