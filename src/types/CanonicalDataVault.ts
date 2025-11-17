/**
 * Canonical Personal Data Vault
 *
 * "Passpartout" - The master key that unlocks every form.
 *
 * This schema represents the absolute source of truth for a user's personal information.
 * Once populated, it enables 70-95% auto-fill rates across all legal forms.
 *
 * Data sources:
 * - Manual entry via Personal Data Vault Panel
 * - Voice conversation extraction (Gemini 2.5 Flash)
 * - Document scanning (Mistral OCR)
 * - Form field extraction (copying from previously filled forms)
 * - Opposing counsel filings (extracting their information)
 */

// Data provenance tracking
export interface DataProvenance {
  source: 'manual_entry' | 'voice_conversation' | 'document_scan' | 'form_extraction' | 'opposing_counsel';
  confidence: number; // 0.0 - 1.0
  verifiedByUser: boolean;
  lastUpdated: string; // ISO 8601 timestamp
  documentId?: string; // Reference to source document if applicable
  extractionMetadata?: {
    documentType?: string;
    pageNumber?: number;
    fieldName?: string;
  };
}

// Address structure (used in multiple places)
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string; // 2-letter state code
  zipCode: string;
  county?: string;
  country?: string; // Defaults to 'US'
  residenceSince?: string; // ISO 8601 date
}

// Phone number structure
export interface PhoneNumbers {
  mobile?: string; // Format: (XXX) XXX-XXXX
  home?: string;
  work?: string;
  fax?: string;
}

// Email structure
export interface EmailAddresses {
  primary: string;
  secondary?: string;
  work?: string;
}

// Person information (reusable)
export interface PersonInfo {
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  suffix?: string; // Jr., Sr., III, etc.
  preferredName?: string;
  maidenName?: string;
  dateOfBirth?: string; // ISO 8601 date
  sex?: 'M' | 'F' | 'X';
  socialSecurityNumber?: string; // Encrypted at rest
  address?: Address;
  phoneNumbers?: PhoneNumbers;
  emailAddresses?: EmailAddresses;
}

// Child information
export interface ChildInfo {
  id: string; // UUID
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  dateOfBirth: string; // ISO 8601 date
  sex?: 'M' | 'F' | 'X';
  birthplace?: {
    city: string;
    state: string;
    country?: string;
  };
  currentAddress?: Address;
  livesWith?: 'petitioner' | 'respondent' | 'other';
  livesWithOtherDetails?: string;
  schoolInfo?: {
    name: string;
    address?: Address;
    grade?: string;
  };
  medicalInfo?: {
    healthInsuranceProvider?: string;
    policyNumber?: string;
    primaryCarePhysician?: string;
  };
  specialNeeds?: string;
  custody?: {
    legalCustody?: 'joint' | 'petitioner_sole' | 'respondent_sole' | 'other';
    physicalCustody?: 'joint' | 'petitioner_primary' | 'respondent_primary' | 'other';
    visitationSchedule?: string;
  };
}

// Employment information
export interface EmploymentInfo {
  status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student' | 'disabled';
  employer?: {
    name: string;
    address?: Address;
    phoneNumber?: string;
    supervisor?: string;
  };
  occupation?: string;
  annualIncome?: number;
  monthlyIncome?: number;
  startDate?: string; // ISO 8601 date
  paymentFrequency?: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
}

// Identification documents
export interface IdentificationDocuments {
  driversLicense?: {
    number: string;
    state: string;
    expirationDate: string; // ISO 8601 date
    issueDate?: string;
    class?: string; // License class (C, M, etc.)
    height?: string;
    weight?: string;
    eyeColor?: string;
    hairColor?: string;
    organDonor?: boolean;
  };
  passport?: {
    number: string;
    country: string; // Defaults to 'US'
    expirationDate: string; // ISO 8601 date
    issueDate?: string;
    placeOfBirth?: {
      city: string;
      state?: string;
      country: string;
    };
  };
  stateId?: {
    number: string;
    state: string;
    expirationDate: string;
    issueDate?: string;
  };
}

// Legal case information
export interface LegalCaseInfo {
  caseNumber: string;
  caseType: 'divorce' | 'custody' | 'domestic_violence' | 'support' | 'paternity' | 'other';
  caseTypeOther?: string;
  filingDate?: string; // ISO 8601 date
  status?: 'pending' | 'active' | 'closed' | 'appealed';
  court: {
    name: string;
    county: string;
    state: string;
    address: Address;
    phoneNumber: string;
    faxNumber?: string;
    department?: string;
    division?: string;
    judge?: string;
  };
  parties: {
    petitioner: PersonInfo;
    respondent: PersonInfo;
    children?: ChildInfo[];
    otherParties?: PersonInfo[];
  };
  opposingCounsel?: {
    name: string;
    barNumber: string;
    firmName?: string;
    address: Address;
    phoneNumbers: PhoneNumbers;
    emailAddresses: EmailAddresses;
    faxNumber?: string;
  };
  yourAttorney?: {
    name: string;
    barNumber: string;
    firmName?: string;
    address: Address;
    phoneNumbers: PhoneNumbers;
    emailAddresses: EmailAddresses;
    faxNumber?: string;
  };
  restrainingOrders?: {
    active: boolean;
    type?: 'domestic_violence' | 'civil_harassment' | 'elder_abuse' | 'other';
    expirationDate?: string; // ISO 8601 date
    caseNumber?: string;
    issuingCourt?: string;
  }[];
  priorOrders?: {
    custody?: boolean;
    visitation?: boolean;
    support?: boolean;
    propertyDivision?: boolean;
    restrainingOrder?: boolean;
    other?: string;
  };
}

