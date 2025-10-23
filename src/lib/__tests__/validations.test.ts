import { describe, it, expect } from 'vitest';
import { validateField, formDataSchema } from '../validations';

describe('validateField', () => {
  describe('partyName validation', () => {
    it('should accept valid name', () => {
      const result = validateField('partyName', 'John Doe');
      expect(result).toBeUndefined();
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = validateField('partyName', longName);
      expect(result).toBe('Name must be less than 100 characters');
    });

    it('should accept empty string', () => {
      const result = validateField('partyName', '');
      expect(result).toBeUndefined();
    });
  });

  describe('email validation', () => {
    it('should accept valid email', () => {
      const result = validateField('email', 'test@example.com');
      expect(result).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const result = validateField('email', 'invalid-email');
      expect(result).toBe('Invalid email address');
    });

    it('should accept empty string', () => {
      const result = validateField('email', '');
      expect(result).toBeUndefined();
    });
  });

  describe('zipCode validation', () => {
    it('should accept valid 5-digit ZIP code', () => {
      const result = validateField('zipCode', '90210');
      expect(result).toBeUndefined();
    });

    it('should accept valid 9-digit ZIP code', () => {
      const result = validateField('zipCode', '90210-1234');
      expect(result).toBeUndefined();
    });

    it('should reject invalid ZIP code format', () => {
      const result = validateField('zipCode', '1234');
      expect(result).toBe('ZIP code must be 5 or 9 digits');
    });

    it('should reject ZIP code with letters', () => {
      const result = validateField('zipCode', 'ABCDE');
      expect(result).toBe('ZIP code must be 5 or 9 digits');
    });

    it('should accept empty string', () => {
      const result = validateField('zipCode', '');
      expect(result).toBeUndefined();
    });
  });

  describe('telephoneNo validation', () => {
    it('should accept valid phone number with parentheses', () => {
      const result = validateField('telephoneNo', '(555) 123-4567');
      expect(result).toBeUndefined();
    });

    it('should accept valid phone number without formatting', () => {
      const result = validateField('telephoneNo', '5551234567');
      expect(result).toBeUndefined();
    });

    it('should accept valid phone number with dashes', () => {
      const result = validateField('telephoneNo', '555-123-4567');
      expect(result).toBeUndefined();
    });

    it('should reject phone number with letters', () => {
      const result = validateField('telephoneNo', '555-ABC-4567');
      expect(result).toBe('Invalid phone number format');
    });

    it('should reject phone number longer than 20 characters', () => {
      const longPhone = '1'.repeat(21);
      const result = validateField('telephoneNo', longPhone);
      expect(result).toBe('Phone number too long');
    });

    it('should accept empty string', () => {
      const result = validateField('telephoneNo', '');
      expect(result).toBeUndefined();
    });
  });

  describe('state validation', () => {
    it('should accept valid 2-letter state code', () => {
      const result = validateField('state', 'CA');
      expect(result).toBeUndefined();
    });

    it('should reject state code longer than 2 characters', () => {
      const result = validateField('state', 'CAL');
      expect(result).toBe('State must be 2 characters');
    });

    it('should accept empty string', () => {
      const result = validateField('state', '');
      expect(result).toBeUndefined();
    });
  });

  describe('streetAddress validation', () => {
    it('should accept valid street address', () => {
      const result = validateField('streetAddress', '123 Main St');
      expect(result).toBeUndefined();
    });

    it('should reject address longer than 200 characters', () => {
      const longAddress = 'A'.repeat(201);
      const result = validateField('streetAddress', longAddress);
      expect(result).toBe('Address must be less than 200 characters');
    });

    it('should accept empty string', () => {
      const result = validateField('streetAddress', '');
      expect(result).toBeUndefined();
    });
  });

  describe('city validation', () => {
    it('should accept valid city name', () => {
      const result = validateField('city', 'Los Angeles');
      expect(result).toBeUndefined();
    });

    it('should reject city name longer than 100 characters', () => {
      const longCity = 'A'.repeat(101);
      const result = validateField('city', longCity);
      expect(result).toBe('City must be less than 100 characters');
    });

    it('should accept empty string', () => {
      const result = validateField('city', '');
      expect(result).toBeUndefined();
    });
  });

  describe('caseNumber validation', () => {
    it('should accept valid case number', () => {
      const result = validateField('caseNumber', 'CASE-2024-001');
      expect(result).toBeUndefined();
    });

    it('should reject case number longer than 50 characters', () => {
      const longCase = 'A'.repeat(51);
      const result = validateField('caseNumber', longCase);
      expect(result).toBe('Case number must be less than 50 characters');
    });

    it('should accept empty string', () => {
      const result = validateField('caseNumber', '');
      expect(result).toBeUndefined();
    });
  });

  describe('facts validation', () => {
    it('should accept valid facts text', () => {
      const result = validateField('facts', 'The parties have agreed to the following terms...');
      expect(result).toBeUndefined();
    });

    it('should reject facts longer than 5000 characters', () => {
      const longFacts = 'A'.repeat(5001);
      const result = validateField('facts', longFacts);
      expect(result).toBe('Facts must be less than 5000 characters');
    });

    it('should accept empty string', () => {
      const result = validateField('facts', '');
      expect(result).toBeUndefined();
    });
  });

  describe('boolean fields validation', () => {
    it('should accept true for noOrders', () => {
      const result = validateField('noOrders', true);
      expect(result).toBeUndefined();
    });

    it('should accept false for noOrders', () => {
      const result = validateField('noOrders', false);
      expect(result).toBeUndefined();
    });

    it('should accept true for agreeOrders', () => {
      const result = validateField('agreeOrders', true);
      expect(result).toBeUndefined();
    });

    it('should accept false for consentCustody', () => {
      const result = validateField('consentCustody', false);
      expect(result).toBeUndefined();
    });

    it('should accept true for consentVisitation', () => {
      const result = validateField('consentVisitation', true);
      expect(result).toBeUndefined();
    });
  });
});

