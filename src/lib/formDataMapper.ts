/**
 * Form Data Mapper
 *
 * Handles data mapping and autofilling between TRO packet forms.
 * Maps common fields from one form to another to reduce redundant data entry.
 *
 * @version 1.0
 * @date November 17, 2025
 * @author Agent 2 - Workflow Engine
 */

import { FormType, type AutofillResult } from '@/types/WorkflowTypes';

// ============================================================================
// Field Mapping Definitions
// ============================================================================

/**
 * Common field names used across multiple forms
 */
export const CommonFields = {
  // Party information
  PETITIONER_NAME: 'petitionerName',
  RESPONDENT_NAME: 'respondentName',
  PROTECTED_PERSON_NAME: 'protectedPersonName',
  RESTRAINED_PERSON_NAME: 'restrainedPersonName',
  PARTY_NAME: 'partyName',

  // Address fields
  STREET_ADDRESS: 'streetAddress',
  CITY: 'city',
  STATE: 'state',
  ZIP_CODE: 'zipCode',
  MAILING_ADDRESS: 'mailingAddress',

  // Contact information
  TELEPHONE: 'telephoneNo',
  FAX: 'faxNo',
  EMAIL: 'email',

  // Case information
  CASE_NUMBER: 'caseNumber',
  COUNTY: 'county',
  COURT_ADDRESS: 'courtAddress',

  // Attorney information
  ATTORNEY_FOR: 'attorneyFor',
  STATE_BAR_NUMBER: 'stateBarNumber',
  FIRM_NAME: 'firmName',

  // Children information
  CHILDREN: 'children',
  CHILD_NAMES: 'childNames',
  CHILD_BIRTHDATES: 'childBirthdates',

  // Physical descriptions (for CLETS)
  GENDER: 'gender',
  RACE: 'race',
  HEIGHT: 'height',
  WEIGHT: 'weight',
  HAIR_COLOR: 'hairColor',
  EYE_COLOR: 'eyeColor',
  DATE_OF_BIRTH: 'dateOfBirth'
} as const;

// ============================================================================
// DV-100 to CLETS-001 Mapping
// ============================================================================

/**
 * Map DV-100 data to CLETS-001 form
 * CLETS-001 requires detailed information about both protected and restrained persons
 */
