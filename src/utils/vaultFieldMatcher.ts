/**
 * Vault Field Matcher
 * Intelligent matching between form fields and personal data vault entries
 */

export interface PersonalVaultData {
  full_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  telephone_no?: string;
  fax_no?: string;
  email_address?: string;
  attorney_name?: string;
  firm_name?: string;
  bar_number?: string;
}

export interface FieldMapping {
  formField: string;
  vaultField: keyof PersonalVaultData;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Default field mappings with high confidence
 */
export const DEFAULT_FIELD_MAPPINGS: FieldMapping[] = [
  { formField: 'partyName', vaultField: 'full_name', confidence: 'high' },
  { formField: 'streetAddress', vaultField: 'street_address', confidence: 'high' },
  { formField: 'city', vaultField: 'city', confidence: 'high' },
  { formField: 'state', vaultField: 'state', confidence: 'high' },
  { formField: 'zipCode', vaultField: 'zip_code', confidence: 'high' },
  { formField: 'telephoneNo', vaultField: 'telephone_no', confidence: 'high' },
  { formField: 'faxNo', vaultField: 'fax_no', confidence: 'high' },
  { formField: 'email', vaultField: 'email_address', confidence: 'high' },
  { formField: 'attorneyFor', vaultField: 'attorney_name', confidence: 'medium' },
  { formField: 'signatureName', vaultField: 'full_name', confidence: 'medium' },
];

/**
 * Get all autofillable fields from vault data
 */
export const getAutofillableFields = (vaultData: PersonalVaultData | null): string[] => {
  if (!vaultData) return [];
  
  const autofillable: string[] = [];
  
  DEFAULT_FIELD_MAPPINGS.forEach(mapping => {
    if (vaultData[mapping.vaultField]) {
      autofillable.push(mapping.formField);
    }
  });
  
  return autofillable;
};

/**
 * Get vault value for a specific form field
 */
export const getVaultValueForField = (
  fieldName: string,
  vaultData: PersonalVaultData | null
): string | null => {
  if (!vaultData) return null;
  
  const mapping = DEFAULT_FIELD_MAPPINGS.find(m => m.formField === fieldName);
  if (!mapping) return null;
  
  return vaultData[mapping.vaultField] || null;
};

/**
 * Autofill multiple fields from vault data
 */
export const autofillFieldsFromVault = (
  fields: string[],
  vaultData: PersonalVaultData | null
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  if (!vaultData) return result;
  
  fields.forEach(fieldName => {
    const value = getVaultValueForField(fieldName, vaultData);
    if (value) {
      result[fieldName] = value;
    }
  });
  
  return result;
};

/**
 * Autofill all available fields from vault data
 */
export const autofillAllFromVault = (
  vaultData: PersonalVaultData | null
): Record<string, string> => {
  if (!vaultData) return {};
  
  const result: Record<string, string> = {};
  
  DEFAULT_FIELD_MAPPINGS.forEach(mapping => {
    const value = vaultData[mapping.vaultField];
    if (value) {
      result[mapping.formField] = value;
    }
  });
  
  return result;
};

/**
 * Check if a field can be autofilled
 */
export const canAutofill = (
  fieldName: string,
  vaultData: PersonalVaultData | null
): boolean => {
  return getVaultValueForField(fieldName, vaultData) !== null;
};

/**
 * Get autofill confidence for a field
 */
export const getAutofillConfidence = (fieldName: string): 'high' | 'medium' | 'low' | null => {
  const mapping = DEFAULT_FIELD_MAPPINGS.find(m => m.formField === fieldName);
  return mapping?.confidence || null;
};
