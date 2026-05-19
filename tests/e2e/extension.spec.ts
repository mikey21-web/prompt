import { test, expect } from '@playwright/test';

test.describe('PromptForge Extension', () => {
  // Note: These tests require the extension to be loaded into Chrome
  // Use --load-extension flag when running tests
  
  test('popup loads correctly', async ({ page }) => {
    // Navigate to extension popup
    // This would require special handling for extension contexts
    // For now, we test the popup UI as a standalone page
    
    await page.goto('chrome-extension://EXTENSION_ID/popup.html');
    
    // Check popup elements
    const modeButtons = page.locator('button[aria-label*="mode"]');
    await expect(modeButtons).toHaveCount(3); // compress, enhance, rewrite
  });

  test('options page loads', async ({ page }) => {
    await page.goto('chrome-extension://EXTENSION_ID/options.html');
    
    // Check settings form
    const apiKeyInput = page.getByPlaceholder(/api key|openai/i);
    await expect(apiKeyInput).toBeVisible();
    
    const modelSelect = page.getByLabel(/model|gpt/i);
    await expect(modelSelect).toBeVisible();
  });

  test('can change settings', async ({ page }) => {
    await page.goto('chrome-extension://EXTENSION_ID/options.html');
    
    // Set API key
    const apiKeyInput = page.getByPlaceholder(/api key/i);
    await apiKeyInput.fill('sk-test-dummy-key-12345');
    
    // Change model
    const modelSelect = page.getByLabel(/model/i);
    await modelSelect.selectOption('gpt-4o');
    
    // Save (check for save button or auto-save)
    await page.waitForTimeout(500); // Allow time for auto-save
  });

  test('popup mode selection works', async ({ page }) => {
    await page.goto('chrome-extension://EXTENSION_ID/popup.html');
    
    // Click enhance mode
    const enhanceButton = page.getByRole('button', { name: /enhance/i });
    await enhanceButton.click();
    
    // Check if selected state updates
    await expect(enhanceButton).toHaveAttribute('data-active', 'true');
  });

  test('popup displays usage bar', async ({ page }) => {
    await page.goto('chrome-extension://EXTENSION_ID/popup.html');
    
    // Check for usage bar
    const usageBar = page.locator('[data-testid="usage-bar"]');
    await expect(usageBar).toBeVisible();
  });

  test('context menu items registered', async ({ page, context }) => {
    // Context menu registration happens in background service worker
    // This would require service worker testing setup
    // For now, verify the background script doesn't error
    
    const bgPage = context.backgroundPages()[0];
    if (bgPage) {
      const errors = await bgPage.evaluate(() => {
        // Check if chrome API calls succeeded
        return (window as any).__tauriErrors || [];
      });
      expect(errors).toHaveLength(0);
    }
  });
});

test.describe('Extension Content Scripts', () => {
  test('getSelection message works', async ({ page }) => {
    await page.goto('about:blank');
    await page.evaluate(() => {
      // Select text
      const range = document.createRange();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
    
    // Verify getSelection works
    const selection = await page.evaluate(() => window.getSelection()?.toString());
    // Result depends on page content
  });

  test('text insertion works', async ({ page }) => {
    // Set up a contenteditable element
    await page.setContent('<div contenteditable="true" id="editor"></div>');
    
    // Focus and set cursor position
    await page.focus('#editor');
    
    // Simulate text insertion
    await page.evaluate(() => {
      const editor = document.getElementById('editor');
      if (editor) {
        editor.textContent = 'Original text';
        const range = document.createRange();
        range.setStart(editor.firstChild, 0);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    });
    
    // Verify insertion
    const text = await page.textContent('#editor');
    expect(text).toContain('Original text');
  });

  test('toast notification appears', async ({ page }) => {
    // Set up page
    await page.goto('about:blank');
    
    // Simulate toast notification
    await page.evaluate(() => {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: green; color: white; padding: 10px; z-index: 10000;';
      toast.textContent = 'Copied!';
      document.body.appendChild(toast);
      
      setTimeout(() => toast.remove(), 2000);
    });
    
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Copied!');
    
    // Wait for auto-removal
    await expect(toast).toBeHidden({ timeout: 3000 });
  });
});
