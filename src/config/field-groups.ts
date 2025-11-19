/**
 * Field Group Configuration for FL-320 Form
 *
 * Organizes the 64 form fields into logical sections for the Liquid Glass Accordion.
 * Each group creates a collapsible section in the Field Navigation Panel.
 */

export interface FieldGroup {
  /** Unique identifier for the group */
  id: string;
  /** Display name shown in accordion header */
  title: string;
  /** Icon name from lucide-react */
  icon?: string;
  /** Fields included in this group (by field name) */
  fields: string[];
  /** Short description of the section */
  description?: string;
  /** Whether this section starts open by default */
  defaultOpen?: boolean;
}

/**
 * FL-320 Field Groupings
 * Organized by logical form sections for optimal user experience
 */
export const FL_320_FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'party-info',
    title: 'Party/Attorney Information',
    icon: 'User',
    description: 'Your contact information and attorney details',
    defaultOpen: true,
    fields: [
      'partyName',
      'firmName',
      'streetAddress',
      'mailingAddress',
      'city',
      'state',
      'zipCode',
      'telephoneNo',
      'faxNo',
      'email',
      'attorneyFor',
      'stateBarNumber',
    ],
  },
  {
    id: 'court-info',
    title: 'Court Information',
    icon: 'Scale',
    description: 'Court location and contact details',
    defaultOpen: false,
    fields: [
      'county',
      'courtStreetAddress',
      'courtMailingAddress',
      'courtCityAndZip',
      'branchName',
    ],
  },
  {
    id: 'case-info',
    title: 'Case Information',
    icon: 'FileText',
    description: 'Case parties and case number',
    defaultOpen: false,
    fields: [
      'petitioner',
      'respondent',
      'otherParentParty',
      'caseNumber',
    ],
  },
  {
    id: 'hearing-info',
    title: 'Hearing Information',
    icon: 'Calendar',
    description: 'Hearing date, time, and location',
    defaultOpen: false,
    fields: [
      'hearingDate',
      'hearingTime',
      'hearingDepartment',
      'hearingRoom',
    ],
  },
  {
    id: 'restraining-orders',
    title: 'Restraining Orders',
    icon: 'Shield',
    description: 'Current restraining order status',
    defaultOpen: false,
    fields: [
      'restrainingOrderNone',
      'restrainingOrderActive',
    ],
  },
  {
    id: 'child-custody',
    title: 'Child Custody & Visitation',
    icon: 'User',
    description: 'Custody and visitation preferences',
    defaultOpen: false,
    fields: [
      'childCustodyConsent',
      'visitationConsent',
      'childCustodyDoNotConsent',
      'visitationDoNotConsent',
      'custodyAlternativeOrder',
    ],
  },
  {
    id: 'child-support',
    title: 'Child Support',
    icon: 'Calculator',
    description: 'Child support consent and calculations',
    defaultOpen: false,
    fields: [
      'childSupportFiledFL150',
      'childSupportConsent',
      'childSupportGuidelineConsent',
      'childSupportDoNotConsent',
      'childSupportAlternativeOrder',
    ],
  },
  {
    id: 'spousal-support',
    title: 'Spousal Support',
    icon: 'Calculator',
    description: 'Spousal support consent and calculations',
    defaultOpen: false,
    fields: [
      'spousalSupportFiledFL150',
      'spousalSupportConsent',
      'spousalSupportDoNotConsent',
      'spousalSupportAlternativeOrder',
    ],
  },
  {
    id: 'attorney-fees',
    title: 'Attorney Fees & Costs',
    icon: 'Calculator',
    description: 'Attorney fees and cost preferences',
    defaultOpen: false,
    fields: [
      'attorneyFeesConsent',
      'attorneyFeesDoNotConsent',
      'attorneyFeesAlternativeOrder',
    ],
  },
  {
    id: 'property-control',
    title: 'Property Control',
    icon: 'Package',
    description: 'Property control order preferences',
    defaultOpen: false,
    fields: [
      'propertyControlConsent',
      'propertyControlDoNotConsent',
      'propertyControlAlternativeOrder',
    ],
  },
  {
    id: 'property-restraint',
    title: 'Property Restraint',
    icon: 'Lock',
    description: 'Property restraint order preferences',
    defaultOpen: false,
    fields: [
      'propertyRestraintConsent',
      'propertyRestraintDoNotConsent',
      'propertyRestraintAlternativeOrder',
    ],
  },
  {
    id: 'other-relief',
    title: 'Other Relief',
    icon: 'MoreHorizontal',
    description: 'Additional relief requests',
    defaultOpen: false,
    fields: [
      'otherReliefRequest',
    ],
  },
  {
    id: 'supporting-facts',
    title: 'Supporting Facts',
    icon: 'MessageSquare',
    description: 'Facts supporting your response',
    defaultOpen: false,
    fields: [
      'factsText',
    ],
  },
];

/**
 * Get completion percentage for a field group
 * @param groupId - The group identifier
 * @param formData - Current form data
 * @returns Percentage of completed fields (0-100)
 */
export const getGroupCompletionPercentage = (
  groupId: string,
  formData: Record<string, unknown>
): number => {
  const group = FL_320_FIELD_GROUPS.find(g => g.id === groupId);
  if (!group) return 0;

  const completedFields = group.fields.filter(fieldName => {
    const value = formData[fieldName];
    // Consider field complete if it has a truthy value (string, boolean, etc.)
    return value !== undefined && value !== null && value !== '';
  }).length;

  return Math.round((completedFields / group.fields.length) * 100);
};

/**
 * Get completion badge text for a group
 * @param groupId - The group identifier
 * @param formData - Current form data
 * @returns Badge text like "3/5 complete"
 */
export const getGroupCompletionBadge = (
  groupId: string,
  formData: Record<string, unknown>
): string => {
  const group = FL_320_FIELD_GROUPS.find(g => g.id === groupId);
  if (!group) return '';

  const completedFields = group.fields.filter(fieldName => {
    const value = formData[fieldName];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return `${completedFields}/${group.fields.length} complete`;
};

/**
 * Get overall form completion percentage across all field groups
 * @param formData - Current form data
 * @returns Overall percentage of completed fields (0-100)
 */
export const getOverallFormCompletionPercentage = (
  formData: Record<string, unknown>
): number => {
  // Get all unique fields from all groups
  const allFields = new Set<string>();
  FL_320_FIELD_GROUPS.forEach(group => {
    group.fields.forEach(field => allFields.add(field));
  });

  // Count completed fields
  const completedFields = Array.from(allFields).filter(fieldName => {
    const value = formData[fieldName];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return Math.round((completedFields / allFields.size) * 100);
};

/**
 * Get overall form completion count
 * @param formData - Current form data
 * @returns Object with completedFields and totalFields
 */
export const getOverallFormCompletionCount = (
  formData: Record<string, unknown>
): { completedFields: number; totalFields: number } => {
  // Get all unique fields from all groups
  const allFields = new Set<string>();
  FL_320_FIELD_GROUPS.forEach(group => {
    group.fields.forEach(field => allFields.add(field));
  });

  // Count completed fields
  const completedFields = Array.from(allFields).filter(fieldName => {
    const value = formData[fieldName];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return {
    completedFields,
    totalFields: allFields.size
  };
};
