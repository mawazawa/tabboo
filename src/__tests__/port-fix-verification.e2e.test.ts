/**
 * PORT FIX VERIFICATION TEST
 *
 * This test verifies that the port mismatch bug fix works correctly.
 * Before fix: Playwright config used port 8085, dev server runs on 8080 → tests fail
 * After fix: Both use port 8080 → tests can connect
 */

import { test, expect } from '@playwright/test';

test.describe('Port Configuration Fix Verification', () => {
  test('should successfully connect to the application on correct port', async ({ page }) => {
    // This test verifies the bug fix by attempting to connect to the app
    // Before fix: Would timeout trying to connect to port 8085
    // After fix: Successfully connects to port 8080

    const response = await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 });

    // Verify we got a successful HTTP response (not timeout/connection refused)
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    // Verify the page actually loaded (has a title)
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Verify we can see the main app container
    const appElement = page.locator('#root');
    await expect(appElement).toBeVisible({ timeout: 5000 });
  });

  test('should load application assets correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 });

    // Verify JavaScript loaded (React is running)
    const hasReactRoot = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root !== null && root.children.length > 0;
    });
    expect(hasReactRoot).toBe(true);
  });
});
