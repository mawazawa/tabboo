# SwiftFill: Complete TRO/DVRO/CHRO Guided Workflow Architecture

## Vision Statement (November 2025)

**"From courthouse steps to filed restraining order in minutes. One website. Complete guidance. Peace of mind."**

A self-represented litigant (SRL) in Los Angeles should:
1. Hear about SwiftFill
2. Visit the website
3. Experience **100% guided workflow** - "Tab through their entire filing"
4. Upload documents or connect bank accounts
5. Have all forms auto-populated from a **Canonical Personal Data Vault**
6. Review, verify, and export court-ready PDFs
7. Walk into the courthouse with complete packet ready to file

**Key Principle**: Data flows **always** through the Canonical Vault:
```
Form A → Vault (source of truth) → Form B/C/D
         ↓
    Upload documents, bank accounts, voice input, etc.
    Everything extraction points → Vault
    All forms pull from Vault
```

## Architecture Overview

### Core Components

#### 1. **Canonical Personal Data Vault** (✅ Exists: `src/types/CanonicalDataVault.ts`)
- **Purpose**: Single source of truth for user's personal information
- **Auto-fill rate**: 70-95% across all legal forms
- **Data sources**:
  - Manual entry via Vault Panel
  - Voice conversation extraction (Gemini Flash 2.5)
  - Document scanning (Mistral OCR)
  - Form field extraction (copy from one form → vault)
  - Opposing counsel filings extraction
  - Bank account data (Plaid integration)
- **Encryption**: AES-256-GCM for PII (SSN, financial data)

#### 2. **TRO Workflow State Machine** (✅ Exists: `src/hooks/useTROWorkflow.ts`)
- **Purpose**: Guide users through multi-form packet completion
- **States**: 18 workflow states (NOT_STARTED → FILED)
- **Packet types**:
  - `INITIATING_WITH_CHILDREN`: DV-100 + CLETS-001 + DV-105 + FL-150 (optional)
  - `INITIATING_WITHOUT_CHILDREN`: DV-100 + CLETS-001 + FL-150 (optional)
  - `RESPONSE`: DV-120 + FL-150 + FL-320 (response forms)
  - `MODIFICATION`: Modify existing order
