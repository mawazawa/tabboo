/**
 * TRO Workflow Engine - TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the multi-form
 * workflow engine that guides users through completing TRO packets.
 *
 * @version 1.0
 * @date November 17, 2025
 * @author Agent 2 - Workflow Engine
 */

// ============================================================================
// Workflow State Enums
// ============================================================================

/**
 * Workflow state machine states
 * Represents the current step in the TRO packet workflow
 */
export enum WorkflowState {
  NOT_STARTED = 'not_started',           // Initial state before user begins
  PACKET_TYPE_SELECTION = 'packet_type', // User choosing packet type
  DV100_IN_PROGRESS = 'dv100_progress',  // Filling DV-100 form
  DV100_COMPLETE = 'dv100_complete',     // DV-100 finished
  CLETS_IN_PROGRESS = 'clets_progress',  // Filling CLETS-001 form
  CLETS_COMPLETE = 'clets_complete',     // CLETS-001 finished
  DV105_IN_PROGRESS = 'dv105_progress',  // Filling DV-105 form (if children)
  DV105_COMPLETE = 'dv105_complete',     // DV-105 finished
  FL150_IN_PROGRESS = 'fl150_progress',  // Filling FL-150 form (if support)
  FL150_COMPLETE = 'fl150_complete',     // FL-150 finished
  DV101_IN_PROGRESS = 'dv101_progress',  // Filling DV-101 form (optional)
  DV101_COMPLETE = 'dv101_complete',     // DV-101 finished
  DV120_IN_PROGRESS = 'dv120_progress',  // Filling DV-120 form (response)
  DV120_COMPLETE = 'dv120_complete',     // DV-120 finished
  FL320_IN_PROGRESS = 'fl320_progress',  // Filling FL-320 form (response)
  FL320_COMPLETE = 'fl320_complete',     // FL-320 finished
  REVIEW_IN_PROGRESS = 'review_progress',// Reviewing complete packet
  READY_TO_FILE = 'ready_to_file',       // All forms complete, ready to export
  FILED = 'filed'                        // Packet exported/filed
}

/**
 * Individual form completion status
 */
export enum FormStatus {
  NOT_STARTED = 'not_started',    // Form not begun
  IN_PROGRESS = 'in_progress',    // Form partially filled
  COMPLETE = 'complete',          // All required fields filled
  VALIDATED = 'validated',        // Passed validation checks
  SKIPPED = 'skipped',           // Not required for this packet type
  ERROR = 'error'                // Validation errors present
}

/**
 * TRO packet types
 */
export enum PacketType {
  INITIATING_WITHOUT_CHILDREN = 'initiating_no_children',  // TRO without child custody
  INITIATING_WITH_CHILDREN = 'initiating_with_children',   // TRO with child custody
  RESPONSE = 'response',                                    // Response to TRO
  MODIFICATION = 'modification'                             // Modify existing order
}

/**
 * Form types (California Judicial Council forms)
 */
export enum FormType {
  DV100 = 'DV-100',      // Request for Domestic Violence Restraining Order
  DV101 = 'DV-101',      // Description of Abuse
  DV105 = 'DV-105',      // Request for Child Custody and Visitation Orders
  DV109 = 'DV-109',      // Notice of Hearing
  DV110 = 'DV-110',      // Temporary Restraining Order
  DV120 = 'DV-120',      // Response to Request for DV Restraining Order
  CLETS001 = 'CLETS-001', // Confidential CLETS Information
  FL150 = 'FL-150',      // Income and Expense Declaration
  FL320 = 'FL-320'       // Responsive Declaration to Request for Order
}

/**
 * Workflow error codes
 */
export enum WorkflowErrorCode {
  INVALID_TRANSITION = 'invalid_transition',     // Cannot transition to this state
  MISSING_DEPENDENCY = 'missing_dependency',     // Required form not complete
  VALIDATION_FAILED = 'validation_failed',       // Form validation failed
  DATA_CONFLICT = 'data_conflict',               // Conflicting data between forms
  SAVE_FAILED = 'save_failed',                   // Failed to save to database
  LOAD_FAILED = 'load_failed',                   // Failed to load from database
  AUTOFILL_FAILED = 'autofill_failed',          // Failed to autofill data
  PERMISSION_DENIED = 'permission_denied'        // User not authorized
}

