/**
 * FL-320 Form Data Interface - First Principles Design
 * Based on Official California Judicial Council Form FL-320 (Rev. July 1, 2025)
 * Single source of truth matching database canonical_fields exactly
 */

/**
 * Main form data structure for FL-320 Responsive Declaration to Request for Order
 */
export interface FormData {
  // ================== SECTION 1: ATTORNEY/PARTY INFORMATION (Header) ==================
  /** State Bar Number (6 digits) */
  stateBarNumber?: string;

  /** Name of attorney or self-represented party */
  partyName?: string;

  /** Law firm name */
  firmName?: string;

  /** Street address of attorney or party */
  streetAddress?: string;

  /** City */
  city?: string;

  /** State (2-letter code) */
  state?: string;

  /** ZIP code (5 or 9 digits) */
  zipCode?: string;

  /** Telephone number */
  telephoneNo?: string;

  /** Fax number */
  faxNo?: string;

  /** Email address */
  email?: string;

  /** Name of person attorney represents */
  attorneyFor?: string;

  // ================== SECTION 2: COURT INFORMATION (Header) ==================
  /** Superior Court of California, County of... */
  county?: string;

  /** Court street address */
  courtStreetAddress?: string;

  /** Court mailing address */
  courtMailingAddress?: string;

  /** Court city and ZIP code */
  courtCityAndZip?: string;

  /** Court branch name */
  branchName?: string;

  // ================== SECTION 3: CASE INFORMATION (Header) ==================
  /** Petitioner name */
  petitioner?: string;

  /** Respondent name */
  respondent?: string;

  /** Other parent or party name */
  otherParentParty?: string;

  /** Court case number */
  caseNumber?: string;

  // ================== SECTION 4: HEARING INFORMATION (Header) ==================
  /** Date of hearing */
  hearingDate?: string;

  /** Time of hearing */
  hearingTime?: string;

  /** Department or room number for hearing */
  hearingDepartment?: string;

  // ================== ITEM 1: RESTRAINING ORDER INFORMATION ==================
  /** Item 1a: No domestic violence restraining/protective orders in effect */
  item1a_noRestrainingOrder?: boolean;

  /** Item 1b: Domestic violence restraining/protective orders in effect */
  item1b_restrainingOrderActive?: boolean;

  // ================== ITEM 2: CHILD CUSTODY / VISITATION (PARENTING TIME) ==================
  /** Item 2a: I agree with request for child custody */
  item2a_childCustodyAgree?: boolean;

  /** Item 2a: I agree with request for visitation */
  item2a_visitationAgree?: boolean;

  /** Item 2b: I do not agree - child custody */
  item2b_childCustodyDisagree?: boolean;

  /** Item 2b: I do not agree - visitation */
  item2b_visitationDisagree?: boolean;

  /** Item 2b: The orders I am asking the court to make are: */
  item2b_alternativeOrder?: string;

  // ================== ITEM 3: CHILD SUPPORT ==================
  /** Item 3a: I have filed an Income and Expense Declaration (form FL-150) */
  item3a_filedFL150?: boolean;

  /** Item 3b: I agree with the request */
  item3b_agree?: boolean;

  /** Item 3b: I agree the guideline amount is correct */
  item3b_agreeGuideline?: boolean;

  /** Item 3c: I do not agree with the request */
  item3c_disagree?: boolean;

  /** Item 3c: The orders I am asking the court to make are: */
  item3c_alternativeOrder?: string;

  // ================== ITEM 4: SPOUSAL OR DOMESTIC PARTNER SUPPORT ==================
  /** Item 4a: I have filed an Income and Expense Declaration (form FL-150) */
  item4a_filedFL150?: boolean;

  /** Item 4b: I agree with the request */
  item4b_agree?: boolean;

  /** Item 4c: I do not agree with the request */
  item4c_disagree?: boolean;

  /** Item 4c: The orders I am asking the court to make are: */
  item4c_alternativeOrder?: string;

  // ================== ITEM 5: PROPERTY CONTROL ==================
  /** Item 5a: I agree with the request */
  item5a_agree?: boolean;

  /** Item 5b: I do not agree with the request */
  item5b_disagree?: boolean;

  /** Item 5b: The orders I am asking the court to make are: */
  item5b_alternativeOrder?: string;

  // ================== ITEM 6: ATTORNEY'S FEES AND COSTS ==================
  /** Item 6a: I have filed an Income and Expense Declaration (form FL-150) */
  item6a_filedFL150?: boolean;

  /** Item 6a: I have filed a Request for Attorney's Fees and Costs Attachment (form FL-158) */
  item6a_filedFL158?: boolean;

  /** Item 6b: I agree with the request */
  item6b_agree?: boolean;

  /** Item 6c: I do not agree with the request */
  item6c_disagree?: boolean;

  /** Item 6c: The orders I am asking the court to make are: */
  item6c_alternativeOrder?: string;

  // ================== ITEM 7: DOMESTIC VIOLENCE RESTRAINING/PROTECTIVE ORDER ==================
  /** Item 7a: I agree with the request */
  item7a_agree?: boolean;

  /** Item 7b: I do not agree with the request */
  item7b_disagree?: boolean;

  /** Item 7b: The orders I am asking the court to make are: */
  item7b_alternativeOrder?: string;

  // ================== ITEM 8: OTHER ORDERS REQUESTED ==================
  /** Item 8a: I agree with the request */
  item8a_agree?: boolean;

  /** Item 8b: I do not agree with the request */
  item8b_disagree?: boolean;

  /** Item 8b: The orders I am asking the court to make are: */
  item8b_alternativeOrder?: string;

  // ================== ITEM 9: TIME FOR SERVICE OR TIME UNTIL HEARING ==================
  /** Item 9a: I agree with the request */
  item9a_agree?: boolean;

  /** Item 9b: I do not agree with the request */
  item9b_disagree?: boolean;

  /** Item 9b: The orders I am asking the court to make are: */
  item9b_alternativeOrder?: string;

  // ================== ITEM 10: FACTS TO SUPPORT MY REQUEST ==================
  /** Item 10: Facts to support my request for the orders listed above */
  item10_facts?: string;

