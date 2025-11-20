import { describe, it, expect } from 'vitest';
import { formDataSchema, dv100FormDataSchema } from '../validations';

describe('formDataSchema', () => {
  describe('partyName validation', () => {
    it('should accept valid name', () => {
      const result = formDataSchema.safeParse({ partyName: 'John Doe' });
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 200 characters', () => {
      const longName = 'A'.repeat(201);
      const result = formDataSchema.safeParse({ partyName: longName });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be less than 200 characters');
      }
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ partyName: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should accept valid email', () => {
      const result = formDataSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = formDataSchema.safeParse({ email: 'invalid-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email address');
      }
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ email: '' });
      expect(result.success).toBe(true);
    });

    it('should allow clearing email field (regression test for empty string bug)', () => {
      // This tests the specific bug where email validation rejected empty strings
      // User scenario: user fills email, then needs to clear it
      const withEmail = formDataSchema.safeParse({ email: 'test@example.com' });
      expect(withEmail.success).toBe(true);

      const clearedEmail = formDataSchema.safeParse({ email: '' });
      expect(clearedEmail.success).toBe(true);
    });
  });

  describe('zipCode validation', () => {
    it('should accept valid 5-digit ZIP code', () => {
      const result = formDataSchema.safeParse({ zipCode: '90210' });
      expect(result.success).toBe(true);
    });

    it('should accept valid 9-digit ZIP code', () => {
      const result = formDataSchema.safeParse({ zipCode: '90210-1234' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid ZIP code format', () => {
      const result = formDataSchema.safeParse({ zipCode: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject ZIP code with letters', () => {
      const result = formDataSchema.safeParse({ zipCode: 'ABCDE' });
      expect(result.success).toBe(false);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ zipCode: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('telephoneNo validation', () => {
    it('should accept valid phone number', () => {
      const result = formDataSchema.safeParse({ telephoneNo: '(555) 123-4567' });
      expect(result.success).toBe(true);
    });

    it('should reject phone number longer than 20 characters', () => {
      const longPhone = '1'.repeat(21);
      const result = formDataSchema.safeParse({ telephoneNo: longPhone });
      expect(result.success).toBe(false);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ telephoneNo: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('state validation', () => {
    it('should accept valid 2-letter state code', () => {
      const result = formDataSchema.safeParse({ state: 'CA' });
      expect(result.success).toBe(true);
    });

    it('should accept state name longer than 2 characters', () => {
      const result = formDataSchema.safeParse({ state: 'California' });
      expect(result.success).toBe(true);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ state: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('streetAddress validation', () => {
    it('should accept valid street address', () => {
      const result = formDataSchema.safeParse({ streetAddress: '123 Main St' });
      expect(result.success).toBe(true);
    });

    it('should reject address longer than 300 characters', () => {
      const longAddress = 'A'.repeat(301);
      const result = formDataSchema.safeParse({ streetAddress: longAddress });
      expect(result.success).toBe(false);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ streetAddress: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('city validation', () => {
    it('should accept valid city name', () => {
      const result = formDataSchema.safeParse({ city: 'Los Angeles' });
      expect(result.success).toBe(true);
    });

    it('should reject city name longer than 100 characters', () => {
      const longCity = 'A'.repeat(101);
      const result = formDataSchema.safeParse({ city: longCity });
      expect(result.success).toBe(false);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ city: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('caseNumber validation', () => {
    it('should accept valid case number', () => {
      const result = formDataSchema.safeParse({ caseNumber: 'CASE-2024-001' });
      expect(result.success).toBe(true);
    });

    it('should reject case number longer than 100 characters', () => {
      const longCase = 'A'.repeat(101);
      const result = formDataSchema.safeParse({ caseNumber: longCase });
      expect(result.success).toBe(false);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ caseNumber: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('facts validation', () => {
    it('should accept valid facts text', () => {
      const result = formDataSchema.safeParse({ facts: 'The parties have agreed to the terms...' });
      expect(result.success).toBe(true);
    });

    it('should reject facts longer than 10000 characters', () => {
      const longFacts = 'A'.repeat(10001);
      const result = formDataSchema.safeParse({ facts: longFacts });
      expect(result.success).toBe(false);
    });

    it('should accept empty string', () => {
      const result = formDataSchema.safeParse({ facts: '' });
      expect(result.success).toBe(true);
    });
  });

  describe('boolean fields validation', () => {
    it('should accept true for noOrders', () => {
      const result = formDataSchema.safeParse({ noOrders: true });
      expect(result.success).toBe(true);
    });

    it('should accept false for noOrders', () => {
      const result = formDataSchema.safeParse({ noOrders: false });
      expect(result.success).toBe(true);
    });

    it('should accept true for agreeOrders', () => {
      const result = formDataSchema.safeParse({ agreeOrders: true });
      expect(result.success).toBe(true);
    });

    it('should accept false for consentCustody', () => {
      const result = formDataSchema.safeParse({ consentCustody: false });
      expect(result.success).toBe(true);
    });

    it('should accept true for consentVisitation', () => {
      const result = formDataSchema.safeParse({ consentVisitation: true });
      expect(result.success).toBe(true);
    });
  });

  describe('complete form data', () => {
    it('should validate complete valid form data', () => {
      const validData = {
        partyName: 'John Doe',
        streetAddress: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        telephoneNo: '(555) 123-4567',
        email: 'john@example.com',
        caseNumber: 'CASE-2024-001',
        noOrders: false,
        agreeOrders: true,
      };

      const result = formDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial form data with empty fields', () => {
      const partialData = {
        partyName: 'Jane Smith',
        email: 'jane@example.com',
      };

      const result = formDataSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should reject form data with invalid email', () => {
      const invalidData = {
        partyName: 'John Doe',
        email: 'not-an-email',
      };

      const result = formDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject form data with invalid ZIP code', () => {
      const invalidData = {
        partyName: 'John Doe',
        zipCode: '123',
      };

      const result = formDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject form data with fields exceeding max length', () => {
      const invalidData = {
        partyName: 'A'.repeat(201), // Max is 200
      };

      const result = formDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('partyName');
      }
    });
  });
});

describe('dv100FormDataSchema', () => {
  describe('item1d_email validation', () => {
    it('should accept valid email', () => {
      const result = dv100FormDataSchema.safeParse({ item1d_email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = dv100FormDataSchema.safeParse({ item1d_email: 'invalid-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email address');
      }
    });

    it('should accept empty string', () => {
      const result = dv100FormDataSchema.safeParse({ item1d_email: '' });
      expect(result.success).toBe(true);
    });

    it('should allow clearing email field (regression test for empty string bug)', () => {
      // This tests the specific bug where email validation rejected empty strings
      const withEmail = dv100FormDataSchema.safeParse({ item1d_email: 'user@domain.com' });
      expect(withEmail.success).toBe(true);

      const clearedEmail = dv100FormDataSchema.safeParse({ item1d_email: '' });
      expect(clearedEmail.success).toBe(true);
    });
  });
});