export function mapDV100ToCLETS(dv100Data: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  // Protected person information
  if (dv100Data.protectedPersonName) {
    mapped.protectedPersonName = dv100Data.protectedPersonName;
  }
  if (dv100Data.protectedPersonAddress) {
    mapped.protectedPersonAddress = dv100Data.protectedPersonAddress;
  }
  if (dv100Data.protectedPersonCity) {
    mapped.protectedPersonCity = dv100Data.protectedPersonCity;
  }
  if (dv100Data.protectedPersonState) {
    mapped.protectedPersonState = dv100Data.protectedPersonState;
  }
  if (dv100Data.protectedPersonZip) {
    mapped.protectedPersonZip = dv100Data.protectedPersonZip;
  }
  if (dv100Data.protectedPersonDOB) {
    mapped.protectedPersonDOB = dv100Data.protectedPersonDOB;
  }
  if (dv100Data.protectedPersonGender) {
    mapped.protectedPersonGender = dv100Data.protectedPersonGender;
  }
  if (dv100Data.protectedPersonRace) {
    mapped.protectedPersonRace = dv100Data.protectedPersonRace;
  }
  if (dv100Data.protectedPersonHeight) {
    mapped.protectedPersonHeight = dv100Data.protectedPersonHeight;
  }
  if (dv100Data.protectedPersonWeight) {
    mapped.protectedPersonWeight = dv100Data.protectedPersonWeight;
  }
  if (dv100Data.protectedPersonHairColor) {
    mapped.protectedPersonHairColor = dv100Data.protectedPersonHairColor;
  }
  if (dv100Data.protectedPersonEyeColor) {
    mapped.protectedPersonEyeColor = dv100Data.protectedPersonEyeColor;
  }

  // Restrained person information
  if (dv100Data.restrainedPersonName) {
    mapped.restrainedPersonName = dv100Data.restrainedPersonName;
  }
  if (dv100Data.restrainedPersonAddress) {
    mapped.restrainedPersonAddress = dv100Data.restrainedPersonAddress;
  }
  if (dv100Data.restrainedPersonCity) {
    mapped.restrainedPersonCity = dv100Data.restrainedPersonCity;
  }
  if (dv100Data.restrainedPersonState) {
    mapped.restrainedPersonState = dv100Data.restrainedPersonState;
  }
  if (dv100Data.restrainedPersonZip) {
    mapped.restrainedPersonZip = dv100Data.restrainedPersonZip;
  }
  if (dv100Data.restrainedPersonDOB) {
    mapped.restrainedPersonDOB = dv100Data.restrainedPersonDOB;
  }
  if (dv100Data.restrainedPersonGender) {
    mapped.restrainedPersonGender = dv100Data.restrainedPersonGender;
  }
  if (dv100Data.restrainedPersonRace) {
    mapped.restrainedPersonRace = dv100Data.restrainedPersonRace;
  }
  if (dv100Data.restrainedPersonHeight) {
    mapped.restrainedPersonHeight = dv100Data.restrainedPersonHeight;
  }
  if (dv100Data.restrainedPersonWeight) {
    mapped.restrainedPersonWeight = dv100Data.restrainedPersonWeight;
  }
  if (dv100Data.restrainedPersonHairColor) {
    mapped.restrainedPersonHairColor = dv100Data.restrainedPersonHairColor;
  }
  if (dv100Data.restrainedPersonEyeColor) {
    mapped.restrainedPersonEyeColor = dv100Data.restrainedPersonEyeColor;
  }

  // Case information
  if (dv100Data.caseNumber) {
    mapped.caseNumber = dv100Data.caseNumber;
  }
  if (dv100Data.county) {
    mapped.county = dv100Data.county;
  }

  return mapped;
}

// ============================================================================
// DV-100 to DV-105 Mapping
// ============================================================================

/**
 * Map DV-100 data to DV-105 form
 * DV-105 requires child custody and visitation information
 */
export function mapDV100ToDV105(dv100Data: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  // Party names
  if (dv100Data.protectedPersonName) {
    mapped.petitionerName = dv100Data.protectedPersonName;
  }
  if (dv100Data.restrainedPersonName) {
    mapped.respondentName = dv100Data.restrainedPersonName;
  }

  // Case information
  if (dv100Data.caseNumber) {
    mapped.caseNumber = dv100Data.caseNumber;
  }
  if (dv100Data.county) {
    mapped.county = dv100Data.county;
  }

  // Children information
  if (dv100Data.children) {
    mapped.children = dv100Data.children;
  }
  if (dv100Data.childNames) {
    mapped.childNames = dv100Data.childNames;
  }
  if (dv100Data.childBirthdates) {
    mapped.childBirthdates = dv100Data.childBirthdates;
  }
  if (dv100Data.numberOfChildren) {
    mapped.numberOfChildren = dv100Data.numberOfChildren;
  }

  // Current custody arrangement (if mentioned in DV-100)
  if (dv100Data.currentCustodyArrangement) {
    mapped.currentCustodyArrangement = dv100Data.currentCustodyArrangement;
  }

  return mapped;
}

// ============================================================================
// DV-100 to FL-150 Mapping
// ============================================================================

/**
 * Map DV-100 data to FL-150 form
 * FL-150 requires income and expense information
 */