  /** Item 10: Continued on Attachment 10 */
  item10_continuedOnAttachment?: boolean;

  // ================== SIGNATURE SECTION ==================
  /** I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct */
  declarationUnderPenalty?: boolean;

  /** Date signature was made */
  signatureDate?: string;

  /** Typed or printed name for signature */
  printName?: string;

  /** Name used as the visible signature on the form */
  signatureName?: string;

  /** Electronic or handwritten signature */
  signature?: string;
}

/**
 * Field position on PDF canvas
 */
export interface FieldPosition {
  top: number;
  left: number;
}

/**
 * Record of all field positions by field name
 */
export type FieldPositions = Record<string, FieldPosition>;

/**
 * Field configuration for rendering and navigation
 */
export interface FieldConfig {
  field: keyof FormData;
  label: string;
  type: 'input' | 'textarea' | 'checkbox' | 'date';
  placeholder?: string;
  vaultField?: string; // Maps to personal_info column
  item?: string; // Item number (e.g., "1", "2a", "3c")
  section?: string; // Section name (e.g., "attorney_info", "item2", "signature")
}

/**
 * Field overlay configuration for PDF rendering
 */
export interface FieldOverlay {
  type: 'input' | 'textarea' | 'checkbox' | 'date' | 'signature';
  field: string;
  top: string;
  left: string;
  width?: string;
  height?: string;
  placeholder?: string;
  item?: string;
  section?: string;
}

/**
 * Validation rule types
 */
export type ValidationType = 'required' | 'email' | 'phone' | 'zipCode' | 'pattern' | 'minLength' | 'maxLength' | 'barNumber';

/**
 * Individual validation rule
 */
export interface ValidationRule {
  type: ValidationType;
  message: string;
  value?: string | number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  type: ValidationType;
}

/**
 * Record of validation rules by field name
 */
export type ValidationRules = Record<string, ValidationRule[]>;

/**
 * Record of validation errors by field name
 */
export type ValidationErrors = Record<string, ValidationError[]>;

/**
 * User authentication state
 */
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at?: string;
}

/**
 * Personal vault data from Supabase
 * Maps to personal_info table
 */
export interface PersonalVaultData {
  user_id: string;
  attorney_name?: string;       // Maps to partyName
  bar_number?: string;           // Maps to stateBarNumber
  firm_name?: string;            // Maps to firmName
  street_address?: string;       // Maps to streetAddress
  city?: string;                 // Maps to city
  state?: string;                // Maps to state
  zip_code?: string;             // Maps to zipCode
  telephone_no?: string;         // Maps to telephoneNo
  fax_no?: string;               // Maps to faxNo
  email_address?: string;        // Maps to email
  full_name?: string;            // Alternative to attorney_name for self-represented
  created_at?: string;
  updated_at?: string;
  [key: string]: string | undefined;
}

/**
 * Form sections for organization and navigation
 */
export const FORM_SECTIONS = {
  ATTORNEY_INFO: 'attorney_info',
  COURT_INFO: 'court_info',
  CASE_INFO: 'case_info',
  HEARING_INFO: 'hearing_info',
  ITEM1: 'item1',
  ITEM2: 'item2',
  ITEM3: 'item3',
  ITEM4: 'item4',
  ITEM5: 'item5',
  ITEM6: 'item6',
  ITEM7: 'item7',
  ITEM8: 'item8',
  ITEM9: 'item9',
  ITEM10: 'item10',
  SIGNATURE: 'signature',
} as const;

/**
 * Total field count: 62 fields (updated from database)
 * - Input fields: 23 fields
 * - Checkboxes: 30 fields
 * - Textareas: 9 fields
 */

// ================================================================================================
// DV-100 FORM DATA INTERFACE
// ================================================================================================

/**
 * DV-100 Request for Domestic Violence Restraining Order
 * Based on Official California Judicial Council Form DV-100 (Rev. January 1, 2025)
 * Family Code, § 6200 et seq.
 *
 * This is the primary form for requesting domestic violence restraining orders in California.
 * Total: 34 items across 13 pages
 */
export interface DV100FormData {
  // ================== HEADER: COURT INFORMATION ==================
  /** Superior Court of California, County of */
  courtCounty?: string;

  /** Court street address */
  courtStreetAddress?: string;

  /** Court case number (filled by clerk) */
  caseNumber?: string;

  // ================== ITEM 1: PERSON ASKING FOR PROTECTION ==================
  /** Item 1a: Your name */
  item1a_yourName?: string;

  /** Item 1b: Your age */
  item1b_yourAge?: string;

  /** Item 1c: Address where you can receive court papers */
  item1c_address?: string;

  /** Item 1c: City */
  item1c_city?: string;

  /** Item 1c: State */
  item1c_state?: string;

  /** Item 1c: Zip */
  item1c_zip?: string;

  /** Item 1d: Telephone (optional) */
  item1d_telephone?: string;

  /** Item 1d: Fax (optional) */
  item1d_fax?: string;

  /** Item 1d: Email Address (optional) */
  item1d_email?: string;

  /** Item 1e: Your lawyer's Name */
  item1e_lawyerName?: string;

  /** Item 1e: State Bar No. */
  item1e_stateBarNo?: string;

  /** Item 1e: Firm Name */
  item1e_firmName?: string;

  // ================== ITEM 2: PERSON YOU WANT PROTECTION FROM ==================
  /** Item 2a: Full name */
  item2a_fullName?: string;

  /** Item 2b: Age (estimate if unknown) */
  item2b_age?: string;

  /** Item 2c: Date of birth */
  item2c_dateOfBirth?: string;

  /** Item 2d: Gender - M */
  item2d_genderM?: boolean;

  /** Item 2d: Gender - F */
  item2d_genderF?: boolean;

  /** Item 2d: Gender - Nonbinary */
  item2d_genderNonbinary?: boolean;

  /** Item 2e: Race */
  item2e_race?: string;

  // ================== ITEM 3: YOUR RELATIONSHIP TO PERSON IN 2 ==================
  /** Item 3a: We have a child or children together */
  item3a_haveChildren?: boolean;

  /** Item 3a: Names of children */
  item3a_childrenNames?: string;

