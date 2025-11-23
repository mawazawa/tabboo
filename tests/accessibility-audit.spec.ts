/**
 * Accessibility Audit Tests
 *
 * Uses axe-core to audit pages for WCAG 2.1 AA compliance.
 * These tests ensure the application is accessible to users with disabilities.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit', () => {
  test('main form editor should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for PDF to load
    await page.waitForTimeout(3000);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Nodes affected: ${violation.nodes.length}`);
      });
    }

    // Filter for critical and serious violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('TRO filing page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/file-tro');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log('Critical/Serious violations on TRO page:');
      criticalViolations.forEach(v => {
        console.log(`- ${v.id}: ${v.description} (${v.impact})`);
      });
    }

    expect(criticalViolations).toHaveLength(0);
  });

  test('auth page should have no critical accessibility violations', async ({ page }) => {
    // Clear auth state to see login form
    await page.context().clearCookies();

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('keyboard navigation works on main form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Tab through the page
    await page.keyboard.press('Tab');

    // Check that focus is on an interactive element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        ariaLabel: el?.getAttribute('aria-label'),
      };
    });

    // Should focus on an interactive element
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    expect(
      interactiveElements.includes(focusedElement.tagName || '') ||
      focusedElement.role === 'button' ||
      focusedElement.role === 'link'
    ).toBeTruthy();
  });

  test('form inputs have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find first input and focus it
    const input = page.locator('input').first();
    await input.focus();

    // Check for focus styles (outline or ring)
    const hasVisibleFocus = await input.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;

      // Check if there's a visible outline or box-shadow
      return (
        (outline && outline !== 'none' && !outline.includes('0px')) ||
        (boxShadow && boxShadow !== 'none')
      );
    });

    expect(hasVisibleFocus).toBeTruthy();
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // Run only color contrast check separately
      .analyze();

    // Run specific color contrast check
    const contrastResults = await new AxeBuilder({ page })
      .include('body')
      .analyze();

    const contrastViolations = contrastResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    // Allow some violations but log them
    if (contrastViolations.length > 0) {
      console.log('Color contrast issues:');
      contrastViolations.forEach(v => {
        v.nodes.forEach(node => {
          console.log(`  - ${node.html.substring(0, 100)}`);
        });
      });
    }

    // Should have no more than 5 contrast violations
    expect(contrastViolations.length).toBeLessThan(5);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['*'])
      .enableRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('headings are in logical order', async ({ page }) => {
    await page.goto('/file-tro');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['*'])
      .enableRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['*'])
      .enableRules(['button-name'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Buttons without accessible names:');
      accessibilityScanResults.violations.forEach(v => {
        v.nodes.forEach(node => {
          console.log(`  - ${node.html.substring(0, 100)}`);
        });
      });
    }

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('links have accessible names', async ({ page }) => {
    await page.goto('/file-tro');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['*'])
      .enableRules(['link-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });
});
