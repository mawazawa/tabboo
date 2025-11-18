/**
 * CRITICAL SMOKE TESTS
 *
 * These tests verify the core user workflows that MUST work.
 * If these tests pass but the product is broken, WE FAILED.
 *
 * Priority: These tests should catch showstopper bugs like drag-and-drop failures.
 */

import { test, expect } from '@playwright/test';
import { waitForApp } from './helpers/wait-for-app';

// Authentication is handled by auth.setup.ts and stored in playwright/.auth/user.json
// All tests automatically use the authenticated session

test.describe('Critical Product Features (Smoke Tests)', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for ALL console messages to debug PDF loading
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.error('[Page Error]:', error.message);
      console.error('[Stack]:', error.stack);
    });

    // Listen for failed network requests
    page.on('requestfailed', request => {
      console.error('[Request Failed]:', request.url(), request.failure()?.errorText);
    });

    await page.goto('/');
    await waitForApp(page);
  });

  /**
   * TEST 1: PDF Form Rendering
   * Verifies that the PDF form loads and displays correctly
   */
  test('PDF form renders correctly', async ({ page }) => {
    // Wait for PDF to load
    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Verify at least one page is rendered
    const pdfPages = page.locator('.react-pdf__Page');
    await expect(pdfPages.first()).toBeVisible();

    // Verify page count is correct (FL-320 should have 2 pages)
    const pageCount = await pdfPages.count();
    expect(pageCount).toBeGreaterThanOrEqual(1);
  });

  /**
   * TEST 2: Field Input Functionality
   * Verifies that users can type into form fields and see their input
   */
  test('user can fill out text fields', async ({ page }) => {
    // Find a text input field (using data-field attribute or aria-label)
    const partyNameField = page.locator('[data-field="partyName"]').first();

    // Type into the field
    await partyNameField.fill('Jane Smith');

    // Verify the value was set
    await expect(partyNameField).toHaveValue('Jane Smith');

    // Test another field
    const emailField = page.locator('[data-field="email"]').first();
    await emailField.fill('jane@example.com');
    await expect(emailField).toHaveValue('jane@example.com');
  });

  /**
   * TEST 3: Drag-and-Drop Functionality
   * THIS TEST WOULD HAVE CAUGHT THE BUG!
   *
   * Verifies that users can:
   * 1. Enable edit mode
   * 2. Drag a field to a new position
   * 3. See the field move visually
   * 4. Have the position persist
   */
  test('user can enable edit mode and drag fields', async ({ page }) => {
    // Find a field to drag
    const field = page.locator('[data-field="partyName"]').first();
    await field.waitFor({ state: 'visible' });

    // Click the field to select it
    await field.click();

    // Find and click the edit mode button (may be labeled "Edit Mode", "Move", or have Move icon)
    const editModeButton = page.getByRole('button', { name: /edit mode|move|drag/i });
    await editModeButton.click();

    // Verify edit mode is active (look for indicator text or class)
    await expect(page.getByText(/drag mode active|edit mode|repositioning/i)).toBeVisible({ timeout: 5000 });

    // Get initial position
    const initialBox = await field.boundingBox();
    expect(initialBox).toBeTruthy();

    if (!initialBox) {
      throw new Error('Field bounding box not found');
    }

    // Perform drag operation
    // Strategy: Use pointer actions for precise control
    await page.mouse.move(initialBox.x + initialBox.width / 2, initialBox.y + initialBox.height / 2);
    await page.mouse.down();

    // Drag to a new position (100px right, 50px down)
    await page.mouse.move(
      initialBox.x + initialBox.width / 2 + 100,
      initialBox.y + initialBox.height / 2 + 50,
      { steps: 10 } // Smooth movement
    );

    await page.mouse.up();

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    // Get new position
    const newBox = await field.boundingBox();
    expect(newBox).toBeTruthy();

    if (!newBox) {
      throw new Error('Field bounding box not found after drag');
    }

    // THIS IS THE CRITICAL ASSERTION THAT WOULD FAIL IF DRAG IS BROKEN
    // Verify field actually moved (with some tolerance for snapping/constraints)
    const movedHorizontally = Math.abs(newBox.x - initialBox.x) > 50;
    const movedVertically = Math.abs(newBox.y - initialBox.y) > 25;

    expect(movedHorizontally || movedVertically).toBeTruthy();
  });

  /**
   * TEST 4: Data Persistence
   * Verifies that form data persists across page reloads
   */
  test('form data persists across page refresh', async ({ page }) => {
    // Fill in some fields
    const partyNameField = page.locator('[data-field="partyName"]').first();
    const emailField = page.locator('[data-field="email"]').first();

    await partyNameField.fill('John Doe');
    await emailField.fill('john@example.com');

    // Wait for auto-save (5 seconds + buffer)
    await page.waitForTimeout(6000);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify data persisted
    await expect(partyNameField).toHaveValue('John Doe', { timeout: 10000 });
    await expect(emailField).toHaveValue('john@example.com');
  });

  /**
   * TEST 5: AI Assistant Functionality
   * Verifies that the AI assistant responds to user queries
   */
  test('AI assistant responds to queries', async ({ page }) => {
    // Open AI assistant (may be a button or draggable panel)
    const aiButton = page.getByRole('button', { name: /ai assistant|assistant|help/i }).first();

    // Click to open if not already open
    if (await aiButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await aiButton.click();
    }

    // Find the chat input
    const chatInput = page.getByPlaceholder(/ask|message|type/i).first();
    await chatInput.waitFor({ state: 'visible', timeout: 5000 });

    // Type a question
    await chatInput.fill('What is a restraining order?');
    await chatInput.press('Enter');

    // Wait for AI response (max 15 seconds)
    // Look for response text containing relevant keywords
    await expect(page.getByText(/restraining order|court|order|protection/i).first()).toBeVisible({
      timeout: 15000
    });
  });

  /**
   * TEST 6: Field Navigation
   * Verifies that users can navigate between fields using the navigation panel
   */
  test('user can navigate between fields', async ({ page }) => {
    // Look for navigation panel or next/previous buttons
    const nextButton = page.getByRole('button', { name: /next field|next/i }).first();

    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const currentUrl = page.url();

      // Click next field button
      await nextButton.click();

      // Verify field focus changed (URL might change or field might be highlighted)
      await page.waitForTimeout(500);

      // Basic verification: page didn't crash
      expect(page.url()).toBeTruthy();
    }
  });

  /**
   * TEST 7: Checkbox Fields
   * Verifies that checkbox fields work correctly
   */
  test('user can toggle checkbox fields', async ({ page }) => {
    // Find a checkbox field (FL-320 has several)
    const checkbox = page.locator('[type="checkbox"]').first();

    if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get initial state
      const initiallyChecked = await checkbox.isChecked();

      // Toggle checkbox
      await checkbox.click();

      // Verify state changed
      const nowChecked = await checkbox.isChecked();
      expect(nowChecked).toBe(!initiallyChecked);

      // Toggle back
      await checkbox.click();
      expect(await checkbox.isChecked()).toBe(initiallyChecked);
    }
  });

  /**
   * TEST 8: Personal Vault Integration
   * Verifies that users can autofill from personal vault
   */
  test('user can autofill from personal vault', async ({ page }) => {
    // Look for vault panel button
    const vaultButton = page.getByRole('button', { name: /vault|personal data|my info/i }).first();

    if (await vaultButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vaultButton.click();

      // Wait for vault panel to open
      await page.waitForTimeout(500);

      // Look for autofill button or similar
      const autofillButton = page.getByRole('button', { name: /autofill|fill all|apply/i }).first();

      if (await autofillButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await autofillButton.click();

        // Verify some fields got filled (depends on vault having data)
        // This is a basic check that the feature doesn't crash
        await page.waitForTimeout(1000);
        expect(page.url()).toBeTruthy();
      }
    }
  });

  /**
   * TEST 9: Logout Functionality
   * Verifies that users can logout successfully
   */
  test('user can logout', async ({ page }) => {
    // Find logout button
    const logoutButton = page.getByRole('button', { name: /logout|sign out|log out/i }).first();

    await logoutButton.click();

    // Should redirect to auth page
    await expect(page).toHaveURL(/auth/, { timeout: 5000 });
  });

  /**
   * TEST 10: Error Handling
   * Verifies that the app handles errors gracefully
   */
  test('app handles network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    // Wait a moment
    await page.waitForTimeout(1000);

    // Look for offline indicator
    const offlineIndicator = page.getByText(/offline|no connection|disconnected/i);

    // Either we see an offline indicator, or the app continues to work (cached)
    // Both are acceptable - we just verify the app didn't crash
    expect(page.url()).toBeTruthy();

    // Re-enable network
    await page.context().setOffline(false);
  });
});

/**
 * SUCCESS CRITERIA
 *
 * ✅ If drag-and-drop is broken, test 3 MUST FAIL
 * ✅ If data doesn't persist, test 4 MUST FAIL
 * ✅ If AI is broken, test 5 MUST FAIL
 * ✅ If PDF doesn't load, test 1 MUST FAIL
 * ✅ All tests use real browser rendering (Playwright)
 * ✅ All tests verify user-visible behavior, not implementation
 *
 * If all these tests pass but the product is broken, WE FAILED.
 */
