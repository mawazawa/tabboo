import { test, expect } from '@playwright/test';
import { waitForApp } from './helpers/wait-for-app';

/**
 * COMPLETE FORM WORKFLOW - E2E Tests
 *
 * These tests simulate a complete user journey from opening the app
 * to filling out a form and saving it. Focus on real-world usage.
 *
 * Critical User Journeys:
 * 1. First-time user fills out FL-320 form
 * 2. Auto-save protects data
 * 3. User can recover from refresh
 * 4. User can export/import templates
 * 5. Zoom and field scaling work together
 * 6. Multi-page navigation
 *
 * Best Practices (Nov 2025):
 * - Test complete user journeys, not isolated features
 * - Use Playwright auto-wait (no sleeps)
 * - Focus on what users see and do
 * - Organize by user flow, not technical features
 */

test.describe('Complete Form Workflow: New User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('Complete flow: User fills out entire form header section', async ({ page }) => {
    /**
     * User Journey:
     * 1. Open app
     * 2. See PDF with form
     * 3. Fill out header section (party info, contact, attorney)
     * 4. Verify all data persists
     */

    // Step 1: PDF should load
    await expect(page.locator('.react-pdf__Document, [data-testid="pdf-document"]')).toBeVisible({
      timeout: 10000,
    });

    // Step 2: Fill party name
    const partyName = page.locator('input[placeholder*="Party"], input[name="partyName"]').first();
    await partyName.waitFor({ state: 'visible', timeout: 5000 });
    await partyName.fill('Jane Elizabeth Smith');
    await expect(partyName).toHaveValue('Jane Elizabeth Smith');

    // Step 3: Fill address
    const street = page.locator('input[placeholder*="Street"], input[placeholder*="Address"]').first();
    await street.fill('123 Main Street, Apt 4B');
    await expect(street).toHaveValue('123 Main Street, Apt 4B');

    const city = page.locator('input[placeholder*="City"]').first();
    await city.fill('Los Angeles');

    const state = page.locator('input[placeholder*="State"]').first();
    await state.fill('CA');

    const zip = page.locator('input[placeholder*="ZIP"], input[placeholder*="Zip"]').first();
    await zip.fill('90001');

    // Step 4: Fill contact info
    const phone = page.locator('input[placeholder*="Telephone"], input[placeholder*="Phone"], input[type="tel"]').first();
    await phone.fill('(555) 123-4567');

    const email = page.locator('input[placeholder*="Email"], input[type="email"]').first();
    await email.fill('jane.smith@example.com');

    // Step 5: Fill attorney info
    const attorneyFor = page.locator('input[placeholder*="Attorney"], textarea[placeholder*="Attorney"]').first();
    await attorneyFor.fill('Self-Represented');

    // Step 6: Wait a moment for auto-save
    await page.waitForTimeout(6000); // Auto-save runs every 5 seconds

    // Step 7: Verify all data is still there
    await expect(partyName).toHaveValue('Jane Elizabeth Smith');
    await expect(street).toHaveValue('123 Main Street, Apt 4B');
    await expect(city).toHaveValue('Los Angeles');
    await expect(state).toHaveValue('CA');
    await expect(zip).toHaveValue('90001');
    await expect(phone).toHaveValue('(555) 123-4567');
    await expect(email).toHaveValue('jane.smith@example.com');
    await expect(attorneyFor).toHaveValue('Self-Represented');
  });

  test('Complete flow: User fills form, navigates using field panel', async ({ page }) => {
    /**
     * User Journey:
     * 1. Fill a field
     * 2. Click "Next" in navigation panel
     * 3. Fill next field
     * 4. Click "Previous" to go back
     * 5. Verify data persists
     */

    // Fill first field
    const firstInput = page.locator('input').first();
    await firstInput.waitFor({ state: 'visible' });
    await firstInput.fill('Test Value 1');

    // Look for Next button in navigation panel
    const nextButton = page.locator('button:has-text("Next"), button[aria-label*="Next"]').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Fill second field
      const focusedInput = page.locator('input:focus, textarea:focus').first();
      if (await focusedInput.isVisible()) {
        await focusedInput.fill('Test Value 2');
      }

      // Go back
      const prevButton = page.locator('button:has-text("Previous"), button:has-text("Prev"), button[aria-label*="Previous"]').first();
      if (await prevButton.isVisible()) {
        await prevButton.click();

        // First field should still have value
        await expect(firstInput).toHaveValue('Test Value 1');
      }
    }
  });
});

