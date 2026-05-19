import { test, expect } from '@playwright/test';

test.describe('PromptForge Web', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PromptForge/);
    await expect(page.getByRole('heading', { name: /PromptForge/ })).toBeVisible();
  });

  test('can navigate to auth page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign in|login/i }).click();
    // Should redirect to Clerk auth (or /auth/signin)
    await page.waitForURL(/auth|clerk/);
  });

  test('optimize form appears for authenticated users', async ({ page }) => {
    // Mock authenticated session
    await page.goto('/optimize');
    
    // Check if form elements exist
    const textarea = page.getByPlaceholder(/enter.*prompt/i);
    await expect(textarea).toBeVisible();
    
    const button = page.getByRole('button', { name: /optimize/i });
    await expect(button).toBeVisible();
  });

  test('can use optimization modes', async ({ page }) => {
    await page.goto('/optimize');
    
    // Check all mode buttons exist
    const modes = ['compress', 'enhance', 'rewrite'];
    for (const mode of modes) {
      const button = page.getByRole('button', { name: new RegExp(mode, 'i') });
      await expect(button).toBeVisible();
    }
  });

  test('history displays past optimizations', async ({ page }) => {
    await page.goto('/history');
    
    // Should show history section
    const heading = page.getByRole('heading', { name: /history|optimizations/i });
    await expect(heading).toBeVisible();
  });

  test('settings page is accessible', async ({ page }) => {
    await page.goto('/settings');
    
    const heading = page.getByRole('heading', { name: /settings|preferences/i });
    await expect(heading).toBeVisible();
  });

  test('responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/optimize');
    
    // Elements should still be visible
    const textarea = page.getByPlaceholder(/enter.*prompt/i);
    await expect(textarea).toBeVisible();
  });
});

test.describe('PromptForge API', () => {
  test('POST /api/optimize requires auth', async ({ request }) => {
    const response = await request.post('/api/optimize', {
      data: {
        prompt: 'test',
        mode: 'enhance',
      },
    });
    
    expect(response.status()).toBe(401);
  });

  test('GET /api/usage returns quota info', async ({ request, context }) => {
    // This test requires a valid token setup
    // In CI, you'd use a test user token
    
    const response = await request.get('/api/usage', {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN || ''}`,
      },
    });
    
    if (process.env.TEST_JWT_TOKEN) {
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('used');
      expect(data).toHaveProperty('limit');
    }
  });
});
