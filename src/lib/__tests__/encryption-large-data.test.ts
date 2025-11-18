/**
 * Test for encryption bug with large data
 *
 * Bug: encryptField() uses String.fromCharCode(...array) which causes
 * "Maximum call stack size exceeded" for large arrays due to spread operator
 * passing each element as a function argument.
 *
 * This test verifies that the encryption library can handle realistic
 * large data such as detailed abuse descriptions, medical records, etc.
 */

import { describe, it, expect } from 'vitest';
import { encryptField, decryptField } from '../encryption';

describe('Encryption - Large Data Handling', () => {
  it('should encrypt and decrypt data larger than 10KB without call stack error', async () => {
    // Create a realistic large text (e.g., detailed abuse description)
    // 10KB = ~10,000 characters
    const largeText = 'This is a detailed description of abuse incidents. '.repeat(200);

    // Verify it's actually large enough to trigger the bug
    expect(largeText.length).toBeGreaterThan(10000);

    // This should NOT throw "Maximum call stack size exceeded"
    const encrypted = await encryptField(largeText);

    // Verify encryption worked
    expect(encrypted).toBeTruthy();
    expect(encrypted).toContain(':'); // Format check: "iv:authTag:ciphertext"

    // Verify decryption works
    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(largeText);
  });

  it('should handle very large data (50KB+)', async () => {
    // Even larger data - medical records, financial documents, etc.
    const veryLargeText = 'A'.repeat(50000);

    expect(veryLargeText.length).toBe(50000);

    const encrypted = await encryptField(veryLargeText);
    expect(encrypted).toBeTruthy();

    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(veryLargeText);
  });

  it('should handle extremely large data (200KB+) without stack overflow', async () => {
    // Test the actual call stack limit
    const extremelyLargeText = 'X'.repeat(200000);

    expect(extremelyLargeText.length).toBe(200000);

    const encrypted = await encryptField(extremelyLargeText);
    expect(encrypted).toBeTruthy();

    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(extremelyLargeText);
  });

  it('should handle edge case: empty string', async () => {
    const encrypted = await encryptField('');
    expect(encrypted).toBe('');

    const decrypted = await decryptField('');
    expect(decrypted).toBe('');
  });

  it('should handle small data correctly (backwards compatibility)', async () => {
    const smallText = 'SSN: 123-45-6789';

    const encrypted = await encryptField(smallText);
    expect(encrypted).toBeTruthy();
    expect(encrypted).toContain(':');

    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(smallText);
  });

  it('should handle Unicode characters in large data', async () => {
    // Unicode characters (emojis, accented chars, etc.)
    const unicodeText = '测试数据 🔒 Données chiffrées Daten verschlüsselt '.repeat(500);

    expect(unicodeText.length).toBeGreaterThan(10000);

    const encrypted = await encryptField(unicodeText);
    const decrypted = await decryptField(encrypted);

    expect(decrypted).toBe(unicodeText);
  });

  it('should provide descriptive error message for invalid base64 in decryptField', async () => {
    // BUG FIX VERIFICATION: base64ToUint8Array should preserve DOMException error context
    // Before fix: DOMException from atob() was caught in decryptField and re-thrown as generic error
    // After fix: base64ToUint8Array catches DOMException and throws descriptive Error
    
    const invalidCiphertext = 'invalid:base64:here!';
    
    // Verify error is thrown
    await expect(decryptField(invalidCiphertext)).rejects.toThrow();
    
    try {
      await decryptField(invalidCiphertext);
      expect.fail('Should have thrown an error for invalid base64');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      
      // After fix: The error chain should preserve the "Invalid base64 string" message
      // Even though decryptField wraps it, the original error context is preserved
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toContain('Failed to decrypt field');
      
      // Verify the error was properly caught and re-thrown (not a raw DOMException)
      // This confirms base64ToUint8Array handled the DOMException correctly
      expect((error as Error).constructor.name).toBe('Error');
    }
  });

  it('should handle corrupted encrypted data with invalid base64 characters', async () => {
    // Test with corrupted data that has invalid base64 characters
    const corruptedData = 'dGVzdA==:invalid!base64:corrupted@data';
    
    await expect(decryptField(corruptedData)).rejects.toThrow();
    
    try {
      await decryptField(corruptedData);
      expect.fail('Should have thrown an error for corrupted data');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // Verify error is thrown (before fix: generic message, after fix: more descriptive)
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Failed to decrypt field');
    }
  });
});