  /** Item 3b: We are married or registered domestic partners */
  item3b_married?: boolean;

  /** Item 3c: We used to be married or registered domestic partners */
  item3c_usedToBeMarried?: boolean;

  /** Item 3d: We are dating or used to date */
  item3d_dating?: boolean;

  /** Item 3e: We are or used to be engaged to be married */
  item3e_engaged?: boolean;

  /** Item 3f: We are related */
  item3f_related?: boolean;

  /** Item 3f: Parent, stepparent, or parent-in-law */
  item3f_parent?: boolean;

  /** Item 3f: Brother, sister, sibling, stepsibling, or sibling in-law */
  item3f_sibling?: boolean;

  /** Item 3f: Child, stepchild, or legally adopted child */
  item3f_child?: boolean;

  /** Item 3f: Grandparent, step-grandparent, or grandparent-in-law */
  item3f_grandparent?: boolean;

  /** Item 3f: Child's spouse */
  item3f_childSpouse?: boolean;

  /** Item 3f: Grandchild, step-grandchild, or grandchild-in-law */
  item3f_grandchild?: boolean;

  /** Item 3g: We live together or used to live together */
  item3g_liveTogether?: boolean;

  /** Item 3g: Yes - lived as family/household */
  item3g_asFamily?: boolean;

  /** Item 3g: No - just roommates */
  item3g_justRoommates?: boolean;

  // ================== ITEM 4: OTHER RESTRAINING ORDERS AND COURT CASES ==================
  /** Item 4a: No existing restraining orders */
  item4a_noOrders?: boolean;

  /** Item 4a: Yes, existing restraining orders */
  item4a_yesOrders?: boolean;

  /** Item 4a(1): Date of first order */
  item4a1_dateOfOrder?: string;

  /** Item 4a(1): Date first order expires */
  item4a1_dateExpires?: string;

  /** Item 4a(2): Date of second order */
  item4a2_dateOfOrder?: string;

  /** Item 4a(2): Date second order expires */
  item4a2_dateExpires?: string;

  /** Item 4b: No other court cases */
  item4b_noOtherCases?: boolean;

  /** Item 4b: Yes, other court cases */
  item4b_yesOtherCases?: boolean;

  /** Item 4b: Custody case */
  item4b_custody?: boolean;

  /** Item 4b: Divorce case */
  item4b_divorce?: boolean;

  /** Item 4b: Juvenile case */
  item4b_juvenile?: boolean;

  /** Item 4b: Guardianship case */
  item4b_guardianship?: boolean;

  /** Item 4b: Criminal case */
  item4b_criminal?: boolean;

  /** Item 4b: Other type of case */
  item4b_other?: boolean;

  // ================== ITEM 5: MOST RECENT ABUSE ==================
  /** Item 5a: Date of abuse */
  item5a_dateOfAbuse?: string;

  /** Item 5b: Did anyone else see/hear - I don't know */
  item5b_witnessDontKnow?: boolean;

  /** Item 5b: Did anyone else see/hear - No */
  item5b_witnessNo?: boolean;

  /** Item 5b: Did anyone else see/hear - Yes */
  item5b_witnessYes?: boolean;

  /** Item 5b: If yes, give names */
  item5b_witnessNames?: string;

  /** Item 5c: Use/threaten gun or weapon - No */
  item5c_weaponNo?: boolean;

  /** Item 5c: Use/threaten gun or weapon - Yes */
  item5c_weaponYes?: boolean;

  /** Item 5c: If yes, describe weapon */
  item5c_weaponDescribe?: string;

  /** Item 5d: Cause emotional/physical harm - No */
  item5d_harmNo?: boolean;

  /** Item 5d: Cause emotional/physical harm - Yes */
  item5d_harmYes?: boolean;

  /** Item 5d: If yes, describe harm */
  item5d_harmDescribe?: string;

  /** Item 5e: Did police come - I don't know */
  item5e_policeDontKnow?: boolean;

  /** Item 5e: Did police come - No */
  item5e_policeNo?: boolean;

  /** Item 5e: Did police come - Yes */
  item5e_policeYes?: boolean;

  /** Item 5f: Details about abuse on this day */
  item5f_details?: string;

  /** Item 5g: How often - Just this once */
  item5g_justOnce?: boolean;

  /** Item 5g: How often - 2-5 times */
  item5g_2to5times?: boolean;

  /** Item 5g: How often - Weekly */
  item5g_weekly?: boolean;

  /** Item 5g: How often - Other */
  item5g_other?: boolean;

  /** Item 5g: Dates or estimates */
  item5g_dates?: string;

  // ================== ITEM 6: DIFFERENT TYPE OF ABUSE ==================
  /** Item 6a: Date of abuse */
  item6a_dateOfAbuse?: string;

  /** Item 6b: Witness - I don't know */
  item6b_witnessDontKnow?: boolean;

  /** Item 6b: Witness - No */
  item6b_witnessNo?: boolean;

  /** Item 6b: Witness - Yes */
  item6b_witnessYes?: boolean;

  /** Item 6b: Witness names */
  item6b_witnessNames?: string;

  /** Item 6c: Weapon - No */
  item6c_weaponNo?: boolean;

  /** Item 6c: Weapon - Yes */
  item6c_weaponYes?: boolean;

  /** Item 6c: Weapon description */
  item6c_weaponDescribe?: string;

  /** Item 6d: Harm - No */
  item6d_harmNo?: boolean;

  /** Item 6d: Harm - Yes */
  item6d_harmYes?: boolean;

  /** Item 6d: Harm description */
  item6d_harmDescribe?: string;

  /** Item 6e: Police - I don't know */
  item6e_policeDontKnow?: boolean;

  /** Item 6e: Police - No */
  item6e_policeNo?: boolean;

  /** Item 6e: Police - Yes */
  item6e_policeYes?: boolean;

  /** Item 6f: Details */
  item6f_details?: string;

  /** Item 6g: How often - Just once */
  item6g_justOnce?: boolean;

  /** Item 6g: How often - 2-5 times */
  item6g_2to5times?: boolean;

  /** Item 6g: How often - Weekly */
  item6g_weekly?: boolean;

  /** Item 6g: How often - Other */
  item6g_other?: boolean;

