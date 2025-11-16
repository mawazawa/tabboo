// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',

  // Files to mutate
  mutate: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.tsx',
    '!src/test/**',
    '!src/__tests__/**',
  ],

  // Test files
  testRunnerNodeArgs: ['--experimental-vm-modules'],

  // Mutation score thresholds
  thresholds: {
    high: 80,
    low: 60,
    break: 50, // Fail if mutation score < 50%
  },

  // Performance settings
  concurrency: 4,
  timeoutMS: 60000,
  timeoutFactor: 2,

  // Ignore slow mutants
  maxConcurrentTestRunners: 4,

  // Report configuration
  htmlReporter: {
    fileName: 'mutation-report.html',
  },
  jsonReporter: {
    fileName: 'mutation-report.json',
  },

  // Incremental mode (faster subsequent runs)
  incremental: true,
  incrementalFile: '.stryker-tmp/incremental.json',

  // Ignore patterns
  ignorePatterns: [
    'dist',
    'build',
    'coverage',
    'node_modules',
    '.stryker-tmp',
    'playwright-report',
    'test-results',
  ],
};

export default config;