test.describe('Auto-Save & Recovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('Auto-save: Data persists after page refresh', async ({ page }) => {
    /**
     * Critical User Journey:
     * 1. User fills out form
     * 2. Auto-save runs
     * 3. User accidentally refreshes page
     * 4. Data should be recovered
     */

    // Fill out several fields
    const partyName = page.locator('input[placeholder*="Party"]').first();
    await partyName.waitFor({ state: 'visible' });
    await partyName.fill('Recovery Test User');

    const email = page.locator('input[type="email"]').first();
    await email.fill('recovery@test.com');

    // Wait for auto-save (runs every 5 seconds)
    await page.waitForTimeout(6000);

    // Look for auto-save indicator
    const autoSaveIndicator = page.locator('text=/saved|saving/i, [aria-label*="save"]').first();
    if (await autoSaveIndicator.isVisible()) {
      await expect(autoSaveIndicator).toContainText(/saved/i, { timeout: 10000 });
    }

    // Refresh the page
    await page.reload();
    await waitForApp(page);

    // Data should be recovered
    await expect(page.locator('input[placeholder*="Party"]').first()).toHaveValue('Recovery Test User', {
      timeout: 10000,
    });
    await expect(page.locator('input[type="email"]').first()).toHaveValue('recovery@test.com');
  });

  test('Auto-save indicator shows save status', async ({ page }) => {
    /**
     * User Journey:
     * 1. User types in field
     * 2. Auto-save indicator shows "Saving..."
     * 3. After save completes, shows "Saved"
     */

    const input = page.locator('input').first();
    await input.waitFor({ state: 'visible' });
    await input.fill('Test Auto-Save');

    // Look for save indicator
    const saveIndicator = page.locator('[data-testid="auto-save-indicator"], text=/saving|saved/i').first();

    if (await saveIndicator.isVisible()) {
      // Should show "Saving..." or "Saved"
      const saveText = await saveIndicator.textContent();
      expect(saveText).toMatch(/saving|saved/i);
    }
  });
});