  /** Item 6g: Dates */
  item6g_dates?: string;

  // ================== ITEM 7: OTHER ABUSE ==================
  /** Item 7a: Date of abuse */
  item7a_dateOfAbuse?: string;

  /** Item 7b: Witness - I don't know */
  item7b_witnessDontKnow?: boolean;

  /** Item 7b: Witness - No */
  item7b_witnessNo?: boolean;

  /** Item 7b: Witness - Yes */
  item7b_witnessYes?: boolean;

  /** Item 7b: Witness names */
  item7b_witnessNames?: string;

  /** Item 7c: Weapon - No */
  item7c_weaponNo?: boolean;

  /** Item 7c: Weapon - Yes */
  item7c_weaponYes?: boolean;

  /** Item 7c: Weapon description */
  item7c_weaponDescribe?: string;

  /** Item 7d: Harm - No */
  item7d_harmNo?: boolean;

  /** Item 7d: Harm - Yes */
  item7d_harmYes?: boolean;

  /** Item 7d: Harm description */
  item7d_harmDescribe?: string;

  /** Item 7e: Police - I don't know */
  item7e_policeDontKnow?: boolean;

  /** Item 7e: Police - No */
  item7e_policeNo?: boolean;

  /** Item 7e: Police - Yes */
  item7e_policeYes?: boolean;

  /** Item 7f: Details */
  item7f_details?: string;

  /** Item 7g: How often - Just once */
  item7g_justOnce?: boolean;

  /** Item 7g: How often - 2-5 times */
  item7g_2to5times?: boolean;

  /** Item 7g: How often - Weekly */
  item7g_weekly?: boolean;

  /** Item 7g: How often - Other */
  item7g_other?: boolean;

  /** Item 7g: Dates */
  item7g_dates?: string;

  /** Item 7: Need more space checkbox */
  item7_needMoreSpace?: boolean;

  // ================== ITEM 8: OTHER PROTECTED PEOPLE ==================
  /** Item 8a: No other people need protection */
  item8a_no?: boolean;

  /** Item 8b: Yes, other people need protection */
  item8b_yes?: boolean;

  /** Item 8b(1): Person 1 full name */
  item8b1_person1Name?: string;

  /** Item 8b(1): Person 1 age */
  item8b1_person1Age?: string;

  /** Item 8b(1): Person 1 relationship */
  item8b1_person1Relationship?: string;

  /** Item 8b(1): Person 1 lives with you - Yes */
  item8b1_person1LivesYes?: boolean;

  /** Item 8b(1): Person 1 lives with you - No */
  item8b1_person1LivesNo?: boolean;

  /** Item 8b(1): Person 2 full name */
  item8b1_person2Name?: string;

  /** Item 8b(1): Person 2 age */
  item8b1_person2Age?: string;

  /** Item 8b(1): Person 2 relationship */
  item8b1_person2Relationship?: string;

  /** Item 8b(1): Person 2 lives with you - Yes */
  item8b1_person2LivesYes?: boolean;

  /** Item 8b(1): Person 2 lives with you - No */
  item8b1_person2LivesNo?: boolean;

  /** Item 8b(1): Person 3 full name */
  item8b1_person3Name?: string;

  /** Item 8b(1): Person 3 age */
  item8b1_person3Age?: string;

  /** Item 8b(1): Person 3 relationship */
  item8b1_person3Relationship?: string;

  /** Item 8b(1): Person 3 lives with you - Yes */
  item8b1_person3LivesYes?: boolean;

  /** Item 8b(1): Person 3 lives with you - No */
  item8b1_person3LivesNo?: boolean;

  /** Item 8b(1): Person 4 full name */
  item8b1_person4Name?: string;

  /** Item 8b(1): Person 4 age */
  item8b1_person4Age?: string;

  /** Item 8b(1): Person 4 relationship */
  item8b1_person4Relationship?: string;

  /** Item 8b(1): Person 4 lives with you - Yes */
  item8b1_person4LivesYes?: boolean;

  /** Item 8b(1): Person 4 lives with you - No */
  item8b1_person4LivesNo?: boolean;

  /** Item 8b: Need more people */
  item8b_needMorePeople?: boolean;

  /** Item 8b(2): Why do these people need protection */
  item8b2_whyProtection?: string;

  // ================== ITEM 9: FIREARMS INFORMATION ==================
  /** Item 9a: I don't know about firearms */
  item9a_dontKnow?: boolean;

  /** Item 9b: No firearms */
  item9b_no?: boolean;

  /** Item 9c: Yes, has firearms */
  item9c_yes?: boolean;

  /** Item 9c(1): Firearm 1 description */
  item9c1_describe?: string;

  /** Item 9c(1): Firearm 1 number/amount */
  item9c1_number?: string;

  /** Item 9c(1): Firearm 1 location */
  item9c1_location?: string;

  /** Item 9c(2): Firearm 2 description */
  item9c2_describe?: string;

  /** Item 9c(2): Firearm 2 number/amount */
  item9c2_number?: string;

  /** Item 9c(2): Firearm 2 location */
  item9c2_location?: string;

  /** Item 9c(3): Firearm 3 description */
  item9c3_describe?: string;

  /** Item 9c(3): Firearm 3 number/amount */
  item9c3_number?: string;

  /** Item 9c(3): Firearm 3 location */
  item9c3_location?: string;

  /** Item 9c(4): Firearm 4 description */
  item9c4_describe?: string;

  /** Item 9c(4): Firearm 4 number/amount */
  item9c4_number?: string;

  /** Item 9c(4): Firearm 4 location */
  item9c4_location?: string;

  /** Item 9c(5): Firearm 5 description */
  item9c5_describe?: string;

  /** Item 9c(5): Firearm 5 number/amount */
  item9c5_number?: string;

  /** Item 9c(5): Firearm 5 location */
  item9c5_location?: string;

  /** Item 9c(6): Firearm 6 description */
  item9c6_describe?: string;

  /** Item 9c(6): Firearm 6 number/amount */
  item9c6_number?: string;

  /** Item 9c(6): Firearm 6 location */
  item9c6_location?: string;