- **Form dependencies**: Ensures proper sequencing (e.g., can't skip DV-100 before CLETS)

#### 3. **Form Rendering Engine** (✅ Exists: `src/components/FormViewer.tsx`)
- **Purpose**: Display and edit forms with real-time field population
- **Features**:
  - PDF-based form overlays (position-based field injection)
  - Real-time field synchronization with workflow state
  - Auto-fill from Canonical Vault
  - Drag-to-reposition fields (edit mode)
  - Font size adjustment (8pt-16pt)
  - Field validation with error highlighting

#### 4. **Guided Workflow UI** (⚠️ Partial: `src/components/TROWorkflowWizard.tsx`)
- **Status**: Component structure exists, needs UI refinement
- **Components**:
  - `PacketTypeSelector`: Choose TRO/DVRO/CHRO type
  - `WorkflowProgressBar`: Visual progress tracking
  - `FormStepIndicator`: Current form in sequence
  - `WorkflowNavigationButtons`: Next/Previous/Save/Submit
- **Missing**: Comprehensive guided flow UI with onboarding

### Supported Form Types

| Form | Type | Status | Pages | Fields | Required For |
|------|------|--------|-------|--------|--------------|
| DV-100 | Request for DVRO | ✅ Complete | 4 | 70+ | All TRO packets |
| DV-101 | Description of Abuse | ⚠️ Mapped | 2 | 40+ | Long narrative (optional) |
| DV-105 | Child Custody/Visitation | ✅ Complete | 6 | 466 | Packets with children |
| DV-109 | Notice of Hearing | ✅ Downloaded | 1 | 30+ | All packets |
| DV-110 | Temp Restraining Order | ✅ Downloaded | 2 | 50+ | Court clerk (auto-generated) |
| DV-120 | Response to DVRO | ✅ Mapped | 4 | 60+ | Respondent response |
| CLETS-001 | Law Enforcement Data | ✅ Downloaded | 2 | 50+ | All initial filings |
| FL-150 | Income/Expense Declaration | ✅ Mapped | 6 | 80+ | Support requests |
| FL-320 | Responsive Declaration | ✅ Complete | 4 | 50+ | Response packets |

### Database Schema

```sql
-- User's Canonical Data Vault (source of truth)
personal_data_vault {
  id: uuid,
  user_id: uuid (RLS),
  protected_person: PersonInfo,
  restrained_person: PersonInfo,
  children: ChildInfo[],
  address_history: Address[],
  income_sources: IncomeSource[],
  assets: Asset[],
  debts: Debt[],
  employment_history: EmploymentHistory[],
  relationship_history: RelationshipHistory[],
  abuse_narrative: AbuseSummary,
  metadata: {
    lastUpdated: timestamp,
    dataCompleteness: 0-100,
    extractionSources: string[]
  }
}

-- Active TRO workflow tracking
tro_workflows {
  id: uuid,
  user_id: uuid (RLS),
  packet_type: 'initiating_with_children' | 'initiating_no_children' | 'response',
  current_state: WorkflowState,
  form_statuses: FormStatuses,
  packet_config: PacketConfig,
  form_data_refs: { FormType → document_id },
  metadata: {
    completionPercentage: 0-100,
    estimatedTimeRemaining: minutes,
    validationErrors: ValidationError[]
  }
}

-- Individual form data (linked to workflow)
legal_documents {
  id: uuid,
  user_id: uuid (RLS),
  workflow_id: uuid,
  form_type: FormType,
  title: string,
  content: jsonb (form field values),
  status: 'draft' | 'in_progress' | 'complete' | 'validated' | 'filed',
  metadata: {
    fieldPositions: { fieldName → {top, left} },
    validationRules: Rule[],
    dependencies: DependentForm[]
  }
}

-- Document uploads for OCR extraction
vault_documents {
  id: uuid,
  user_id: uuid (RLS),
  document_type: 'driver_license' | 'tax_form' | 'proof_of_income' | 'court_order' | 'police_report',
  file_path: string (S3),
  sha256_hash: string (deduplication),
  extracted_data: jsonb (Mistral OCR → fields),
  confidence_score: 0.0-1.0,
  extraction_timestamp: timestamp,
  verified_by_user: boolean
}
```

## Implementation Roadmap (Prioritized)

### Phase 1: Core Workflow UI (Current Sprint)

**Goal**: Make the wizard component work end-to-end with proper guided flow

1. **Enhance TROWorkflowWizard Component**
   - Add visual progress tracker (e.g., "Step 3 of 8")
   - Show form completion status (green checkmark when done)
   - Display estimated time remaining
   - Add intro/onboarding screen explaining TRO vs DVRO vs CHRO
   - Show current form name and purpose

2. **Implement Packet Type Intelligence**
   - Smart detection: Does user mention children? → Recommend INITIATING_WITH_CHILDREN
   - Questionnaire: "Do you need support?" → Include FL-150
   - Case number check: "Existing case?" → Include DV-101 for amendment

3. **Form Rendering per Workflow State**
   - When state = `DV100_IN_PROGRESS` → Render DV-100 form
   - When state = `CLETS_IN_PROGRESS` → Render CLETS-001
   - Support all 9 form types in the workflow

4. **Auto-fill from Vault**
   - Before rendering each form, populate fields from `personal_data_vault`
   - Visual indicator when field is auto-filled vs manual entry
   - Allow user to override auto-filled values

### Phase 2: Document Upload & OCR (Next Week)

**Goal**: Extract data from documents → Vault → Forms

1. **Document Upload Panel**
   - Accept: Driver's license, tax forms, bank statements, court orders, police reports
   - File validation: Size limits, format checks
   - Progress indicator: "Analyzing document..."

2. **Mistral OCR Integration**
   - Extract text from uploaded documents
   - Map OCR fields to Vault schema automatically
   - Confidence scoring (0.0-1.0) for extracted fields
   - User verification step: Review extracted data before saving

3. **OCR → Vault Pipeline**
   ```
   Upload PDF
       ↓
   Mistral OCR (mistral-ocr-latest)
       ↓
   Extract { firstName, lastName, address, ... }
       ↓
   Map to CanonicalDataVault schema
       ↓
   Save with confidence score & provenance
       ↓
   Auto-fill all forms from updated Vault
   ```

### Phase 3: Plaid Integration (Week 2)

**Goal**: Connect bank accounts for automatic financial data extraction

1. **Plaid Link Component**
   - User clicks "Connect Bank Account"
   - Plaid modal opens
   - Returns access token to our backend

2. **Backend Processing**
   - Query recent transactions
   - Extract income sources (recurring deposits)
   - Extract debts (recurring payments)
   - Calculate monthly expenses

3. **Vault Population**
   - Save to `income_sources`, `assets`, `debts`
   - Auto-populate FL-150 (Income/Expense Declaration)
   - Show user: "We found $X/month income, $Y/month expenses"

### Phase 4: Form Review & Validation (Week 3)

**Goal**: Ensure all data is correct before filing

1. **Multi-form Review Page**
   - Display all forms in packet side-by-side
   - Highlight fields that differ between forms (potential conflicts)
   - Show validation status for each form (✅ complete, ⚠️ warnings)

2. **Consistency Checks**
   - Same party name across all forms? ✓
   - Same address in DV-100 and CLETS? ✓
   - Children in DV-100 match DV-105 roster? ✓
   - Income/expense values consistent with FL-150?

3. **Edit Capabilities**
   - "Edit this form" button → Return to form view
   - Changes propagate to all linked forms
   - Update Vault when user makes changes

### Phase 5: Export & Filing (Week 4)

**Goal**: Generate court-ready PDFs ready for courthouse submission

1. **PDF Generation**
   - Flatten forms (remove interactive elements)
   - Verify all required fields are filled
   - Add signature lines (user can print + sign)
   - Create multi-page PDF with all forms in correct order

2. **Print-to-File**
   - Generate complete packet (DV-100 + CLETS + DV-105 + etc.)
   - Add cover sheet with filing instructions for LA Superior Court
   - Include checklist of required copies (original + 2 copies for most courts)

3. **E-filing Integration (if available)**
   - Check if LA Superior Court has online filing portal
   - If available, integrate direct filing with digital signature

## Key Implementation Details

### Auto-fill Algorithm

```typescript
// When rendering form with current state = DV100_IN_PROGRESS
const populateFormFields = (formType: 'DV-100', vault: CanonicalDataVault) => {
  return {
    'protected_person_name': vault.protected_person.legalFirstName + ' ' + vault.protected_person.legalLastName,
    'protected_person_dob': vault.protected_person.dateOfBirth,
    'protected_person_address': vault.protected_person.address.street1 + ', ' + vault.protected_person.address.city,
    'restrained_person_name': vault.restrained_person.legalFirstName + ' ' + vault.restrained_person.legalLastName,
    'restrained_person_dob': vault.restrained_person.dateOfBirth,
    'case_number': vault.caseNumber || '',
    'county': vault.county || 'Los Angeles',
    // ... 60+ more fields auto-populated
  };
};
```

### Form Dependency Graph

```
DV-100 (Required)
  ├── CLETS-001 (Required, depends on DV-100)
  ├── DV-105 (Conditional, if hasChildren)
  ├── FL-150 (Conditional, if requestingSupport)
  └── DV-101 (Optional, if needMoreSpace)

Response Packet:
DV-120 (Required for response)
  ├── FL-320 (Optional, if contesting terms)
  └── FL-150 (Conditional, if contesting support)
```

### User Experience Flow

```
1. Landing: "File a Restraining Order"
   ↓
2. Question: "What type? TRO / DVRO / CHRO?"
   ↓
3. Setup: "Tell us about your situation"
   - Do you have children? [Yes/No]
   - Do you need support? [Yes/No]
   - Have you filed before? [Yes/No]
   ↓
4. Personal Vault: "Let's populate your information"
   - Enter manually OR
   - Upload documents (OCR extraction) OR
   - Connect bank account (Plaid)
   ↓
5. Form Sequence: [Progress: 1 of 8]
   - DV-100: Request for Order (auto-filled 70%)
   - CLETS-001: Law Enforcement Data (auto-filled 80%)
   - DV-105: Child Custody (if applicable, auto-filled 85%)
   - FL-150: Income/Expense (if applicable, auto-filled from Plaid)
   ↓
6. Review: "Verify everything is correct"
   - Check for conflicts
   - Edit if needed
   ↓
7. Export: "Ready to file!"
   - Download PDF packet
   - Print-and-sign or digital signature
   - Instructions for courthouse submission
```

## Technical Stack

- **Frontend**: React 18, TypeScript 5, Vite 5
- **State Management**: React Query (@tanstack/react-query)
- **Form Handling**: react-hook-form, Zod validation
- **PDF**: react-pdf, PDF.js
- **Backend**: Supabase (PostgreSQL, Row-Level Security)
- **AI/Extraction**:
  - Mistral OCR (mistral-ocr-latest for document extraction)
  - Gemini Flash 2.5 (voice conversation extraction)
  - Groq Llama 3.3 (chat assistance)
- **Financial**: Plaid API
- **Design**: Liquid Justice Design System, shadcn/ui, Tailwind CSS

## Success Metrics

- **Completion Rate**: 95%+ of users complete full packet
- **Time to Complete**: < 15 minutes for repeat users, < 30 minutes first-time
- **Auto-fill Rate**: 75%+ fields auto-populated from Vault
- **User Satisfaction**: 4.5+ stars from SRLs
- **Form Accuracy**: <1% error rate in filed packets
- **Mobile Usability**: 80%+ users complete on mobile (courthouse filing)

## Database Setup

```bash
# Run migrations
npx supabase db push

# Deploy edge functions
npx supabase functions deploy mistral-ocr-extraction
npx supabase functions deploy plaid-webhook

# Set environment variables
npx supabase secrets set MISTRAL_API_KEY=...
npx supabase secrets set PLAID_CLIENT_ID=...
npx supabase secrets set PLAID_SECRET=...
```

## Next Steps (Immediate Action Items)

1. ✅ Download all CA court forms → `/public/` [DONE]
2. ⚠️ Enhance TROWorkflowWizard UI with guided flow
3. ⚠️ Implement form rendering per workflow state
4. ⚠️ Connect auto-fill from Canonical Vault
5. ⚠️ Build OCR extraction pipeline
6. ⚠️ Add Plaid integration
7. ⚠️ Create multi-form review interface
8. ⚠️ Generate court-ready PDFs
9. ⚠️ Test end-to-end workflow
10. ⚠️ Deploy to production

---

**Last Updated**: November 21, 2025
**Status**: Phase 1 (Core Workflow UI) - Ready to implement
**Owner**: Mathieu Wauters
