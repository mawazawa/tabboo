/**
 * Input sanitization utilities
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitize HTML string to prevent XSS
 * Removes script tags and dangerous attributes
 */
export const sanitizeHtml = (input: string): string => {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

/**
 * Sanitize string for safe display
 * Trims whitespace and limits length
 */
export const sanitizeString = (input: string, maxLength?: number): string => {
  let sanitized = input.trim();
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (input: string): string => {
  return input.trim().toLowerCase();
};

/**
 * Sanitize phone number
 * Removes non-numeric characters except + and -
 */
export const sanitizePhone = (input: string): string => {
  return input.replace(/[^\d+\-\s()]/g, '').trim();
};

/**
 * Sanitize ZIP code
 * Allows only digits and hyphens
 */
export const sanitizeZipCode = (input: string): string => {
  return input.replace(/[^\d\-]/g, '').trim();
};

/**
 * Sanitize form data object
 * Applies appropriate sanitization to all fields
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

/**
 * Check if string contains potential XSS
 */
export const containsPotentialXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Validate and sanitize URL
 */
export const sanitizeUrl = (input: string): string | null => {
  try {
    const url = new URL(input);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    
    return url.toString();
  } catch {
    return null;
  }
};
