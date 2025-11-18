/**
 * Visual Regression Testing Suite
 *
 * This test suite captures visual snapshots at critical points in user workflows
 * to detect unintended UI changes. Based on November 2025 Playwright best practices:
 * - https://playwright.dev/docs/test-snapshots
 * - https://www.chromatic.com/blog/how-to-visual-test-with-playwright
 *
 * Visual regression catches:
 * - CSS changes that break layouts
 * - Missing fonts/assets
 * - Component rendering bugs
 * - Cross-browser visual differences
 * - Responsive design issues
 *
 * HOW VISUAL REGRESSION WORKS:
 * 1. First run: Takes screenshots and saves as "baseline"
 * 2. Subsequent runs: Compares new screenshots to baseline
 * 3. If different: Test fails, shows visual diff
 * 4. If intentional change: Update baseline with --update-snapshots
 *
 * RUNNING VISUAL TESTS:
 * - npm run test:e2e -- visual-regression.e2e.test.ts
 * - npm run test:e2e:headed -- visual-regression.e2e.test.ts (see browser)
 * - npx playwright test --update-snapshots (update baselines after intentional changes)
 */

import { test, expect } from '@playwright/test';
import { waitForApp } from './helpers/wait-for-app';

test.describe('Visual Regression - Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('01 - Initial page load (main form editor)', async ({ page }) => {
    // Wait for PDF and form to load completely
    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Take full-page screenshot for visual regression
    await expect(page).toHaveScreenshot('01-main-form-editor.png', {
      fullPage: true,
      animations: 'disabled', // Disable animations for consistent snapshots
      timeout: 30000
    });
  });

  test('02 - PDF viewer with form fields visible', async ({ page }) => {
    // Wait for PDF pages to render
    const pdfPages = page.locator('.react-pdf__Page');
    await expect(pdfPages.first()).toBeVisible();

    // Wait for field overlays to appear
    await expect(page.locator('[data-field]').first()).toBeVisible({ timeout: 10000 });

    // Capture PDF viewer with field overlays
    const pdfViewer = page.locator('.react-pdf__Document').first();
    await expect(pdfViewer).toHaveScreenshot('02-pdf-viewer-with-fields.png', {
      animations: 'disabled'
    });
  });

  test('03 - Filled form fields (data entry)', async ({ page }) => {
    // Fill out several fields to show populated state
    await page.locator('[data-field="partyName"]').first().fill('Jane Smith');
    await page.locator('[data-field="email"]').first().fill('jane@example.com');
    await page.locator('[data-field="telephoneNo"]').first().fill('555-123-4567');
    await page.locator('[data-field="streetAddress"]').first().fill('123 Main Street');
    await page.locator('[data-field="city"]').first().fill('Los Angeles');

    // Wait a moment for values to settle
    await page.waitForTimeout(1000);

    // Capture filled form state
    await expect(page).toHaveScreenshot('03-filled-form-fields.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('04 - Edit mode active (repositioning UI)', async ({ page }) => {
    // Select a field
    const field = page.locator('[data-field="partyName"]').first();
    await field.click();

    // Enable edit mode
    const editModeButton = page.getByRole('button', { name: /edit mode|move|drag/i });
    if (await editModeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editModeButton.click();

      // Wait for edit mode UI to activate
      await page.waitForTimeout(1000);

      // Capture edit mode UI
      await expect(page).toHaveScreenshot('04-edit-mode-active.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('05 - Field navigation panel open', async ({ page }) => {
    // Look for navigation panel toggle
    const navToggle = page.getByRole('button', { name: /fields|navigation|panel/i }).first();

    if (await navToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await navToggle.click();
      await page.waitForTimeout(500);

      // Capture navigation panel state
      await expect(page).toHaveScreenshot('05-field-navigation-panel.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('06 - AI assistant open with chat interface', async ({ page }) => {
    // Open AI assistant
    const aiButton = page.getByRole('button', { name: /ai assistant|assistant|help/i }).first();

    if (await aiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aiButton.click();
      await page.waitForTimeout(1000);

      // Capture AI assistant interface
      await expect(page).toHaveScreenshot('06-ai-assistant-interface.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('07 - AI assistant with conversation', async ({ page }) => {
    // Open AI assistant
    const aiButton = page.getByRole('button', { name: /ai assistant|assistant|help/i }).first();

    if (await aiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aiButton.click();
      await page.waitForTimeout(500);

      // Find chat input
      const chatInput = page.getByPlaceholder(/ask|message|type/i).first();
      await chatInput.waitFor({ state: 'visible', timeout: 3000 });

      // Send a message
      await chatInput.fill('What is FL-320 used for?');
      await chatInput.press('Enter');

      // Wait for response (with timeout)
      await page.waitForTimeout(5000);

      // Capture conversation state
      await expect(page).toHaveScreenshot('07-ai-assistant-conversation.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('08 - Personal data vault panel', async ({ page }) => {
    // Look for vault button
    const vaultButton = page.getByRole('button', { name: /vault|personal data|my info/i }).first();

    if (await vaultButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vaultButton.click();
      await page.waitForTimeout(1000);

      // Capture vault panel
      await expect(page).toHaveScreenshot('08-personal-data-vault.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('09 - Form with validation errors', async ({ page }) => {
    // Fill invalid data to trigger validation
    const emailField = page.locator('[data-field="email"]').first();
    await emailField.fill('invalid-email'); // Invalid email format

    // Trigger validation (click away or submit)
    await page.click('body');
    await page.waitForTimeout(1000);

    // Look for error indicators
    const hasErrors = await page.getByText(/invalid|error|required/i).isVisible({ timeout: 2000 }).catch(() => false);

    if (hasErrors) {
      // Capture validation error state
      await expect(page).toHaveScreenshot('09-validation-errors.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('10 - Responsive mobile view (320px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(1000);

    // Capture mobile view
    await expect(page).toHaveScreenshot('10-mobile-view-320px.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('11 - Responsive tablet view (768px)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    // Capture tablet view
    await expect(page).toHaveScreenshot('11-tablet-view-768px.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('12 - Zoomed PDF view (150%)', async ({ page }) => {
    // Find zoom controls
    const zoomInButton = page.getByRole('button', { name: /zoom in|\+/i }).first();

    if (await zoomInButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click zoom in 3 times (50% → 100% → 150%)
      await zoomInButton.click();
      await page.waitForTimeout(300);
      await zoomInButton.click();
      await page.waitForTimeout(300);
      await zoomInButton.click();
      await page.waitForTimeout(1000);

      // Capture zoomed view
      await expect(page).toHaveScreenshot('12-zoomed-pdf-150percent.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('13 - Field with autofill suggestion', async ({ page }) => {
    // Click on a field that might show autofill
    const field = page.locator('[data-field="partyName"]').first();
    await field.click();

    // Wait for autofill UI to appear (if vault has data)
    await page.waitForTimeout(1000);

    // Look for autofill button/sparkles icon
    const autofillButton = page.getByRole('button', { name: /autofill|sparkle|vault/i }).first();

    if (await autofillButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Capture autofill suggestion state
      await expect(page).toHaveScreenshot('13-autofill-suggestion.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('14 - Empty form initial state', async ({ page }) => {
    // Reload to get clean state
    await page.reload();
    await waitForApp(page);

    // Clear any existing data (if persistence is active)
    // Just capture the initial empty state
    await page.waitForLoadState('networkidle');

    // Capture empty form baseline
    await expect(page).toHaveScreenshot('14-empty-form-initial.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('15 - Loading states (PDF rendering)', async ({ page }) => {
    // Reload and capture during loading
    const loadPromise = page.reload();

    // Try to capture loading state (may be very quick)
    await page.waitForTimeout(100);

    // Check if loading indicator is visible
    const loadingIndicator = page.getByText(/loading|preparing/i).first();
    const isLoading = await loadingIndicator.isVisible({ timeout: 500 }).catch(() => false);

    if (isLoading) {
      await expect(page).toHaveScreenshot('15-loading-state.png', {
        animations: 'disabled'
      });
    }

    await loadPromise;
    await waitForApp(page);
  });
});

/**
 * VISUAL REGRESSION BEST PRACTICES (November 2025)
 *
 * 1. Disable animations: { animations: 'disabled' }
 *    - Prevents timing-based flakiness
 *    - Ensures consistent snapshots
 *
 * 2. Wait for network idle: page.waitForLoadState('networkidle')
 *    - Ensures all resources loaded
 *    - Prevents incomplete screenshots
 *
 * 3. Use descriptive filenames: "01-main-form-editor.png"
 *    - Numbered for execution order
 *    - Descriptive for easy identification
 *
 * 4. Test multiple viewports: Mobile, tablet, desktop
 *    - Catches responsive design issues
 *    - Ensures cross-device consistency
 *
 * 5. Capture key interaction states:
 *    - Empty forms
 *    - Filled forms
 *    - Error states
 *    - Loading states
 *    - Edit/interaction modes
 *
 * 6. Use fullPage: true when appropriate
 *    - Captures entire page scroll
 *    - Detects layout shifts outside viewport
 *
 * 7. Set reasonable timeouts: { timeout: 30000 }
 *    - Accounts for slow CI environments
 *    - Prevents false failures
 *
 * UPDATING SNAPSHOTS:
 * - After intentional UI changes: npx playwright test --update-snapshots
 * - Review diff images before accepting changes
 * - Commit updated snapshots with code changes
 *
 * DEBUGGING VISUAL FAILURES:
 * 1. Check diff images in test-results/
 * 2. Look for actual-vs-expected comparison
 * 3. Run with --headed to see browser
 * 4. Check if fonts/assets loaded correctly
 * 5. Verify viewport size matches expectation
 */
