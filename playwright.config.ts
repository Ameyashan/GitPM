import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

const e2eAuthEnabled = Boolean(process.env.E2E_SECRET && process.env.E2E_AUTH_EMAIL);
const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    ...(e2eAuthEnabled
      ? [
          {
            name: "setup",
            testMatch: /auth\.setup\.ts/,
          },
        ]
      : []),
    {
      name: "chromium",
      testIgnore: [/auth\.setup\.ts/, /\.authenticated\.spec\.ts$/],
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    ...(e2eAuthEnabled
      ? [
          {
            name: "chromium-authed",
            dependencies: ["setup"],
            testMatch: /\.authenticated\.spec\.ts$/,
            use: {
              ...devices["Desktop Chrome"],
              storageState: authFile,
            },
          },
        ]
      : []),
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: process.env.CI !== "true",
    timeout: 120_000,
  },
});
