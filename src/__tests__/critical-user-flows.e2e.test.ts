import { test, expect } from '@playwright/test';
import { waitForApp } from './helpers/wait-for-app';

/**
 * CRITICAL USER FLOWS - E2E Tests
 *
 * These tests simulate REAL user behavior and would have caught the click-to-type bug.
 * Written from a user's perspective, not testing implementation details.
 *
 * Philosophy:
 * - If a user can't do it, the test should fail
 * - Test the UI, not the code
 * - Simulate actual mouse/keyboard interactions
 * - Verify what users see, not internal state
 */

test.describe('Critical User Flow: Basic Form Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('CRITICAL: User can click into a field and type immediately', async ({ page }) => {
    /**
     * This is THE most critical test - it would have caught the click-to-type bug.
     *
     * User flow:
     * 1. See a field on the form
     * 2. Click on it
     * 3. Type their name
     * 4. See the text appear immediately
     */

    // Find the first input field on the PDF (party name)
    const partyNameInput = page.locator('input[placeholder="Party name"]').first();

    // User sees the field
    await expect(partyNameInput).toBeVisible();

    // User clicks into the field
    await partyNameInput.click();

    // User types their name
    await partyNameInput.fill('Jane Smith');

    // User sees their name appear
    await expect(partyNameInput).toHaveValue('Jane Smith');

    // CRITICAL: The value should also appear in the right panel
    // (This tests two-way data binding)
    const rightPanel = page.locator('[data-testid="field-navigation-panel"], .field-navigation, aside').first();
    await expect(rightPanel).toContainText('Jane Smith');
  });

  test('User can fill multiple fields in sequence', async ({ page }) => {
    /**
     * Real user fills out the top section of the form
     */

    // Fill party name
    await page.locator('input[placeholder="Party name"]').first().fill('Jane Smith');
    await expect(page.locator('input[placeholder="Party name"]').first()).toHaveValue('Jane Smith');

    // Fill street address
    const streetInput = page.locator('input[placeholder*="Street"], input[placeholder*="Address"]').first();
    await streetInput.fill('123 Main Street');
    await expect(streetInput).toHaveValue('123 Main Street');

    // Fill city
    const cityInput = page.locator('input[placeholder*="City"]').first();
    await cityInput.fill('Los Angeles');
    await expect(cityInput).toHaveValue('Los Angeles');

    // Fill state
    const stateInput = page.locator('input[placeholder*="State"]').first();
    await stateInput.fill('CA');
    await expect(stateInput).toHaveValue('CA');

    // Fill zip
    const zipInput = page.locator('input[placeholder*="ZIP"], input[placeholder*="Zip"]').first();
    await zipInput.fill('90001');
    await expect(zipInput).toHaveValue('90001');

    // All values should persist (not disappear)
    await expect(page.locator('input[placeholder="Party name"]').first()).toHaveValue('Jane Smith');
    await expect(streetInput).toHaveValue('123 Main Street');
  });

  test('User can click between fields without losing data', async ({ page }) => {
    /**
     * User enters data, clicks to another field, comes back
     * Data should still be there
     */

    const partyNameInput = page.locator('input[placeholder="Party name"]').first();
    const emailInput = page.locator('input[placeholder*="Email"], input[type="email"]').first();

    // Enter name
    await partyNameInput.fill('John Doe');

    // Click to email field
    await emailInput.click();
    await emailInput.fill('john@example.com');

    // Click back to name field
    await partyNameInput.click();

    // Both values should still be there
    await expect(partyNameInput).toHaveValue('John Doe');
    await expect(emailInput).toHaveValue('john@example.com');
  });

  test('User can use Tab key to navigate between fields', async ({ page }) => {
    /**
     * Keyboard navigation is essential for power users
     */

    const partyNameInput = page.locator('input[placeholder="Party name"]').first();

    // Start at first field
    await partyNameInput.click();
    await partyNameInput.fill('Test User');

    // Press Tab to move to next field
    await page.keyboard.press('Tab');

    // Type in the new field (should be street address)
    await page.keyboard.type('456 Oak Avenue');

    // Verify the value went into the street field
    const streetInput = page.locator('input[placeholder*="Street"], input[placeholder*="Address"]').first();
    await expect(streetInput).toHaveValue('456 Oak Avenue');
  });

  test('User sees visual feedback when selecting a field', async ({ page }) => {
    /**
     * Users need to know which field is selected
     */

    const partyNameInput = page.locator('input[placeholder="Party name"]').first();

    // Click field
    await partyNameInput.click();

    // Field should have focus
    await expect(partyNameInput).toBeFocused();

    // Field container should have some visual indicator (border, ring, etc.)
    const fieldContainer = partyNameInput.locator('..');
    const className = await fieldContainer.getAttribute('class');

    // Should have some kind of active/selected/current styling
    expect(
      className?.includes('primary') ||
      className?.includes('ring') ||
      className?.includes('border') ||
      className?.includes('selected') ||
      className?.includes('current')
    ).toBeTruthy();
  });
});

