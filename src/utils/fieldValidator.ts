/**
 * Field Validator
 * Validates form field values against defined rules
 */

import { z } from 'zod';
import type { ValidationRule, ValidationError, FieldValidationConfig } from '@/types/validation';
import { VALIDATION_PATTERNS } from '@/types/validation';

/**
 * Validate a single field value against its validation rules
 */
export const validateField = (
  fieldName: string,
  value: string | boolean | undefined,
  rules: ValidationRule[]
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Skip validation for boolean fields (checkboxes)
  if (typeof value === 'boolean') {
    return errors;
  }
  
  const stringValue = value?.toString() || '';
  
  // Filter only enabled rules
  const enabledRules = rules.filter(rule => rule.enabled);
  
  for (const rule of enabledRules) {
    let isValid = true;
    
    switch (rule.type) {
      case 'required':
        isValid = stringValue.trim().length > 0;
        break;
        
      case 'email':
        if (stringValue.trim().length > 0) {
          isValid = VALIDATION_PATTERNS.email.test(stringValue);
        }
        break;
        
      case 'phone':
        if (stringValue.trim().length > 0) {
          isValid = VALIDATION_PATTERNS.phone.test(stringValue);
        }
        break;
        
      case 'zipCode':
        if (stringValue.trim().length > 0) {
          isValid = VALIDATION_PATTERNS.zipCode.test(stringValue);
        }
        break;
        
      case 'minLength':
        if (rule.value && stringValue.trim().length > 0) {
          isValid = stringValue.length >= Number(rule.value);
        }
        break;
        
      case 'maxLength':
        if (rule.value) {
          isValid = stringValue.length <= Number(rule.value);
        }
        break;
        
      case 'pattern':
        if (rule.value && stringValue.trim().length > 0) {
          try {
            const regex = new RegExp(rule.value as string);
            isValid = regex.test(stringValue);
          } catch (e) {
            console.error('Invalid regex pattern:', rule.value);
            isValid = false; // Invalid regex patterns should fail validation
          }
        }
        break;
    }
    
    if (!isValid) {
      errors.push({
        fieldName,
        message: rule.message,
        ruleType: rule.type,
      });
    }
  }
  
  return errors;
};

/**
 * Validate all fields in a form
 */
export const validateForm = (
  formData: Record<string, string | boolean | undefined>,
  validationConfigs: FieldValidationConfig[]
): Record<string, ValidationError[]> => {
  const allErrors: Record<string, ValidationError[]> = {};
  
  for (const config of validationConfigs) {
    const fieldErrors = validateField(
      config.fieldName,
      formData[config.fieldName],
      config.rules
    );
    
    if (fieldErrors.length > 0) {
      allErrors[config.fieldName] = fieldErrors;
    }
  }
  
  return allErrors;
};

/**
 * Check if a field has any errors
 */
export const hasFieldErrors = (
  fieldName: string,
  errors: Record<string, ValidationError[]>
): boolean => {
  return !!errors[fieldName] && errors[fieldName].length > 0;
};

/**
 * Get error messages for a field
 */
export const getFieldErrorMessages = (
  fieldName: string,
  errors: Record<string, ValidationError[]>
): string[] => {
  return errors[fieldName]?.map(error => error.message) || [];
};
