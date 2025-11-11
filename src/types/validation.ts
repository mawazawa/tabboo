/**
 * Field Validation System
 * Defines validation rules and error types for form fields
 */

export type ValidationRuleType = 'required' | 'email' | 'phone' | 'zipCode' | 'minLength' | 'maxLength' | 'pattern';

export interface ValidationRule {
  type: ValidationRuleType;
  value?: string | number; // For pattern (regex), minLength, maxLength
  message: string;
  enabled: boolean;
}

export interface FieldValidationConfig {
  fieldName: string;
  rules: ValidationRule[];
}

export interface ValidationError {
  fieldName: string;
  message: string;
  ruleType: ValidationRuleType;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s()+-]+$/,
  zipCode: /^\d{5}(-\d{4})?$/,
};

// Default validation messages
export const DEFAULT_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  zipCode: 'Please enter a valid ZIP code',
  minLength: 'Minimum length not met',
  maxLength: 'Maximum length exceeded',
  pattern: 'Invalid format',
};
