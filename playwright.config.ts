import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 *
 * This config runs REAL browser tests for critical user workflows.
 * These tests would have caught the drag-and-drop bug.
 */
export default defineConfig({
  testDir: './',
  testMatch: [
    'src/__tests__/**/*.e2e.test.ts',
    'src/__tests__/**/smoke.test.ts',
    'src/__tests__/**/workflows.test.ts',
    'tests/visual-regression/**/*.spec.ts',
  ],

  // Test timeout configuration
  timeout: 60000, // 60s per test (visual tests take longer)
  expect: {
    timeout: 10000, // 10s for assertions
    toHaveScreenshot: {
      // Allow some pixel differences for anti-aliasing
      maxDiffPixels: 100,
      // Threshold for color comparison (0-1)
      threshold: 0.2,
      // Disable animations for consistent screenshots
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05, // 5% pixel difference allowed
    },
  },

  // Snapshot configuration
  snapshotDir: './tests/visual-regression/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    // Add junit reporter for CI
    process.env.CI ? ['junit', { outputFile: 'test-results/junit.xml' }] : null,
  ].filter(Boolean) as any,

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:8080',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - runs ONCE to authenticate
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Test projects - all depend on setup completing first
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use stored authentication state
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Visual regression tests - no auth needed
    {
      name: 'visual-regression',
      testMatch: 'tests/visual-regression/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // No auth needed for visual tests
      },
      // No dependencies - runs independently
    },

    // Firefox browser testing
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Use stored authentication state
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
