import { test, expect } from '@playwright/test';

/**
 * Optimize flow E2E.
 *
 * Skipped by default because it requires a signed-in user. To run, set
 * PLAYWRIGHT_AUTHED=1 and configure storageState in playwright.config.ts.
 */
test.describe('Optimize flow', () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTHED,
    'requires signed-in session — set PLAYWRIGHT_AUTHED=1 to run'
  );

  test('submitting a prompt produces a result', async ({ page }) => {
    await page.goto('/optimize');

    await page
      .getByLabel(/your prompt/i)
      .fill('Write a friendly customer support reply to a refund request.');

    await page
      .getByRole('button', { name: /optimize prompt/i })
      .click();

    // Wait for either a result panel or an error message
    await expect(
      page.locator('text=/Result|Error|Tokens|Optimized/i').first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
