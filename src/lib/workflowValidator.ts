/**
 * Workflow Validator
 *
 * Validates TRO packet forms and workflows for completeness, correctness,
 * and consistency. Ensures all required fields are filled and data is
 * consistent across multiple forms.
 *
 * @version 1.0
 * @date November 17, 2025
 * @author Agent 2 - Workflow Engine
 */

import {
  FormType,
  type TROWorkflow,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  FormStatus,
  FORM_REQUIREMENTS,
  FORM_DEPENDENCIES
} from '@/types/WorkflowTypes';
import { findInconsistencies } from '@/lib/formDataMapper';

// ============================================================================
// Validation Rule Definitions
// ============================================================================

/**
 * Required fields for each form type
 * These fields MUST be filled for the form to be considered complete
 */
const REQUIRED_FIELDS: Record<FormType, string[]> = {
  [FormType.DV100]: [
    'protectedPersonName',
    'restrainedPersonName',
    'relationship',
    'abuseDescription',
    'ordersRequested',
    'signatureDate',
    'signature'
  ],
  [FormType.CLETS001]: [
    'protectedPersonName',
    'protectedPersonAddress',
    'protectedPersonCity',
    'protectedPersonState',
    'protectedPersonZip',
    'protectedPersonDOB',
    'protectedPersonGender',
    'protectedPersonRace',
    'restrainedPersonName',
    'restrainedPersonDOB',
    'restrainedPersonGender',
    'lawEnforcementAgency'
  ],
  [FormType.DV105]: [
    'petitionerName',
    'respondentName',
    'caseNumber',
    'children',
    'custodyOrders',
    'visitationOrders'
  ],
  [FormType.FL150]: [
    'partyName',
    'caseNumber',
    'averageMonthlyIncome',
    'averageMonthlyExpenses',
    'signatureDate',
    'signature'
  ],
  [FormType.DV120]: [
    'respondentName',
    'petitionerName',
    'caseNumber',
    'agreeOrDisagree',
    'signatureDate',
    'signature'
  ],
  [FormType.FL320]: [
    'partyName',
    'caseNumber',
    'petitioner',
    'respondent',
    'signatureDate',
    'signature'
  ],
  [FormType.DV101]: [
    'incidentDate',
    'incidentDescription'
  ],
  [FormType.DV109]: [], // Court-generated
  [FormType.DV110]: []  // Court-generated
};

/**
 * Conditional required fields
 * Fields that are required only under certain conditions
 */
interface ConditionalRequirement {
  field: string;
  condition: (data: Record<string, unknown>) => boolean;
  message: string;
}

const CONDITIONAL_REQUIREMENTS: Record<FormType, ConditionalRequirement[]> = {
  [FormType.DV100]: [
    {
      field: 'childNames',
      condition: (data) => data.hasChildren === true,
      message: 'Child names are required when children are involved'
    },
    {
      field: 'childSupportAmount',
      condition: (data) => data.requestingChildSupport === true,
      message: 'Child support amount is required when requesting child support'
    },
    {
      field: 'spousalSupportAmount',
      condition: (data) => data.requestingSpousalSupport === true,
      message: 'Spousal support amount is required when requesting spousal support'
    }
  ],
  [FormType.DV105]: [
    {
      field: 'currentCustodyArrangement',
      condition: (data) => !!data.children && Array.isArray(data.children) && data.children.length > 0,
      message: 'Current custody arrangement must be described'
    }
  ],
  [FormType.FL150]: [
    {
      field: 'employerName',
      condition: (data) => (data.employmentStatus === 'employed'),
      message: 'Employer name is required if employed'
    },
    {
      field: 'childCareExpenses',
      condition: (data) => !!data.hasChildren,
      message: 'Child care expenses must be listed if you have children'
    }
  ],
  [FormType.CLETS001]: [],
  [FormType.DV120]: [],
  [FormType.FL320]: [],
  [FormType.DV101]: [],
  [FormType.DV109]: [],
  [FormType.DV110]: []
};

// ============================================================================
// Field Validation Functions
// ============================================================================

/**
 * Validate that a field has a value (not empty, null, or undefined)
 */
function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return false;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (US)
 */
function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Should be 10 digits for US phone
  return digitsOnly.length === 10;
}

/**
 * Validate ZIP code format (US)
 */
