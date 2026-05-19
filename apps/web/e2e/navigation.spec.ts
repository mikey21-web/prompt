import { test, expect } from '@playwright/test';

/**
 * Dashboard navigation E2E.
 *
 * Skipped by default — requires an authed session. Each route just needs to
 * respond with 2xx and render `body`.
 */
test.describe('Dashboard navigation', () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTHED,
    'requires signed-in session — set PLAYWRIGHT_AUTHED=1 to run'
  );

  const routes = [
    '/dashboard',
    '/optimize',
    '/history',
    '/templates',
    '/settings',
    '/billing',
  ];

  for (const route of routes) {
    test(`navigates to ${route}`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.ok()).toBe(true);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
