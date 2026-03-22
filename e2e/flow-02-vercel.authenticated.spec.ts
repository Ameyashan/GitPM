import { expect, test } from "@playwright/test";

const publicUsername = process.env.E2E_PUBLIC_USERNAME ?? "";

test.describe("Flow 2: add project via Vercel path + profile tier", () => {
  test("Add project opens source picker and Vercel import phase", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Add project" }).click();
    await expect(page.getByText("Choose a source")).toBeVisible();
    await page.getByRole("button", { name: /^Vercel$/ }).click();
    await expect(page.getByText("Import from Vercel")).toBeVisible();
  });

  test("public profile shows builder tier card when username fixture is set", async ({ page }) => {
    test.skip(!publicUsername, "Set E2E_PUBLIC_USERNAME to assert profile tier copy.");

    await page.goto(`/${publicUsername}`);
    await expect(
      page.getByText(/Getting started|Active builder|Verified builder/)
    ).toBeVisible({ timeout: 15_000 });
  });
});
