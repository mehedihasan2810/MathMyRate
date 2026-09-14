import { defineConfig } from "@playwright/test";

/**
 * The browser gate intentionally serves the already-built static output. Build
 * the web app first (`PUBLIC_SERVER_URL=... pnpm run build:web`) so a test run
 * cannot accidentally hide a production-build failure by compiling on start.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
    baseURL: "http://127.0.0.1:4174",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm run preview:e2e",
    url: "http://127.0.0.1:4174/",
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      PORT: "4174",
    },
  },
});
