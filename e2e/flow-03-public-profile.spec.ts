import { expect, test } from "@playwright/test";

const publicUsername = process.env.E2E_PUBLIC_USERNAME ?? "";
const publicProjectSlug = process.env.E2E_PUBLIC_PROJECT_SLUG ?? "";
const noVideoProjectSlug = process.env.E2E_NO_VIDEO_PROJECT_SLUG ?? "";

test.describe("Flow 3: public profile, project detail, OG metadata", () => {
  test("unknown username shows profile not found", async ({ page }) => {
    await page.goto("/nonexistent-user-xyz-12345");
    await expect(
      page.getByRole("heading", { name: /This profile doesn't exist/i })
    ).toBeVisible();
  });

  test("public profile shows project cards when fixtures are set", async ({ page }) => {
    test.skip(!publicUsername, "Set E2E_PUBLIC_USERNAME for this test.");

    await page.goto(`/${publicUsername}`);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByTestId("public-project-grid")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("project detail renders and exposes OG tags", async ({ page }) => {
    test.skip(!publicUsername || !publicProjectSlug, "Set E2E_PUBLIC_USERNAME and E2E_PUBLIC_PROJECT_SLUG.");

    await page.goto(`/${publicUsername}/${publicProjectSlug}`);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main h1").first()).toBeVisible();

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
    const title = await ogTitle.getAttribute("content");
    expect(title?.length).toBeGreaterThan(0);
  });

  test("project page has twitter:card meta", async ({ page }) => {
    test.skip(!publicUsername || !publicProjectSlug, "Set E2E_PUBLIC_USERNAME and E2E_PUBLIC_PROJECT_SLUG.");

    await page.goto(`/${publicUsername}/${publicProjectSlug}`);
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveCount(1);
    const content = await twitterCard.getAttribute("content");
    expect(content === "summary" || content === "summary_large_image").toBeTruthy();
  });

  test("project without demo video still has stable layout", async ({ page }) => {
    const slug = noVideoProjectSlug || publicProjectSlug;
    test.skip(!publicUsername || !slug, "Set E2E_PUBLIC_USERNAME and E2E_NO_VIDEO_PROJECT_SLUG (or E2E_PUBLIC_PROJECT_SLUG).");

    await page.goto(`/${publicUsername}/${slug}`);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main h1").first()).toBeVisible();
  });
});