export function mapDV100ToFL150(dv100Data: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  // Party information (the person filling out FL-150)
  if (dv100Data.protectedPersonName) {
    mapped.partyName = dv100Data.protectedPersonName;
  }

  // Case information
  if (dv100Data.caseNumber) {
    mapped.caseNumber = dv100Data.caseNumber;
  }
  if (dv100Data.county) {
    mapped.county = dv100Data.county;
  }

  // Petitioner/Respondent for reference
  if (dv100Data.protectedPersonName) {
    mapped.petitioner = dv100Data.protectedPersonName;
  }
  if (dv100Data.restrainedPersonName) {
    mapped.respondent = dv100Data.restrainedPersonName;
  }

  // Number of children (for child support calculations)
  if (dv100Data.numberOfChildren) {
    mapped.numberOfChildren = dv100Data.numberOfChildren;
  }

  return mapped;
}

// ============================================================================
// DV-120 to FL-320 Mapping
// ============================================================================

/**
 * Map DV-120 data to FL-320 form
 * FL-320 is the responsive declaration
 */
export function mapDV120ToFL320(dv120Data: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  // Respondent information (person responding)
  if (dv120Data.respondentName) {
    mapped.partyName = dv120Data.respondentName;
  }

  // Case information
  if (dv120Data.caseNumber) {
    mapped.caseNumber = dv120Data.caseNumber;
  }
  if (dv120Data.county) {
    mapped.county = dv120Data.county;
  }

  // Petitioner/Respondent names
  if (dv120Data.petitionerName) {
    mapped.petitioner = dv120Data.petitionerName;
  }
  if (dv120Data.respondentName) {
    mapped.respondent = dv120Data.respondentName;
  }

  // Attorney information (if responding with attorney)
  // Note: attorneyName goes to attorneyFor field, NOT partyName
  // partyName must always be the actual party (respondent), not their attorney
  if (dv120Data.attorneyName) {
    mapped.attorneyFor = dv120Data.attorneyName;
  }
  if (dv120Data.firmName) {
    mapped.firmName = dv120Data.firmName;
  }
  if (dv120Data.stateBarNumber) {
    mapped.stateBarNumber = dv120Data.stateBarNumber;
  }

  // Address information
  if (dv120Data.streetAddress) {
    mapped.streetAddress = dv120Data.streetAddress;
  }
  if (dv120Data.city) {
    mapped.city = dv120Data.city;
  }
  if (dv120Data.state) {
    mapped.state = dv120Data.state;
  }
  if (dv120Data.zipCode) {
    mapped.zipCode = dv120Data.zipCode;
  }

  // Contact information
  if (dv120Data.telephoneNo) {
    mapped.telephoneNo = dv120Data.telephoneNo;
  }
  if (dv120Data.faxNo) {
    mapped.faxNo = dv120Data.faxNo;
  }
  if (dv120Data.email) {
    mapped.email = dv120Data.email;
  }

  return mapped;
}

// ============================================================================
// Personal Data Vault Mapping
// ============================================================================

/**
 * Map Personal Data Vault to any form
 * Vault contains reusable personal information
 */
