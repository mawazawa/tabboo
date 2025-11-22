import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateField,
  validateForm,
  hasFieldErrors,
  getFieldErrorMessages,
} from '../fieldValidator';
import type { ValidationRule, FieldValidationConfig } from '@/types/validation';

describe('fieldValidator', () => {
  describe('validateField', () => {
    describe('required validation', () => {
      it('should pass for non-empty values', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: true },
        ];

        const errors = validateField('name', 'John Doe', rules);
        expect(errors).toHaveLength(0);
      });

      it('should fail for empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Name is required', enabled: true },
        ];

        const errors = validateField('name', '', rules);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('Name is required');
        expect(errors[0].ruleType).toBe('required');
      });

      it('should fail for whitespace-only strings', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: true },
        ];

        const errors = validateField('name', '   ', rules);
        expect(errors).toHaveLength(1);
      });

      it('should fail for undefined values', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: true },
        ];

        const errors = validateField('name', undefined, rules);
        expect(errors).toHaveLength(1);
      });
    });

    describe('email validation', () => {
      it('should pass for valid email addresses', () => {
        const rules: ValidationRule[] = [
          { type: 'email', message: 'Invalid email', enabled: true },
        ];

        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.com',
        ];

        validEmails.forEach((email) => {
          const errors = validateField('email', email, rules);
          expect(errors).toHaveLength(0);
        });
      });

      it('should fail for invalid email addresses', () => {
        const rules: ValidationRule[] = [
          { type: 'email', message: 'Invalid email', enabled: true },
        ];

        const invalidEmails = [
          'notanemail',
          '@example.com',
          'user@',
          'user @example.com',
        ];

        invalidEmails.forEach((email) => {
          const errors = validateField('email', email, rules);
          expect(errors).toHaveLength(1);
          expect(errors[0].ruleType).toBe('email');
        });
      });

      it('should skip validation for empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'email', message: 'Invalid email', enabled: true },
        ];

        const errors = validateField('email', '', rules);
        expect(errors).toHaveLength(0);
      });
    });

    describe('phone validation', () => {
      it('should pass for valid phone numbers', () => {
        const rules: ValidationRule[] = [
          { type: 'phone', message: 'Invalid phone', enabled: true },
        ];

        const validPhones = [
          '555-1234',
          '(555) 123-4567',
          '+1 555-123-4567',
          '5551234567',
        ];

        validPhones.forEach((phone) => {
          const errors = validateField('phone', phone, rules);
          expect(errors).toHaveLength(0);
        });
      });

      it('should fail for invalid phone numbers', () => {
        const rules: ValidationRule[] = [
          { type: 'phone', message: 'Invalid phone', enabled: true },
        ];

        const invalidPhones = [
          'abc-defg',
          '555#1234',
          '555@1234',
        ];

        invalidPhones.forEach((phone) => {
          const errors = validateField('phone', phone, rules);
          expect(errors).toHaveLength(1);
          expect(errors[0].ruleType).toBe('phone');
        });
      });

      it('should skip validation for empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'phone', message: 'Invalid phone', enabled: true },
        ];

        const errors = validateField('phone', '', rules);
        expect(errors).toHaveLength(0);
      });
    });

    describe('zipCode validation', () => {
      it('should pass for valid 5-digit ZIP codes', () => {
        const rules: ValidationRule[] = [
          { type: 'zipCode', message: 'Invalid ZIP', enabled: true },
        ];

        const errors = validateField('zip', '90210', rules);
        expect(errors).toHaveLength(0);
      });

      it('should pass for valid ZIP+4 format', () => {
        const rules: ValidationRule[] = [
          { type: 'zipCode', message: 'Invalid ZIP', enabled: true },
        ];

        const errors = validateField('zip', '90210-1234', rules);
        expect(errors).toHaveLength(0);
      });

      it('should fail for invalid ZIP codes', () => {
        const rules: ValidationRule[] = [
          { type: 'zipCode', message: 'Invalid ZIP', enabled: true },
        ];

        const invalidZips = ['123', '12345-', 'ABCDE', '12345-12'];

        invalidZips.forEach((zip) => {
          const errors = validateField('zip', zip, rules);
          expect(errors).toHaveLength(1);
          expect(errors[0].ruleType).toBe('zipCode');
        });
      });

      it('should skip validation for empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'zipCode', message: 'Invalid ZIP', enabled: true },
        ];

        const errors = validateField('zip', '', rules);
        expect(errors).toHaveLength(0);
      });
    });

    describe('minLength validation', () => {
      it('should pass when length meets minimum', () => {
        const rules: ValidationRule[] = [
          { type: 'minLength', value: 5, message: 'Too short', enabled: true },
        ];

        const errors = validateField('text', 'hello', rules);
        expect(errors).toHaveLength(0);
      });

      it('should pass when length exceeds minimum', () => {
        const rules: ValidationRule[] = [
          { type: 'minLength', value: 5, message: 'Too short', enabled: true },
        ];

        const errors = validateField('text', 'hello world', rules);
        expect(errors).toHaveLength(0);
      });

      it('should fail when length is below minimum', () => {
        const rules: ValidationRule[] = [
          { type: 'minLength', value: 5, message: 'Minimum 5 characters', enabled: true },
        ];

        const errors = validateField('text', 'hi', rules);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('Minimum 5 characters');
      });

      it('should skip validation for empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'minLength', value: 5, message: 'Too short', enabled: true },
        ];

        const errors = validateField('text', '', rules);
        expect(errors).toHaveLength(0);
      });
    });

    describe('maxLength validation', () => {
      it('should pass when length is below maximum', () => {
        const rules: ValidationRule[] = [
          { type: 'maxLength', value: 10, message: 'Too long', enabled: true },
        ];

        const errors = validateField('text', 'hello', rules);
        expect(errors).toHaveLength(0);
      });

      it('should pass when length equals maximum', () => {
        const rules: ValidationRule[] = [
          { type: 'maxLength', value: 5, message: 'Too long', enabled: true },
        ];

        const errors = validateField('text', 'hello', rules);
        expect(errors).toHaveLength(0);
      });

      it('should fail when length exceeds maximum', () => {
        const rules: ValidationRule[] = [
          { type: 'maxLength', value: 5, message: 'Maximum 5 characters', enabled: true },
        ];

        const errors = validateField('text', 'hello world', rules);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('Maximum 5 characters');
      });

      it('should validate empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'maxLength', value: 5, message: 'Too long', enabled: true },
        ];

        const errors = validateField('text', '', rules);
        expect(errors).toHaveLength(0);
      });
    });

    describe('pattern validation', () => {
      it('should pass for matching patterns', () => {
        const rules: ValidationRule[] = [
          { type: 'pattern', value: '^[A-Z]+$', message: 'Must be uppercase', enabled: true },
        ];

        const errors = validateField('text', 'HELLO', rules);
        expect(errors).toHaveLength(0);
      });

      it('should fail for non-matching patterns', () => {
        const rules: ValidationRule[] = [
          { type: 'pattern', value: '^[A-Z]+$', message: 'Must be uppercase', enabled: true },
        ];

        const errors = validateField('text', 'hello', rules);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('Must be uppercase');
      });

      it('should handle complex regex patterns', () => {
        const rules: ValidationRule[] = [
          { type: 'pattern', value: '^\\d{3}-\\d{2}-\\d{4}$', message: 'Invalid SSN format', enabled: true },
        ];

        const validErrors = validateField('ssn', '123-45-6789', rules);
        expect(validErrors).toHaveLength(0);

        const invalidErrors = validateField('ssn', '12-345-6789', rules);
        expect(invalidErrors).toHaveLength(1);
      });

      it('should handle invalid regex gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const rules: ValidationRule[] = [
          { type: 'pattern', value: '[invalid(regex', message: 'Invalid', enabled: true },
        ];

        // Should fail validation for invalid regex
        const errors = validateField('text', 'anything', rules);
        expect(errors).toHaveLength(1);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should skip validation for empty strings', () => {
        const rules: ValidationRule[] = [
          { type: 'pattern', value: '^[A-Z]+$', message: 'Must be uppercase', enabled: true },
        ];

        const errors = validateField('text', '', rules);
        expect(errors).toHaveLength(0);
      });
    });

    describe('boolean fields', () => {
      it('should skip validation for boolean values', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: true },
        ];

        const errorsTrue = validateField('checkbox', true, rules);
        expect(errorsTrue).toHaveLength(0);

        const errorsFalse = validateField('checkbox', false, rules);
        expect(errorsFalse).toHaveLength(0);
      });
    });

    describe('disabled rules', () => {
      it('should skip disabled rules', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: false },
          { type: 'minLength', value: 10, message: 'Too short', enabled: false },
        ];

        const errors = validateField('text', '', rules);
        expect(errors).toHaveLength(0);
      });

      it('should only apply enabled rules', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: true },
          { type: 'minLength', value: 10, message: 'Too short', enabled: false },
        ];

        const errors = validateField('text', '', rules);
        expect(errors).toHaveLength(1);
        expect(errors[0].ruleType).toBe('required');
      });
    });

    describe('multiple rules', () => {
      it('should return all validation errors', () => {
        const rules: ValidationRule[] = [
          { type: 'required', message: 'Required', enabled: true },
          { type: 'minLength', value: 5, message: 'Too short', enabled: true },
          { type: 'email', message: 'Invalid email', enabled: true },
        ];

        const errors = validateField('email', 'a', rules);
        // Should fail minLength and email, but not required
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateForm', () => {
    it('should validate all fields in a form', () => {
      const formData = {
        name: '',
        email: 'invalid-email',
        phone: '555-1234',
      };

      const configs: FieldValidationConfig[] = [
        {
          fieldName: 'name',
          rules: [{ type: 'required', message: 'Name required', enabled: true }],
        },
        {
          fieldName: 'email',
          rules: [{ type: 'email', message: 'Invalid email', enabled: true }],
        },
        {
          fieldName: 'phone',
          rules: [{ type: 'phone', message: 'Invalid phone', enabled: true }],
        },
      ];

      const errors = validateForm(formData, configs);

      expect(errors.name).toHaveLength(1);
      expect(errors.email).toHaveLength(1);
      expect(errors.phone).toBeUndefined(); // Phone is valid
    });

    it('should return empty object when all fields are valid', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const configs: FieldValidationConfig[] = [
        {
          fieldName: 'name',
          rules: [{ type: 'required', message: 'Name required', enabled: true }],
        },
        {
          fieldName: 'email',
          rules: [{ type: 'email', message: 'Invalid email', enabled: true }],
        },
      ];

      const errors = validateForm(formData, configs);

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle empty form data', () => {
      const formData = {};
      const configs: FieldValidationConfig[] = [];

      const errors = validateForm(formData, configs);

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle missing fields in form data', () => {
      const formData = {
        name: 'John',
      };

      const configs: FieldValidationConfig[] = [
        {
          fieldName: 'name',
          rules: [{ type: 'required', message: 'Required', enabled: true }],
        },
        {
          fieldName: 'email',
          rules: [{ type: 'required', message: 'Required', enabled: true }],
        },
      ];

      const errors = validateForm(formData, configs);

      expect(errors.name).toBeUndefined();
      expect(errors.email).toHaveLength(1);
    });
  });

  describe('hasFieldErrors', () => {
    it('should return true when field has errors', () => {
      const errors = {
        name: [
          { fieldName: 'name', message: 'Required', ruleType: 'required' as const },
        ],
      };

      expect(hasFieldErrors('name', errors)).toBe(true);
    });

    it('should return false when field has no errors', () => {
      const errors = {
        email: [
          { fieldName: 'email', message: 'Invalid', ruleType: 'email' as const },
        ],
      };

      expect(hasFieldErrors('name', errors)).toBe(false);
    });

    it('should return false when field has empty error array', () => {
      const errors = {
        name: [],
      };

      expect(hasFieldErrors('name', errors)).toBe(false);
    });

    it('should return false for empty errors object', () => {
      expect(hasFieldErrors('name', {})).toBe(false);
    });
  });

  describe('getFieldErrorMessages', () => {
    it('should return error messages for a field', () => {
      const errors = {
        name: [
          { fieldName: 'name', message: 'Required', ruleType: 'required' as const },
          { fieldName: 'name', message: 'Too short', ruleType: 'minLength' as const },
        ],
      };

      const messages = getFieldErrorMessages('name', errors);

      expect(messages).toEqual(['Required', 'Too short']);
    });

    it('should return empty array when field has no errors', () => {
      const errors = {
        email: [
          { fieldName: 'email', message: 'Invalid', ruleType: 'email' as const },
        ],
      };

      const messages = getFieldErrorMessages('name', errors);

      expect(messages).toEqual([]);
    });

    it('should return empty array for non-existent field', () => {
      const messages = getFieldErrorMessages('name', {});

      expect(messages).toEqual([]);
    });
  });
});
