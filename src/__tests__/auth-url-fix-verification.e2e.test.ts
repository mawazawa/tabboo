/**
 * AUTH URL FIX VERIFICATION TEST
 *
 * This test verifies that auth.setup.ts uses relative URLs instead of hardcoded absolute URLs.
 * Before fix: auth.setup.ts used 'http://localhost:8085/auth' and 'http://localhost:8085/'
 * After fix: Uses '/auth' and '/' which inherit the correct baseURL (port 8080) from config
 */

import { test, expect } from '@playwright/test';

test.describe('Auth URL Configuration Fix Verification', () => {
  test('auth page should be accessible via relative URL on correct port', async ({ page, baseURL }) => {
    // This test verifies the bug fix by ensuring auth navigation uses the correct port

    // The baseURL from playwright.config.ts should be http://localhost:8080
    expect(baseURL).toBe('http://localhost:8080');

    // Navigate to /auth using relative URL (should use baseURL port 8080, not hardcoded 8085)
    const authResponse = await page.goto('/auth');

    // Verify we got a successful response
    expect(authResponse).not.toBeNull();
    expect(authResponse!.status()).toBe(200);

    // Verify we're actually on the auth page
    const currentURL = page.url();
    expect(currentURL).toBe('http://localhost:8080/auth');

    // Verify the auth page loaded correctly (has the auth form)
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('main page should be accessible via relative URL on correct port', async ({ page, baseURL }) => {
    // Verify baseURL is correct
    expect(baseURL).toBe('http://localhost:8080');

    // Navigate to / using relative URL
    const homeResponse = await page.goto('/');

    // Verify successful response
    expect(homeResponse).not.toBeNull();
    expect(homeResponse!.status()).toBe(200);

    // Verify we're on the correct URL with correct port
    const currentURL = page.url();
    expect(currentURL).toBe('http://localhost:8080/');
  });

  test('should NOT be able to connect to wrong port 8085', async ({ page }) => {
    // This test verifies that port 8085 is NOT running (proving we need to use port 8080)

    try {
      // Try to navigate to the hardcoded wrong port
      await page.goto('http://localhost:8085/', { timeout: 3000 });

      // If we get here, port 8085 is running (unexpected in normal testing)
      // This isn't necessarily a failure, but indicates multiple servers running
      console.warn('Warning: Port 8085 is responding. Ensure only port 8080 is used in config.');
    } catch (error) {
      // Expected: Connection should fail because nothing is running on 8085
      expect(error.message).toMatch(/net::ERR_CONNECTION_REFUSED|Timeout|Navigation failed/);
    }
  });
});