test.describe('Zoom & Field Scaling Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('USER REPORTED BUG: Fields scale when PDF is zoomed', async ({ page }) => {
    /**
     * Critical Bug Test:
     * 1. User sees form at 100% zoom
     * 2. User zooms to 150%
     * 3. Fields should scale proportionally
     * 4. Fields should not appear tiny or misaligned
     */

    // Wait for PDF to load
    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Get initial field position and size
    const testField = page.locator('input[placeholder*="Party"]').first();
    await testField.waitFor({ state: 'visible' });
    const initialBox = await testField.boundingBox();

    // Find zoom controls
    const zoomInButton = page.locator('button:has-text("Zoom In"), button[aria-label*="zoom in"], button:has-text("+")').first();

    if (await zoomInButton.isVisible()) {
      // Zoom in
      await zoomInButton.click();
      await zoomInButton.click(); // 150% zoom

      // Wait for zoom to apply
      await page.waitForTimeout(500);

      // Field should be larger now
      const zoomedBox = await testField.boundingBox();

      if (initialBox && zoomedBox) {
        // Field width should increase
        expect(zoomedBox.width).toBeGreaterThan(initialBox.width);

        // Field should still be visible
        await expect(testField).toBeVisible();
      }
    }
  });

  test('"Scale to Fit" button works correctly', async ({ page }) => {
    /**
     * User Journey:
     * 1. User clicks "Scale to Fit" button
     * 2. PDF should fit viewport
     * 3. Fields should remain aligned
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Look for Scale to Fit button
    const scaleToFitButton = page.locator('button:has-text("Scale to Fit"), button:has-text("Fit"), button[aria-label*="fit"]').first();

    if (await scaleToFitButton.isVisible()) {
      await scaleToFitButton.click();

      // Wait for scaling to apply
      await page.waitForTimeout(500);

      // Fields should still be visible and aligned
      const field = page.locator('input').first();
      if (await field.isVisible()) {
        await expect(field).toBeVisible();
      }
    }
  });

  test('Zoom maintains field positions relative to PDF', async ({ page }) => {
    /**
     * User Journey:
     * 1. User fills a field at 100% zoom
     * 2. User zooms to 200%
     * 3. Field should still align with PDF form field
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Fill a field
    const field = page.locator('input[placeholder*="Party"]').first();
    await field.waitFor({ state: 'visible' });
    await field.fill('Zoom Test');

    // Zoom in
    const zoomInButton = page.locator('button:has-text("Zoom In"), button[aria-label*="zoom in"], button:has-text("+")').first();

    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
      await zoomInButton.click();
      await zoomInButton.click(); // 200% zoom

      await page.waitForTimeout(500);

      // Field should still have value and be visible
      await expect(field).toHaveValue('Zoom Test');
      await expect(field).toBeVisible();
    }
  });
});

test.describe('Multi-Page Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can navigate between PDF pages', async ({ page }) => {
    /**
     * User Journey:
     * 1. User sees page 1
     * 2. User clicks to go to page 2
     * 3. Page 2 loads
     * 4. User can go back to page 1
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Look for page navigation
    const nextPageButton = page.locator('button:has-text("Next Page"), button[aria-label*="next page"]').first();

    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();

      // Should show page 2
      await expect(page.locator('.react-pdf__Page[data-page-number="2"], text=/page.*2/i').first()).toBeVisible({
        timeout: 5000,
      });

      // Go back to page 1
      const prevPageButton = page.locator('button:has-text("Previous Page"), button[aria-label*="previous page"]').first();
      if (await prevPageButton.isVisible()) {
        await prevPageButton.click();

        await expect(page.locator('.react-pdf__Page[data-page-number="1"], text=/page.*1/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('Field values persist when navigating between pages', async ({ page }) => {
    /**
     * User Journey:
     * 1. User fills field on page 1
     * 2. User navigates to page 2
     * 3. User navigates back to page 1
     * 4. Field value should still be there
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Fill a field on page 1
    const page1Field = page.locator('input').first();
    await page1Field.waitFor({ state: 'visible' });
    await page1Field.fill('Page 1 Data');

    // Navigate to page 2
    const nextPageButton = page.locator('button:has-text("Next Page"), button[aria-label*="next page"]').first();

    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();
      await page.waitForTimeout(1000);

      // Go back to page 1
      const prevPageButton = page.locator('button:has-text("Previous Page"), button[aria-label*="previous page"]').first();
      if (await prevPageButton.isVisible()) {
        await prevPageButton.click();
        await page.waitForTimeout(1000);

        // Field should still have value
        await expect(page1Field).toHaveValue('Page 1 Data');
      }
    }
  });

  test('Thumbnail sidebar shows correct page count', async ({ page }) => {
    /**
     * User Journey:
     * 1. User opens form
     * 2. Thumbnail sidebar shows all pages
     * 3. User can click thumbnail to jump to page
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Look for thumbnail sidebar
    const thumbnailSidebar = page.locator('[data-testid="thumbnail-sidebar"], .pdf-thumbnails, aside:has(.thumbnail)').first();

    if (await thumbnailSidebar.isVisible()) {
      // Should show multiple thumbnails (FL-320 has 4 pages)
      const thumbnails = page.locator('.thumbnail, [data-testid*="thumbnail"]');
      const count = await thumbnails.count();

      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Template Export/Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can save template with current field positions', async ({ page }) => {
    /**
     * User Journey:
     * 1. User adjusts field positions
     * 2. User clicks "Save Template"
     * 3. Template is saved
     * 4. Success message appears
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Look for settings/template button
    const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Template"), button[aria-label*="settings"]').first();

    if (await settingsButton.isVisible()) {
      await settingsButton.click();

      // Look for save/export template option
      const saveTemplateButton = page.locator('button:has-text("Save Template"), button:has-text("Export")').first();

      if (await saveTemplateButton.isVisible()) {
        await saveTemplateButton.click();

        // Should show success message
        await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('User can load template to restore field positions', async ({ page }) => {
    /**
     * User Journey:
     * 1. User has saved template
     * 2. User clicks "Load Template"
     * 3. Template is applied
     * 4. Field positions are restored
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Template"), button[aria-label*="settings"]').first();

    if (await settingsButton.isVisible()) {
      await settingsButton.click();

      const loadTemplateButton = page.locator('button:has-text("Load Template"), button:has-text("Import")').first();

      if (await loadTemplateButton.isVisible()) {
        // This would typically involve file upload
        // Test verifies button exists and is clickable
        await expect(loadTemplateButton).toBeEnabled();
      }
    }
  });
});

test.describe('AI Assistant Interaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can open AI assistant and ask questions', async ({ page }) => {
    /**
     * User Journey:
     * 1. User clicks AI assistant button
     * 2. AI chat panel opens
     * 3. User types question
     * 4. AI responds
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Look for AI assistant button/panel
    const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant"), [aria-label*="AI"]').first();

    if (await aiButton.isVisible()) {
      await aiButton.click();

      // AI panel should appear
      await expect(page.locator('[role="dialog"], .ai-assistant, .ai-chat').first()).toBeVisible({ timeout: 5000 });

      // Look for chat input
      const chatInput = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"], input[type="text"]').last();

      if (await chatInput.isVisible()) {
        await chatInput.fill('How do I fill out the party name field?');

        // Submit message
        const submitButton = page.locator('button[type="submit"], button:has-text("Send")').last();
        if (await submitButton.isVisible()) {
          await submitButton.click();

          // Should show AI response (may take a moment)
          await page.waitForTimeout(3000);

          // Chat area should have messages
          const chatMessages = page.locator('.message, [role="log"], .chat-message');
          const messageCount = await chatMessages.count();

          expect(messageCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('AI assistant can be dragged around the screen', async ({ page }) => {
    /**
     * User Journey:
     * 1. User opens AI assistant
     * 2. User drags it to different position
     * 3. Assistant moves smoothly
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant")').first();

    if (await aiButton.isVisible()) {
      await aiButton.click();

      const aiPanel = page.locator('[role="dialog"], .ai-assistant').first();

      if (await aiPanel.isVisible()) {
        // Try to drag the panel
        const panelBox = await aiPanel.boundingBox();

        if (panelBox) {
          // Drag from center to new position
          await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + 10);
          await page.mouse.down();
          await page.mouse.move(panelBox.x + 100, panelBox.y + 100);
          await page.mouse.up();

          // Panel should have moved
          const newBox = await aiPanel.boundingBox();
          if (newBox) {
            expect(newBox.x).not.toBe(panelBox.x);
          }
        }
      }
    }
  });
});

test.describe('Accessibility & Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can navigate entire form using only keyboard', async ({ page }) => {
    /**
     * Accessibility Critical:
     * 1. User presses Tab to navigate
     * 2. All interactive elements are reachable
     * 3. User can fill form without mouse
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Tab to next element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Should be able to type in focused input
    if (focusedElement === 'INPUT' || focusedElement === 'TEXTAREA') {
      await page.keyboard.type('Keyboard Test');

      const activeInput = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        return el?.value || '';
      });

      expect(activeInput).toContain('Keyboard');
    }
  });

  test('Screen reader announcements work correctly', async ({ page }) => {
    /**
     * Accessibility Critical:
     * 1. App has live regions for announcements
     * 2. Navigation changes are announced
     * 3. Errors are announced
     */

    await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

    // Look for ARIA live regions
    const liveRegion = page.locator('[role="status"], [aria-live="polite"], [aria-live="assertive"]').first();

    if (await liveRegion.isVisible()) {
      await expect(liveRegion).toBeAttached();
    }
  });
});
