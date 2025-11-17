# TRO Packet Workflow Design

**Version**: 1.0
**Date**: November 17, 2025
**Author**: Agent 2 - Workflow Engine
**Status**: Design Complete - Ready for Implementation

---

## Executive Summary

This document defines the multi-form workflow engine for SwiftFill's TRO (Temporary Restraining Order) packet system. The workflow guides users through completing all required California Judicial Council forms for filing a domestic violence restraining order with Los Angeles Superior Court.

---

## Workflow Overview

### Packet Types Supported

**Type 1: TRO Without Children (Simplified)**
- DV-100 (Request for Domestic Violence Restraining Order)
- CLETS-001 (Confidential CLETS Information)
- FL-150 (Income and Expense Declaration) - if requesting support
- DV-101 (Description of Abuse) - optional

**Type 2: TRO With Children (Full Packet)**
- DV-100 (Request for Domestic Violence Restraining Order)
- CLETS-001 (Confidential CLETS Information)
- DV-105 (Request for Child Custody and Visitation Orders)
- FL-150 (Income and Expense Declaration) - if requesting support
- DV-101 (Description of Abuse) - optional

**Type 3: Response to TRO**
- DV-120 (Response to Request for Domestic Violence Restraining Order)
- FL-150 (Income and Expense Declaration) - if support involved
- FL-320 (Responsive Declaration to Request for Order)

---

## State Machine Architecture

### Workflow States

```typescript
enum WorkflowState {
  NOT_STARTED = 'not_started',           // Initial state
  PACKET_TYPE_SELECTION = 'packet_type', // Choose packet type
  DV100_IN_PROGRESS = 'dv100_progress',  // Filling DV-100
  DV100_COMPLETE = 'dv100_complete',     // DV-100 finished
  CLETS_IN_PROGRESS = 'clets_progress',  // Filling CLETS-001
  CLETS_COMPLETE = 'clets_complete',     // CLETS-001 finished
  DV105_IN_PROGRESS = 'dv105_progress',  // Filling DV-105 (if children)
  DV105_COMPLETE = 'dv105_complete',     // DV-105 finished
  FL150_IN_PROGRESS = 'fl150_progress',  // Filling FL-150 (if support)
  FL150_COMPLETE = 'fl150_complete',     // FL-150 finished
  DV101_IN_PROGRESS = 'dv101_progress',  // Filling DV-101 (optional)
  DV101_COMPLETE = 'dv101_complete',     // DV-101 finished
  REVIEW_IN_PROGRESS = 'review_progress',// Reviewing complete packet
  READY_TO_FILE = 'ready_to_file',       // All forms complete, ready to export
  FILED = 'filed'                        // Packet exported/filed
}
```

### Form States

```typescript
enum FormStatus {
  NOT_STARTED = 'not_started',    // Form not begun
  IN_PROGRESS = 'in_progress',    // Form partially filled
  COMPLETE = 'complete',          // All required fields filled
  VALIDATED = 'validated',        // Passed validation checks
  SKIPPED = 'skipped'            // Not required for this packet type
}
```

---

## Workflow State Machine

### State Transitions

```
[NOT_STARTED]
     ↓
[PACKET_TYPE_SELECTION]
     ↓
  (User selects packet type)
     ↓
     ├─ Initiating TRO (with/without children)
     │       ↓
     │  [DV100_IN_PROGRESS]
     │       ↓
     │  [DV100_COMPLETE] ← (triggers validation)
     │       ↓
     │  [CLETS_IN_PROGRESS] ← (auto-populated from DV-100)
     │       ↓
     │  [CLETS_COMPLETE]
     │       ↓
     │   (Conditional: Has children?)
     │       ├─ YES → [DV105_IN_PROGRESS]
     │       │             ↓
     │       │        [DV105_COMPLETE]
     │       │             ↓
     │       └─ NO → (skip DV-105)
     │
     │   (Conditional: Requesting support?)
     │       ├─ YES → [FL150_IN_PROGRESS]
     │       │             ↓
     │       │        [FL150_COMPLETE]
     │       │             ↓
     │       └─ NO → (skip FL-150)
     │
     │   (Optional: Need more space?)
     │       ├─ YES → [DV101_IN_PROGRESS]
     │       │             ↓
     │       │        [DV101_COMPLETE]
     │       │             ↓
     │       └─ NO → (skip DV-101)
     │
     └─ Responding to TRO
             ↓
        [DV120 workflow - separate path]
     ↓
[REVIEW_IN_PROGRESS]
     ↓
[READY_TO_FILE]
     ↓
[FILED]
```

