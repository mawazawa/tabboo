/**
 * Central type definitions for SwiftFill form data
 * Single source of truth for FormData interface
 */

/**
 * Main form data structure for PDF form fields
 */
export interface FormData {
  // Attorney/Party Information (Item 1)
  partyName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  attorneyBarNumber?: string;

  // Case Information
  county?: string;
  petitioner?: string;
  respondent?: string;
  caseNumber?: string;

  // Hearing Information (Item 2)
  hearingDate?: string;
  hearingTime?: string;
  hearingDepartment?: string;
  hearingRoom?: string;

  // Child Information (Item 3)
  child1Name?: string;
  child1BirthDate?: string;
  child2Name?: string;
  child2BirthDate?: string;
  child3Name?: string;
  child3BirthDate?: string;

  // Order Types (Items 4-7)
  orderChildCustody?: boolean;
  orderVisitation?: boolean;
  orderChildSupport?: boolean;
  orderSpousalSupport?: boolean;
  orderAttorneyFees?: boolean;
  orderPropertyControl?: boolean;
  orderOther?: boolean;
  orderOtherText?: string;

  // Response Type
  noOrders?: boolean;
  agreeOrders?: boolean;
  consentCustody?: boolean;
  consentVisitation?: boolean;

  // Facts and Declaration
  facts?: string;
  declarationUnderPenalty?: boolean;

  // Signature
  signatureDate?: string;
  signatureName?: string;
  printName?: string;
}

/**
 * Field position on PDF canvas
 */
export interface FieldPosition {
  top: number;
  left: number;
}

/**
 * Record of all field positions by field name
 */
export type FieldPositions = Record<string, FieldPosition>;

/**
 * Field configuration for rendering and navigation
 */
export interface FieldConfig {
  field: keyof FormData;
  label: string;
  type: 'input' | 'textarea' | 'checkbox';
  placeholder?: string;
  vaultField?: string; // Maps to personal_info column
}

/**
 * Field overlay configuration for PDF rendering
 */
export interface FieldOverlay {
  type: 'input' | 'textarea' | 'checkbox';
  field: string;
  top: string;
  left: string;
  width?: string;
  height?: string;
  placeholder?: string;
}

/**
 * Validation rule types
 */
export type ValidationType = 'required' | 'email' | 'phone' | 'zipCode' | 'pattern' | 'minLength' | 'maxLength';

/**
 * Individual validation rule
 */
export interface ValidationRule {
  type: ValidationType;
  message: string;
  value?: string | number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  type: ValidationType;
}

/**
 * Record of validation rules by field name
 */
export type ValidationRules = Record<string, ValidationRule[]>;

/**
 * Record of validation errors by field name
 */
export type ValidationErrors = Record<string, ValidationError[]>;

/**
 * User authentication state
 */
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at?: string;
}

/**
 * Personal vault data from Supabase
 */
export interface PersonalVaultData {
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | undefined;
}
