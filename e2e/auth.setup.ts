import fs from "node:fs";
import path from "node:path";
import { expect, test as setup } from "@playwright/test";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

setup("magic link session", async ({ page, request }) => {
  const secret = process.env.E2E_SECRET;
  const email = process.env.E2E_AUTH_EMAIL;
  if (!secret || !email) {
    throw new Error("E2E_SECRET and E2E_AUTH_EMAIL must be set for auth.setup.ts");
  }

  const res = await request.post("/api/e2e/session", {
    data: { secret },
    headers: { "Content-Type": "application/json" },
  });

  expect(res.ok(), await res.text()).toBeTruthy();

  const json = (await res.json()) as { data: { url: string } };
  await page.goto(json.data.url);

  await expect(page).toHaveURL(/\/dashboard(\?.*)?$/, { timeout: 90_000 });

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
