/**
 * TRO Packet Assembly Types
 * Comprehensive type definitions for assembling, validating, and exporting
 * California Domestic Violence TRO packets for Los Angeles Superior Court
 */

import type { FormData } from './FormData';

// ==================== FORM IDENTIFICATION ====================

/**
 * Supported California Judicial Council forms
 */
export enum FormType {
  /** FL-320: Responsive Declaration to Request for Order */
  FL320 = 'FL-320',
  /** DV-100: Request for Domestic Violence Restraining Order */
  DV100 = 'DV-100',
  /** DV-105: Request for Child Custody and Visitation Orders */
  DV105 = 'DV-105',
  /** FL-150: Income and Expense Declaration */
  FL150 = 'FL-150',
  /** CLETS-001: Confidential CLETS Information */
  CLETS001 = 'CLETS-001',
  /** DV-109: Notice of Court Hearing (court-issued) */
  DV109 = 'DV-109',
  /** DV-110: Temporary Restraining Order (court-issued) */
  DV110 = 'DV-110',
  /** DV-140: Child Custody and Visitation Order (court-issued) */
  DV140 = 'DV-140',
}

/**
 * Form category for organization
 */
export enum FormCategory {
  /** Primary filing form (DV-100) */
  PRIMARY = 'primary',
  /** Required attachment forms (DV-105, FL-150) */
  ATTACHMENT = 'attachment',
  /** Supporting documents (exhibits, declarations) */
  SUPPORTING = 'supporting',
  /** Confidential forms (CLETS-001) */
  CONFIDENTIAL = 'confidential',
  /** Court-issued forms (DV-109, DV-110, DV-140) */
  COURT_ISSUED = 'court_issued',
  /** Response forms (FL-320) */
  RESPONSE = 'response',
}

// ==================== PACKET STRUCTURE ====================

/**
 * Individual form in the packet with metadata
 */
export interface PacketForm {
  /** Form identifier */
  formType: FormType;

  /** Form category */
  category: FormCategory;

  /** Display name */
  displayName: string;

  /** Form data (if available) */
  formData?: FormData | any;

  /** PDF blob or data URL */
  pdfData?: Blob | string;

  /** Page count */
  pageCount?: number;

  /** Starting page number in assembled packet */
  startPage?: number;

  /** Ending page number in assembled packet */
  endPage?: number;

  /** Whether form is required for this packet type */
  isRequired: boolean;

  /** Whether form is completed and valid */
  isComplete: boolean;

  /** Validation errors for this form */
  validationErrors?: ValidationError[];

  /** Completion percentage (0-100) */
  completionPercentage?: number;

  /** Last modified timestamp */
  lastModified?: Date;
}

/**
 * Packet metadata
 */
export interface PacketMetadata {
  /** Unique packet ID */
  packetId: string;

  /** Packet type */
  packetType: PacketType;

  /** Case number (if available) */
  caseNumber?: string;

  /** Petitioner name */
  petitioner?: string;

  /** Respondent name */
  respondent?: string;

  /** County */
  county?: string;

  /** Created timestamp */
  createdAt: Date;

  /** Last modified timestamp */
  lastModified: Date;

  /** User ID (for Supabase integration) */
  userId?: string;

  /** Packet version (for tracking changes) */
  version: number;

  /** Filing method */
  filingMethod?: FilingMethod;

  /** E-filing confirmation number (if e-filed) */
  eFilingConfirmation?: string;

  /** Filing date */
  filingDate?: Date;
}

/**
 * Complete TRO packet with all forms
 */
export interface TROPacket {
  /** Packet metadata */
  metadata: PacketMetadata;

  /** All forms in the packet */
  forms: PacketForm[];

  /** Assembly status */
  assemblyStatus: AssemblyStatus;

  /** Overall validation status */
  validationStatus: ValidationStatus;

  /** Total page count */
  totalPages: number;

  /** Overall completion percentage */
  completionPercentage: number;

  /** Assembled PDF blob (if assembled) */
  assembledPdf?: Blob;

  /** Assembly timestamp */
  assembledAt?: Date;
}

// ==================== PACKET TYPES ====================

/**
 * Type of TRO packet being assembled
 */
export enum PacketType {
  /** Initial request for DV restraining order */
  DV_INITIAL_REQUEST = 'dv_initial_request',

