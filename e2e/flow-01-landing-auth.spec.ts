import { expect, test } from "@playwright/test";

test.describe("Flow 1: landing, GitHub OAuth start, protected routes", () => {
  test("landing shows GitHub sign-up CTA", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toContainText("One link to prove");
    const heroCta = page
      .locator(".landing-hero-section")
      .getByRole("button", { name: /Start building your profile/i });
    await heroCta.waitFor({ state: "visible", timeout: 20_000 });
    await expect(heroCta).toBeEnabled();
  });

  test("hero GitHub CTA starts GitHub OAuth", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    const heroCta = page
      .locator(".landing-hero-section")
      .getByRole("button", { name: /Start building your profile/i });
    await heroCta.waitFor({ state: "visible", timeout: 20_000 });

    await Promise.all([
      page.waitForURL(/github\.com\/login/, { timeout: 50_000 }),
      heroCta.click(),
    ]);
  });

  test("dashboard redirects unauthenticated visitors", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/auth=required/);
  });

  test("onboarding redirects unauthenticated visitors", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/auth=required/);
  });
});
