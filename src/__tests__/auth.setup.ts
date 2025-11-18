/**
 * Playwright Authentication Setup
 *
 * This file runs ONCE before all tests to authenticate and save the session state.
 * All subsequent tests will reuse this authenticated state for speed.
 *
 * Based on November 2025 Playwright best practices:
 * - https://playwright.dev/docs/auth
 * - Isolated authenticated browser state
 * - Stored in playwright/.auth/user.json (gitignored)
 * - Runs as a separate "setup" project
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

// Test account credentials (from user)
const TEST_EMAIL = 'mathieuwauters@gmail.com';
const TEST_PASSWORD = 'Karmaisabitch2025$';

setup('authenticate with Supabase', async ({ page }) => {
  // Navigate to auth page
  await page.goto('/auth');

  // Wait for auth UI to load
  await page.waitForLoadState('networkidle');

  // Log the page title for debugging
  const title = await page.title();
  console.log(`Auth page title: ${title}`);

  // Screenshot initial state (visual regression baseline)
  await page.screenshot({ path: 'playwright/.auth/auth-page-initial.png' });

  // Find and fill email input (Supabase Auth UI)
  // Supabase uses specific selectors - try multiple strategies
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(TEST_EMAIL);

  // Find and fill password input
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(TEST_PASSWORD);

  // Screenshot filled form (visual regression)
  await page.screenshot({ path: 'playwright/.auth/auth-page-filled.png' });

  // Click sign in button
  const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]').first();
  await expect(signInButton).toBeVisible({ timeout: 10000 });

  // Click and wait for navigation
  await Promise.all([
    page.waitForURL('**/', { timeout: 30000 }), // Wait for redirect to main page
    signInButton.click()
  ]);

  // Verify we're authenticated by checking for main app UI
  // SwiftFill should show the form editor after login
  await expect(page).toHaveURL('/', { timeout: 30000 });

  // Wait for main app to load
  await page.waitForLoadState('networkidle');

  // Wait a bit for React to render
  await page.waitForTimeout(2000);

  // Screenshot authenticated state (visual regression)
  await page.screenshot({ path: 'playwright/.auth/authenticated-app.png', fullPage: true });

  console.log('✅ Authentication successful - saving session state');

  // Disable tutorial for all tests by setting localStorage
  await page.evaluate(() => {
    localStorage.setItem('tutorial-shown', 'true');
  });

  // Save authenticated state to file (includes localStorage)
  await page.context().storageState({ path: authFile });

  // Log success
  const cookies = await page.context().cookies();
  console.log(`Saved ${cookies.length} cookies to ${authFile}`);
  console.log('Session state includes:', {
    cookieCount: cookies.length,
    hasSbAccessToken: cookies.some(c => c.name.includes('sb-') && c.name.includes('auth-token')),
    localStorage: 'saved',
    sessionStorage: 'saved'
  });
});