// ============================================================================
// Core Workflow Interfaces
// ============================================================================

/**
 * Packet configuration
 * Determines which forms are required based on user's situation
 */
export interface PacketConfig {
  hasChildren: boolean;              // Children involved (requires DV-105)
  requestingChildSupport: boolean;   // Child support requested (requires FL-150)
  requestingSpousalSupport: boolean; // Spousal support requested (requires FL-150)
  needMoreSpace: boolean;            // Need DV-101 for more description space
  hasExistingCaseNumber: boolean;    // Case already filed

  // Additional configuration
  numberOfChildren?: number;         // Number of children
  numberOfProtectedPersons?: number; // Number of people seeking protection
  numberOfRestrainedPersons?: number; // Number of people to be restrained
}

/**
 * Form status tracking
 * Maps form types to their current status
 */
export interface FormStatuses {
  [FormType.DV100]?: FormStatus;
  [FormType.DV101]?: FormStatus;
  [FormType.DV105]?: FormStatus;
  [FormType.DV109]?: FormStatus;
  [FormType.DV110]?: FormStatus;
  [FormType.DV120]?: FormStatus;
  [FormType.CLETS001]?: FormStatus;
  [FormType.FL150]?: FormStatus;
  [FormType.FL320]?: FormStatus;
}

/**
 * Form data references
 * Links workflow to actual form data in legal_documents table
 */
export interface FormDataRefs {
  [FormType.DV100]?: string;      // UUID of DV-100 document
  [FormType.DV101]?: string;      // UUID of DV-101 document
  [FormType.DV105]?: string;      // UUID of DV-105 document
  [FormType.DV109]?: string;      // UUID of DV-109 document
  [FormType.DV110]?: string;      // UUID of DV-110 document
  [FormType.DV120]?: string;      // UUID of DV-120 document
  [FormType.CLETS001]?: string;   // UUID of CLETS-001 document
  [FormType.FL150]?: string;      // UUID of FL-150 document
  [FormType.FL320]?: string;      // UUID of FL-320 document
}

/**
 * Main TRO workflow interface
 * Represents the complete state of a user's TRO packet workflow
 */
export interface TROWorkflow {
  id: string;                      // Workflow UUID
  userId: string;                  // User UUID
  packetType: PacketType;          // Type of packet
  currentState: WorkflowState;     // Current workflow state
  formStatuses: FormStatuses;      // Status of each form
  packetConfig: PacketConfig;      // Packet configuration
  formDataRefs: FormDataRefs;      // References to form data
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp

  // Metadata
  metadata?: {
    lastEditedForm?: FormType;     // Last form user was working on
    estimatedTimeRemaining?: number; // Minutes
    completionPercentage?: number;  // 0-100
    validationErrors?: string[];    // Current validation errors
  };
}

/**
 * Workflow transition
 * Represents a state transition in the workflow
 */
