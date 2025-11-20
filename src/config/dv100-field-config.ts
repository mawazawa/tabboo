import type { FieldConfig } from "@/types/FormData";

/**
 * DV-100 California Judicial Council Form Field Configuration
 * Request for Domestic Violence Restraining Order
 * Rev. January 1, 2025, Mandatory Form Family Code, § 6200 et seq.
 * 
 * Pixel-perfect field positioning for 612x792pt PDF (letter size)
 * All positions in percentage relative to PDF dimensions
 */

export const DV_100_FIELD_CONFIG: FieldConfig[] = [
  // ==================== HEADER: COURT INFORMATION ====================
  {
    field: 'courtCounty',
    label: 'Superior Court of California, County of',
    type: 'input',
    placeholder: 'County name',
    position: { top: 27.15, left: 67.48, width: '27%', height: '5.8%' }
  },
  {
    field: 'courtStreetAddress',
    label: 'Court Street Address',
    type: 'input',
    placeholder: 'Court street address',
    position: { top: 33.5, left: 67.48, width: '27%', height: '5.8%' }
  },
  {
    field: 'caseNumber',
    label: 'Case Number',
    type: 'input',
    placeholder: 'Case number',
    position: { top: 39.1, left: 67.48, width: '27%', height: '4.3%' }
  },

  // ==================== ITEM 1: PERSON ASKING FOR PROTECTION ====================
  
  // 1a. Your name
  {
    field: 'item1a_yourName',
    label: 'Your name',
    type: 'input',
    placeholder: 'Full legal name',
    vaultField: 'full_name',
    position: { top: 28.28, left: 12.75, width: '51%', height: '1.39%' }
  },

  // 1b. Your age
  {
    field: 'item1b_yourAge',
    label: 'Your age',
    type: 'input',
    placeholder: 'Age',
    vaultField: 'age',
    position: { top: 30.05, left: 21.08, width: '17.97%', height: '1.39%' }
  },

  // 1c. Address where you can receive court papers
  {
    field: 'item1c_address',
    label: 'Address',
    type: 'input',
    placeholder: 'Street address',
    vaultField: 'street_address',
    position: { top: 45.96, left: 19.77, width: '44.61%', height: '1.39%' }
  },
  {
    field: 'item1c_city',
    label: 'City',
    type: 'input',
    placeholder: 'City',
    vaultField: 'city',
    position: { top: 47.73, left: 17.01, width: '20.92%', height: '1.39%' }
  },
  {
    field: 'item1c_state',
    label: 'State',
    type: 'input',
    placeholder: 'CA',
    vaultField: 'state',
    position: { top: 47.73, left: 42.48, width: '14.46%', height: '1.39%' }
  },
  {
    field: 'item1c_zip',
    label: 'Zip',
    type: 'input',
    placeholder: 'ZIP code',
    vaultField: 'zip_code',
    position: { top: 47.73, left: 60.95, width: '10.13%', height: '1.39%' }
  },

  // 1d. Your contact information (optional)
  {
    field: 'item1d_telephone',
    label: 'Telephone',
    type: 'input',
    placeholder: 'Phone number',
    vaultField: 'telephone_no',
    position: { top: 56.82, left: 20.75, width: '19.77%', height: '1.39%' }
  },
  {
    field: 'item1d_fax',
    label: 'Fax',
    type: 'input',
    placeholder: 'Fax number',
    vaultField: 'fax_no',
    position: { top: 56.82, left: 46.41, width: '19.77%', height: '1.39%' }
  },
  {
    field: 'item1d_email',
    label: 'Email Address',
    type: 'input',
    placeholder: 'Email address',
    vaultField: 'email_address',
    position: { top: 59.47, left: 25.16, width: '46.73%', height: '1.39%' }
  },

  // 1e. Your lawyer's information (if you have one)
  {
    field: 'item1e_lawyerName',
    label: 'Name',
    type: 'input',
    placeholder: 'Attorney name',
    vaultField: 'attorney_name',
    position: { top: 65.53, left: 18.14, width: '33.50%', height: '1.39%' }
  },
  {
    field: 'item1e_stateBarNo',
    label: 'State Bar No.',
    type: 'input',
    placeholder: 'State bar number',
    position: { top: 65.53, left: 62.91, width: '14.54%', height: '1.39%' }
  },
  {
    field: 'item1e_firmName',
    label: 'Firm Name',
    type: 'input',
    placeholder: 'Law firm name',
    position: { top: 66.79, left: 22.06, width: '56.05%', height: '1.39%' }
  },

  // ==================== ITEM 2: PERSON YOU WANT PROTECTION FROM ====================
  
  // 2a. Full name
  {
    field: 'item2a_fullName',
    label: 'Full name',
    type: 'input',
    placeholder: 'Full legal name of person',
    position: { top: 75.63, left: 22.71, width: '70.26%', height: '1.39%' }
  },

  // 2b. Age (give estimate if you do not know exact age)
  {
    field: 'item2b_age',
    label: 'Age (give estimate if you do not know exact age)',
    type: 'input',
    placeholder: 'Age or estimate',
    position: { top: 77.65, left: 48.20, width: '34.64%', height: '1.39%' }
  },

  // 2c. Date of birth (if known)
  {
    field: 'item2c_dateOfBirth',
    label: 'Date of birth (if known)',
    type: 'input',
    placeholder: 'MM/DD/YYYY',
    position: { top: 80.18, left: 31.70, width: '20.26%', height: '1.39%' }
  },

  // 2d. Gender (checkboxes)
  {
    field: 'item2d_genderM',
    label: 'M',
    type: 'checkbox',
    position: { top: 82.45, left: 10.13, width: '1.47%', height: '1.14%' }
  },
  {
    field: 'item2d_genderF',
    label: 'F',
    type: 'checkbox',
    position: { top: 82.45, left: 17.65, width: '1.47%', height: '1.14%' }
  },
  {
    field: 'item2d_genderNonbinary',
    label: 'Nonbinary',
    type: 'checkbox',
    position: { top: 82.58, left: 35.62, width: '1.47%', height: '1.14%' }
  },

  // 2e. Race
  {
    field: 'item2e_race',
    label: 'Race',
    type: 'input',
    placeholder: 'Race',
    position: { top: 85.61, left: 17.65, width: '42.32%', height: '1.39%' }
  },
];

/**
 * Get field configuration for a specific field name
 */
export const getDV100FieldConfig = (fieldName: string): FieldConfig | undefined => {
  return DV_100_FIELD_CONFIG.find(config => config.field === fieldName);
};

/**
 * Get all fields for a specific page
 */
export const getDV100FieldsByPage = (page: number): FieldConfig[] => {
  // Page 1 contains all fields defined above
  if (page === 1) {
    return DV_100_FIELD_CONFIG;
  }
  // Additional pages would be defined here as the form is expanded
  return [];
};

/**
 * Field name to index mapping for keyboard navigation
 */
export const DV_100_FIELD_NAME_TO_INDEX: Record<string, number> = DV_100_FIELD_CONFIG.reduce(
  (acc, config, index) => ({ ...acc, [config.field]: index }),
  {}
);
