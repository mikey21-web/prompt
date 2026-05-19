import { test, expect } from '@playwright/test';

/**
 * Billing flow E2E.
 *
 * Skipped by default — requires an authed session. Verifies the billing page
 * renders the 3 plan cards and an Upgrade CTA.
 */
test.describe('Billing flow', () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTHED,
    'requires signed-in session — set PLAYWRIGHT_AUTHED=1 to run'
  );

  test('renders all 3 plan cards', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.locator('text=Free').first()).toBeVisible();
    await expect(page.locator('text=Pro').first()).toBeVisible();
    await expect(page.locator('text=Team').first()).toBeVisible();
  });

  test('clicking an Upgrade button triggers an API call', async ({ page }) => {
    await page.goto('/billing');
    const upgradeBtn = page
      .getByRole('button', { name: /upgrade/i })
      .first();

    // Block the real navigation to Stripe — we just want to verify the request
    let calledCheckout = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/checkout')) calledCheckout = true;
    });

    await upgradeBtn.click();
    await page.waitForTimeout(500);
    expect(calledCheckout).toBe(true);
  });
});