export interface WorkflowTransition {
  fromState: WorkflowState;
  toState: WorkflowState;
  timestamp: string;
  triggeredBy: 'user' | 'system';
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Validation Interfaces
// ============================================================================

/**
 * Validation result
 * Result of validating a form or packet
 */
export interface ValidationResult {
  valid: boolean;                  // Overall validation status
  errors: ValidationError[];       // List of validation errors
  warnings: ValidationWarning[];   // List of warnings (non-blocking)
}

/**
 * Validation error
 */
export interface ValidationError {
  field?: string;                  // Field that failed validation
  formType?: FormType;             // Form containing the error
  message: string;                 // Error message
  code: string;                    // Error code for programmatic handling
  severity: 'error' | 'critical';  // Severity level
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field?: string;                  // Field with warning
  formType?: FormType;             // Form containing the warning
  message: string;                 // Warning message
  suggestion?: string;             // Suggested fix
}

/**
 * Form dependency
 * Represents a dependency between forms
 */
export interface FormDependency {
  dependentForm: FormType;         // Form that depends on another
  requiredForm: FormType;          // Form that must be complete first
  condition?: (workflow: TROWorkflow) => boolean; // Optional condition
  reason: string;                  // Why this dependency exists
}

// ============================================================================
// Data Mapping Interfaces
// ============================================================================

/**
 * Field mapping
 * Maps a field from one form to another
 */
export interface FieldMapping {
  sourceForm: FormType;
  sourceField: string;
  targetForm: FormType;
  targetField: string;
  transform?: (value: unknown) => unknown; // Optional transformation function
}

/**
 * Form data collection
 * Collection of all form data in a packet
 */
export interface FormCollection {
  dv100?: Record<string, unknown>;
  dv101?: Record<string, unknown>;
  dv105?: Record<string, unknown>;
  dv120?: Record<string, unknown>;
  clets?: Record<string, unknown>;
  fl150?: Record<string, unknown>;
  fl320?: Record<string, unknown>;
}

/**
 * Autofill result
 * Result of autofilling a form from previous forms
 */
export interface AutofillResult {
  fieldsAutofilled: number;        // Number of fields autofilled
  fields: Record<string, unknown>; // Autofilled field data
  source: 'previous_form' | 'vault' | 'both'; // Source of data
}

// ============================================================================
// UI Component Interfaces
// ============================================================================

/**
 * Workflow wizard props
 */
export interface TROWorkflowWizardProps {
  userId: string;
  onComplete?: () => void;
  onError?: (error: WorkflowError) => void;
  initialPacketType?: PacketType;
  existingWorkflowId?: string;
}

/**
 * Packet progress panel props
 */
export interface PacketProgressPanelProps {
  workflow: TROWorkflow;
  onFormSelect?: (formType: FormType) => void;
  compact?: boolean;
  showEstimatedTime?: boolean;
}

/**
 * Form step
 * Represents a step in the workflow wizard
 */
export interface FormStep {
  formType: FormType;
  title: string;
  description: string;
  required: boolean;
  status: FormStatus;
  estimatedMinutes: number;
  dependencies: FormType[];        // Forms that must be complete first
}

// ============================================================================
// Workflow Hook Interface
// ============================================================================

/**
 * useTROWorkflow hook return type
 * Complete API for workflow management
 */
export interface UseTROWorkflowReturn {
  // State
  workflow: TROWorkflow | null;
  loading: boolean;
  error: WorkflowError | null;

  // Workflow actions
  startWorkflow: (packetType: PacketType, config: PacketConfig) => Promise<void>;
  loadWorkflow: (workflowId: string) => Promise<void>;
  updateFormStatus: (formType: FormType, status: FormStatus) => Promise<void>;
  updatePacketConfig: (config: Partial<PacketConfig>) => Promise<void>;

  // State transitions
  transitionToNextForm: () => Promise<void>;
  transitionToPreviousForm: () => Promise<void>;
  jumpToForm: (formType: FormType) => Promise<void>;
  completeWorkflow: () => Promise<void>;
  resetWorkflow: () => Promise<void>;

  // Validation
  validateCurrentForm: () => Promise<ValidationResult>;
  validateForm: (formType: FormType) => Promise<ValidationResult>;
  validatePacket: () => Promise<ValidationResult>;
  canTransitionToNextForm: () => boolean;
  canTransitionToPreviousForm: () => boolean;

  // Data operations
  autofillFormFromPrevious: (targetForm: FormType) => Promise<AutofillResult>;
  autofillFormFromVault: (targetForm: FormType) => Promise<AutofillResult>;
  getFormData: (formType: FormType) => Promise<Record<string, unknown> | null>;
  saveFormData: (formType: FormType, data: Record<string, unknown>) => Promise<void>;

