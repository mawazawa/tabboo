import type { FieldConfig } from "@/types/FormData";

/**
 * FL-320 California Judicial Council Form Field Configuration
 * Defines all fields for the Responsive Declaration to Request for Order form
 */
export const FL_320_FIELD_CONFIG: FieldConfig[] = [
  // HEADER - Party/Attorney Information
  { field: 'partyName', label: 'Name', type: 'input', placeholder: 'Full name', vaultField: 'full_name' },
  { field: 'firmName', label: 'Firm Name', type: 'input', placeholder: 'Law firm name' },
  { field: 'streetAddress', label: 'Street Address', type: 'input', placeholder: 'Street address', vaultField: 'street_address' },
  { field: 'mailingAddress', label: 'Mailing Address', type: 'input', placeholder: 'P.O. Box or mailing address' },
  { field: 'city', label: 'City', type: 'input', placeholder: 'City', vaultField: 'city' },
  { field: 'state', label: 'State', type: 'input', placeholder: 'CA', vaultField: 'state' },
  { field: 'zipCode', label: 'ZIP Code', type: 'input', placeholder: 'ZIP code', vaultField: 'zip_code' },
  { field: 'telephoneNo', label: 'Telephone', type: 'input', placeholder: 'Phone number', vaultField: 'telephone_no' },
  { field: 'faxNo', label: 'Fax', type: 'input', placeholder: 'Fax number', vaultField: 'fax_no' },
  { field: 'email', label: 'Email', type: 'input', placeholder: 'Email address', vaultField: 'email_address' },
  { field: 'attorneyFor', label: 'Attorney For', type: 'input', placeholder: 'Self-Represented or attorney name', vaultField: 'attorney_name' },
  { field: 'stateBarNumber', label: 'State Bar Number', type: 'input', placeholder: 'State bar number' },

  // HEADER - Court Information
  { field: 'county', label: 'County', type: 'input', placeholder: 'County' },
  { field: 'courtStreetAddress', label: 'Court Street Address', type: 'input', placeholder: 'Court street address' },
  { field: 'courtMailingAddress', label: 'Court Mailing Address', type: 'input', placeholder: 'Court mailing address' },
  { field: 'courtCityAndZip', label: 'Court City and ZIP', type: 'input', placeholder: 'City and ZIP code' },
  { field: 'branchName', label: 'Branch Name', type: 'input', placeholder: 'Court branch name' },

  // HEADER - Case Information
  { field: 'petitioner', label: 'Petitioner', type: 'input', placeholder: 'Petitioner name' },
  { field: 'respondent', label: 'Respondent', type: 'input', placeholder: 'Respondent name' },
  { field: 'otherParentParty', label: 'Other Parent/Party', type: 'input', placeholder: 'Third party name' },
  { field: 'caseNumber', label: 'Case Number', type: 'input', placeholder: 'Case number' },

  // HEADER - Hearing Information
  { field: 'hearingDate', label: 'Hearing Date', type: 'input', placeholder: 'MM/DD/YYYY' },
  { field: 'hearingTime', label: 'Hearing Time', type: 'input', placeholder: 'HH:MM AM/PM' },
  { field: 'hearingDepartment', label: 'Department', type: 'input', placeholder: 'Department' },
  { field: 'hearingRoom', label: 'Room', type: 'input', placeholder: 'Room number' },

  // ITEM 1: Restraining Order Information
  { field: 'restrainingOrderNone', label: 'No restraining orders', type: 'checkbox' },
  { field: 'restrainingOrderActive', label: 'Restraining orders active', type: 'checkbox' },

  // ITEM 2: Child Custody/Visitation
  { field: 'childCustodyConsent', label: 'Consent to custody order', type: 'checkbox' },
  { field: 'visitationConsent', label: 'Consent to visitation order', type: 'checkbox' },
  { field: 'childCustodyDoNotConsent', label: 'Do not consent to custody', type: 'checkbox' },
  { field: 'visitationDoNotConsent', label: 'Do not consent to visitation', type: 'checkbox' },
  { field: 'custodyAlternativeOrder', label: 'Request alternative custody order', type: 'textarea' },

  // ITEM 3: Child Support
  { field: 'childSupportFiledFL150', label: 'Filed Income and Expense Declaration (FL-150)', type: 'checkbox' },
  { field: 'childSupportConsent', label: 'Consent to child support order', type: 'checkbox' },
  { field: 'childSupportGuidelineConsent', label: 'Consent to guideline child support', type: 'checkbox' },
  { field: 'childSupportDoNotConsent', label: 'Do not consent to child support', type: 'checkbox' },
  { field: 'childSupportAlternativeOrder', label: 'Request alternative support amount', type: 'textarea' },

  // ITEM 4: Spousal Support
  { field: 'spousalSupportFiledFL150', label: 'Filed Income and Expense Declaration (FL-150)', type: 'checkbox' },
  { field: 'spousalSupportConsent', label: 'Consent to spousal support order', type: 'checkbox' },
  { field: 'spousalSupportDoNotConsent', label: 'Do not consent to spousal support', type: 'checkbox' },
  { field: 'spousalSupportAlternativeOrder', label: 'Request alternative support amount', type: 'textarea' },

  // ITEM 5: Attorney Fees and Costs
  { field: 'attorneyFeesConsent', label: 'Consent to attorney fees order', type: 'checkbox' },
  { field: 'attorneyFeesDoNotConsent', label: 'Do not consent to attorney fees', type: 'checkbox' },
  { field: 'attorneyFeesAlternativeOrder', label: 'Request alternative fees/costs order', type: 'textarea' },

  // ITEM 6: Property Control
  { field: 'propertyControlConsent', label: 'Consent to property control order', type: 'checkbox' },
  { field: 'propertyControlDoNotConsent', label: 'Do not consent to property control', type: 'checkbox' },
  { field: 'propertyControlAlternativeOrder', label: 'Request alternative property order', type: 'textarea' },

  // ITEM 7: Property Restraint
  { field: 'propertyRestraintConsent', label: 'Consent to property restraint', type: 'checkbox' },
  { field: 'propertyRestraintDoNotConsent', label: 'Do not consent to property restraint', type: 'checkbox' },
  { field: 'propertyRestraintAlternativeOrder', label: 'Request alternative restraint order', type: 'textarea' },

  // ITEM 8: Other Relief
  { field: 'otherReliefRequest', label: 'Other relief requested', type: 'textarea', placeholder: 'Describe other relief...' },

  // ITEM 9: Facts Supporting Response
  { field: 'factsText', label: 'Facts supporting your position', type: 'textarea', placeholder: 'Provide detailed facts...' },
];
