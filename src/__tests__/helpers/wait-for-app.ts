/**
 * Test Helper: Wait for App to Load
 *
 * Implements November 2025 Playwright best practices for waiting on PDF.js canvas rendering.
 * Based on research from:
 * - https://playwright.dev/docs/best-practices
 * - https://www.lambdatest.com/blog/playwright-timeout
 * - https://www.checklyhq.com/docs/learn/playwright/waits-and-timeouts
 *
 * Key insight: PDF.js renders canvases asynchronously page-by-page.
 * Canvas elements may exist in DOM but not be visually rendered yet.
 *
 * Strategy:
 * 1. Wait for network to be idle (all initial requests complete)
 * 2. Wait for canvas element to exist and be visible
 * 3. Wait for canvas to have actual dimensions (be rendered, not just present)
 * 4. Wait for form inputs to be interactive
 */

import { Page } from '@playwright/test';

export interface WaitForAppOptions {
  /**
   * Maximum time to wait for app to load (default: 30000ms)
   * Increased from 15s based on Nov 2025 best practices for PDF rendering
   */
  timeout?: number;

  /**
   * Whether to wait for network idle before checking elements (default: true)
   * Recommended for initial page loads
   */
  waitForNetwork?: boolean;

  /**
   * Whether to verify canvas has dimensions (default: true)
   * Ensures canvas is actually rendered, not just present in DOM
   */
  verifyCanvasDimensions?: boolean;
}

/**
 * Wait for the SwiftFill app to be fully loaded and interactive
 *
 * @param page - Playwright page object
 * @param options - Wait configuration options
 *
 * @example
 * ```typescript
 * // Basic usage in beforeEach
 * test.beforeEach(async ({ page }) => {
 *   await page.goto('/');
 *   await waitForApp(page);
 * });
 *
 * // With custom timeout for slow CI environments
 * await waitForApp(page, { timeout: 45000 });
 *
 * // Skip network wait for cached sessions
 * await waitForApp(page, { waitForNetwork: false });
 * ```
 */
export async function waitForApp(
  page: Page,
  options: WaitForAppOptions = {}
): Promise<void> {
  const {
    timeout = 30000,
    waitForNetwork = true,
    verifyCanvasDimensions = true
  } = options;

  // Step 1: Wait for network to be idle (all initial requests complete)
  if (waitForNetwork) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  // Step 2: Wait for PDF canvas to exist and be visible
  // Using specific selector to avoid ambiguity with other canvases
  await page.waitForSelector('.react-pdf__Document canvas', {
    timeout,
    state: 'visible'
  });

  // Step 3: Verify canvas has actual dimensions (is rendered, not just present)
  // PDF.js may create canvas elements before rendering content into them
  if (verifyCanvasDimensions) {
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('.react-pdf__Document canvas') as HTMLCanvasElement;
        return canvas && canvas.offsetHeight > 0 && canvas.offsetWidth > 0;
      },
      { timeout }
    );
  }

  // Step 4: Wait for form input fields to be interactive
  // Ensures the overlay inputs are ready for user interaction
  await page.waitForSelector('input[placeholder]', {
    timeout,
    state: 'visible'
  });
}

/**
 * Wait for PDF to finish rendering all pages
 *
 * Useful for tests that need to interact with multi-page PDFs
 * or verify all pages have loaded correctly.
 *
 * @param page - Playwright page object
 * @param expectedPages - Number of expected pages (optional, will detect if not provided)
 * @param timeout - Maximum time to wait (default: 45000ms)
 *
 * @example
 * ```typescript
 * // Wait for 6-page FL-320 form to fully render
 * await waitForPdfPages(page, 6);
 * ```
 */
export async function waitForPdfPages(
  page: Page,
  expectedPages?: number,
  timeout = 45000
): Promise<void> {
  if (expectedPages) {
    // Wait for specific number of pages to render
    await page.waitForFunction(
      (expected) => {
        const canvases = document.querySelectorAll('.react-pdf__Document canvas');
        return canvases.length >= expected;
      },
      expectedPages,
      { timeout }
    );
  } else {
    // Wait for PDF to stop rendering new pages (stability check)
    // Check that canvas count remains stable for 1 second
    await page.waitForFunction(
      () => {
        return new Promise<boolean>((resolve) => {
          const initialCount = document.querySelectorAll('.react-pdf__Document canvas').length;
          setTimeout(() => {
            const finalCount = document.querySelectorAll('.react-pdf__Document canvas').length;
            resolve(initialCount === finalCount && finalCount > 0);
          }, 1000);
        });
      },
      { timeout }
    );
  }
}