  /** Response to DV restraining order request */
  DV_RESPONSE = 'dv_response',

  /** Modification of existing orders */
  ORDER_MODIFICATION = 'order_modification',

  /** General family law packet */
  GENERAL_FAMILY_LAW = 'general_family_law',
}

/**
 * Filing method
 */
export enum FilingMethod {
  /** E-filing through court system */
  E_FILE = 'e_file',

  /** In-person filing at courthouse */
  IN_PERSON = 'in_person',

  /** Mail filing */
  MAIL = 'mail',

  /** Not yet determined */
  UNDECIDED = 'undecided',
}

// ==================== FORM ORDER ====================

/**
 * Defines the correct order of forms in assembled packet
 */
export interface FormOrder {
  /** Form type */
  formType: FormType;

  /** Position in packet (1-based) */
  position: number;

  /** Whether form is required */
  required: boolean;

  /** Conditions for inclusion */
  includedWhen?: FormInclusionCondition[];
}

/**
 * Condition for including a form in the packet
 */
export interface FormInclusionCondition {
  /** Field to check */
  field: string;

  /** Value that triggers inclusion */
  value: any;

  /** Operator for comparison */
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';

  /** Human-readable description */
  description: string;
}

/**
 * Standard form order for DV initial request packet
 */
export const DV_INITIAL_REQUEST_FORM_ORDER: FormOrder[] = [
  {
    formType: FormType.DV100,
    position: 1,
    required: true,
  },
  {
    formType: FormType.DV105,
    position: 2,
    required: false,
    includedWhen: [
      {
        field: 'requestChildCustody',
        value: true,
        operator: 'equals',
        description: 'Child custody or visitation requested in DV-100',
      },
    ],
  },
  {
    formType: FormType.FL150,
    position: 3,
    required: false,
    includedWhen: [
      {
        field: 'requestFinancialRelief',
        value: true,
        operator: 'equals',
        description: 'Financial relief (support, fees, etc.) requested in DV-100',
      },
    ],
  },
  {
    formType: FormType.CLETS001,
    position: 4,
    required: true,
  },
];

/**
 * Standard form order for DV response packet
 */
export const DV_RESPONSE_FORM_ORDER: FormOrder[] = [
  {
    formType: FormType.FL320,
    position: 1,
    required: true,
  },
  {
    formType: FormType.FL150,
    position: 2,
    required: false,
    includedWhen: [
      {
        field: 'requestFinancialRelief',
        value: true,
        operator: 'equals',
        description: 'Financial relief requested in FL-320',
      },
    ],
  },
];

// ==================== VALIDATION ====================

/**
 * Overall packet validation status
 */
export enum ValidationStatus {
  /** Packet is valid and ready to file */
  VALID = 'valid',

  /** Packet has warnings but can be filed */
  WARNING = 'warning',

  /** Packet has errors and cannot be filed */
  ERROR = 'error',

  /** Packet has not been validated yet */
  NOT_VALIDATED = 'not_validated',
}

/**
 * Validation error severity
 */
export enum ValidationSeverity {
  /** Critical error - prevents filing */
  ERROR = 'error',

  /** Warning - can file but should fix */
  WARNING = 'warning',

  /** Informational - best practice suggestion */
  INFO = 'info',
}

/**
 * Individual validation error
 */
export interface ValidationError {
  /** Error ID */
  id: string;

  /** Severity level */
  severity: ValidationSeverity;

  /** Form this error relates to */
  formType?: FormType;

  /** Field this error relates to */
  field?: string;

  /** Error message */
  message: string;

  /** Suggested fix */
  suggestion?: string;

  /** Rule that was violated */
  rule: ValidationRule;
}

/**
 * Validation rule types
 */
export enum ValidationRule {
  /** Required form missing */
  MISSING_REQUIRED_FORM = 'missing_required_form',

  /** Required field empty */
  REQUIRED_FIELD_EMPTY = 'required_field_empty',

  /** Invalid format */
  INVALID_FORMAT = 'invalid_format',

  /** Inconsistent data across forms */
  INCONSISTENT_DATA = 'inconsistent_data',

  /** Missing signature */
  MISSING_SIGNATURE = 'missing_signature',

  /** Invalid date */
  INVALID_DATE = 'invalid_date',