---

## Form Dependencies

### Dependency Graph

```
DV-100 (root node)
  │
  ├─ ALWAYS REQUIRES
  │    └─ CLETS-001 (mandatory child)
  │
  ├─ CONDITIONALLY REQUIRES (based on DV-100 data)
  │    ├─ DV-105 (if hasChildren === true)
  │    ├─ FL-150 (if requestingChildSupport === true OR requestingSpousalSupport === true)
  │    └─ DV-101 (if needMoreSpace === true) - user optional
  │
  └─ GENERATES (court-generated)
       ├─ DV-109 (Notice of Hearing)
       └─ DV-110 (Temporary Restraining Order)
```

### Data Flow Between Forms

```
DV-100 Fields → Auto-populate → CLETS-001
  - Protected person name
  - Protected person address
  - Restrained person name
  - Restrained person description
  - Case number (if exists)

DV-100 Fields → Auto-populate → DV-105
  - Children names
  - Children birthdates
  - Current custody arrangement
  - Petitioner/Respondent names

DV-100 Fields → Auto-populate → FL-150
  - Party name
  - Case number
  - Support request context

Personal Data Vault → Auto-populate → ALL FORMS
  - User's full name
  - User's address
  - User's contact info
  - Attorney info (if applicable)
```

---

## Validation Rules

### Form-Level Validation

**DV-100 Validation**:
- ✅ Protected person name required
- ✅ Restrained person name required
- ✅ At least one type of abuse described
- ✅ At least one order requested
- ✅ Relationship to restrained person specified
- ✅ If requesting child orders, hasChildren must be true
- ✅ If requesting support, requestingSupport must be true
- ✅ Declaration under penalty of perjury checked
- ✅ Signature and date present

**CLETS-001 Validation**:
- ✅ Protected person full description
- ✅ Restrained person full description
- ✅ Law enforcement agency selected
- ✅ Confidential address information complete

**DV-105 Validation** (if required):
- ✅ All children listed with birthdates
- ✅ Current custody arrangement described
- ✅ Requested custody orders specified
- ✅ Visitation schedule detailed

**FL-150 Validation** (if required):
- ✅ All income sources listed
- ✅ All expenses categorized
- ✅ Monthly totals calculated
- ✅ Supporting documentation attached (pay stubs, etc.)

### Packet-Level Validation

**Before Transition to READY_TO_FILE**:
- ✅ All required forms completed (based on packet type)
- ✅ All forms pass individual validation
- ✅ Data consistency across forms (names, case numbers match)
- ✅ No conflicting information between forms
- ✅ All conditional dependencies satisfied

---

## User Experience Flow

### Step 1: Packet Type Selection

**UI**: Modal dialog with clear options

```
╔════════════════════════════════════════════════╗
║  Which TRO Packet Do You Need?                ║
║                                                ║
║  ○ I am filing for a restraining order        ║
║    (Initiating TRO)                            ║
║                                                ║
║  ○ I am responding to a restraining order     ║
║    (Response to TRO)                           ║
║                                                ║
║         [Continue]                             ║
╚════════════════════════════════════════════════╝
```

### Step 2: Initial Assessment (if Initiating)

```
╔════════════════════════════════════════════════╗
║  Help Us Customize Your Packet                ║
║                                                ║
║  ☐ I have children with the restrained person ║
║  ☐ I need child support orders                ║
║  ☐ I need spousal support orders               ║
║  ☐ I need more space to describe abuse        ║
║                                                ║
║         [Start Packet]                         ║
╚════════════════════════════════════════════════╝
```

### Step 3: Guided Workflow

**Progress Indicator** (always visible):

```
DV-100 ✓ → CLETS-001 ✓ → DV-105 (current) → FL-150 → Review
═══════════════════════════════════════════════════════
                    60% Complete
```

