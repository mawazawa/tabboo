/**
 * Test to verify no duplicate vault integration files exist
 * 
 * This test prevents regression of the bug where both vaultIntegration.ts
 * and vault-integration.ts existed, causing "Multiple exports with the same name" errors.
 * 
 * Bug fixed: November 23, 2025
 * Root cause: Duplicate files with same exports but different naming conventions
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

describe('Vault Integration File Naming', () => {
  it('should only have vault-integration.ts (kebab-case), not vaultIntegration.ts (camelCase)', () => {
    const libPath = resolve(__dirname, '..');
    
    // Check that the correct kebab-case file exists
    const kebabCaseFile = resolve(libPath, 'vault-integration.ts');
    expect(existsSync(kebabCaseFile), 'vault-integration.ts should exist').toBe(true);
    
    // Check that the incorrect camelCase file does NOT exist
    const camelCaseFile = resolve(libPath, 'vaultIntegration.ts');
    expect(existsSync(camelCaseFile), 'vaultIntegration.ts should NOT exist (causes duplicate exports)').toBe(false);
  });

  it('should follow kebab-case naming convention for service files', () => {
    const libPath = resolve(__dirname, '..');
    
    // Verify related service files use kebab-case
    const googleMapsService = resolve(libPath, 'google-maps-service.ts');
    const plaidService = resolve(libPath, 'plaid-service.ts');
    
    expect(existsSync(googleMapsService), 'google-maps-service.ts should exist').toBe(true);
    expect(existsSync(plaidService), 'plaid-service.ts should exist').toBe(true);
    
    // Verify camelCase versions don't exist
    const googleMapsCamelCase = resolve(libPath, 'googleMapsService.ts');
    const plaidCamelCase = resolve(libPath, 'plaidService.ts');
    
    expect(existsSync(googleMapsCamelCase), 'googleMapsService.ts should NOT exist').toBe(false);
    expect(existsSync(plaidCamelCase), 'plaidService.ts should NOT exist').toBe(false);
  });

  it('should not have duplicate exports for checkVaultStatus', async () => {
    // Import should succeed without "Multiple exports" error
    const { checkVaultStatus } = await import('../vault-integration');
    
    expect(checkVaultStatus).toBeDefined();
    expect(typeof checkVaultStatus).toBe('function');
  });

  it('should not have duplicate exports for getDataProvenance', async () => {
    const { getDataProvenance } = await import('../vault-integration');
    
    expect(getDataProvenance).toBeDefined();
    expect(typeof getDataProvenance).toBe('function');
  });

  it('should not have duplicate exports for clearFinancialData', async () => {
    const { clearFinancialData } = await import('../vault-integration');
    
    expect(clearFinancialData).toBeDefined();
    expect(typeof clearFinancialData).toBe('function');
  });

  it('should not have duplicate exports for getFormAutoFillData', async () => {
    const { getFormAutoFillData } = await import('../vault-integration');
    
    expect(getFormAutoFillData).toBeDefined();
    expect(typeof getFormAutoFillData).toBe('function');
  });
});

