import { test, expect } from '@playwright/test';
import { waitForApp } from './helpers/wait-for-app';
import fs from 'fs';
import path from 'path';

test.describe('PDF Export Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('User can fill form and export PDF', async ({ page }) => {
    console.log('Step 1: Filling out form fields...');
    const testData = {
      partyName: 'Jane Smith',
      streetAddress: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      telephoneNo: '(555) 123-4567',
      email: 'jane.smith@example.com'
    };

    for (const [fieldName, value] of Object.entries(testData)) {
      const field = page.locator('[data-field="' + fieldName + '"]').first();
      if (await field.isVisible({ timeout: 2000 }).catch(() => false)) {
        await field.fill(value);
      }
    }

    await page.waitForTimeout(6000);
    await expect(page).toHaveScreenshot('pdf-export-filled-form.png', { fullPage: true, animations: 'disabled' });

    const exportButton = page.getByRole('button', { name: /export|download|save pdf/i });
    await expect(exportButton).toBeVisible({ timeout: 5000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await exportButton.click();
    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/FL-320.*\.pdf$/i);

    const tempPath = path.join(__dirname, '../../test-results/downloads', filename);
    await download.saveAs(tempPath);

    expect(fs.existsSync(tempPath)).toBe(true);
    const fileStats = fs.statSync(tempPath);
    expect(fileStats.size).toBeGreaterThan(1000);
  });
});
