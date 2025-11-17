import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 *
 * This config runs REAL browser tests for critical user workflows.
 * These tests would have caught the drag-and-drop bug.
 */
export default defineConfig({
  testDir: './src/__tests__',
  testMatch: ['**/*.e2e.test.ts', '**/smoke.test.ts', '**/workflows.test.ts'],

  // Test timeout configuration
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000, // 5s for assertions
  },

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
    baseURL: 'http://localhost:8085',

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

    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
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
    url: 'http://localhost:8085',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