describe('formDataSchema', () => {
  it('should validate complete valid form data', () => {
    const validData = {
      partyName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      telephoneNo: '(555) 123-4567',
      faxNo: '(555) 123-4568',
      email: 'john@example.com',
      attorneyFor: 'Jane Smith',
      county: 'Los Angeles County',
      petitioner: 'John Doe',
      respondent: 'Jane Doe',
      caseNumber: 'CASE-2024-001',
      noOrders: false,
      agreeOrders: true,
      consentCustody: true,
      consentVisitation: true,
      facts: 'The parties have agreed to the following terms.',
      signatureDate: '2024-01-01',
      signatureName: 'John Doe',
    };

    const result = formDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate partial form data with empty fields', () => {
    const partialData = {
      partyName: 'John Doe',
      email: 'john@example.com',
      city: '',
      state: '',
      zipCode: '',
    };

    const result = formDataSchema.safeParse(partialData);
    expect(result.success).toBe(true);
  });

  it('should reject form data with invalid email', () => {
    const invalidData = {
      partyName: 'John Doe',
      email: 'invalid-email',
    };

    const result = formDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('email');
      expect(result.error.errors[0].message).toBe('Invalid email address');
    }
  });

  it('should reject form data with invalid ZIP code', () => {
    const invalidData = {
      zipCode: '1234', // Too short
    };

    const result = formDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('zipCode');
      expect(result.error.errors[0].message).toBe('ZIP code must be 5 or 9 digits');
    }
  });

  it('should reject form data with fields exceeding max length', () => {
    const invalidData = {
      partyName: 'A'.repeat(101),
    };

    const result = formDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('partyName');
      expect(result.error.errors[0].message).toBe('Name must be less than 100 characters');
    }
  });
});
