import type { FieldPositions } from '@/types/FormData';

/**
 * Field configuration for FL-320 form
 * Maps field names to their default positions on the PDF
 */
const FIELD_CONFIGS = [
  { field: 'partyName', top: 8, left: 5 },
  { field: 'firmName', top: 10, left: 5 },
  { field: 'streetAddress', top: 12, left: 5 },
  { field: 'mailingAddress', top: 14, left: 5 },
  { field: 'city', top: 16, left: 5 },
  { field: 'state', top: 16, left: 26 },
  { field: 'zipCode', top: 16, left: 34 },
  { field: 'telephoneNo', top: 18, left: 5 },
  { field: 'faxNo', top: 18, left: 23 },
  { field: 'email', top: 20, left: 5 },
  { field: 'attorneyFor', top: 22, left: 5 },
  { field: 'stateBarNumber', top: 22, left: 36 },
  { field: 'county', top: 8, left: 50 },
  { field: 'petitioner', top: 20, left: 77 },
  { field: 'respondent', top: 22, left: 77 },
  { field: 'otherParentParty', top: 24, left: 77 },
  { field: 'caseNumber', top: 27, left: 77 },
  { field: 'restrainingOrderNone', top: 36, left: 5 },
  { field: 'restrainingOrderActive', top: 38, left: 5 },
  { field: 'childCustodyConsent', top: 42, left: 5 },
  { field: 'visitationConsent', top: 44, left: 5 },
  { field: 'childCustodyDoNotConsent', top: 46, left: 7 },
  { field: 'visitationDoNotConsent', top: 46, left: 25 },
  { field: 'facts', top: 54, left: 5 },
  { field: 'signatureDate', top: 91, left: 5 },
  { field: 'printName', top: 93, left: 5 },
  { field: 'signatureName', top: 95, left: 5 },
];

/**
 * Get current field positions for minimap indicators
 * Supports displaying multiple fields (current, selected, highlighted)
 *
 * @param currentFieldIndex - Index of currently focused field
 * @param fieldPositions - User-customized field positions
 * @param selectedFields - Array of selected field names
 * @param highlightedField - Currently highlighted field name
 * @returns Array of field positions for minimap display
 */
export function getCurrentFieldPositions(
  currentFieldIndex: number,
  fieldPositions: FieldPositions,
  selectedFields: string[],
  highlightedField: string | null
): { top: number; left: number }[] {
  const positions: { top: number; left: number }[] = [];

  // Add current field
  const currentFieldName = FIELD_CONFIGS[currentFieldIndex]?.field;
  if (currentFieldName) {
    positions.push(fieldPositions[currentFieldName] || FIELD_CONFIGS[currentFieldIndex]);
  }

  // Add selected fields
  selectedFields.forEach(fieldName => {
    const config = FIELD_CONFIGS.find(f => f.field === fieldName);
    if (config) {
      positions.push(fieldPositions[fieldName] || { top: config.top, left: config.left });
    }
  });

  // Add highlighted field
  if (highlightedField) {
    const config = FIELD_CONFIGS.find(f => f.field === highlightedField);
    if (config && !positions.some(p => p === (fieldPositions[highlightedField] || { top: config.top, left: config.left }))) {
      positions.push(fieldPositions[highlightedField] || { top: config.top, left: config.left });
    }
  }

  return positions;
}