  /** Form dependency not met */
  DEPENDENCY_NOT_MET = 'dependency_not_met',

  /** Page size violation */
  PAGE_SIZE_VIOLATION = 'page_size_violation',

  /** Margin violation */
  MARGIN_VIOLATION = 'margin_violation',

  /** File size too large */
  FILE_SIZE_EXCEEDED = 'file_size_exceeded',

  /** PDF not text-searchable */
  NOT_TEXT_SEARCHABLE = 'not_text_searchable',
}

/**
 * Validation result for the entire packet
 */
export interface PacketValidationResult {
  /** Overall status */
  status: ValidationStatus;

  /** All errors found */
  errors: ValidationError[];

  /** Number of errors by severity */
  errorCount: {
    error: number;
    warning: number;
    info: number;
  };

  /** Whether packet can be filed */
  canFile: boolean;

  /** Validation timestamp */
  validatedAt: Date;

  /** Forms validated */
  formsValidated: FormType[];

  /** Summary message */
  summary: string;
}

// ==================== ASSEMBLY ====================

/**
 * Packet assembly status
 */
export enum AssemblyStatus {
  /** Not yet started */
  NOT_STARTED = 'not_started',

  /** Currently assembling */
  IN_PROGRESS = 'in_progress',

  /** Successfully assembled */
  COMPLETED = 'completed',

  /** Assembly failed */
  FAILED = 'failed',
}

/**
 * Assembly options
 */
export interface AssemblyOptions {
  /** Include page numbers */
  includePageNumbers?: boolean;

  /** Include table of contents */
  includeTableOfContents?: boolean;

  /** Include bookmarks */
  includeBookmarks?: boolean;

  /** Compress PDF */
  compress?: boolean;

  /** PDF/A compliance */
  pdfACompliance?: boolean;

  /** Add watermark (e.g., "DRAFT") */
  watermark?: string;

  /** Output format */
  outputFormat?: 'pdf' | 'pdf/a-1b' | 'pdf/a-2b';
}

/**
 * Assembly result
 */
export interface AssemblyResult {
  /** Assembly status */
  status: AssemblyStatus;

  /** Assembled PDF blob */
  pdf?: Blob;

  /** Total pages in assembled packet */
  totalPages: number;

  /** File size in bytes */
  fileSizeBytes: number;

  /** Assembly timestamp */
  assembledAt: Date;

  /** Assembly duration in milliseconds */
  durationMs: number;

  /** Errors encountered */
  errors?: string[];

  /** Warnings */
  warnings?: string[];
}

// ==================== E-FILING ====================

/**
 * E-filing format options
 */
export interface EFilingOptions {
  /** Include metadata */
  includeMetadata?: boolean;

  /** Generate separate CLETS-001 */
  separateCLETS?: boolean;

  /** Generate individual form PDFs */
  generateIndividualForms?: boolean;

  /** Include filing checklist */
  includeChecklist?: boolean;

  /** Court-specific requirements */
  courtRequirements?: CourtRequirements;
}

/**
 * Court-specific requirements
 */
export interface CourtRequirements {
  /** Court name */
  courtName: string;

  /** County */
  county: string;

  /** Required page size (inches) */
  pageSize: { width: number; height: number };

  /** Required margins (inches) */
  margins: { top: number; right: number; bottom: number; left: number };

  /** Maximum file size (bytes) */
  maxFileSizeBytes: number;

  /** Require text-searchable PDF */
  requireTextSearchable: boolean;

  /** Require bookmarks */
  requireBookmarks: boolean;
}

/**
 * Default LA Superior Court requirements
 */
export const LA_SUPERIOR_COURT_REQUIREMENTS: CourtRequirements = {
  courtName: 'Los Angeles Superior Court',
  county: 'Los Angeles',
  pageSize: { width: 8.5, height: 11 },
  margins: { top: 1.0, right: 0.5, bottom: 1.0, left: 1.0 },
  maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB
  requireTextSearchable: true,
  requireBookmarks: false, // Optional for self-represented litigants
};

/**
 * E-filing export result
 */
export interface EFilingExportResult {
  /** Main packet PDF */
  packetPdf: Blob;

  /** Separate CLETS-001 PDF (if requested) */
  cletsPdf?: Blob;

  /** Individual form PDFs (if requested) */
  individualForms?: Map<FormType, Blob>;

