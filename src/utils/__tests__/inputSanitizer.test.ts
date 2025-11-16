import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeZipCode,
  sanitizeFormData,
  containsPotentialXSS,
  sanitizeUrl,
} from '../inputSanitizer';

describe('inputSanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags by escaping HTML', () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });

    it('should escape HTML entities', () => {
      const input = '<div>Test</div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;div&gt;Test&lt;/div&gt;');
    });

    it('should handle nested tags', () => {
      const input = '<div><span>Nested</span></div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<span>');
    });

    it('should preserve safe content', () => {
      const input = 'Hello World';
      const result = sanitizeHtml(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should escape special characters', () => {
      const input = '< > & "';
      const result = sanitizeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const result = sanitizeString('  hello  ');
      expect(result).toBe('hello');
    });

    it('should limit length when maxLength provided', () => {
      const result = sanitizeString('hello world', 5);
      expect(result).toBe('hello');
    });

    it('should not truncate if within maxLength', () => {
      const result = sanitizeString('hello', 10);
      expect(result).toBe('hello');
    });

    it('should handle empty strings', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });

    it('should handle strings with only whitespace', () => {
      const result = sanitizeString('   ');
      expect(result).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should trim and lowercase email', () => {
      const result = sanitizeEmail('  Test@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should handle already lowercase emails', () => {
      const result = sanitizeEmail('test@example.com');
      expect(result).toBe('test@example.com');
    });

    it('should handle empty strings', () => {
      const result = sanitizeEmail('');
      expect(result).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('should preserve digits and formatting characters', () => {
      const result = sanitizePhone('(555) 123-4567');
      expect(result).toBe('(555) 123-4567');
    });

    it('should remove letters', () => {
      const result = sanitizePhone('555-CALL-NOW');
      expect(result).toBe('555--');
    });

    it('should remove special characters except allowed ones', () => {
      const result = sanitizePhone('555#123@4567');
      expect(result).toBe('5551234567');
    });

    it('should preserve plus sign for international', () => {
      const result = sanitizePhone('+1 555-123-4567');
      expect(result).toBe('+1 555-123-4567');
    });

    it('should trim whitespace', () => {
      const result = sanitizePhone('  555-1234  ');
      expect(result).toBe('555-1234');
    });

    it('should handle empty strings', () => {
      const result = sanitizePhone('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeZipCode', () => {
    it('should allow 5-digit ZIP codes', () => {
      const result = sanitizeZipCode('90210');
      expect(result).toBe('90210');
    });

    it('should allow ZIP+4 format', () => {
      const result = sanitizeZipCode('90210-1234');
      expect(result).toBe('90210-1234');
    });

    it('should remove letters', () => {
      const result = sanitizeZipCode('9021A');
      expect(result).toBe('9021');
    });

    it('should remove invalid characters', () => {
      const result = sanitizeZipCode('90210#1234');
      expect(result).toBe('902101234');
    });

    it('should trim whitespace', () => {
      const result = sanitizeZipCode('  90210  ');
      expect(result).toBe('90210');
    });

    it('should handle empty strings', () => {
      const result = sanitizeZipCode('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize string fields', () => {
      const data = { name: '  John Doe  ', age: 30 };
      const result = sanitizeFormData(data);
      expect(result.name).toBe('John Doe');
      expect(result.age).toBe(30);
    });

    it('should preserve boolean values', () => {
      const data = { isActive: true, isDeleted: false };
      const result = sanitizeFormData(data);
      expect(result.isActive).toBe(true);
      expect(result.isDeleted).toBe(false);
    });

    it('should preserve number values', () => {
      const data = { count: 42, price: 19.99 };
      const result = sanitizeFormData(data);
      expect(result.count).toBe(42);
      expect(result.price).toBe(19.99);
    });

    it('should preserve null values', () => {
      const data = { optional: null };
      const result = sanitizeFormData(data);
      expect(result.optional).toBe(null);
    });

    it('should preserve undefined values', () => {
      const data = { optional: undefined };
      const result = sanitizeFormData(data);
      expect(result.optional).toBe(undefined);
    });

    it('should handle mixed data types', () => {
      const data = {
        name: '  Alice  ',
        age: 25,
        isActive: true,
        notes: null,
      };
      const result = sanitizeFormData(data);
      expect(result.name).toBe('Alice');
      expect(result.age).toBe(25);
      expect(result.isActive).toBe(true);
      expect(result.notes).toBe(null);
    });
  });

  describe('containsPotentialXSS', () => {
    it('should detect script tags', () => {
      expect(containsPotentialXSS('<script>alert("XSS")</script>')).toBe(true);
    });

    it('should detect script tags with attributes', () => {
      expect(containsPotentialXSS('<script src="malicious.js"></script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsPotentialXSS('javascript:alert("XSS")')).toBe(true);
    });

    it('should detect onclick event handler', () => {
      expect(containsPotentialXSS('<div onclick="alert()">Click</div>')).toBe(true);
    });

    it('should detect onload event handler', () => {
      expect(containsPotentialXSS('<img onload="alert()" />')).toBe(true);
    });

    it('should detect onerror event handler', () => {
      expect(containsPotentialXSS('<img onerror="alert()" />')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsPotentialXSS('<iframe src="malicious.html"></iframe>')).toBe(true);
    });

    it('should detect object tags', () => {
      expect(containsPotentialXSS('<object data="malicious.swf"></object>')).toBe(true);
    });

    it('should detect embed tags', () => {
      expect(containsPotentialXSS('<embed src="malicious.swf" />')).toBe(true);
    });

    it('should allow safe HTML-like content', () => {
      expect(containsPotentialXSS('Hello <world>')).toBe(false);
    });

    it('should allow safe text', () => {
      expect(containsPotentialXSS('Hello World')).toBe(false);
    });

    it('should handle case variations', () => {
      expect(containsPotentialXSS('<SCRIPT>alert("XSS")</SCRIPT>')).toBe(true);
      expect(containsPotentialXSS('JAVASCRIPT:alert("XSS")')).toBe(true);
      expect(containsPotentialXSS('<IMG ONLOAD="alert()" />')).toBe(true);
    });

    it('should handle empty strings', () => {
      expect(containsPotentialXSS('')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http protocol', () => {
      const result = sanitizeUrl('http://example.com');
      expect(result).toBe('http://example.com/');
    });

    it('should allow https protocol', () => {
      const result = sanitizeUrl('https://example.com');
      expect(result).toBe('https://example.com/');
    });

    it('should reject javascript: protocol', () => {
      const result = sanitizeUrl('javascript:alert("XSS")');
      expect(result).toBe(null);
    });

    it('should reject data: protocol', () => {
      const result = sanitizeUrl('data:text/html,<script>alert("XSS")</script>');
      expect(result).toBe(null);
    });

    it('should reject file: protocol', () => {
      const result = sanitizeUrl('file:///etc/passwd');
      expect(result).toBe(null);
    });

    it('should reject ftp: protocol', () => {
      const result = sanitizeUrl('ftp://example.com');
      expect(result).toBe(null);
    });

    it('should return null for invalid URLs', () => {
      const result = sanitizeUrl('not a url');
      expect(result).toBe(null);
    });

    it('should handle URLs with paths', () => {
      const result = sanitizeUrl('https://example.com/path/to/page');
      expect(result).toBe('https://example.com/path/to/page');
    });

    it('should handle URLs with query parameters', () => {
      const result = sanitizeUrl('https://example.com?param=value');
      expect(result).toBe('https://example.com/?param=value');
    });

    it('should handle URLs with fragments', () => {
      const result = sanitizeUrl('https://example.com#section');
      expect(result).toBe('https://example.com/#section');
    });
  });
});
