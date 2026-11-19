import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_WORKERS_PORT ?? 3101);
const baseURL =
  process.env.PLAYWRIGHT_WORKERS_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e-workers",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report-workers" }]]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build:vinext && npm run start:vinext -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