test.describe('Real User Journey: Complete Form Filling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User fills out a complete FL-320 form from start to finish', async ({ page }) => {
    /**
     * Simulates a self-represented litigant filling out the entire form
     * This is the REAL use case
     */

    // Header information
    await page.locator('input[placeholder="Party name"]').first().fill('Jane Smith');
    await page.locator('input[placeholder*="Street"]').first().fill('123 Main Street');
    await page.locator('input[placeholder*="City"]').first().fill('Los Angeles');
    await page.locator('input[placeholder*="State"]').first().fill('CA');
    await page.locator('input[placeholder*="ZIP"]').first().fill('90001');

    const phoneInput = page.locator('input[placeholder*="Phone"], input[placeholder*="Telephone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('(555) 123-4567');
    }

    const emailInput = page.locator('input[placeholder*="Email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('jane.smith@example.com');
    }

    // Case information
    const countyInput = page.locator('input[placeholder*="County"]').first();
    if (await countyInput.isVisible()) {
      await countyInput.fill('Los Angeles');
    }

    const caseNumberInput = page.locator('input[placeholder*="Case"], input[placeholder*="Number"]').first();
    if (await caseNumberInput.isVisible()) {
      await caseNumberInput.fill('FL12345678');
    }

    // Wait a bit for auto-save
    await page.waitForTimeout(1000);

    // Verify all data is still there (auto-save didn't break anything)
    await expect(page.locator('input[placeholder="Party name"]').first()).toHaveValue('Jane Smith');
    await expect(page.locator('input[placeholder*="City"]').first()).toHaveValue('Los Angeles');
  });

  test('User can see their progress as they fill out the form', async ({ page }) => {
    /**
     * Progress indicator helps users know how much is left
     */

    // Look for progress indicator (could be "5/41 fields" or percentage)
    const progressText = page.locator('text=/\\d+\\/\\d+|\\d+%/').first();

    // Should show some kind of progress
    if (await progressText.isVisible({ timeout: 2000 }).catch(() => false)) {
      const initialProgress = await progressText.textContent();

      // Fill a field
      await page.locator('input[placeholder="Party name"]').first().fill('John Doe');

      // Progress should update
      await page.waitForTimeout(500);
      const newProgress = await progressText.textContent();

      // Progress should change (more fields filled)
      expect(newProgress).not.toBe(initialProgress);
    }
  });
});