  // ================== ITEMS 10-22: ORDERS TO REQUEST ==================
  /** Item 10: Order to Not Abuse */
  item10_orderToNotAbuse?: boolean;

  /** Item 11: No-Contact Order */
  item11_noContact?: boolean;

  /** Item 12: Stay-Away Order */
  item12_stayAway?: boolean;

  /** Item 12a: Stay away from - Me */
  item12a_me?: boolean;

  /** Item 12a: Stay away from - My home */
  item12a_myHome?: boolean;

  /** Item 12a: Stay away from - My job or workplace */
  item12a_myJob?: boolean;

  /** Item 12a: Stay away from - My vehicle */
  item12a_myVehicle?: boolean;

  /** Item 12a: Stay away from - My school */
  item12a_mySchool?: boolean;

  /** Item 12a: Stay away from - Each person in 8 */
  item12a_item8People?: boolean;

  /** Item 12a: Stay away from - My children's school or childcare */
  item12a_childrensSchool?: boolean;

  /** Item 12a: Stay away from - Other */
  item12a_other?: string;

  /** Item 12b: Distance - 100 yards (300 feet) */
  item12b_100yards?: boolean;

  /** Item 12b: Distance - Other */
  item12b_otherDistance?: string;

  /** Item 12c: Live together - No */
  item12c_no?: boolean;

  /** Item 12c: Live together - Yes */
  item12c_yes?: boolean;

  /** Item 12c: Live together */
  item12c_liveTogether?: boolean;

  /** Item 12c: Live in same building */
  item12c_sameBuilding?: boolean;

  /** Item 12c: Live in same neighborhood */
  item12c_sameNeighborhood?: boolean;

  /** Item 12c: Other */
  item12c_other?: string;

  /** Item 12d: Same workplace/school - No */
  item12d_no?: boolean;

  /** Item 12d: Same workplace/school - Yes */
  item12d_yes?: boolean;

  /** Item 12d: Work together at */
  item12d_workTogether?: string;

  /** Item 12d: Go to same school */
  item12d_sameSchool?: string;

  /** Item 12d: Other */
  item12d_other?: string;

  /** Item 13: Order to Move Out */
  item13_moveOut?: boolean;

  /** Item 13a: Address to move out from */
  item13a_address?: string;

  /** Item 13b: I own the home */
  item13b_ownHome?: boolean;

  /** Item 13b: My name is on lease */
  item13b_nameOnLease?: boolean;

  /** Item 13b: I live at address with children */
  item13b_liveWithChildren?: boolean;

  /** Item 13b: Lived for years */
  item13b_livedYears?: string;

  /** Item 13b: Lived for months */
  item13b_livedMonths?: string;

  /** Item 13b: I pay some/all rent or mortgage */
  item13b_payRent?: boolean;

  /** Item 13b: Other reason */
  item13b_other?: string;

  /** Item 14: Other Orders */
  item14_otherOrders?: boolean;

  /** Item 14: Describe additional orders */
  item14_describe?: string;

  /** Item 15: Child Custody and Visitation (requires DV-105) */
  item15_childCustody?: boolean;

  /** Item 16: Protect Animals */
  item16_protectAnimals?: boolean;

  /** Item 16a(1): Animal 1 name/ID */
  item16a1_name?: string;

  /** Item 16a(1): Animal 1 type */
  item16a1_type?: string;

  /** Item 16a(1): Animal 1 breed */
  item16a1_breed?: string;

  /** Item 16a(1): Animal 1 color */
  item16a1_color?: string;

  /** Item 16a(2): Animal 2 name/ID */
  item16a2_name?: string;

  /** Item 16a(2): Animal 2 type */
  item16a2_type?: string;

  /** Item 16a(2): Animal 2 breed */
  item16a2_breed?: string;

  /** Item 16a(2): Animal 2 color */
  item16a2_color?: string;

  /** Item 16a(3): Animal 3 name/ID */
  item16a3_name?: string;

  /** Item 16a(3): Animal 3 type */
  item16a3_type?: string;

  /** Item 16a(3): Animal 3 breed */
  item16a3_breed?: string;

  /** Item 16a(3): Animal 3 color */
  item16a3_color?: string;

  /** Item 16a(4): Animal 4 name/ID */
  item16a4_name?: string;

  /** Item 16a(4): Animal 4 type */
  item16a4_type?: string;

  /** Item 16a(4): Animal 4 breed */
  item16a4_breed?: string;

  /** Item 16a(4): Animal 4 color */
  item16a4_color?: string;

  /** Item 16b(1): Stay away from animals - 100 yards */
  item16b1_stayAway100?: boolean;

  /** Item 16b(1): Stay away from animals - Other distance */
  item16b1_stayAwayOther?: string;

  /** Item 16b(2): Not take, sell, hide, harm animals */
  item16b2_notTakeSellHarm?: boolean;

  /** Item 16b(3): Give me sole possession */
  item16b3_giveMePossession?: boolean;

  /** Item 16b(3): Person abuses animals */
  item16b3_personAbuses?: boolean;

  /** Item 16b(3): I take care of animals */
  item16b3_iTakeCare?: boolean;

  /** Item 16b(3): I purchased animals */
  item16b3_iPurchased?: boolean;

  /** Item 16b(3): Other reason */
  item16b3_other?: string;

  /** Item 17: Control of Property */
  item17_controlProperty?: boolean;

  /** Item 17a: Describe property */
  item17a_describe?: string;

  /** Item 17b: Why you want control */
  item17b_why?: string;

  /** Item 18: Health and Other Insurance */
  item18_insurance?: boolean;

  /** Item 19: Record Communications */
  item19_recordCommunications?: boolean;

  /** Item 20: Property Restraint */
  item20_propertyRestraint?: boolean;

  /** Item 21: Extend Deadline to Serve */
  item21_extendDeadline?: boolean;

  /** Item 21: Explain why need more time */
  item21_explain?: string;

  /** Item 22: Pay Debts */
  item22_payDebts?: boolean;

  /** Item 22a(1): Pay to */
  item22a1_payTo?: string;

  /** Item 22a(1): For */
  item22a1_for?: string;

  /** Item 22a(1): Amount */
  item22a1_amount?: string;