// Financial information
export interface FinancialInfo {
  income: {
    employment?: EmploymentInfo;
    selfEmployment?: {
      businessName: string;
      businessType: string;
      monthlyGrossIncome: number;
      monthlyExpenses: number;
      netIncome: number;
    };
    rentalIncome?: number;
    socialSecurity?: number;
    disability?: number;
    unemployment?: number;
    pension?: number;
    other?: {
      source: string;
      amount: number;
    }[];
    totalMonthlyIncome: number;
  };
  assets?: {
    realProperty?: {
      address: Address;
      estimatedValue: number;
      mortgage?: number;
      equity: number;
    }[];
    vehicles?: {
      make: string;
      model: string;
      year: number;
      estimatedValue: number;
      loanBalance?: number;
    }[];
    bankAccounts?: {
      institution: string;
      accountType: 'checking' | 'savings' | 'investment' | 'retirement';
      balance: number;
    }[];
    totalAssets: number;
  };
  debts?: {
    creditCards?: {
      creditor: string;
      balance: number;
      monthlyPayment: number;
    }[];
    loans?: {
      lender: string;
      type: string;
      balance: number;
      monthlyPayment: number;
    }[];
    totalDebts: number;
  };
}

/**
 * Canonical Personal Data Vault
 *
 * The complete schema representing all extractable user data.
 */
export interface CanonicalDataVault {
  id: string; // UUID - unique vault ID
  userId: string; // Supabase user ID

  // Core identity
  personalInfo: PersonInfo;

  // Contact information
  contactInfo: {
    currentAddress: Address;
    mailingAddress?: Address; // If different from current
    phoneNumbers: PhoneNumbers;
    emailAddresses: EmailAddresses;
  };

  // Identification
  identificationDocuments?: IdentificationDocuments;

  // Employment
  employment?: EmploymentInfo;

  // Financial (sensitive - encrypted at rest)
  financial?: FinancialInfo;

  // Legal cases (can have multiple ongoing cases)
  legalCases?: {
    [caseId: string]: LegalCaseInfo;
  };

  // Relationships (ex-spouse, children, etc.)
  relationships?: {
    spouse?: PersonInfo;
    exSpouse?: PersonInfo;
    children?: ChildInfo[];
    otherRelationships?: {
      relationship: string; // e.g., "domestic partner", "guardian", etc.
      person: PersonInfo;
    }[];
  };

  // Data provenance for every field (enables confidence tracking)
  dataProvenance: {
    [fieldPath: string]: DataProvenance; // e.g., "personalInfo.legalFirstName"
  };

  // Metadata
  metadata: {
    createdAt: string; // ISO 8601 timestamp
    updatedAt: string; // ISO 8601 timestamp
    completeness: number; // 0.0 - 1.0 (percentage of filled fields)
    documentsScanned: number; // Count of documents used to populate vault
    voiceConversationsCompleted: number; // Count of voice sessions
    autofillUsageCount: number; // How many times auto-fill was used
    timeSavedMinutes: number; // Estimated time saved via auto-fill
  };
}

// Database table structure for Supabase
export interface CanonicalDataVaultRow {
  id: string; // UUID
  user_id: string; // Foreign key to auth.users
  personal_info: PersonInfo;
  contact_info: {
    currentAddress: Address;
    mailingAddress?: Address;
    phoneNumbers: PhoneNumbers;
    emailAddresses: EmailAddresses;
  };
  identification_documents?: IdentificationDocuments;
  employment?: EmploymentInfo;
  financial?: FinancialInfo;
  legal_cases?: {
    [caseId: string]: LegalCaseInfo;
  };
  relationships?: {
    spouse?: PersonInfo;
    exSpouse?: PersonInfo;
    children?: ChildInfo[];
    otherRelationships?: {
      relationship: string;
      person: PersonInfo;
    }[];
  };
  data_provenance: {
    [fieldPath: string]: DataProvenance;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    completeness: number;
    documentsScanned: number;
    voiceConversationsCompleted: number;
    autofillUsageCount: number;
    timeSavedMinutes: number;
  };
  created_at: string; // Database timestamp
  updated_at: string; // Database timestamp
}
