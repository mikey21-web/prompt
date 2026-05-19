import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the PromptForge web E2E suite.
 *
 * The dev server must be running on http://localhost:3000 for these tests to
 * pass. We do not start it automatically because the app requires real Clerk +
 * Convex credentials. Set PLAYWRIGHT_WEB_SERVER=auto to opt-in to starting it.
 */
const startWebServer = process.env.PLAYWRIGHT_WEB_SERVER === 'auto';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(startWebServer
    ? {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }
    : {}),
});
