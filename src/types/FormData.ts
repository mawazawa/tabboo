/**
 * FL-320 Form Data Interface - First Principles Design
 * Based on Official California Judicial Council Form FL-320 (Rev. July 1, 2025)
 * Single source of truth matching database canonical_fields exactly
 */

/**
 * Main form data structure for FL-320 Responsive Declaration to Request for Order
 */
export interface FormData {
  // ================== SECTION 1: ATTORNEY/PARTY INFORMATION (Header) ==================
  /** State Bar Number (6 digits) */
  stateBarNumber?: string;

  /** Name of attorney or self-represented party */
  attorneyOrPartyName?: string;

  /** Law firm name */
  firmName?: string;

  /** Street address of attorney or party */
  streetAddress?: string;

  /** City */
  city?: string;

  /** State (2-letter code) */
  state?: string;

  /** ZIP code (5 or 9 digits) */
  zipCode?: string;

  /** Telephone number */
  telephoneNo?: string;

  /** Fax number */
  faxNo?: string;

  /** Email address */
  emailAddress?: string;

  /** Name of person attorney represents */
  attorneyFor?: string;

  // ================== SECTION 2: COURT INFORMATION (Header) ==================
  /** Superior Court of California, County of... */
  county?: string;

  /** Court street address */
  courtStreetAddress?: string;

  /** Court mailing address */
  courtMailingAddress?: string;

  /** Court city and ZIP code */
  courtCityAndZip?: string;

  /** Court branch name */
  branchName?: string;

  // ================== SECTION 3: CASE INFORMATION (Header) ==================
  /** Petitioner name */
  petitioner?: string;

  /** Respondent name */
  respondent?: string;

  /** Other parent or party name */
  otherParentParty?: string;

  /** Court case number */
  caseNumber?: string;

  // ================== SECTION 4: HEARING INFORMATION (Header) ==================
  /** Date of hearing */
  hearingDate?: string;

  /** Time of hearing */
  hearingTime?: string;

  /** Department or room number for hearing */
  hearingDepartment?: string;

  // ================== ITEM 1: RESTRAINING ORDER INFORMATION ==================
  /** Item 1a: No domestic violence restraining/protective orders in effect */
  item1a_noRestrainingOrder?: boolean;

  /** Item 1b: Domestic violence restraining/protective orders in effect */
  item1b_restrainingOrderActive?: boolean;

  // ================== ITEM 2: CHILD CUSTODY / VISITATION (PARENTING TIME) ==================
  /** Item 2a: I agree with request for child custody */
  item2a_childCustodyAgree?: boolean;

  /** Item 2a: I agree with request for visitation */
  item2a_visitationAgree?: boolean;

  /** Item 2b: I do not agree - child custody */
  item2b_childCustodyDisagree?: boolean;

  /** Item 2b: I do not agree - visitation */
  item2b_visitationDisagree?: boolean;

  /** Item 2b: The orders I am asking the court to make are: */
  item2b_alternativeOrder?: string;

  // ================== ITEM 3: CHILD SUPPORT ==================
  /** Item 3a: I have filed an Income and Expense Declaration (form FL-150) */
  item3a_filedFL150?: boolean;

  /** Item 3b: I agree with the request */
  item3b_agree?: boolean;

  /** Item 3b: I agree the guideline amount is correct */
  item3b_agreeGuideline?: boolean;

  /** Item 3c: I do not agree with the request */
  item3c_disagree?: boolean;

  /** Item 3c: The orders I am asking the court to make are: */
  item3c_alternativeOrder?: string;

  // ================== ITEM 4: SPOUSAL OR DOMESTIC PARTNER SUPPORT ==================
  /** Item 4a: I have filed an Income and Expense Declaration (form FL-150) */
  item4a_filedFL150?: boolean;

  /** Item 4b: I agree with the request */
  item4b_agree?: boolean;

  /** Item 4c: I do not agree with the request */
  item4c_disagree?: boolean;

  /** Item 4c: The orders I am asking the court to make are: */
  item4c_alternativeOrder?: string;

  // ================== ITEM 5: PROPERTY CONTROL ==================
  /** Item 5a: I agree with the request */
  item5a_agree?: boolean;

  /** Item 5b: I do not agree with the request */
  item5b_disagree?: boolean;

  /** Item 5b: The orders I am asking the court to make are: */
  item5b_alternativeOrder?: string;

  // ================== ITEM 6: ATTORNEY'S FEES AND COSTS ==================
  /** Item 6a: I have filed an Income and Expense Declaration (form FL-150) */
  item6a_filedFL150?: boolean;