  /** Filing checklist PDF (if requested) */
  checklistPdf?: Blob;

  /** Export metadata */
  metadata: {
    exportedAt: Date;
    packetType: PacketType;
    caseNumber?: string;
    totalPages: number;
    fileSizeBytes: number;
    fileNames: string[];
  };
}

// ==================== PRINT SUPPORT ====================

/**
 * Print options for in-person filing
 */
export interface PrintOptions {
  /** Include filing checklist */
  includeChecklist?: boolean;

  /** Include court location and hours */
  includeCourtInfo?: boolean;

  /** Include required copies reminder */
  includeCopiesReminder?: boolean;

  /** Paper size */
  paperSize?: 'letter' | 'legal';

  /** Print orientation */
  orientation?: 'portrait' | 'landscape';

  /** Number of copies to print */
  copies?: number;
}

/**
 * Print result
 */
export interface PrintResult {
  /** Print-ready PDF */
  pdf: Blob;

  /** Instructions for printing */
  instructions: string[];

  /** Filing location info */
  filingLocation?: FilingLocation;
}

/**
 * Filing location information
 */
export interface FilingLocation {
  /** Court name */
  courtName: string;

  /** Address */
  address: string;

  /** City, State, ZIP */
  cityStateZip: string;

  /** Filing window/room */
  filingWindow: string;

  /** Hours */
  hours: string;

  /** Phone number */
  phone?: string;

  /** Special instructions */
  specialInstructions?: string[];
}

/**
 * Stanley Mosk Courthouse filing location
 */
export const STANLEY_MOSK_FILING_LOCATION: FilingLocation = {
  courtName: 'Stanley Mosk Courthouse',
  address: '111 N. Hill Street',
  cityStateZip: 'Los Angeles, CA 90012',
  filingWindow: 'Room 100 (Family Law Filing Window)',
  hours: 'Monday-Friday, 8:30 AM - 4:30 PM',
  phone: '(213) 830-0803',
  specialInstructions: [
    'Bring photo ID',
    'Bring 2 copies of all forms (1 for court, 1 for respondent)',
    'Forms must be signed in original ink (no digital signatures)',
    'Do NOT staple forms - use paper clips',
    'No filing fee for domestic violence restraining orders',
  ],
};

// ==================== HELPER TYPES ====================

/**
 * Form completion status
 */
export interface FormCompletionStatus {
  /** Form type */
  formType: FormType;

  /** Total fields */
  totalFields: number;

  /** Completed fields */
  completedFields: number;

  /** Completion percentage */
  percentage: number;

  /** Required fields missing */
  requiredFieldsMissing: string[];

  /** Is form complete */
  isComplete: boolean;
}

/**
 * Packet statistics
 */
export interface PacketStatistics {
  /** Total forms */
  totalForms: number;

  /** Completed forms */
  completedForms: number;

  /** Total pages */
  totalPages: number;

  /** Total file size */
  totalSizeBytes: number;

  /** Validation errors */
  errorCount: number;

  /** Validation warnings */
  warningCount: number;

  /** Overall completion percentage */
  completionPercentage: number;

  /** Estimated time to complete (minutes) */
  estimatedTimeToComplete?: number;
}

/**
 * Export format
 */
export enum ExportFormat {
  /** Single combined PDF */
  COMBINED_PDF = 'combined_pdf',

  /** Individual form PDFs */
  INDIVIDUAL_PDFS = 'individual_pdfs',

  /** Zip archive with all PDFs */
  ZIP_ARCHIVE = 'zip_archive',

  /** JSON data export */
  JSON = 'json',
}

/**
 * Export request
 */
export interface ExportRequest {
  /** Packet to export */
  packet: TROPacket;

  /** Export format */
  format: ExportFormat;

  /** E-filing options */
  eFilingOptions?: EFilingOptions;

  /** Print options */
  printOptions?: PrintOptions;

  /** Assembly options */
  assemblyOptions?: AssemblyOptions;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Export format */
  format: ExportFormat;

  /** Main output blob */
  mainOutput: Blob;

  /** Additional outputs */
  additionalOutputs?: Map<string, Blob>;

  /** Export metadata */
  metadata: {
    exportedAt: Date;
    format: ExportFormat;
    fileNames: string[];
    totalSizeBytes: number;
  };
}
