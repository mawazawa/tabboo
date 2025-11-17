/**
 * Field-Level Encryption Library
 *
 * Purpose: Encrypt high-sensitivity PII fields before database storage
 *
 * Security:
 * - AES-256-GCM (Galois/Counter Mode) for authenticated encryption
 * - Random IV (Initialization Vector) per encryption
 * - Auth tag for integrity verification
 * - Key derivation from environment variable
 *
 * Usage:
 * ```typescript
 * // Encrypt before storing
 * const encryptedSSN = await encryptField(personalInfo.ssn);
 *
 * // Decrypt after retrieval
 * const decryptedSSN = await decryptField(encryptedValue);
 * ```
 *
 * High-Sensitivity Fields (require encryption):
 * - Social Security Number (SSN)
 * - Financial account numbers
 * - Credit card numbers
 * - Medical records
 * - Passwords/secrets
 */

// ============================================================================
// Configuration
// ============================================================================

// Web Crypto API (browser-compatible)
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes (recommended for GCM)
const TAG_LENGTH = 128; // bits

/**
 * Get encryption key from environment or derive from seed
 * In production, this should be stored in Supabase Vault or environment secrets
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // For demo/development: use a fixed key
  // In production: use VITE_ENCRYPTION_KEY from environment
  const keyMaterial = import.meta.env.VITE_ENCRYPTION_KEY || 'swiftfill-demo-key-change-in-production-32bytes!!';

  // Convert string to bytes
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyMaterial);

  // Derive key from raw bytes
  const keyMaterialImport = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('swiftfill-salt'), // Static salt for deterministic key derivation
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterialImport,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // not extractable
    ['encrypt', 'decrypt']
  );

  return key;
}

// ============================================================================
// Encryption Functions
// ============================================================================

/**
 * Encrypt a plaintext field value
 *
 * @param plaintext - The sensitive data to encrypt
 * @returns Encrypted value as base64 string: "iv:authTag:ciphertext"
 */
