/**
 * Central configuration for form field positions and metadata
 * Single source of truth for field positioning across the application
 */

export interface FieldPosition {
  top: number;
  left: number;
  width?: string;
  height?: string;
}

export interface FieldConfig {
  field: string;
  label: string;
  type: 'input' | 'textarea' | 'checkbox';
  placeholder?: string;
  position: FieldPosition;
  vaultField?: string; // Maps to personal_info column
  maxLength?: number;
}

/**
 * Default field positions for FL-320 form
 * Coordinates are in percentage of parent container
 */
export const DEFAULT_FIELD_POSITIONS: Record<string, FieldPosition> = {
  partyName: { top: 15.8, left: 5, width: '40%' },
  streetAddress: { top: 19, left: 5, width: '40%' },
  city: { top: 22.5, left: 5, width: '23%' },
  state: { top: 22.5, left: 29.5, width: '7%' },
  zipCode: { top: 22.5, left: 38, width: '7%' },
  telephoneNo: { top: 25.8, left: 5, width: '16%' },
  faxNo: { top: 25.8, left: 23, width: '22%' },
  email: { top: 29.2, left: 5, width: '40%' },
  attorneyFor: { top: 32.5, left: 5, width: '40%' },
  county: { top: 15.8, left: 55, width: '40%' },
  petitioner: { top: 22.5, left: 55, width: '40%' },
  respondent: { top: 26.5, left: 55, width: '40%' },
  caseNumber: { top: 32.5, left: 55, width: '40%' },
  noOrders: { top: 43.5, left: 25.5 },
  agreeOrders: { top: 46.5, left: 25.5 },
  consentCustody: { top: 53, left: 25.5 },
  consentVisitation: { top: 56, left: 25.5 },
  facts: { top: 68, left: 5, width: '90%', height: '15%' },
  signatureDate: { top: 90, left: 5, width: '20%' },
  signatureName: { top: 90, left: 50, width: '40%' },
};

/**
 * Complete field configuration including metadata
 */
export const FIELD_CONFIGS: FieldConfig[] = [
  {
    field: 'partyName',
    label: 'Name',
    type: 'input',
    placeholder: 'Full name',
    position: DEFAULT_FIELD_POSITIONS.partyName,
    vaultField: 'full_name',
    maxLength: 100,
  },
  {
    field: 'streetAddress',
    label: 'Street Address',
    type: 'input',
    placeholder: 'Street address',
    position: DEFAULT_FIELD_POSITIONS.streetAddress,
    vaultField: 'street_address',
    maxLength: 200,
  },
  {
    field: 'city',
    label: 'City',
    type: 'input',
    placeholder: 'City',
    position: DEFAULT_FIELD_POSITIONS.city,
    vaultField: 'city',
    maxLength: 100,
  },
  {
    field: 'state',
    label: 'State',
    type: 'input',
    placeholder: 'CA',
    position: DEFAULT_FIELD_POSITIONS.state,
    vaultField: 'state',
    maxLength: 2,
  },
  {
    field: 'zipCode',
    label: 'ZIP Code',
    type: 'input',
    placeholder: 'ZIP code',
    position: DEFAULT_FIELD_POSITIONS.zipCode,
    vaultField: 'zip_code',
    maxLength: 10,
  },
  {
    field: 'telephoneNo',
    label: 'Telephone',
    type: 'input',
    placeholder: 'Phone number',
    position: DEFAULT_FIELD_POSITIONS.telephoneNo,
    vaultField: 'telephone_no',
    maxLength: 20,
  },
  {
    field: 'faxNo',
    label: 'Fax',
    type: 'input',
    placeholder: 'Fax number',
    position: DEFAULT_FIELD_POSITIONS.faxNo,
    vaultField: 'fax_no',
    maxLength: 20,
  },
  {
    field: 'email',
    label: 'Email',
    type: 'input',
    placeholder: 'Email address',
    position: DEFAULT_FIELD_POSITIONS.email,
    vaultField: 'email_address',
    maxLength: 255,
  },
  {
    field: 'attorneyFor',
    label: 'Attorney For',
    type: 'input',
    placeholder: 'Attorney for',
    position: DEFAULT_FIELD_POSITIONS.attorneyFor,
    vaultField: 'attorney_name',
    maxLength: 100,
  },
  {
    field: 'county',
    label: 'County',
    type: 'input',
    placeholder: 'County',
    position: DEFAULT_FIELD_POSITIONS.county,
    maxLength: 100,
  },
  {
    field: 'petitioner',
    label: 'Petitioner',
    type: 'input',
    placeholder: 'Petitioner name',
    position: DEFAULT_FIELD_POSITIONS.petitioner,
    maxLength: 100,
  },
  {
    field: 'respondent',
    label: 'Respondent',
    type: 'input',
    placeholder: 'Respondent name',
    position: DEFAULT_FIELD_POSITIONS.respondent,
    maxLength: 100,
  },
  {
    field: 'caseNumber',
    label: 'Case Number',
    type: 'input',
    placeholder: 'Case number',
    position: DEFAULT_FIELD_POSITIONS.caseNumber,
    maxLength: 50,
  },
  {
    field: 'noOrders',
    label: 'No orders requested',
    type: 'checkbox',
    position: DEFAULT_FIELD_POSITIONS.noOrders,
  },
  {
    field: 'agreeOrders',
    label: 'Agree to orders',
    type: 'checkbox',
    position: DEFAULT_FIELD_POSITIONS.agreeOrders,
  },
  {
    field: 'consentCustody',
    label: 'Consent to custody',
    type: 'checkbox',
    position: DEFAULT_FIELD_POSITIONS.consentCustody,
  },
  {
    field: 'consentVisitation',
    label: 'Consent to visitation',
    type: 'checkbox',
    position: DEFAULT_FIELD_POSITIONS.consentVisitation,
  },
  {
    field: 'facts',
    label: 'Facts',
    type: 'textarea',
    placeholder: 'Enter facts and details',
    position: DEFAULT_FIELD_POSITIONS.facts,
    maxLength: 5000,
  },
  {
    field: 'signatureDate',
    label: 'Date',
    type: 'input',
    placeholder: 'Date',
    position: DEFAULT_FIELD_POSITIONS.signatureDate,
  },
  {
    field: 'signatureName',
    label: 'Signature Name',
    type: 'input',
    placeholder: 'Your name',
    position: DEFAULT_FIELD_POSITIONS.signatureName,
    vaultField: 'full_name',
    maxLength: 100,
  },
];

/**
 * Get field configuration by field name
 */
export const getFieldConfig = (fieldName: string): FieldConfig | undefined => {
  return FIELD_CONFIGS.find(config => config.field === fieldName);
};

/**
 * Get default position for a field
 */
export const getDefaultPosition = (fieldName: string): FieldPosition => {
  return DEFAULT_FIELD_POSITIONS[fieldName] || { top: 0, left: 0 };
};

/**
 * Map field names to indices for navigation
 */
export const FIELD_NAME_TO_INDEX: Record<string, number> = FIELD_CONFIGS.reduce(
  (acc, config, index) => ({ ...acc, [config.field]: index }),
  {}
);