  /** Item 22a(1): Due date */
  item22a1_dueDate?: string;

  /** Item 22a(2): Pay to */
  item22a2_payTo?: string;

  /** Item 22a(2): For */
  item22a2_for?: string;

  /** Item 22a(2): Amount */
  item22a2_amount?: string;

  /** Item 22a(2): Due date */
  item22a2_dueDate?: string;

  /** Item 22a(3): Pay to */
  item22a3_payTo?: string;

  /** Item 22a(3): For */
  item22a3_for?: string;

  /** Item 22a(3): Amount */
  item22a3_amount?: string;

  /** Item 22a(3): Due date */
  item22a3_dueDate?: string;

  /** Item 22: Explain why */
  item22_explainWhy?: string;

  /** Item 22b: Special finding - No */
  item22b_specialFindingNo?: boolean;

  /** Item 22b: Special finding - Yes */
  item22b_specialFindingYes?: boolean;

  /** Item 22b(1): Which debts - a(1) */
  item22b1_a1?: boolean;

  /** Item 22b(1): Which debts - a(2) */
  item22b1_a2?: boolean;

  /** Item 22b(1): Which debts - a(3) */
  item22b1_a3?: boolean;

  /** Item 22b(2): Know how debt made - No */
  item22b2_knowNo?: boolean;

  /** Item 22b(2): Know how debt made - Yes */
  item22b2_knowYes?: boolean;

  /** Item 22b(2): Explanation */
  item22b2_explain?: string;

  // ================== ITEMS 23-26: ORDERS FOR COURT DATE ==================
  /** Item 23: Pay Expenses Caused by Abuse */
  item23_payExpenses?: boolean;

  /** Item 24: Child Support */
  item24_childSupport?: boolean;

  /** Item 24a: No child support order, want one */
  item24a_noOrder?: boolean;

  /** Item 24b: Have child support order, want changed */
  item24b_haveOrder?: boolean;

  /** Item 24c: Receive/applied for TANF/Welfare/CalWORKS */
  item24c_tanf?: boolean;

  /** Item 25: Spousal Support */
  item25_spousalSupport?: boolean;

  /** Item 26: Lawyer's Fees and Costs */
  item26_lawyerFees?: boolean;

  // ================== ITEMS 27-31: AUTOMATIC ORDERS ==================
  /** Item 27: Batterer Intervention Program */
  item27_battererProgram?: boolean;

  /** Item 28: Transfer of Wireless Phone Account */
  item28_wirelessTransfer?: boolean;

  /** Item 28a: My number */
  item28a_myNumber?: boolean;

  /** Item 28a: Number of child in my care */
  item28a_childNumber?: string;

  /** Item 28b: My number */
  item28b_myNumber?: boolean;

  /** Item 28b: Number of child in my care */
  item28b_childNumber?: string;

  /** Item 28c: My number */
  item28c_myNumber?: boolean;

  /** Item 28c: Number of child in my care */
  item28c_childNumber?: string;

  /** Item 28d: My number */
  item28d_myNumber?: boolean;

  /** Item 28d: Number of child in my care */
  item28d_childNumber?: string;

  // Item 29-31 are automatic, no fields needed

  // ================== ITEM 32: ADDITIONAL PAGES ==================
  /** Item 32: Number of extra pages attached */
  item32_additionalPages?: string;

  // ================== ITEM 33: YOUR SIGNATURE ==================
  /** Item 33: Date */
  item33_date?: string;

  /** Item 33: Type or print your name */
  item33_printName?: string;

  /** Item 33: Sign your name */
  item33_signName?: string;

  // ================== ITEM 34: YOUR LAWYER'S SIGNATURE ==================
  /** Item 34: Date */
  item34_date?: string;

  /** Item 34: Lawyer's name */
  item34_lawyerName?: string;

  /** Item 34: Lawyer's signature */
  item34_lawyerSignature?: string;
}

// ================================================================================================
// DV-105 FORM DATA INTERFACE
// ================================================================================================

/**
 * DV-105 Request for Child Custody and Visitation Orders
 * Based on Official California Judicial Council Form DV-105 (Rev. January 1, 2024)
 * Family Code, §§ 3048, 3063, 6323, 6323.5
 *
 * This form is attached to DV-100 for requesting child custody/visitation orders.
 * Total: 13 items across 6 pages
 */
export interface DV105FormData {
  // ================== HEADER ==================
  /** Case Number (from DV-100) */
  caseNumber?: string;

  // ================== ITEM 1: YOUR INFORMATION ==================
  /** Item 1: Name */
  item1_name?: string;

  /** Item 1: Relationship - Parent */
  item1_relationshipParent?: boolean;

  /** Item 1: Relationship - Legal Guardian */
  item1_relationshipGuardian?: boolean;

  /** Item 1: Relationship - Other */
  item1_relationshipOther?: boolean;

  /** Item 1: Relationship - Other describe */
  item1_relationshipOtherDescribe?: string;

  // ================== ITEM 2: PERSON YOU WANT PROTECTION FROM ==================
  /** Item 2: Name */
  item2_name?: string;

  /** Item 2: Relationship - Parent */
  item2_relationshipParent?: boolean;

  /** Item 2: Relationship - Legal Guardian */
  item2_relationshipGuardian?: boolean;

  /** Item 2: Relationship - Other */
  item2_relationshipOther?: boolean;

  /** Item 2: Relationship - Other describe */
  item2_relationshipOtherDescribe?: string;

  // ================== ITEM 3: CHILDREN UNDER 18 YEARS OLD ==================
  /** Item 3a: Child 1 name */
  item3a_name?: string;

  /** Item 3a: Child 1 date of birth */
  item3a_dateOfBirth?: string;

  /** Item 3b: Child 2 name */
  item3b_name?: string;

  /** Item 3b: Child 2 date of birth */
  item3b_dateOfBirth?: string;

  /** Item 3c: Child 3 name */
  item3c_name?: string;

  /** Item 3c: Child 3 date of birth */
  item3c_dateOfBirth?: string;

  /** Item 3d: Child 4 name */
  item3d_name?: string;

  /** Item 3d: Child 4 date of birth */
  item3d_dateOfBirth?: string;

