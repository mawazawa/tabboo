import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { personalInfoSchema } from '../validations';

/**
 * Test for BUG FIX: State field validation should allow empty strings
 *
 * Bug: State field validation required EXACTLY 2 characters but used .optional()
 *      which only allows undefined, not empty strings.
 *
 * Fix: Added .or(z.literal("")) to allow empty strings like other optional fields
 *
 * This test verifies:
 * 1. Empty string "" should be valid (was failing before fix)
 * 2. Valid 2-char state codes should pass (CA, NY, TX)
 * 3. Invalid states should fail (California, X, empty after trim)
 * 4. Undefined should be valid (optional field)
 */

describe('personalInfoSchema - state field validation (BUG FIX)', () => {
  describe('Empty string handling (THE BUG)', () => {
    it('should accept empty string "" for state field', () => {
      const data = {
        full_name: 'John Doe',
        state: '', // Empty string should be valid
      };

      // Before fix: This would throw "State must be 2 characters"
      // After fix: This should pass
      expect(() => personalInfoSchema.parse(data)).not.toThrow();

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBe('');
    });

    it('should accept whitespace-only string (trimmed to empty)', () => {
      const data = {
        full_name: 'John Doe',
        state: '   ', // Whitespace trimmed to empty string
      };

      expect(() => personalInfoSchema.parse(data)).not.toThrow();

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBe(''); // Trimmed
    });

    it('should accept undefined for state field', () => {
      const data = {
        full_name: 'John Doe',
        // state is undefined (not provided)
      };

      expect(() => personalInfoSchema.parse(data)).not.toThrow();

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBeUndefined();
    });
  });

  describe('Valid state codes', () => {
    it('should accept valid 2-character state code (CA)', () => {
      const data = {
        full_name: 'John Doe',
        state: 'CA',
      };

      expect(() => personalInfoSchema.parse(data)).not.toThrow();

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBe('CA');
    });

    it('should accept valid 2-character state code (NY)', () => {
      const data = {
        full_name: 'John Doe',
        state: 'NY',
      };

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBe('NY');
    });

    it('should trim and accept valid state code', () => {
      const data = {
        full_name: 'John Doe',
        state: '  TX  ', // Whitespace should be trimmed
      };

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBe('TX');
    });
  });

  describe('Invalid state codes (should fail)', () => {
    it('should reject full state name (too long)', () => {
      const data = {
        full_name: 'John Doe',
        state: 'California',
      };

      expect(() => personalInfoSchema.parse(data)).toThrow('State must be 2 characters');
    });

    it('should reject single character state code', () => {
      const data = {
        full_name: 'John Doe',
        state: 'C',
      };

      expect(() => personalInfoSchema.parse(data)).toThrow('State must be 2 characters');
    });

    it('should reject 3-character state code', () => {
      const data = {
        full_name: 'John Doe',
        state: 'CAL',
      };

      expect(() => personalInfoSchema.parse(data)).toThrow('State must be 2 characters');
    });
  });

  describe('Consistency with other optional fields', () => {
    it('should handle empty strings consistently across optional fields', () => {
      const data = {
        full_name: 'John Doe',
        state: '',
        street_address: '',
        city: '',
        zip_code: '',
        email_address: '',
        telephone_no: '',
        fax_no: '',
      };

      // All optional fields should accept empty strings consistently
      expect(() => personalInfoSchema.parse(data)).not.toThrow();

      const result = personalInfoSchema.parse(data);
      expect(result.state).toBe('');
      expect(result.street_address).toBe('');
      expect(result.city).toBe('');
      expect(result.zip_code).toBe('');
      expect(result.email_address).toBe('');
    });
  });

  describe('Real-world scenarios', () => {
    it('should accept form with state field left blank', () => {
      const data = {
        full_name: 'Jane Smith',
        street_address: '123 Main St',
        city: 'Los Angeles',
        state: '', // User left this blank - should be valid
        zip_code: '90001',
        email_address: 'jane@example.com',
      };

      expect(() => personalInfoSchema.parse(data)).not.toThrow();
    });

    it('should accept form with only required fields', () => {
      const data = {
        full_name: 'Bob Johnson',
        // All other fields empty or undefined
        state: '',
        street_address: '',
      };

      expect(() => personalInfoSchema.parse(data)).not.toThrow();
    });
  });
});

/**
 * BEFORE FIX (Bug Reproduction):
 *
 * This test would have failed with:
 * ```
 * Error: State must be 2 characters
 * ```
 *
 * Because the schema was:
 * state: z.string().trim().length(2, "State must be 2 characters").optional(),
 *
 * AFTER FIX:
 *
 * Schema is now:
 * state: z.string().trim().length(2, "State must be 2 characters").optional().or(z.literal("")),
 *
 * This allows empty strings, making it consistent with other optional fields.
 */