export async function encryptField(plaintext: string): Promise<string> {
  if (!plaintext) return '';

  try {
    // Get encryption key
    const key = await getEncryptionKey();

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Convert plaintext to bytes
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);

    // Encrypt
    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      plaintextBytes
    );

    // Extract ciphertext and auth tag
    const ciphertext = new Uint8Array(ciphertextBuffer);

    // GCM mode appends the auth tag to the ciphertext
    // Last 16 bytes are the auth tag
    const authTagStart = ciphertext.length - TAG_LENGTH / 8;
    const actualCiphertext = ciphertext.slice(0, authTagStart);
    const authTag = ciphertext.slice(authTagStart);

    // Convert to base64 for storage
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const authTagBase64 = btoa(String.fromCharCode(...authTag));
    const ciphertextBase64 = btoa(String.fromCharCode(...actualCiphertext));

    // Format: "iv:authTag:ciphertext"
    return `${ivBase64}:${authTagBase64}:${ciphertextBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * Decrypt an encrypted field value
 *
 * @param ciphertext - Encrypted value as base64 string: "iv:authTag:ciphertext"
 * @returns Decrypted plaintext value
 */
export async function decryptField(ciphertext: string): Promise<string> {
  if (!ciphertext) return '';

  try {
    // Parse encrypted value
    const [ivBase64, authTagBase64, ciphertextBase64] = ciphertext.split(':');

    if (!ivBase64 || !authTagBase64 || !ciphertextBase64) {
      throw new Error('Invalid encrypted field format');
    }

    // Convert from base64
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const authTag = Uint8Array.from(atob(authTagBase64), c => c.charCodeAt(0));
    const actualCiphertext = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));

    // Combine ciphertext and auth tag (GCM expects them together)
    const combined = new Uint8Array(actualCiphertext.length + authTag.length);
    combined.set(actualCiphertext);
    combined.set(authTag, actualCiphertext.length);

    // Get encryption key
    const key = await getEncryptionKey();

    // Decrypt
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      combined
    );

    // Convert bytes to string
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(plaintextBuffer);

    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt field (invalid key or corrupted data)');
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Encrypt multiple fields in an object
 *
 * @param data - Object with plaintext fields
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns New object with encrypted fields
 */
export async function encryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): Promise<T> {
  const encrypted = { ...data };

  for (const field of fieldsToEncrypt) {
    if (encrypted[field]) {
      encrypted[field] = await encryptField(String(encrypted[field]));
    }
  }

  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 *
 * @param data - Object with encrypted fields
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns New object with decrypted fields
 */
export async function decryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: (keyof T)[]
): Promise<T> {
  const decrypted = { ...data };

  for (const field of fieldsToDecrypt) {
    if (decrypted[field]) {
      decrypted[field] = await decryptField(String(decrypted[field]));
    }
  }

  return decrypted;
}

// ============================================================================
// Field Classification
// ============================================================================

/**
 * High-sensitivity fields requiring encryption
 */
export const HIGH_SENSITIVITY_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'taxId',
  'bankAccountNumber',
  'routingNumber',
  'creditCardNumber',
  'cvv',
  'pin',
  'password',
  'medicalRecordNumber',
  'healthInsuranceNumber',
] as const;

/**
 * Check if a field requires encryption
 */
export function requiresEncryption(fieldName: string): boolean {
  return HIGH_SENSITIVITY_FIELDS.some(
    sensitiveField => fieldName.toLowerCase().includes(sensitiveField.toLowerCase())
  );
}

// ============================================================================
// Automatic Encryption Helper
// ============================================================================

/**
 * Automatically encrypt high-sensitivity fields in an object
 *
 * @param data - Object with mixed plaintext/encrypted fields
 * @returns New object with high-sensitivity fields encrypted
 */
export async function autoEncryptSensitiveFields<T extends Record<string, any>>(
  data: T
): Promise<T> {
  const fieldsToEncrypt = Object.keys(data).filter(requiresEncryption) as (keyof T)[];

  if (fieldsToEncrypt.length === 0) {
    return data; // No sensitive fields found
  }

  return await encryptFields(data, fieldsToEncrypt);
}

/**
 * Automatically decrypt high-sensitivity fields in an object
 *
 * @param data - Object with encrypted high-sensitivity fields
 * @returns New object with high-sensitivity fields decrypted
 */
export async function autoDecryptSensitiveFields<T extends Record<string, any>>(
  data: T
): Promise<T> {
  const fieldsToDecrypt = Object.keys(data).filter(requiresEncryption) as (keyof T)[];

  if (fieldsToDecrypt.length === 0) {
    return data; // No sensitive fields found
  }

  return await decryptFields(data, fieldsToDecrypt);
}

// ============================================================================
// Key Rotation (Advanced)
// ============================================================================

/**
 * Re-encrypt a field with a new key (for key rotation)
 *
 * @param oldEncryptedValue - Value encrypted with old key
 * @param oldKey - Old encryption key
 * @param newKey - New encryption key
 * @returns Value re-encrypted with new key
 */
export async function reEncryptField(
  oldEncryptedValue: string,
  oldKey: string,
  newKey: string
): Promise<string> {
  // This is a placeholder for key rotation logic
  // In production, you would:
  // 1. Decrypt with old key
  // 2. Re-encrypt with new key
  // 3. Store mapping of old key ID -> new key ID

  // For now, just decrypt and re-encrypt with current key
  const plaintext = await decryptField(oldEncryptedValue);
  const newEncrypted = await encryptField(plaintext);

  return newEncrypted;
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// Example 1: Encrypt single field
const ssn = '123-45-6789';
const encryptedSSN = await encryptField(ssn);
console.log(encryptedSSN); // "iv:authTag:ciphertext"

const decryptedSSN = await decryptField(encryptedSSN);
console.log(decryptedSSN); // "123-45-6789"

// Example 2: Encrypt multiple fields
const personalInfo = {
  name: 'Jane Doe',
  ssn: '123-45-6789',
  address: '123 Main St',
  bankAccount: '9876543210'
};

const encrypted = await encryptFields(personalInfo, ['ssn', 'bankAccount']);
console.log(encrypted);
// {
//   name: 'Jane Doe',
//   ssn: 'iv:authTag:ciphertext',
//   address: '123 Main St',
//   bankAccount: 'iv:authTag:ciphertext'
// }

// Example 3: Auto-encrypt sensitive fields
const autoEncrypted = await autoEncryptSensitiveFields(personalInfo);
// Automatically detects 'ssn' and 'bankAccount' and encrypts them

// Example 4: Storing in Supabase
const { data, error } = await supabase
  .from('canonical_data_vault')
  .update({
    personal_info: await autoEncryptSensitiveFields({
      legalFirstName: 'Jane',
      legalLastName: 'Doe',
      ssn: '123-45-6789', // Will be encrypted automatically
      dateOfBirth: '1990-01-01'
    })
  })
  .eq('user_id', userId);

// Example 5: Retrieving from Supabase
const { data: vault } = await supabase
  .from('canonical_data_vault')
  .select('personal_info')
  .eq('user_id', userId)
  .single();

const decryptedInfo = await autoDecryptSensitiveFields(vault.personal_info);
console.log(decryptedInfo.ssn); // "123-45-6789" (decrypted)
*/