export function mapVaultToForm(
  vaultData: Record<string, unknown>,
  formType: FormType
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  // Common fields available in most forms
  const commonFieldMappings: Record<string, string> = {
    full_name: 'partyName',
    street_address: 'streetAddress',
    city: 'city',
    state: 'state',
    zip_code: 'zipCode',
    phone: 'telephoneNo',
    email: 'email',
    attorney_name: 'firmName',
    attorney_bar_number: 'stateBarNumber',
    county: 'county'
  };

  // Apply common mappings
  for (const [vaultField, formField] of Object.entries(commonFieldMappings)) {
    if (vaultData[vaultField]) {
      mapped[formField] = vaultData[vaultField];
    }
  }

  // Form-specific mappings
  switch (formType) {
    case FormType.DV100:
      if (vaultData.full_name) {
        mapped.protectedPersonName = vaultData.full_name;
      }
      if (vaultData.street_address) {
        mapped.protectedPersonAddress = vaultData.street_address;
      }
      if (vaultData.city) {
        mapped.protectedPersonCity = vaultData.city;
      }
      if (vaultData.state) {
        mapped.protectedPersonState = vaultData.state;
      }
      if (vaultData.zip_code) {
        mapped.protectedPersonZip = vaultData.zip_code;
      }
      if (vaultData.date_of_birth) {
        mapped.protectedPersonDOB = vaultData.date_of_birth;
      }
      if (vaultData.gender) {
        mapped.protectedPersonGender = vaultData.gender;
      }
      if (vaultData.race) {
        mapped.protectedPersonRace = vaultData.race;
      }
      break;

    case FormType.DV105:
      if (vaultData.full_name) {
        mapped.petitionerName = vaultData.full_name;
      }
      break;

    case FormType.DV120:
      if (vaultData.full_name) {
        mapped.respondentName = vaultData.full_name;
      }
      break;

    case FormType.CLETS001:
      // CLETS gets detailed physical description from vault
      if (vaultData.height) {
        mapped.protectedPersonHeight = vaultData.height;
      }
      if (vaultData.weight) {
        mapped.protectedPersonWeight = vaultData.weight;
      }
      if (vaultData.hair_color) {
        mapped.protectedPersonHairColor = vaultData.hair_color;
      }
      if (vaultData.eye_color) {
        mapped.protectedPersonEyeColor = vaultData.eye_color;
      }
      break;

    case FormType.FL150:
      // FL-150 uses standard common fields
      break;

    case FormType.FL320:
      // FL-320 uses standard common fields
      break;
  }

  return mapped;
}

// ============================================================================
// Autofill Functions
// ============================================================================

/**
 * Autofill a form from previously completed forms
 *
 * @param targetForm - Form to autofill
 * @param completedForms - Map of completed forms and their data
 * @returns AutofillResult with filled fields
 */
export function autofillFromPreviousForms(
  targetForm: FormType,
  completedForms: Record<string, Record<string, unknown>>
): AutofillResult {
  let autofilled: Record<string, unknown> = {};
  let fieldsCount = 0;

  // Define mapping functions for each target form
  const mappings: Record<FormType, Array<{
    sourceForm: FormType;
    mapFn: (data: Record<string, unknown>) => Record<string, unknown>;
  }>> = {
    [FormType.CLETS001]: [
      { sourceForm: FormType.DV100, mapFn: mapDV100ToCLETS }
    ],
    [FormType.DV105]: [
      { sourceForm: FormType.DV100, mapFn: mapDV100ToDV105 }
    ],
    [FormType.FL150]: [
      { sourceForm: FormType.DV100, mapFn: mapDV100ToFL150 },
      { sourceForm: FormType.DV120, mapFn: (data) => ({
        partyName: data.respondentName,
        caseNumber: data.caseNumber,
        county: data.county
      })}
    ],
    [FormType.FL320]: [
      { sourceForm: FormType.DV120, mapFn: mapDV120ToFL320 }
    ],
    // These forms don't typically get autofilled from others
    [FormType.DV100]: [],
    [FormType.DV101]: [],
    [FormType.DV109]: [],
    [FormType.DV110]: [],
    [FormType.DV120]: []
  };

  // Apply mappings
  const targetMappings = mappings[targetForm] || [];
  for (const { sourceForm, mapFn } of targetMappings) {
    const sourceData = completedForms[sourceForm];
    if (sourceData) {
      const mapped = mapFn(sourceData);
      autofilled = { ...autofilled, ...mapped };
    }
  }

  fieldsCount = Object.keys(autofilled).length;

  return {
    fieldsAutofilled: fieldsCount,
    fields: autofilled,
    source: 'previous_form'
  };
}

/**
 * Autofill a form from Personal Data Vault
 *
 * @param targetForm - Form to autofill
 * @param vaultData - Personal vault data
 * @returns AutofillResult with filled fields
 */
export function autofillFromVault(
  targetForm: FormType,
  vaultData: Record<string, unknown>
): AutofillResult {
  const autofilled = mapVaultToForm(vaultData, targetForm);
  const fieldsCount = Object.keys(autofilled).length;

  return {
    fieldsAutofilled: fieldsCount,
    fields: autofilled,
    source: 'vault'
  };
}