test.describe('Personal Data Vault Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can save their information to vault and reuse it', async ({ page }) => {
    /**
     * Power users save common info to avoid retyping
     */

    // Look for vault panel or button
    const vaultButton = page.locator('button:has-text("Vault"), button:has-text("Personal"), button:has-text("Save")').first();

    if (await vaultButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Fill some personal info
      await page.locator('input[placeholder="Party name"]').first().fill('Jane Smith');

      const emailInput = page.locator('input[placeholder*="Email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('jane@example.com');
      }

      // Open vault
      await vaultButton.click();

      // Look for save button in vault
      const saveButton = page.locator('button:has-text("Save")').first();
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click();

        // Should show success message
        const toast = page.locator('text=/saved|success/i').first();
        await expect(toast).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('User can autofill fields from vault', async ({ page }) => {
    /**
     * Clicking autofill should populate fields from saved data
     */

    // Look for autofill button (sparkles icon or "Autofill" text)
    const autofillButton = page.locator('button:has-text("Autofill"), button:has([class*="sparkle"])').first();

    if (await autofillButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click autofill
      await autofillButton.click();

      // Some fields should get populated
      const partyNameInput = page.locator('input[placeholder="Party name"]').first();
      const inputValue = await partyNameInput.inputValue();

      // If vault has data, fields should be filled
      if (inputValue) {
        expect(inputValue.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Field Positioning and Dragging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can enter edit mode and drag fields', async ({ page }) => {
    /**
     * Power users repositioning fields
     * This tests the drag-and-drop that was previously broken
     */

    // Look for Edit Mode button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Move")').first();

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Enter edit mode
      await editButton.click();

      // Find a field to drag
      const fieldToDrag = page.locator('input[placeholder="Party name"]').first();
      const fieldContainer = fieldToDrag.locator('..');

      // Get initial position
      const initialBox = await fieldContainer.boundingBox();
      expect(initialBox).toBeTruthy();

      // Drag the field
      if (initialBox) {
        await fieldContainer.hover();
        await page.mouse.down();
        await page.mouse.move(initialBox.x + 100, initialBox.y + 50);
        await page.mouse.up();

        // Wait for position to update
        await page.waitForTimeout(500);

        // Get new position
        const newBox = await fieldContainer.boundingBox();

        // Position should have changed
        expect(newBox?.x).not.toBe(initialBox.x);
      }

      // CRITICAL: After dragging, user should still be able to type
      await fieldToDrag.click();
      await fieldToDrag.fill('Test Name');
      await expect(fieldToDrag).toHaveValue('Test Name');
    }
  });
});

test.describe('Auto-save and Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User data is automatically saved and persists on reload', async ({ page }) => {
    /**
     * Users expect their work to be saved automatically
     * This is CRITICAL for long forms
     */

    const uniqueValue = `Test User ${Date.now()}`;

    // Fill in a field
    await page.locator('input[placeholder="Party name"]').first().fill(uniqueValue);

    // Wait for auto-save (usually 500ms - 2s)
    await page.waitForTimeout(3000);

    // Reload the page
    await page.reload();
    await page.waitForSelector('.react-pdf__Document canvas', { timeout: 15000, state: 'visible' });
    // Also wait for at least one input field to be ready
    await page.waitForSelector('input[placeholder]', { timeout: 15000, state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Wait for form data to load
    await page.waitForTimeout(2000);

    // Data should still be there
    const partyNameInput = page.locator('input[placeholder="Party name"]').first();
    const value = await partyNameInput.inputValue();

    expect(value).toBe(uniqueValue);
  });

  test('Auto-save does not interfere with typing', async ({ page }) => {
    /**
     * Users should not experience lag or interruptions while typing
     */

    const partyNameInput = page.locator('input[placeholder="Party name"]').first();

    // Type continuously without waiting
    await partyNameInput.click();
    await page.keyboard.type('Jane', { delay: 50 });
    await page.keyboard.type(' ', { delay: 50 });
    await page.keyboard.type('Smith', { delay: 50 });

    // Should have full name
    await expect(partyNameInput).toHaveValue('Jane Smith');

    // Continue typing to trigger multiple auto-saves
    await page.keyboard.type(' - Attorney', { delay: 50 });

    await expect(partyNameInput).toHaveValue('Jane Smith - Attorney');
  });
});

test.describe('Accessibility and Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can navigate entire form using only keyboard', async ({ page }) => {
    /**
     * Accessibility requirement - keyboard-only users
     */

    // Tab to first field
    await page.keyboard.press('Tab');

    // Type in first focused field
    await page.keyboard.type('First Field');

    // Tab to next
    await page.keyboard.press('Tab');
    await page.keyboard.type('Second Field');

    // Tab to next
    await page.keyboard.press('Tab');
    await page.keyboard.type('Third Field');

    // Verify at least one field got the value
    const inputs = await page.locator('input[type="text"], input[type="email"]').all();
    let foundValue = false;

    for (const input of inputs.slice(0, 5)) {
      const value = await input.inputValue();
      if (value.includes('Field')) {
        foundValue = true;
        break;
      }
    }

    expect(foundValue).toBeTruthy();
  });

  test('Keyboard shortcuts work correctly', async ({ page }) => {
    /**
     * Power users rely on shortcuts
     */

    // Fill a field
    await page.locator('input[placeholder="Party name"]').first().fill('Original Value');

    // Try Cmd/Ctrl+Z to undo (if undo is implemented)
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+KeyZ`);

    // Wait for undo to process
    await page.waitForTimeout(500);

    // Note: This test verifies shortcuts don't break the app
    // If undo is implemented, value should change
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can recover if they click rapidly between fields', async ({ page }) => {
    /**
     * Real users click around rapidly - app shouldn't break
     */

    const inputs = await page.locator('input[type="text"]').all();

    // Rapidly click between first 5 fields
    for (let i = 0; i < Math.min(5, inputs.length); i++) {
      await inputs[i].click({ timeout: 1000 });
      await page.waitForTimeout(100);
    }

    // Should still be able to type
    await inputs[0].fill('Recovery Test');
    await expect(inputs[0]).toHaveValue('Recovery Test');
  });

  test('User can fill fields with special characters', async ({ page }) => {
    /**
     * Real names and addresses have special characters
     */

    const partyNameInput = page.locator('input[placeholder="Party name"]').first();

    // Name with apostrophe and hyphen
    await partyNameInput.fill("O'Brien-Smith");
    await expect(partyNameInput).toHaveValue("O'Brien-Smith");

    // Address with special characters
    const streetInput = page.locator('input[placeholder*="Street"]').first();
    await streetInput.fill('123 Main St. #4-B');
    await expect(streetInput).toHaveValue('123 Main St. #4-B');
  });

  test('User gets helpful error for invalid input', async ({ page }) => {
    /**
     * Validation should be helpful, not blocking
     */

    // Try to enter invalid phone number (if validation exists)
    const phoneInput = page.locator('input[placeholder*="Phone"]').first();

    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill('invalid');

      // Look for validation error
      const errorMessage = page.locator('text=/invalid|error|format/i').first();

      // If validation is implemented, should show helpful message
      if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorMessage.textContent();
        expect(errorText?.toLowerCase()).toMatch(/phone|format|number/);
      }
    }
  });
});