function isValidZipCode(zip: string): boolean {
  // Accept both 5-digit and 9-digit formats
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Validate date format and reasonableness
 */
function isValidDate(date: string): boolean {
  if (!date) return false;

  // Try to parse the date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return false;

  // Date should not be in the distant past (before 1900)
  // or in the distant future (more than 1 year from now)
  const minDate = new Date('1900-01-01');
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return parsed >= minDate && parsed <= maxDate;
}

/**
 * Validate case number format
 * California case numbers typically follow specific patterns
 */
function isValidCaseNumber(caseNumber: string): boolean {
  if (!caseNumber) return false;

  // Remove spaces and dashes
  const cleaned = caseNumber.replace(/[\s-]/g, '');

  // Should be alphanumeric and at least 6 characters
  return /^[A-Z0-9]{6,}$/i.test(cleaned);
}

// ============================================================================
// Form Validation Functions
// ============================================================================

/**
 * Validate DV-100 form data
 */
function validateDV100(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.DV100];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.DV100,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  // Check conditional requirements
  const conditionals = CONDITIONAL_REQUIREMENTS[FormType.DV100];
  for (const { field, condition, message } of conditionals) {
    if (condition(data) && !hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.DV100,
        message,
        code: 'CONDITIONAL_REQUIREMENT_NOT_MET',
        severity: 'error'
      });
    }
  }

  // Validate at least one type of abuse is described
  const abuseTypes = [
    'physicalAbuse',
    'sexualAbuse',
    'emotionalAbuse',
    'financialAbuse',
    'stalking',
    'harassment'
  ];
  const hasAbuseType = abuseTypes.some(type => data[type] === true);
  if (!hasAbuseType) {
    errors.push({
      formType: FormType.DV100,
      message: 'At least one type of abuse must be indicated',
      code: 'NO_ABUSE_TYPE_SELECTED',
      severity: 'critical'
    });
  }

  // Validate at least one order is requested
  const orderTypes = [
    'personalConductOrders',
    'stayAwayOrders',
    'moveOutOrders',
    'childCustodyOrders',
    'childSupportOrders',
    'spousalSupportOrders',
    'propertyOrders'
  ];
  const hasOrderRequested = orderTypes.some(type => data[type] === true);
  if (!hasOrderRequested) {
    errors.push({
      formType: FormType.DV100,
      message: 'At least one order must be requested',
      code: 'NO_ORDERS_REQUESTED',
      severity: 'critical'
    });
  }

  // Warning if abuse description is very short
  if (typeof data.abuseDescription === 'string' && data.abuseDescription.length < 50) {
    warnings.push({
      field: 'abuseDescription',
      formType: FormType.DV100,
      message: 'Abuse description is very brief. More details may strengthen your case.',
      suggestion: 'Consider adding more specific details about dates, locations, and incidents'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate CLETS-001 form data
 */
function validateCLETS001(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.CLETS001];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.CLETS001,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  // Validate ZIP code format
  if (data.protectedPersonZip && !isValidZipCode(data.protectedPersonZip as string)) {
    errors.push({
      field: 'protectedPersonZip',
      formType: FormType.CLETS001,
      message: 'Invalid ZIP code format',
      code: 'INVALID_ZIP_CODE',
      severity: 'error'
    });
  }

  // Validate dates
  if (data.protectedPersonDOB && !isValidDate(data.protectedPersonDOB as string)) {
    errors.push({
      field: 'protectedPersonDOB',
      formType: FormType.CLETS001,
      message: 'Invalid date of birth',
      code: 'INVALID_DATE',
      severity: 'error'
    });
  }

  // Warning if physical description fields are missing
  const descriptionFields = ['height', 'weight', 'hairColor', 'eyeColor'];
  const missingDescriptions = descriptionFields.filter(field => !hasValue(data[field]));
  if (missingDescriptions.length > 0) {
    warnings.push({
      formType: FormType.CLETS001,
      message: 'Physical description is incomplete. This information helps law enforcement.',
      suggestion: `Add: ${missingDescriptions.join(', ')}`
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate DV-105 form data
 */
function validateDV105(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.DV105];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.DV105,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  // Validate children array
  if (data.children && Array.isArray(data.children)) {
    const children = data.children as Array<Record<string, unknown>>;

    if (children.length === 0) {
      errors.push({
        field: 'children',
        formType: FormType.DV105,
        message: 'At least one child must be listed',
        code: 'NO_CHILDREN_LISTED',
        severity: 'critical'
      });
    }

    // Validate each child has required info
    children.forEach((child, index) => {
      if (!child.name) {
        errors.push({
          field: `children[${index}].name`,
          formType: FormType.DV105,
          message: `Child ${index + 1} name is required`,
          code: 'CHILD_INFO_INCOMPLETE',
          severity: 'error'
        });
      }
      if (!child.birthdate) {
        errors.push({
          field: `children[${index}].birthdate`,
          formType: FormType.DV105,
          message: `Child ${index + 1} birthdate is required`,
          code: 'CHILD_INFO_INCOMPLETE',
          severity: 'error'
        });
      }
    });
  }

  // Validate case number format
  if (data.caseNumber && !isValidCaseNumber(data.caseNumber as string)) {
    warnings.push({
      field: 'caseNumber',
      formType: FormType.DV105,
      message: 'Case number format may be invalid',
      suggestion: 'Verify case number matches court records'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate FL-150 form data
 */
function validateFL150(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.FL150];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.FL150,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  // Validate income and expenses are numbers
  if (data.averageMonthlyIncome && typeof data.averageMonthlyIncome !== 'number') {
    errors.push({
      field: 'averageMonthlyIncome',
      formType: FormType.FL150,
      message: 'Income must be a valid number',
      code: 'INVALID_NUMBER',
      severity: 'error'
    });
  }

  if (data.averageMonthlyExpenses && typeof data.averageMonthlyExpenses !== 'number') {
    errors.push({
      field: 'averageMonthlyExpenses',
      formType: FormType.FL150,
      message: 'Expenses must be a valid number',
      code: 'INVALID_NUMBER',
      severity: 'error'
    });
  }

  // Warning if expenses exceed income significantly
  if (
    typeof data.averageMonthlyIncome === 'number' &&
    typeof data.averageMonthlyExpenses === 'number' &&
    data.averageMonthlyExpenses > data.averageMonthlyIncome * 1.2
  ) {
    warnings.push({
      formType: FormType.FL150,
      message: 'Expenses exceed income by more than 20%',
      suggestion: 'Review expense calculations for accuracy'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate DV-120 form data
 */
function validateDV120(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.DV120];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.DV120,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  // Validate that response indicates agreement or disagreement
  if (!data.agreeOrDisagree) {
    errors.push({
      field: 'agreeOrDisagree',
      formType: FormType.DV120,
      message: 'You must indicate whether you agree or disagree with the request',
      code: 'NO_RESPONSE_INDICATED',
      severity: 'critical'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate FL-320 form data
 */
function validateFL320(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.FL320];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.FL320,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate DV-101 form data
 */
function validateDV101(data: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  const requiredFields = REQUIRED_FIELDS[FormType.DV101];
  for (const field of requiredFields) {
    if (!hasValue(data[field])) {
      errors.push({
        field,
        formType: FormType.DV101,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// Main Validation Functions
// ============================================================================

/**
 * Validate form data based on form type
 *
 * @param formType - Type of form to validate
 * @param data - Form data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateFormData(
  formType: FormType,
  data: Record<string, unknown>
): ValidationResult {
  switch (formType) {
    case FormType.DV100:
      return validateDV100(data);
    case FormType.CLETS001:
      return validateCLETS001(data);
    case FormType.DV105:
      return validateDV105(data);
    case FormType.FL150:
      return validateFL150(data);
    case FormType.DV120:
      return validateDV120(data);
    case FormType.FL320:
      return validateFL320(data);
    case FormType.DV101:
      return validateDV101(data);
    case FormType.DV109:
    case FormType.DV110:
      // Court-generated forms don't need validation
      return { valid: true, errors: [], warnings: [] };
    default:
      return {
        valid: false,
        errors: [
          {
            formType,
            message: `Unknown form type: ${formType}`,
            code: 'UNKNOWN_FORM_TYPE',
            severity: 'critical'
          }
        ],
        warnings: []
      };
  }
}

/**
 * Validate entire packet for completeness and consistency
 *
 * @param workflow - TRO workflow to validate
 * @param formData - Collection of all form data
 * @returns ValidationResult with errors and warnings
 */
export function validatePacketData(
  workflow: TROWorkflow,
  formData: Record<string, Record<string, unknown>>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Validate all required forms are present and complete
  const requiredForms = FORM_REQUIREMENTS[workflow.packetType].required;
  for (const formType of requiredForms) {
    const status = workflow.formStatuses[formType];

    if (status === FormStatus.NOT_STARTED || status === FormStatus.IN_PROGRESS) {
      errors.push({
        formType,
        message: `${formType} must be completed before filing`,
        code: 'INCOMPLETE_FORM',
        severity: 'critical'
      });
      continue;
    }

    // Validate the form data
    if (formData[formType]) {
      const validation = validateFormData(formType, formData[formType]);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    } else {
      errors.push({
        formType,
        message: `${formType} data not found`,
        code: 'FORM_DATA_MISSING',
        severity: 'critical'
      });
    }
  }

  // 2. Validate form dependencies are met
  for (const dependency of FORM_DEPENDENCIES) {
    const dependentStatus = workflow.formStatuses[dependency.dependentForm];
    const requiredStatus = workflow.formStatuses[dependency.requiredForm];

    // If dependent form is complete but required form is not
    if (
      (dependentStatus === FormStatus.COMPLETE || dependentStatus === FormStatus.VALIDATED) &&
      (requiredStatus !== FormStatus.COMPLETE && requiredStatus !== FormStatus.VALIDATED)
    ) {
      errors.push({
        formType: dependency.dependentForm,
        message: dependency.reason,
        code: 'DEPENDENCY_NOT_MET',
        severity: 'critical'
      });
    }

    // Check conditional dependencies
    if (dependency.condition && dependency.condition(workflow)) {
      if (requiredStatus !== FormStatus.COMPLETE && requiredStatus !== FormStatus.VALIDATED) {
        errors.push({
          formType: dependency.dependentForm,
          message: dependency.reason,
          code: 'CONDITIONAL_DEPENDENCY_NOT_MET',
          severity: 'critical'
        });
      }
    }
  }

  // 3. Validate data consistency across forms
  const inconsistencies = findInconsistencies(formData);
  for (const inconsistency of inconsistencies) {
    warnings.push({
      message: inconsistency,
      suggestion: 'Review and correct conflicting information across forms'
    });
  }

  // 4. Validate packet configuration matches form statuses
  if (workflow.packetConfig.hasChildren) {
    const dv105Status = workflow.formStatuses[FormType.DV105];
    if (dv105Status !== FormStatus.COMPLETE && dv105Status !== FormStatus.VALIDATED) {
      errors.push({
        formType: FormType.DV105,
        message: 'DV-105 must be completed when children are involved',
        code: 'MISSING_REQUIRED_FORM',
        severity: 'critical'
      });
    }
  }

  if (workflow.packetConfig.requestingChildSupport || workflow.packetConfig.requestingSpousalSupport) {
    const fl150Status = workflow.formStatuses[FormType.FL150];
    if (fl150Status !== FormStatus.COMPLETE && fl150Status !== FormStatus.VALIDATED) {
      errors.push({
        formType: FormType.FL150,
        message: 'FL-150 must be completed when requesting support',
        code: 'MISSING_REQUIRED_FORM',
        severity: 'critical'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Quick validation check - returns true if form appears complete
 * (Doesn't do deep validation, just checks required fields exist)
 *
 * @param formType - Type of form
 * @param data - Form data
 * @returns boolean indicating if form appears complete
 */
export function isFormComplete(
  formType: FormType,
  data: Record<string, unknown>
): boolean {
  const requiredFields = REQUIRED_FIELDS[formType];
  if (!requiredFields) return true;

  return requiredFields.every(field => hasValue(data[field]));
}

/**
 * Get completion percentage for a form (0-100)
 *
 * @param formType - Type of form
 * @param data - Form data
 * @returns Completion percentage
 */
export function getFormCompletionPercentage(
  formType: FormType,
  data: Record<string, unknown>
): number {
  const requiredFields = REQUIRED_FIELDS[formType];
  if (!requiredFields || requiredFields.length === 0) return 100;

  const completedFields = requiredFields.filter(field => hasValue(data[field]));
  return Math.round((completedFields.length / requiredFields.length) * 100);
}

// Export all functions
export default {
  validateFormData,
  validatePacketData,
  isFormComplete,
  getFormCompletionPercentage,
  isValidEmail,
  isValidPhone,
  isValidZipCode,
  isValidDate,
  isValidCaseNumber
};
