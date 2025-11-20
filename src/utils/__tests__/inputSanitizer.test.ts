import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeZipCode,
  sanitizeFormData,
  containsPotentialXSS,
  sanitizeUrl
} from '../inputSanitizer';

describe('inputSanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should preserve normal text', () => {
      expect(sanitizeHtml('Normal text')).toBe('Normal text');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should truncate to maxLength', () => {
      expect(sanitizeString('hello world', 5)).toBe('hello');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim emails', () => {
      expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('should preserve valid phone characters', () => {
      expect(sanitizePhone('(555) 123-4567')).toBe('(555) 123-4567');
    });

    it('should remove invalid characters', () => {
      expect(sanitizePhone('555-ABC-1234!')).toBe('555--1234');
    });
  });

  describe('sanitizeZipCode', () => {
    it('should allow digits and hyphens', () => {
      expect(sanitizeZipCode('90210-1234')).toBe('90210-1234');
    });

    it('should remove letters', () => {
      expect(sanitizeZipCode('90210ABC')).toBe('90210');
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize all string fields for XSS', () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        count: 5,
        active: true
      };

      const result = sanitizeFormData(maliciousData);

      // Key test - the bug fix ensures XSS is prevented
      expect(result.name).not.toContain('<script>');
      expect(result.name).toContain('&lt;script&gt;');
      expect(result.email).toBe('test@example.com');
      expect(result.count).toBe(5);
      expect(result.active).toBe(true);
    });

    it('should handle onclick attributes in form data', () => {
      const data = {
        field: '<div onclick="malicious()">click</div>'
      };

      const result = sanitizeFormData(data);
      expect(result.field).toContain('&lt;div');
    });

    it('should preserve null and undefined values', () => {
      const data = {
        name: 'John',
        optional: null,
        missing: undefined
      };

      const result = sanitizeFormData(data);
      expect(result.name).toBe('John');
      expect(result.optional).toBeNull();
      expect(result.missing).toBeUndefined();
    });
  });

  describe('containsPotentialXSS', () => {
    it('should detect script tags', () => {
      expect(containsPotentialXSS('<script>alert(1)</script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsPotentialXSS('javascript:alert(1)')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsPotentialXSS('<div onclick="evil()">')).toBe(true);
    });

    it('should return false for safe strings', () => {
      expect(containsPotentialXSS('Hello, World!')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
    });

    it('should reject javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull();
    });
  });
});