**Form Navigation** (left sidebar):

```
╔═══════════════════════════════════╗
║  TRO Packet Progress              ║
║                                   ║
║  ✓ DV-100 Request (complete)      ║
║  ✓ CLETS-001 Info (complete)      ║
║  ▶ DV-105 Child Custody (current) ║
║  ○ FL-150 Income (not started)    ║
║  ○ Review & File (locked)         ║
║                                   ║
║  [< Previous]  [Next >]           ║
╚═══════════════════════════════════╝
```

### Step 4: Data Autofill Notifications

```
╔════════════════════════════════════════════════╗
║  ℹ️ We've pre-filled some fields from DV-100  ║
║                                                ║
║  • Protected person name                       ║
║  • Case information                            ║
║  • Children names and birthdates               ║
║                                                ║
║  Please review and edit as needed.             ║
║                                                ║
║         [Got it]                               ║
╚════════════════════════════════════════════════╝
```

### Step 5: Packet Review

**Review Screen** (before filing):

```
╔═══════════════════════════════════════════════════╗
║  Review Your TRO Packet                          ║
║                                                   ║
║  Forms Included:                                  ║
║  ✓ DV-100 Request for Domestic Violence RO       ║
║  ✓ CLETS-001 Confidential Information            ║
║  ✓ DV-105 Child Custody Orders                   ║
║  ✓ FL-150 Income and Expense Declaration         ║
║                                                   ║
║  Validation Status:                               ║
║  ✓ All required fields complete                  ║
║  ✓ Data consistent across forms                  ║
║  ✓ Ready to file                                  ║
║                                                   ║
║  [Preview PDF]  [Edit Forms]  [Export Packet]    ║
╚═══════════════════════════════════════════════════╝
```

---

## Technical Implementation

### Workflow State Management

**Storage**: Supabase `tro_workflows` table

```sql
CREATE TABLE tro_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  packet_type TEXT NOT NULL, -- 'initiating' | 'response'
  current_state TEXT NOT NULL, -- WorkflowState enum
  form_statuses JSONB NOT NULL, -- { dv100: 'complete', clets: 'in_progress', ... }
  packet_config JSONB NOT NULL, -- { hasChildren: true, requestingSupport: false, ... }
  form_data_refs JSONB NOT NULL, -- { dv100_id: 'uuid', clets_id: 'uuid', ... }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Form Data References

**Storage**: Existing `legal_documents` table (one row per form)

```typescript
// Example: DV-100 document
{
  id: 'uuid',
  user_id: 'uuid',
  title: 'DV-100 Request for Domestic Violence Restraining Order',
  form_type: 'DV-100',
  workflow_id: 'uuid', // Links back to tro_workflows
  content: { /* DV-100 form data */ },
  metadata: {
    fieldPositions: { /* ... */ },
    validationRules: { /* ... */ },
    completionPercentage: 85,
    lastEditedField: 'protectedPersonAddress'
  },
  status: 'in_progress',
  created_at: '2025-11-17T10:00:00Z',
  updated_at: '2025-11-17T10:15:00Z'
}
```

---

## Data Mapper Functions

### Common Field Mappings

```typescript
// DV-100 → CLETS-001
mapDV100ToCLETS(dv100Data: DV100FormData): Partial<CLETSFormData> {
  return {
    protectedPersonName: dv100Data.protectedPersonName,
    protectedPersonAddress: dv100Data.protectedPersonAddress,
    protectedPersonCity: dv100Data.protectedPersonCity,
    protectedPersonState: dv100Data.protectedPersonState,
    protectedPersonZip: dv100Data.protectedPersonZip,
    protectedPersonDOB: dv100Data.protectedPersonDOB,
    protectedPersonGender: dv100Data.protectedPersonGender,
    protectedPersonRace: dv100Data.protectedPersonRace,
    protectedPersonHeight: dv100Data.protectedPersonHeight,
    protectedPersonWeight: dv100Data.protectedPersonWeight,

    restrainedPersonName: dv100Data.restrainedPersonName,
    restrainedPersonAddress: dv100Data.restrainedPersonAddress,
    // ... etc
  };
}