  /** Item 3: Need more space */
  item3_needMoreSpace?: boolean;

  // ================== ITEM 4: CITY AND STATE WHERE CHILDREN LIVED ==================
  /** Item 4a: Children lived together - Yes */
  item4a_yes?: boolean;

  /** Item 4a: Children lived together - No */
  item4a_no?: boolean;

  /** Item 4b: Row 1 - From date */
  item4b_row1_fromDate?: string;

  /** Item 4b: Row 1 - To present */
  item4b_row1_toPresent?: boolean;

  /** Item 4b: Row 1 - Until date */
  item4b_row1_toDate?: string;

  /** Item 4b: Row 1 - Location */
  item4b_row1_location?: string;

  /** Item 4b: Row 1 - Keep private */
  item4b_row1_keepPrivate?: boolean;

  /** Item 4b: Row 1 - With Me */
  item4b_row1_withMe?: boolean;

  /** Item 4b: Row 1 - With Person in 2 */
  item4b_row1_withPerson2?: boolean;

  /** Item 4b: Row 1 - With Other */
  item4b_row1_withOther?: boolean;

  // Repeat for rows 2-7
  /** Item 4b: Row 2 - From date */
  item4b_row2_fromDate?: string;
  item4b_row2_toDate?: string;
  item4b_row2_location?: string;
  item4b_row2_withMe?: boolean;
  item4b_row2_withPerson2?: boolean;
  item4b_row2_withOther?: boolean;

  item4b_row3_fromDate?: string;
  item4b_row3_toDate?: string;
  item4b_row3_location?: string;
  item4b_row3_withMe?: boolean;
  item4b_row3_withPerson2?: boolean;
  item4b_row3_withOther?: boolean;

  item4b_row4_fromDate?: string;
  item4b_row4_toDate?: string;
  item4b_row4_location?: string;
  item4b_row4_withMe?: boolean;
  item4b_row4_withPerson2?: boolean;
  item4b_row4_withOther?: boolean;

  item4b_row5_fromDate?: string;
  item4b_row5_toDate?: string;
  item4b_row5_location?: string;
  item4b_row5_withMe?: boolean;
  item4b_row5_withPerson2?: boolean;
  item4b_row5_withOther?: boolean;

  item4b_row6_fromDate?: string;
  item4b_row6_toDate?: string;
  item4b_row6_location?: string;
  item4b_row6_withMe?: boolean;
  item4b_row6_withPerson2?: boolean;
  item4b_row6_withOther?: boolean;

  item4b_row7_fromDate?: string;
  item4b_row7_toDate?: string;
  item4b_row7_location?: string;
  item4b_row7_withMe?: boolean;
  item4b_row7_withPerson2?: boolean;
  item4b_row7_withOther?: boolean;

  /** Item 4b: Other relationship to child */
  item4b_otherRelationship?: string;

  // ================== ITEM 5: HISTORY OF COURT CASES ==================
  /** Item 5a: No other cases */
  item5a_no?: boolean;

  /** Item 5a: Yes, other cases */
  item5a_yes?: boolean;

  /** Item 5a: Custody */
  item5a_custody?: boolean;

  /** Item 5a: Divorce */
  item5a_divorce?: boolean;

  /** Item 5a: Juvenile Court */
  item5a_juvenile?: boolean;

  /** Item 5a: Guardianship */
  item5a_guardianship?: boolean;

  /** Item 5a: Criminal */
  item5a_criminal?: boolean;

  /** Item 5a: Other */
  item5a_other?: boolean;

  /** Item 5b: No current custody/visitation order */
  item5b_no?: boolean;

  /** Item 5b: Yes, current order exists */
  item5b_yes?: boolean;

  /** Item 5b: What did judge order */
  item5b_currentOrder?: string;

  /** Item 5b: Why change order */
  item5b_whyChange?: string;

  /** Item 5c: Other parent/guardian name */
  item5c_name?: string;

  /** Item 5c: Parent */
  item5c_parent?: boolean;

  /** Item 5c: Legal Guardian */
  item5c_legalGuardian?: boolean;

  // ================== ITEM 6: LIMIT TRAVEL ==================
  /** Item 6: No - don't limit travel */
  item6_no?: boolean;

  /** Item 6: Yes - limit travel */
  item6_yes?: boolean;

  /** Item 6: The county of */
  item6_county?: boolean;

  /** Item 6: County name */
  item6_countyName?: string;

  /** Item 6: California */
  item6_california?: boolean;

  /** Item 6: Other places */
  item6_otherPlaces?: boolean;

  /** Item 6: Other places describe */
  item6_otherPlacesDescribe?: string;

  // ================== ITEM 7: ACCESS TO CHILDREN'S RECORDS ==================
  /** Item 7: Yes - allow access */
  item7_yes?: boolean;

  /** Item 7: No - do not allow access */
  item7_no?: boolean;

  /** Item 7a: All children */
  item7a_allChildren?: boolean;

  /** Item 7a: Only these children */
  item7a_onlyThese?: boolean;

  /** Item 7a: Names */
  item7a_names?: string;

  /** Item 7b: Medical, dental, mental health */
  item7b_medical?: boolean;

  /** Item 7b: School and daycare */
  item7b_school?: boolean;

  /** Item 7b: Extracurricular activity */
  item7b_extracurricular?: boolean;

  /** Item 7b: Child's employment */
  item7b_employment?: boolean;

  /** Item 7b: Other */
  item7b_other?: boolean;

  /** Item 7b: Other describe */
  item7b_otherDescribe?: string;

  // ================== ITEM 8: RISK OF ABDUCTION ==================
  /** Item 8: No - no risk */
  item8_no?: boolean;

  /** Item 8: Yes - risk of abduction (requires DV-108) */
  item8_yes?: boolean;

  // ================== ITEM 9: CHILD CUSTODY ==================
  /** Item 9: No - don't want custody orders */
  item9_no?: boolean;

  /** Item 9: Yes - want custody orders */
  item9_yes?: boolean;

  /** Item 9: Legal custody - Sole to me */
  item9_legalSoleToMe?: boolean;

  /** Item 9: Legal custody - Sole to person in 2 */
  item9_legalSoleToPerson2?: boolean;