  // Utility
  getCurrentForm: () => FormType | null;
  getNextForm: () => FormType | null;
  getPreviousForm: () => FormType | null;
  getRequiredForms: () => FormType[];
  getOptionalForms: () => FormType[];
  getFormCompletionPercentage: (formType: FormType) => number;
  getPacketCompletionPercentage: () => number;
  getEstimatedTimeRemaining: () => number; // minutes
  getFormSteps: () => FormStep[];

  // Dependency checking
  getDependencies: (formType: FormType) => FormType[];
  areDependenciesMet: (formType: FormType) => boolean;
  getUnmetDependencies: (formType: FormType) => FormType[];
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Workflow error class
 * Custom error class for workflow-specific errors
 */
export class WorkflowError extends Error {
  constructor(
    message: string,
    public code: WorkflowErrorCode,
    public recoverable: boolean = true,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WorkflowError';

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WorkflowError);
    }
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Workflow state transition map
 * Defines valid transitions between states
 */
export type StateTransitionMap = {
  [key in WorkflowState]?: WorkflowState[];
};

/**
 * Form requirement map
 * Maps packet types to required forms
 */
export type FormRequirementMap = {
  [key in PacketType]: {
    required: FormType[];
    optional: FormType[];
  };
};

/**
 * Form order map
 * Defines the order in which forms should be completed
 */
export type FormOrderMap = {
  [key in PacketType]: FormType[];
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Valid state transitions
 * Defines which states can transition to which other states
 */
export const STATE_TRANSITIONS: StateTransitionMap = {
  [WorkflowState.NOT_STARTED]: [WorkflowState.PACKET_TYPE_SELECTION],
  [WorkflowState.PACKET_TYPE_SELECTION]: [WorkflowState.DV100_IN_PROGRESS, WorkflowState.DV120_IN_PROGRESS],
  [WorkflowState.DV100_IN_PROGRESS]: [WorkflowState.DV100_COMPLETE, WorkflowState.PACKET_TYPE_SELECTION],
  [WorkflowState.DV100_COMPLETE]: [WorkflowState.CLETS_IN_PROGRESS, WorkflowState.DV100_IN_PROGRESS],
  [WorkflowState.CLETS_IN_PROGRESS]: [WorkflowState.CLETS_COMPLETE, WorkflowState.DV100_COMPLETE],
  [WorkflowState.CLETS_COMPLETE]: [
    WorkflowState.DV105_IN_PROGRESS,
    WorkflowState.FL150_IN_PROGRESS,
    WorkflowState.DV101_IN_PROGRESS,
    WorkflowState.REVIEW_IN_PROGRESS,
    WorkflowState.CLETS_IN_PROGRESS
  ],
  [WorkflowState.DV105_IN_PROGRESS]: [WorkflowState.DV105_COMPLETE, WorkflowState.CLETS_COMPLETE],
  [WorkflowState.DV105_COMPLETE]: [
    WorkflowState.FL150_IN_PROGRESS,
    WorkflowState.DV101_IN_PROGRESS,
    WorkflowState.REVIEW_IN_PROGRESS,
    WorkflowState.DV105_IN_PROGRESS
  ],
  [WorkflowState.FL150_IN_PROGRESS]: [WorkflowState.FL150_COMPLETE, WorkflowState.DV105_COMPLETE, WorkflowState.CLETS_COMPLETE],
  [WorkflowState.FL150_COMPLETE]: [
    WorkflowState.DV101_IN_PROGRESS,
    WorkflowState.REVIEW_IN_PROGRESS,
    WorkflowState.FL150_IN_PROGRESS
  ],
  [WorkflowState.DV101_IN_PROGRESS]: [WorkflowState.DV101_COMPLETE, WorkflowState.FL150_COMPLETE, WorkflowState.DV105_COMPLETE],
  [WorkflowState.DV101_COMPLETE]: [WorkflowState.REVIEW_IN_PROGRESS, WorkflowState.DV101_IN_PROGRESS],
  [WorkflowState.DV120_IN_PROGRESS]: [WorkflowState.DV120_COMPLETE, WorkflowState.PACKET_TYPE_SELECTION],
  [WorkflowState.DV120_COMPLETE]: [WorkflowState.FL320_IN_PROGRESS, WorkflowState.FL150_IN_PROGRESS, WorkflowState.REVIEW_IN_PROGRESS],
  [WorkflowState.FL320_IN_PROGRESS]: [WorkflowState.FL320_COMPLETE, WorkflowState.DV120_COMPLETE],
  [WorkflowState.FL320_COMPLETE]: [WorkflowState.REVIEW_IN_PROGRESS, WorkflowState.FL320_IN_PROGRESS],
  [WorkflowState.REVIEW_IN_PROGRESS]: [WorkflowState.READY_TO_FILE, WorkflowState.DV100_IN_PROGRESS, WorkflowState.DV120_IN_PROGRESS],
  [WorkflowState.READY_TO_FILE]: [WorkflowState.FILED, WorkflowState.REVIEW_IN_PROGRESS],
  [WorkflowState.FILED]: []
};

/**
 * Form requirements by packet type
 */
export const FORM_REQUIREMENTS: FormRequirementMap = {
  [PacketType.INITIATING_WITHOUT_CHILDREN]: {
    required: [FormType.DV100, FormType.CLETS001],
    optional: [FormType.FL150, FormType.DV101]
  },
  [PacketType.INITIATING_WITH_CHILDREN]: {
    required: [FormType.DV100, FormType.CLETS001, FormType.DV105],
    optional: [FormType.FL150, FormType.DV101]
  },
  [PacketType.RESPONSE]: {
    required: [FormType.DV120],
    optional: [FormType.FL150, FormType.FL320]
  },
  [PacketType.MODIFICATION]: {
    required: [FormType.FL320],
    optional: [FormType.FL150]
  }
};

/**
 * Form completion order by packet type
 */
export const FORM_ORDER: FormOrderMap = {
  [PacketType.INITIATING_WITHOUT_CHILDREN]: [
    FormType.DV100,
    FormType.CLETS001,
    FormType.FL150,
    FormType.DV101
  ],
  [PacketType.INITIATING_WITH_CHILDREN]: [
    FormType.DV100,
    FormType.CLETS001,
    FormType.DV105,
    FormType.FL150,
    FormType.DV101
  ],
  [PacketType.RESPONSE]: [
    FormType.DV120,
    FormType.FL150,
    FormType.FL320
  ],
  [PacketType.MODIFICATION]: [
    FormType.FL320,
    FormType.FL150
  ]
};

/**
 * Estimated time to complete each form (in minutes)
 */
export const FORM_ESTIMATED_TIME: Record<FormType, number> = {
  [FormType.DV100]: 30,
  [FormType.DV101]: 15,
  [FormType.DV105]: 20,
  [FormType.DV109]: 5,  // Generated by court
  [FormType.DV110]: 5,  // Generated by court
  [FormType.DV120]: 25,
  [FormType.CLETS001]: 10,
  [FormType.FL150]: 45,
  [FormType.FL320]: 30
};

/**
 * Form dependencies
 * Forms that must be completed before starting another form
 */
export const FORM_DEPENDENCIES: FormDependency[] = [
  {
    dependentForm: FormType.CLETS001,
    requiredForm: FormType.DV100,
    reason: 'CLETS-001 requires information from DV-100'
  },
  {
    dependentForm: FormType.DV105,
    requiredForm: FormType.DV100,
    reason: 'DV-105 requires case and party information from DV-100'
  },
  {
    dependentForm: FormType.FL150,
    requiredForm: FormType.DV100,
    condition: (workflow) => workflow.packetConfig.requestingChildSupport || workflow.packetConfig.requestingSpousalSupport,
    reason: 'FL-150 required when requesting support in DV-100'
  },
  {
    dependentForm: FormType.DV101,
    requiredForm: FormType.DV100,
    reason: 'DV-101 is an attachment to DV-100'
  },
  {
    dependentForm: FormType.FL320,
    requiredForm: FormType.DV120,
    reason: 'FL-320 is typically filed with DV-120 response'
  }
];

// Export all types
export type {
  StateTransitionMap,
  FormRequirementMap,
  FormOrderMap
};
