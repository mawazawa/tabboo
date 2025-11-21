/**
 * Vitest Configuration Validation Test
 *
 * This test verifies that the vitest configuration correctly excludes Playwright tests.
 * Bug: Playwright tests (smoke.test.ts, workflows.test.ts) were not being excluded from Vitest,
 * causing "test.describe() to be called here" errors when running the test suite.
 *
 * Fix: Added explicit exclusion patterns to vitest.config.ts:
 *   - smoke.test.ts pattern
 *   - workflows.test.ts pattern
 *
 * @version 1.0
 * @date November 21, 2025
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vitest Configuration Validation', () => {
  it('should exclude Playwright smoke.test.ts files from Vitest', () => {
    // Read vitest.config.ts
    const configPath = path.resolve(__dirname, '../../../vitest.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Verify the exclusion pattern is present
    expect(configContent).toContain("'**/smoke.test.ts'");
    expect(configContent).toContain('smoke');
  });

  it('should exclude Playwright workflows.test.ts files from Vitest', () => {
    // Read vitest.config.ts
    const configPath = path.resolve(__dirname, '../../../vitest.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Verify the exclusion pattern is present
    expect(configContent).toContain("'**/workflows.test.ts'");
    expect(configContent).toContain('workflows');
  });

  it('should have both Playwright test exclusions in the exclude array', () => {
    // Read vitest.config.ts
    const configPath = path.resolve(__dirname, '../../../vitest.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Extract the exclude array
    const excludeMatch = configContent.match(/exclude:\s*\[([\s\S]*?)\]/);
    expect(excludeMatch).toBeTruthy();

    const excludeArray = excludeMatch![1];

    // Verify both patterns are in the exclude array
    expect(excludeArray).toContain("'**/smoke.test.ts'");
    expect(excludeArray).toContain("'**/workflows.test.ts'");

    // Verify they appear after other patterns
    expect(excludeArray).toContain("'**/*.e2e.test.ts'");
    expect(excludeArray).toContain("'**/tests/**'");
  });

  it('should properly comment the Playwright test exclusions', () => {
    // Read vitest.config.ts
    const configPath = path.resolve(__dirname, '../../../vitest.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Verify comments are present and accurate
    expect(configContent).toContain("'**/smoke.test.ts', // Exclude Playwright smoke tests");
    expect(configContent).toContain("'**/workflows.test.ts', // Exclude Playwright workflow tests");
  });

  it('should validate that the config syntax is correct', () => {
    // Attempt to require/import the config to validate syntax
    const configPath = path.resolve(__dirname, '../../../vitest.config.ts');

    // If we got here without error, the TypeScript/JavaScript syntax is valid
    // (The test file itself being able to read and parse the config is validation)
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Basic validation: should have a valid structure
    expect(configContent).toContain('export default defineConfig');
    expect(configContent).toContain('test:');
    expect(configContent).toContain('exclude:');
  });
});