  /** Item 9: Legal custody - Jointly */
  item9_legalJoint?: boolean;

  /** Item 9: Legal custody - Other */
  item9_legalOther?: boolean;

  /** Item 9: Legal custody - Other describe */
  item9_legalOtherDescribe?: string;

  /** Item 9: Physical custody - Sole to me */
  item9_physicalSoleToMe?: boolean;

  /** Item 9: Physical custody - Sole to person in 2 */
  item9_physicalSoleToPerson2?: boolean;

  /** Item 9: Physical custody - Jointly */
  item9_physicalJoint?: boolean;

  /** Item 9: Physical custody - Other */
  item9_physicalOther?: boolean;

  /** Item 9: Physical custody - Other describe */
  item9_physicalOtherDescribe?: string;

  // ================== ITEM 10: VISITATION DECISION ==================
  /** Item 10: No - no visits */
  item10_no?: boolean;

  /** Item 10: Yes - allow visits */
  item10_yes?: boolean;

  // ================== ITEM 11: SUPERVISED VS UNSUPERVISED ==================
  /** Item 11: Yes - supervised visits */
  item11_yes?: boolean;

  /** Item 11: No - unsupervised visits */
  item11_no?: boolean;

  // ================== ITEM 12: DETAILS OF SUPERVISED VISITS ==================
  /** Item 12a: Nonprofessional supervisor */
  item12a_nonprofessional?: boolean;

  /** Item 12a: Nonprofessional name */
  item12a_nonprofessionalName?: string;

  /** Item 12a: Professional supervisor */
  item12a_professional?: boolean;

  /** Item 12a: Professional name */
  item12a_professionalName?: string;

  /** Item 12a: Professional fees - Me % */
  item12a_feesMe?: string;

  /** Item 12a: Professional fees - Person in 2 % */
  item12a_feesPerson2?: string;

  /** Item 12a: Professional fees - Other % */
  item12a_feesOther?: string;

  /** Item 12b: Once a week */
  item12b_onceWeek?: boolean;

  /** Item 12b: Once a week hours */
  item12b_onceWeekHours?: string;

  /** Item 12b: Twice a week */
  item12b_twiceWeek?: boolean;

  /** Item 12b: Twice a week hours */
  item12b_twiceWeekHours?: string;

  /** Item 12b: Other */
  item12b_other?: boolean;

  /** Item 12b: Other describe */
  item12b_otherDescribe?: string;

  /** Item 12b: Use chart */
  item12b_useChart?: boolean;

  // Schedule table fields
  /** Item 12: Monday start */
  item12_mondayStart?: string;
  item12_mondayEnd?: string;
  item12_mondayPerson?: string;
  item12_mondayLocation?: string;

  item12_tuesdayStart?: string;
  item12_tuesdayEnd?: string;
  item12_tuesdayPerson?: string;
  item12_tuesdayLocation?: string;

  item12_wednesdayStart?: string;
  item12_wednesdayEnd?: string;
  item12_wednesdayPerson?: string;
  item12_wednesdayLocation?: string;

  item12_thursdayStart?: string;
  item12_thursdayEnd?: string;
  item12_thursdayPerson?: string;
  item12_thursdayLocation?: string;

  item12_fridayStart?: string;
  item12_fridayEnd?: string;
  item12_fridayPerson?: string;
  item12_fridayLocation?: string;

  item12_saturdayStart?: string;
  item12_saturdayEnd?: string;
  item12_saturdayPerson?: string;
  item12_saturdayLocation?: string;

  item12_sundayStart?: string;
  item12_sundayEnd?: string;
  item12_sundayPerson?: string;
  item12_sundayLocation?: string;

  /** Item 12: Every week */
  item12_everyWeek?: boolean;

  /** Item 12: Every other week */
  item12_everyOtherWeek?: boolean;

  /** Item 12: Other schedule */
  item12_otherSchedule?: string;

  /** Item 12: Start date */
  item12_startDate?: string;

  // ================== ITEM 13: DETAILS OF UNSUPERVISED VISITS ==================
  /** Item 13a: No supervised exchanges */
  item13a_no?: boolean;

  /** Item 13a: Yes supervised exchanges */
  item13a_yes?: boolean;

  /** Item 13a: Nonprofessional supervisor */
  item13a_nonprofessional?: boolean;

  /** Item 13a: Nonprofessional name */
  item13a_nonprofessionalName?: string;

  /** Item 13a: Professional supervisor */
  item13a_professional?: boolean;

  /** Item 13a: Professional name */
  item13a_professionalName?: string;

  /** Item 13a: Professional fees - Me % */
  item13a_feesMe?: string;

  /** Item 13a: Professional fees - Person in 2 % */
  item13a_feesPerson2?: string;

  /** Item 13a: Professional fees - Other % */
  item13a_feesOther?: string;

  /** Item 13b: Describe parenting time */
  item13b_describe?: string;

  // Schedule table fields (same structure as Item 12)
  item13_mondayStart?: string;
  item13_mondayEnd?: string;
  item13_mondayPerson?: string;
  item13_mondayLocation?: string;

  item13_tuesdayStart?: string;
  item13_tuesdayEnd?: string;
  item13_tuesdayPerson?: string;
  item13_tuesdayLocation?: string;

  item13_wednesdayStart?: string;
  item13_wednesdayEnd?: string;
  item13_wednesdayPerson?: string;
  item13_wednesdayLocation?: string;

  item13_thursdayStart?: string;
  item13_thursdayEnd?: string;
  item13_thursdayPerson?: string;
  item13_thursdayLocation?: string;

  item13_fridayStart?: string;
  item13_fridayEnd?: string;
  item13_fridayPerson?: string;
  item13_fridayLocation?: string;

  item13_saturdayStart?: string;
  item13_saturdayEnd?: string;
  item13_saturdayPerson?: string;
  item13_saturdayLocation?: string;

  item13_sundayStart?: string;
  item13_sundayEnd?: string;
  item13_sundayPerson?: string;
  item13_sundayLocation?: string;

  item13_everyWeek?: boolean;
  item13_everyOtherWeek?: boolean;
  item13_otherSchedule?: string;
  item13_startDate?: string;
}
