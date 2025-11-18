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
});