  /** Item 6a: I have filed a Request for Attorney's Fees and Costs Attachment (form FL-158) */
  item6a_filedFL158?: boolean;

  /** Item 6b: I agree with the request */
  item6b_agree?: boolean;

  /** Item 6c: I do not agree with the request */
  item6c_disagree?: boolean;

  /** Item 6c: The orders I am asking the court to make are: */
  item6c_alternativeOrder?: string;

  // ================== ITEM 7: DOMESTIC VIOLENCE RESTRAINING/PROTECTIVE ORDER ==================
  /** Item 7a: I agree with the request */
  item7a_agree?: boolean;

  /** Item 7b: I do not agree with the request */
  item7b_disagree?: boolean;

  /** Item 7b: The orders I am asking the court to make are: */
  item7b_alternativeOrder?: string;

  // ================== ITEM 8: OTHER ORDERS REQUESTED ==================
  /** Item 8a: I agree with the request */
  item8a_agree?: boolean;

  /** Item 8b: I do not agree with the request */
  item8b_disagree?: boolean;

  /** Item 8b: The orders I am asking the court to make are: */
  item8b_alternativeOrder?: string;

  // ================== ITEM 9: TIME FOR SERVICE OR TIME UNTIL HEARING ==================
  /** Item 9a: I agree with the request */
  item9a_agree?: boolean;

  /** Item 9b: I do not agree with the request */
  item9b_disagree?: boolean;

  /** Item 9b: The orders I am asking the court to make are: */
  item9b_alternativeOrder?: string;

  // ================== ITEM 10: FACTS TO SUPPORT MY REQUEST ==================
  /** Item 10: Facts to support my request for the orders listed above */
  item10_facts?: string;

  /** Item 10: Continued on Attachment 10 */
  item10_continuedOnAttachment?: boolean;

  // ================== SIGNATURE SECTION ==================
  /** I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct */
  declarationUnderPenalty?: boolean;

  /** Date signature was made */
  signatureDate?: string;

  /** Typed or printed name for signature */
  typeOrPrintName?: string;

  /** Electronic or handwritten signature */
  signature?: string;
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
  type: 'input' | 'textarea' | 'checkbox' | 'date';
  placeholder?: string;
  vaultField?: string; // Maps to personal_info column
  item?: string; // Item number (e.g., "1", "2a", "3c")
  section?: string; // Section name (e.g., "attorney_info", "item2", "signature")
}

/**
 * Field overlay configuration for PDF rendering
 */
export interface FieldOverlay {
  type: 'input' | 'textarea' | 'checkbox' | 'date' | 'signature';
  field: string;
  top: string;
  left: string;
  width?: string;
  height?: string;
  placeholder?: string;
  item?: string;
  section?: string;
}

/**
 * Validation rule types
 */
export type ValidationType = 'required' | 'email' | 'phone' | 'zipCode' | 'pattern' | 'minLength' | 'maxLength' | 'barNumber';

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
 * Maps to personal_info table
 */
export interface PersonalVaultData {
  user_id: string;
  attorney_name?: string;       // Maps to attorneyOrPartyName
  bar_number?: string;           // Maps to stateBarNumber
  firm_name?: string;            // Maps to firmName
  street_address?: string;       // Maps to streetAddress
  city?: string;                 // Maps to city
  state?: string;                // Maps to state
  zip_code?: string;             // Maps to zipCode
  telephone_no?: string;         // Maps to telephoneNo
  fax_no?: string;               // Maps to faxNo
  email_address?: string;        // Maps to emailAddress
  full_name?: string;            // Alternative to attorney_name for self-represented
  created_at?: string;
  updated_at?: string;
  [key: string]: string | undefined;
}

/**
 * Form sections for organization and navigation
 */
export const FORM_SECTIONS = {
  ATTORNEY_INFO: 'attorney_info',
  COURT_INFO: 'court_info',
  CASE_INFO: 'case_info',
  HEARING_INFO: 'hearing_info',
  ITEM1: 'item1',
  ITEM2: 'item2',
  ITEM3: 'item3',
  ITEM4: 'item4',
  ITEM5: 'item5',
  ITEM6: 'item6',
  ITEM7: 'item7',
  ITEM8: 'item8',
  ITEM9: 'item9',
  ITEM10: 'item10',
  SIGNATURE: 'signature',
} as const;

/**
 * Total field count: 62 fields (updated from database)
 * - Input fields: 23 fields
 * - Checkboxes: 30 fields
 * - Textareas: 9 fields
 */
