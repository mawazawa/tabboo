/**
 * Playwright Authentication Setup
 *
 * This setup runs ONCE before all tests to authenticate with Supabase
 * and store the session in playwright/.auth/user.json
 *
 * Best Practice Pattern from Supabase E2E Testing Guide (Nov 2025)
 * https://github.com/supabase-community/e2e
 */

import { test as setup } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { waitForApp } from './helpers/wait-for-app';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

const authFile = 'playwright/.auth/user.json';

setup('authenticate with Supabase', async ({ page }) => {
  const email = process.env.SUPABASE_TEST_EMAIL;
  const password = process.env.SUPABASE_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing test credentials. Please set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD in .env.test'
    );
  }

  console.log('[Auth Setup] Starting authentication...');

  // Navigate to auth page (using relative URL to inherit baseURL from config)
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  console.log('[Auth Setup] Filling credentials...');

  // Fill in the auth form using getByLabel (fields have labels, not placeholders)
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i);

  await emailInput.fill(email);
  await passwordInput.fill(password);

  console.log('[Auth Setup] Submitting login...');

  // Click sign in button
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Wait for redirect to main page (using relative URL to inherit baseURL from config)
  await page.waitForURL('/', { timeout: 15000 });

  console.log('[Auth Setup] Login successful, waiting for app to load...');

  // Wait for app to be fully loaded and interactive using November 2025 best practices
  await waitForApp(page);

  console.log('[Auth Setup] App loaded successfully!');

  // Disable tutorial for tests by setting localStorage flag
  await page.evaluate(() => {
    localStorage.setItem('tutorial-shown', 'true');
  });

  console.log('[Auth Setup] Tutorial disabled for tests');

  // Save the authenticated state (includes localStorage)
  await page.context().storageState({ path: authFile });

  console.log(`[Auth Setup] Authentication state saved to ${authFile}`);
});
