/**
 * Central type definitions for SwiftFill form data
 * Single source of truth for FormData interface
 */

/**
 * Main form data structure for FL-320 Responsive Declaration to Request for Order
 * Based on official California Judicial Council form (Rev. July 1, 2025)
 */
export interface FormData {
  // Header - Party/Attorney Information
  partyName?: string;
  firmName?: string;
  streetAddress?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  stateBarNumber?: string;

  // Header - Court Information
  county?: string;
  courtStreetAddress?: string;
  courtMailingAddress?: string;
  courtCityAndZip?: string;
  branchName?: string;

  // Header - Case Information
  petitioner?: string;
  respondent?: string;
  otherParentParty?: string;
  caseNumber?: string;

  // Header - Hearing Information
  hearingDate?: string;
  hearingTime?: string;
  hearingDepartment?: string;
  hearingRoom?: string;

  // Item 1: Restraining Order Information
  restrainingOrderNone?: boolean;
  restrainingOrderActive?: boolean;

  // Item 2: Child Custody / Visitation (Parenting Time)
  childCustodyConsent?: boolean;
  visitationConsent?: boolean;
  childCustodyDoNotConsent?: boolean;
  visitationDoNotConsent?: boolean;
  custodyAlternativeOrder?: string;

  // Item 3: Child Support
  childSupportFiledFL150?: boolean;
  childSupportConsent?: boolean;
  childSupportGuidelineConsent?: boolean;
  childSupportDoNotConsent?: boolean;
  childSupportAlternativeOrder?: string;

  // Item 4: Spousal or Domestic Partner Support
  spousalSupportFiledFL150?: boolean;
  spousalSupportConsent?: boolean;
  spousalSupportDoNotConsent?: boolean;
  spousalSupportAlternativeOrder?: string;

  // Item 5: Property Control
  propertyControlConsent?: boolean;
  propertyControlDoNotConsent?: boolean;
  propertyControlAlternativeOrder?: string;

  // Item 6: Attorney's Fees and Costs
  attorneyFeesFiledFL150?: boolean;
  attorneyFeesFiledFL158?: boolean;
  attorneyFeesConsent?: boolean;
  attorneyFeesDoNotConsent?: boolean;
  attorneyFeesAlternativeOrder?: string;

  // Item 7: Domestic Violence Order
  domesticViolenceConsent?: boolean;
  domesticViolenceDoNotConsent?: boolean;
  domesticViolenceAlternativeOrder?: string;

  // Item 8: Other Orders Requested
  otherOrdersConsent?: boolean;
  otherOrdersDoNotConsent?: boolean;
  otherOrdersAlternativeOrder?: string;

  // Item 9: Time for Service / Time Until Hearing
  timeForServiceConsent?: boolean;
  timeForServiceDoNotConsent?: boolean;
  timeForServiceAlternativeOrder?: string;

  // Item 10: Facts to Support
  facts?: string;
  factsAttachment?: boolean;

  // Signature Section
  declarationUnderPenalty?: boolean;
  signatureDate?: string;
  printName?: string;
  signatureName?: string;
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