// DV-100 → DV-105
mapDV100ToDV105(dv100Data: DV100FormData): Partial<DV105FormData> {
  return {
    petitionerName: dv100Data.protectedPersonName,
    respondentName: dv100Data.restrainedPersonName,
    caseNumber: dv100Data.caseNumber,
    children: dv100Data.childrenInvolved?.map(child => ({
      name: child.name,
      birthdate: child.birthdate,
      age: calculateAge(child.birthdate)
    })) || []
  };
}

// Personal Vault → All Forms
mapVaultToForm(vaultData: PersonalVaultData, formType: string): Partial<FormData> {
  const commonFields = {
    partyName: vaultData.full_name,
    streetAddress: vaultData.street_address,
    city: vaultData.city,
    state: vaultData.state,
    zipCode: vaultData.zip_code,
    telephoneNo: vaultData.phone,
    email: vaultData.email,
    // ... etc
  };

  return commonFields;
}
```

---

## Validation Functions

### Dependency Validation

```typescript
validateFormDependencies(workflow: TROWorkflow): ValidationResult {
  const errors: string[] = [];

  // DV-100 must be complete before CLETS-001
  if (workflow.formStatuses.clets === 'in_progress' &&
      workflow.formStatuses.dv100 !== 'complete') {
    errors.push('DV-100 must be completed before CLETS-001');
  }

  // If hasChildren, DV-105 is required
  if (workflow.packetConfig.hasChildren &&
      workflow.formStatuses.dv105 === 'skipped') {
    errors.push('DV-105 is required when children are involved');
  }

  // If requesting support, FL-150 is required
  if (workflow.packetConfig.requestingSupport &&
      workflow.formStatuses.fl150 === 'skipped') {
    errors.push('FL-150 is required when requesting support');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Data Consistency Validation

```typescript
validateDataConsistency(forms: FormCollection): ValidationResult {
  const errors: string[] = [];

  // Case numbers must match across all forms
  const caseNumbers = [
    forms.dv100?.caseNumber,
    forms.clets?.caseNumber,
    forms.dv105?.caseNumber,
    forms.fl150?.caseNumber
  ].filter(Boolean);

  if (new Set(caseNumbers).size > 1) {
    errors.push('Case numbers do not match across forms');
  }

  // Protected person name must match
  const protectedNames = [
    forms.dv100?.protectedPersonName,
    forms.clets?.protectedPersonName,
    forms.dv105?.petitionerName
  ].filter(Boolean);

  if (new Set(protectedNames).size > 1) {
    errors.push('Protected person names do not match across forms');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Workflow Hooks API

### useTROWorkflow Hook

```typescript
interface TROWorkflowHook {
  // State
  workflow: TROWorkflow | null;
  loading: boolean;
  error: Error | null;

  // Actions
  startWorkflow: (packetType: PacketType, config: PacketConfig) => Promise<void>;
  updateFormStatus: (formType: FormType, status: FormStatus) => Promise<void>;
  transitionToNextForm: () => Promise<void>;
  transitionToPreviousForm: () => Promise<void>;
  jumpToForm: (formType: FormType) => Promise<void>;
  completeWorkflow: () => Promise<void>;

  // Validation
  validateCurrentForm: () => Promise<ValidationResult>;
  validatePacket: () => Promise<ValidationResult>;
  canTransitionToNextForm: () => boolean;

  // Data
  autofillFormFromPrevious: (targetForm: FormType) => Promise<void>;
  getFormCompletionPercentage: (formType: FormType) => number;
  getPacketCompletionPercentage: () => number;

  // Utility
  getCurrentForm: () => FormType;
  getNextForm: () => FormType | null;
  getPreviousForm: () => FormType | null;
  getRequiredForms: () => FormType[];
  getOptionalForms: () => FormType[];
}
```

### Example Usage

```typescript
function TROPacketPage() {
  const {
    workflow,
    startWorkflow,
    transitionToNextForm,
    validateCurrentForm,
    getPacketCompletionPercentage
  } = useTROWorkflow();

  const handleNext = async () => {
    const validation = await validateCurrentForm();

    if (validation.valid) {
      await transitionToNextForm();
    } else {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <ProgressBar value={getPacketCompletionPercentage()} />
      <CurrentFormViewer />
      <Button onClick={handleNext}>Next</Button>
    </div>
  );
}
```

---

## Component Architecture

### TROWorkflowWizard Component

**Purpose**: Main orchestration component for workflow

**Features**:
- Step indicator (progress bar)
- Form navigation (next/previous/jump)
- Validation feedback
- Auto-save integration

**Props**:
```typescript
interface TROWorkflowWizardProps {
  userId: string;
  onComplete: () => void;
  initialPacketType?: PacketType;
}
```

### PacketProgressPanel Component

**Purpose**: Visual progress indicator and form status

**Features**:
- Form completion checkmarks
- Current form highlighting
- Click-to-jump navigation
- Estimated time remaining

**Props**:
```typescript
interface PacketProgressPanelProps {
  workflow: TROWorkflow;
  onFormSelect: (formType: FormType) => void;
  compact?: boolean;
}
```

---

## Error Handling

### Workflow Errors

```typescript
class WorkflowError extends Error {
  constructor(
    message: string,
    public code: WorkflowErrorCode,
    public recoverable: boolean
  ) {
    super(message);
  }
}

enum WorkflowErrorCode {
  INVALID_TRANSITION = 'invalid_transition',
  MISSING_DEPENDENCY = 'missing_dependency',
  VALIDATION_FAILED = 'validation_failed',
  DATA_CONFLICT = 'data_conflict',
  SAVE_FAILED = 'save_failed'
}
```

### Error Recovery

```typescript
// Recoverable errors: Show toast, stay on current form
if (error.recoverable) {
  toast({
    title: "Something went wrong",
    description: error.message,
    variant: "destructive"
  });
  return;
}

// Non-recoverable errors: Show error boundary, offer restart
throw error;
```

---

## Performance Considerations

### Lazy Loading Forms

- Only load current form component
- Preload next form in background
- Unload previous forms after transition

### Optimistic Updates

- Update UI immediately
- Sync to Supabase in background
- Rollback on error

### Caching Strategy

- Cache workflow state in React Query
- Invalidate on form transitions
- Prefetch next form data

---

## Testing Strategy

### Unit Tests

- State transitions
- Validation functions
- Data mappers
- Form dependencies

### Integration Tests

- Complete workflow flow
- Form-to-form data transfer
- Validation across forms
- Error handling

### E2E Tests

- User selects packet type
- Fills all required forms
- Reviews packet
- Exports packet

---

## Future Enhancements

### Phase 2 Features

- **Save and Resume**: Allow users to save partially completed packets
- **Packet Templates**: Save completed packets as templates
- **Court-Specific Variations**: Support different county requirements
- **E-Filing Integration**: Direct submission to court systems
- **Attorney Review**: Request attorney review before filing

### Phase 3 Features

- **Multi-Language Support**: Spanish, Chinese, Vietnamese, etc.
- **Accessibility Enhancements**: Screen reader optimization, high contrast
- **Mobile App**: Native iOS/Android apps
- **Video Tutorials**: Embedded help videos for each form
- **Live Chat Support**: Real-time assistance during form completion

---

## Success Metrics

### Technical Metrics

- ✅ Zero state machine bugs
- ✅ < 100ms state transitions
- ✅ 100% form validation coverage
- ✅ < 5s auto-save latency

### User Experience Metrics

- ✅ < 20 minutes to complete packet (average)
- ✅ > 90% packet completion rate
- ✅ < 5% error rate on validation
- ✅ > 4.5/5 user satisfaction score

---

## Implementation Checklist

- [ ] Create WorkflowTypes.ts with all interfaces
- [ ] Create useTROWorkflow.ts hook
- [ ] Create formDataMapper.ts with mapping functions
- [ ] Create workflowValidator.ts with validation logic
- [ ] Create TROWorkflowWizard.tsx component
- [ ] Create PacketProgressPanel.tsx component
- [ ] Set up Supabase tro_workflows table
- [ ] Integrate with Index.tsx
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update documentation

---

**Document Status**: ✅ Complete - Ready for Implementation
**Next Steps**: Implement WorkflowTypes.ts and useTROWorkflow.ts hook
**Review Date**: November 17, 2025
**Approved By**: Agent 2 - Workflow Engine