/**
 * Autofill a form from both vault and previous forms
 * Vault data is applied first, then previous forms override
 *
 * @param targetForm - Form to autofill
 * @param vaultData - Personal vault data
 * @param completedForms - Map of completed forms and their data
 * @returns AutofillResult with filled fields
 */
export function autofillFromBoth(
  targetForm: FormType,
  vaultData: Record<string, unknown>,
  completedForms: Record<string, Record<string, unknown>>
): AutofillResult {
  // Start with vault data
  let autofilled = mapVaultToForm(vaultData, targetForm);

  // Override/supplement with data from previous forms
  const fromPrevious = autofillFromPreviousForms(targetForm, completedForms);
  autofilled = { ...autofilled, ...fromPrevious.fields };

  const fieldsCount = Object.keys(autofilled).length;

  return {
    fieldsAutofilled: fieldsCount,
    fields: autofilled,
    source: 'both'
  };
}

// ============================================================================
// Data Consistency Helpers
// ============================================================================

/**
 * Extract common values across forms for consistency checking
 *
 * @param forms - Collection of form data
 * @returns Object with common values found across forms
 */
export function extractCommonValues(
  forms: Record<string, Record<string, unknown>>
): Record<string, Set<string>> {
  const commonValues: Record<string, Set<string>> = {
    caseNumber: new Set(),
    county: new Set(),
    petitionerName: new Set(),
    respondentName: new Set()
  };

  for (const formData of Object.values(forms)) {
    if (formData.caseNumber != null) {
      // Normalize to string to prevent false inconsistencies from type differences
      commonValues.caseNumber.add(String(formData.caseNumber).trim());
    }
    if (formData.county != null) {
      commonValues.county.add(String(formData.county).trim());
    }
    if (formData.petitionerName != null || formData.protectedPersonName != null) {
      commonValues.petitionerName.add(
        String(formData.petitionerName ?? formData.protectedPersonName).trim()
      );
    }
    if (formData.respondentName != null || formData.restrainedPersonName != null) {
      commonValues.respondentName.add(
        String(formData.respondentName ?? formData.restrainedPersonName).trim()
      );
    }
  }

  return commonValues;
}

/**
 * Find inconsistencies in common fields across forms
 *
 * @param forms - Collection of form data
 * @returns Array of inconsistency descriptions
 */
export function findInconsistencies(
  forms: Record<string, Record<string, unknown>>
): string[] {
  const commonValues = extractCommonValues(forms);
  const inconsistencies: string[] = [];

  for (const [field, values] of Object.entries(commonValues)) {
    if (values.size > 1) {
      inconsistencies.push(
        `${field} has inconsistent values: ${Array.from(values).join(', ')}`
      );
    }
  }

  return inconsistencies;
}

/**
 * Synchronize common fields across all forms
 * Updates all forms to use the most recent value for common fields
 *
 * @param forms - Collection of form data (will be modified)
 * @param authoritative - Which form's data should be considered authoritative
 */
export function synchronizeCommonFields(
  forms: Record<string, Record<string, unknown>>,
  authoritative: FormType
): void {
  const authData = forms[authoritative];
  if (!authData) return;

  const fieldsToSync = [
    'caseNumber',
    'county',
    'petitionerName',
    'respondentName'
  ];

  for (const formType of Object.keys(forms)) {
    if (formType === authoritative) continue;

    const formData = forms[formType];
    for (const field of fieldsToSync) {
      if (authData[field] && !formData[field]) {
        formData[field] = authData[field];
      }
    }
  }
}

// Export all functions
export default {
  mapDV100ToCLETS,
  mapDV100ToDV105,
  mapDV100ToFL150,
  mapDV120ToFL320,
  mapVaultToForm,
  autofillFromPreviousForms,
  autofillFromVault,
  autofillFromBoth,
  extractCommonValues,
  findInconsistencies,
  synchronizeCommonFields
};
