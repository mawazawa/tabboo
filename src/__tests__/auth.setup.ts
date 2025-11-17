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

  // Navigate to auth page
  await page.goto('http://localhost:8085/auth');
  await page.waitForLoadState('networkidle');

  console.log('[Auth Setup] Filling credentials...');

  // Fill in the auth form
  const emailInput = page.getByPlaceholder(/email/i);
  const passwordInput = page.getByPlaceholder(/password/i);

  await emailInput.fill(email);
  await passwordInput.fill(password);

  console.log('[Auth Setup] Submitting login...');

  // Click sign in button
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Wait for redirect to main page
  await page.waitForURL('http://localhost:8085/', { timeout: 15000 });

  console.log('[Auth Setup] Login successful, waiting for app to load...');

  // Wait for the PDF viewer to load as confirmation app is ready
  await page.waitForSelector('.react-pdf__Document', { timeout: 15000 });

  console.log('[Auth Setup] App loaded successfully!');

  // Save the authenticated state
  await page.context().storageState({ path: authFile });

  console.log(`[Auth Setup] Authentication state saved to ${authFile}`);
});
