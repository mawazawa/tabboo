# Systematic Approach for Implementing California Judicial Council Forms
## Framework for SwiftFill Form Development

**Version**: 1.0
**Date**: November 2025
**Forms Covered**: FL, DV, and all Judicial Council series

---

## Overview

This guide provides a systematic, repeatable approach for implementing any California Judicial Council form in SwiftFill. It was developed during the FL-320 implementation and refined to be form-agnostic.

---

## Phase 1: Form Research & Analysis (2-4 hours)

### Step 1.1: Obtain Official Form PDF
**Tools**: California Courts website, Web Search

```bash
# Search pattern:
"[FORM-NUMBER] California Judicial Council PDF site:courts.ca.gov"

# Example:
"FL-320 California Judicial Council PDF site:courts.ca.gov"
```

**Required Files**:
- ✅ Official PDF form (e.g., fl320.pdf)
- ✅ Information sheet (e.g., fl320info.pdf)
- ✅ Instructions/packet (if available)

**Storage**: Place in `/public/[form-number].pdf`

---

### Step 1.2: Visual Analysis Using Claude Vision
**Tool**: Claude Vision API

**Process**:
1. Read the PDF file
2. Analyze page-by-page structure
3. Document all visible fields
4. Identify field types (input, checkbox, textarea, date, signature)
5. Note page layout (header, sections, signature)

**Output**: Create `[FORM-NUMBER]_VISUAL_ANALYSIS.md`

**Template**:
```markdown
# [FORM-NUMBER] Visual Analysis

## Form Metadata
- Title: [Full form title]
- Revision Date: [Date]
- Pages: [Number]
- Mandatory/Optional: [Status]

## Page 1 Structure
### Header Section
- Field 1: [name, type, position]
- Field 2: [name, type, position]

### Main Content
- Section 1: [name]
  - Field: [details]

## Page 2 Structure
[...]
```

---

### Step 1.3: Research Official Documentation
**Tools**: Web Search, WebFetch

**Required Research**:
```bash
# Search queries:
1. "[FORM-NUMBER] instructions California courts"
2. "[FORM-NUMBER] how to fill out guide"
3. "[FORM-NUMBER] filing requirements deadline"
4. "California Rules of Court [FORM-SERIES]"
```

**Key Information to Gather**:
- ✅ Form purpose
- ✅ When to use this form
- ✅ Filing deadlines (e.g., "9 court days before hearing")
- ✅ Required attachments (e.g., FL-150, FL-158)
- ✅ Related forms (what comes before/after)
- ✅ Legal rules (California Rules of Court references)
- ✅ Common mistakes to avoid

**Output**: Create `[FORM-NUMBER]_COMPLETE_FIELD_GUIDE.md`

---

### Step 1.4: Identify Form Pattern
**Analysis**: Determine which pattern this form follows

**Common California Judicial Council Patterns**:

| Pattern | Forms | Characteristics |
|---------|-------|-----------------|
| **Request Pattern** | FL-300, DV-100, FL-100 | Initiates action, requests orders |
| **Response Pattern** | FL-320, DV-120 | Responds to request, consent/non-consent structure |
| **Financial Pattern** | FL-150, FL-155 | Income/expense data collection |
| **Temporary Order Pattern** | DV-110, FL-305 | Interim/emergency orders |
| **Declaration Pattern** | FL-157, FL-158 | Supporting statements for specific issues |
| **Procedural Pattern** | FL-330, FL-335 | Proof of service, procedural steps |

**Key Insight**: Response forms (FL-320, DV-120) follow consent/non-consent structure:
```
☐ I consent to the order requested
☐ I do not consent ☐ but I consent to the following order: _______
```

---

### Step 1.5: Map Related Forms
**Purpose**: Understand the form's context in the legal workflow

**Example for FL-320**:
```
Workflow:
1. FL-300 (Request for Order) → Filed by Party A
2. FL-320 (Response to Request) → Filed by Party B ← WE ARE HERE
3. FL-150 (Income & Expense) → Attachment (if support requested)
4. FL-158 (Attorney Fees) → Attachment (if fees requested)
5. Hearing → Court decides
6. Order → Court issues decision
```

**Output**: Document in `[FORM-NUMBER]_WORKFLOW.md`

---

## Phase 2: Field Definition & TypeScript Types (3-5 hours)

### Step 2.1: Create Field Inventory
**Tool**: Spreadsheet or Markdown table

**Template**:
| Section | Field Name | Type | Required | Validation | Notes |
|---------|------------|------|----------|------------|-------|
| Header | partyName | input | ✓ | text | Full legal name |
| Header | firmName | input | | text | If represented |
| Item 1 | restrainingOrderNone | checkbox | ✓ | boolean | Mutually exclusive with b |

**Complete Checklist**:
- ✅ All header fields
- ✅ All section fields
- ✅ All checkboxes (consent/non-consent pairs)
- ✅ All text alternatives ("but I consent to following...")
- ✅ All declaration checkboxes ("I have filed FL-###")
- ✅ Signature section

---

### Step 2.2: Define TypeScript Interface
**Location**: `src/types/FormData.ts`

**Naming Conventions**:

```typescript
// Header fields: descriptive names
partyName?: string;
firmName?: string;
mailingAddress?: string;

// Consent fields: [topic]Consent
childCustodyConsent?: boolean;
visitationConsent?: boolean;

// Non-consent fields: [topic]DoNotConsent
childCustodyDoNotConsent?: boolean;

// Alternative order fields: [topic]AlternativeOrder
childCustodyAlternativeOrder?: string;

// Declaration fields: [topic]Filed[FORM]
childSupportFiledFL150?: boolean;
attorneyFeesFiledFL158?: boolean;

// Boolean for simple yes/no
restrainingOrderNone?: boolean;
restrainingOrderActive?: boolean;

// Dates: [purpose]Date
signatureDate?: string;
hearingDate?: string;

// Signatures: [purpose]Name
signatureName?: string;  // For signature
printName?: string;      // For printed name
```

**Complete Interface Template**:
```typescript
export interface FormData {
  // Header - Party Information
  partyName?: string;
  firmName?: string;
  streetAddress?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  stateBarNumber?: string;

  // Header - Court Information
  county?: string;
  courtStreetAddress?: string;
  courtMailingAddress?: string;
  courtCity?: string;
  courtZipCode?: string;
  branchName?: string;

  // Header - Case Information
  petitioner?: string;
  respondent?: string;
  otherParentParty?: string;
  caseNumber?: string;
  hearingDate?: string;
  hearingTime?: string;
  hearingDepartment?: string;
  hearingRoom?: string;

  // Section fields (pattern-specific)
  // ... [add based on form type]

  // Signature Section
  declarationUnderPenalty?: boolean;
  signatureDate?: string;
  printName?: string;
  signatureName?: string;
}
```

---

### Step 2.3: Validate Against Actual Form
**Critical Check**: Ensure NO fields are added that don't exist on form

**Process**:
1. Open PDF side-by-side with TypeScript interface
2. For each TypeScript field, find it on PDF
3. For each PDF field, find it in TypeScript
4. Document any mismatches

**Common Mistakes to Avoid**:
- ❌ Adding child name fields to response forms (they're in request forms)
- ❌ Assuming all sections have same structure
- ❌ Missing "Filed FL-###" declaration checkboxes
- ❌ Missing alternative order text fields
- ❌ Confusing consent vs non-consent checkboxes

---

## Phase 3: Field Implementation (4-6 hours)

### Step 3.1: Update FormViewer Component
**Location**: `src/components/FormViewer.tsx`

**A. Update fieldNameToIndex Mapping**:
```typescript
const fieldNameToIndex: Record<string, number> = {
  // Header - Party Info (0-12)
  partyName: 0,
  firmName: 1,
  // ... continue sequentially

  // Section 1 fields (13-15)
  restrainingOrderNone: 13,
  restrainingOrderActive: 14,
  // ... continue
};
```

**B. Create Field Overlays**:
```typescript
const fieldOverlays: { page: number; fields: FieldOverlay[] }[] = [
  {
    page: 1,
    fields: [
      // Party information
      {
        type: 'input',
        field: 'partyName',
        top: '8',
        left: '5',
        width: '40%',
        placeholder: 'NAME'
      },
      // Checkboxes
      {
        type: 'checkbox',
        field: 'restrainingOrderNone',
        top: '45',
        left: '8',
        placeholder: ''
      },
    ]
  },
  {
    page: 2,
    fields: [
      // Page 2 fields
    ]
  }
];
```

**Position Estimation Strategy**:
```
Page height = 100%
Page width = 100%

Header section: top 0-25%
Main content: top 25-90%
Signature: top 90-100%

Left column: left 5-45%
Right column: left 55-95%

Vertical spacing between fields: 3-4%
Horizontal spacing: 2-3%
```

---

### Step 3.2: Update FieldNavigationPanel
**Location**: `src/components/FieldNavigationPanel.tsx`

**A. Update FIELD_CONFIG Array**:
```typescript
const FIELD_CONFIG: FieldConfig[] = [
  // Group by sections with comments
  // Header - Party Information
  {
    field: 'partyName',
    label: 'Name',
    type: 'input',
    placeholder: 'Full name',
    vaultField: 'full_name'
  },
  {
    field: 'firmName',
    label: 'Firm Name',
    type: 'input',
    placeholder: 'Law firm name'
  },

  // Item 1: Restraining Order Information
  {
    field: 'restrainingOrderNone',
    label: 'No restraining orders in effect',
    type: 'checkbox'
  },
  {
    field: 'restrainingOrderActive',
    label: 'Restraining orders are in effect',
    type: 'checkbox'
  },
];
```

**B. Update getDefaultPosition Function**:
```typescript
const getDefaultPosition = (field: string) => {
  const defaults: Record<string, { top: number; left: number }> = {
    // Match positions from field overlays
    partyName: { top: 8, left: 5 },
    firmName: { top: 11, left: 5 },
    // ...
  };
  return defaults[field] || { top: 0, left: 0 };
};
```

---

### Step 3.3: Build and Test TypeScript
**Command**: `npm run build`

**Expected Result**: Zero TypeScript errors

**Common Errors**:
- Missing field in FormData interface
- Typo in field name
- Type mismatch (string vs boolean)

**Fix Process**:
1. Read error message
2. Locate field in TypeScript
3. Add to FormData interface or fix typo
4. Rebuild

---

## Phase 4: Field Position Validation (2-3 hours)

### Step 4.1: Create Automated Validator
**Location**: `field-position-validator.mjs`

**Template** (already exists):
```javascript
const FIELD_POSITIONS = {
  partyName: { top: 8, left: 5, width: 40, height: 2.4 },
  // ... all fields
};

function checkOverlap(field1, field2, pos1, pos2) {
  // Overlap detection logic
}

function analyzePositions() {
  // Validation logic
}
```

**Run**: `node field-position-validator.mjs`

**Target**: 100/100 score, 0 overlaps

---

### Step 4.2: Visual Validation (Manual)
**Tool**: Browser Dev Server + DevTools

**Process**:
1. `npm run dev`
2. Open http://localhost:8080
3. Load form
4. Fill all fields with test data
5. Enable "Edit Positions" mode
6. Visually inspect each field group
7. Take screenshots for documentation

**Adjustment Process**:
```typescript
// If field is too high:
top: '15' → top: '18'  // Move down 3%

// If field is too far left:
left: '5' → left: '8'  // Move right 3%

// If field is too wide:
width: '50%' → width: '40%'  // Reduce 10%
```

**Iterate**: Adjust, rebuild, re-test until perfect alignment

---

## Phase 5: Testing & Documentation (3-4 hours)

### Step 5.1: Create Test Data
**Location**: In test guides

**Standard Test Data Pattern**:
```json
{
  "partyName": "Jane Smith",
  "streetAddress": "123 Main Street",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "telephoneNo": "(555) 123-4567",
  "email": "jane.smith@example.com",
  "attorneyFor": "Self-Represented",
  "county": "Los Angeles",
  "petitioner": "John Doe",
  "respondent": "Jane Smith",
  "caseNumber": "FL12345678",
  "hearingDate": "12/15/2025",
  "hearingTime": "9:00 AM"
}
```

---

### Step 5.2: Create Testing Documentation

**Required Documents**:

1. **MANUAL_VISUAL_TEST_GUIDE.md** (Developer Testing)
   - 8-phase test procedure
   - Screenshot checklist
   - Production readiness scoring

2. **[FORM]_USER_ACCEPTANCE_TEST.md** (End-User Testing)
   - User-friendly language
   - Real-world scenario
   - Step-by-step guidance

3. **[FORM]_COMPLETE_FIELD_GUIDE.md** (Reference)
   - Field-by-field instructions
   - Filing requirements
   - Common mistakes

---

### Step 5.3: Automated Validation
**Tools**: Vitest, field-position-validator.mjs

**Run All Tests**:
```bash
npm run test                  # Unit tests
node field-position-validator.mjs  # Position validation
npm run build                 # TypeScript compilation
```

**Success Criteria**:
- ✅ 100% unit tests passing
- ✅ 100/100 position validation score
- ✅ 0 TypeScript errors
- ✅ 0 field overlaps
- ✅ All fields within PDF bounds

---

## Phase 6: Commit & Documentation (1-2 hours)

### Step 6.1: Git Commit Strategy
**Pattern**: Feature commit → Documentation commit → Validation commit

**Example Commits**:
```bash
# Commit 1: Core implementation
git commit -m "feat: implement [FORM-NUMBER] with complete field coverage

- Added [N] fields matching official Judicial Council form
- Implemented [PATTERN] structure (consent/non-consent)
- Added required header fields
- TypeScript strict mode: 0 errors
- All fields properly typed"

# Commit 2: Documentation
git commit -m "docs: comprehensive [FORM-NUMBER] documentation

- Visual analysis document
- Complete field guide
- User acceptance test guide
- Filing requirements and deadlines"

# Commit 3: Validation
git commit -m "test: validation and testing for [FORM-NUMBER]

- Field position validation: 100/100 score
- Manual testing guide
- Standard test dataset
- Production readiness checklist"
```

---

### Step 6.2: Linear Documentation
**Project**: SwiftFill (JusticeOS team)

**Create Issue**:
```
Title: Implement [FORM-NUMBER] - [Form Name]
Labels: form-implementation, judicial-council

Description:
Implement California Judicial Council form [FORM-NUMBER].

**Form Details**:
- Name: [Full name]
- Series: [FL/DV/etc.]
- Pattern: [Request/Response/Financial/etc.]
- Pages: [N]
- Fields: [N]

**Implementation Checklist**:
- [ ] Form research completed
- [ ] TypeScript interface defined
- [ ] Field overlays implemented
- [ ] Position validation: 100/100
- [ ] Documentation created
- [ ] Tests passing
- [ ] Committed and pushed

**Related Forms**:
- [FORM-300]: Request
- [FORM-320]: Response (this form)
- [FORM-150]: Attachment

**Status**: [In Progress/Complete]
```

---

## Common Patterns by Form Type

### Pattern 1: Response Forms (FL-320, DV-120)
**Structure**:
- Header (party/court/case info)
- Section items with consent checkboxes:
  ```
  Item [N]: [TOPIC]
    ☐ I consent to the order requested
    ☐ I do not consent ☐ but I consent to: _______
  ```
- Facts textarea (with page limit)
- Declaration under penalty of perjury
- Signature section

**Field Types**:
- Input: Header fields
- Checkbox: Consent/non-consent pairs
- Textarea: Facts section, alternative orders
- Date: Signature date, hearing date
- Signature: Print name + signature

---

### Pattern 2: Request Forms (FL-300, DV-100)
**Structure**:
- Header (party/court/case info)
- Request items with detailed questions
- Supporting facts
- Declaration
- Signature

**Field Types**:
- Input: Party info, dates, specifics
- Checkbox: Types of relief requested
- Textarea: Detailed explanations
- Date: Dates of incidents, hearing request

---

### Pattern 3: Financial Forms (FL-150, FL-155)
**Structure**:
- Header
- Income section (detailed line items)
- Expense section (detailed line items)
- Assets section
- Calculations/totals
- Declaration
- Signature

**Field Types**:
- Input: Numeric (currency)
- Input: Text (description)
- Calculated fields (totals)
- Textarea: Additional information

---

### Pattern 4: Declaration Forms (FL-157, FL-158)
**Structure**:
- Header
- Topic-specific declarations
- Supporting facts
- Signature

**Field Types**:
- Checkbox: Yes/no declarations
- Textarea: Explanations
- Input: Specific details

---

## Validation Checklist (Use for Every Form)

### Pre-Implementation
- [ ] Official PDF obtained
- [ ] Information sheet reviewed
- [ ] Filing requirements researched
- [ ] Form pattern identified
- [ ] Related forms mapped

### Implementation
- [ ] All PDF fields mapped to TypeScript
- [ ] NO fields added that don't exist on PDF
- [ ] Field naming follows conventions
- [ ] TypeScript interface complete
- [ ] FormViewer overlays added
- [ ] FieldNavigationPanel updated
- [ ] Build succeeds (0 errors)

### Validation
- [ ] Position validator: 100/100 score
- [ ] No field overlaps
- [ ] All fields within bounds
- [ ] Visual inspection complete
- [ ] Test data fills all fields correctly

### Testing
- [ ] Unit tests pass
- [ ] Manual test guide created
- [ ] User test guide created
- [ ] Field guide documented
- [ ] Screenshots taken

### Documentation
- [ ] Visual analysis document
- [ ] Complete field guide
- [ ] Test guides (developer + user)
- [ ] Linear issue created/updated
- [ ] Git commits with clear messages
- [ ] Changes pushed to remote

---

## Tools & Resources

### Required Tools
1. **Claude Vision API**: PDF analysis
2. **Web Search**: Official documentation research
3. **Node.js**: Validation scripts
4. **TypeScript**: Type checking
5. **Git**: Version control
6. **Linear**: Project tracking

### Official Resources
- California Courts: https://courts.ca.gov
- Self-Help Center: https://selfhelp.courts.ca.gov
- Rules of Court: https://www.courts.ca.gov/rules.htm
- Form Updates: https://courts.ca.gov/rules-forms/court-forms/latest-changes

### Internal Resources
- Form templates: `/public/[form].pdf`
- TypeScript types: `/src/types/FormData.ts`
- Components: `/src/components/FormViewer.tsx`, `FieldNavigationPanel.tsx`
- Validators: `/field-position-validator.mjs`
- Documentation: `/[FORM]_*.md`

---

## Form Implementation Timeline

| Phase | Time Estimate | Deliverables |
|-------|---------------|--------------|
| Phase 1: Research | 2-4 hours | Visual analysis, field guide, workflow |
| Phase 2: TypeScript | 3-5 hours | FormData interface, validation |
| Phase 3: Implementation | 4-6 hours | FormViewer, FieldNavigationPanel updates |
| Phase 4: Positioning | 2-3 hours | Position validation, visual testing |
| Phase 5: Testing | 3-4 hours | Test guides, automated tests |
| Phase 6: Documentation | 1-2 hours | Git commits, Linear updates |
| **Total** | **15-24 hours** | **Complete form implementation** |

**Per form estimate**: 2-3 days for thorough, production-ready implementation

---

## Next Forms to Implement

### Priority 1: DV Series (Domestic Violence)
- DV-100: Request for Domestic Violence Restraining Order
- DV-110: Temporary Restraining Order
- DV-120: Response to Request for Domestic Violence Restraining Order
- DV-130: Restraining Order After Hearing

### Priority 2: FL Series Completion
- FL-100: Petition for Dissolution of Marriage
- FL-150: Income and Expense Declaration
- FL-300: Request for Order
- FL-155: Financial Statement (Simplified)

### Priority 3: Supporting Forms
- FL-330: Proof of Personal Service
- FL-335: Proof of Service by Mail
- FL-157: Spousal or Partner Support Declaration Attachment
- FL-158: Supporting Declaration for Attorney's Fees

---

## Success Metrics

### Technical Quality
- ✅ 0 TypeScript errors
- ✅ 100/100 position validation score
- ✅ 100% test passing rate
- ✅ 0 field overlaps
- ✅ All fields within PDF bounds

### Accuracy
- ✅ All PDF fields implemented
- ✅ No extra fields added
- ✅ Correct field types
- ✅ Accurate positions (±2%)

### Documentation
- ✅ Complete field guide
- ✅ Test guides created
- ✅ Visual analysis documented
- ✅ Linear issue updated
- ✅ Git history clear

### User Experience
- ✅ Court-compliant sizing (12pt font, 24px height)
- ✅ Clear field labels
- ✅ Logical field order
- ✅ Professional appearance

---

## Lessons Learned (FL-320 Implementation)

### What Went Well
1. ✅ Visual analysis using Claude Vision was highly effective
2. ✅ Field sizing compliance (12pt, monospace) worked perfectly
3. ✅ Automated position validation caught all issues
4. ✅ TypeScript strict mode prevented type errors

### What Needs Improvement
1. ❌ Initial implementation added non-existent fields (child names)
2. ❌ Didn't validate against actual PDF before implementing
3. ❌ Assumed form structure without research

### Key Takeaways
1. **Always validate against actual PDF first** - Don't assume
2. **Response forms ≠ Request forms** - Different field sets
3. **Read the information sheet** - Contains critical context
4. **Visual analysis prevents costly mistakes** - Use Claude Vision upfront
5. **Document everything** - Future forms will thank you

---

## Conclusion

This systematic approach ensures:
- ✅ Accurate implementation matching official forms
- ✅ Repeatable process for any Judicial Council form
- ✅ High quality, production-ready code
- ✅ Comprehensive documentation
- ✅ Efficient 2-3 day implementation cycle

**Apply this framework to every new form** to maintain consistency and quality across SwiftFill.

---

**Last Updated**: November 2025
**Version**: 1.0
**Author**: Claude (AI Assistant)
**Status**: Production-ready framework

---

*This framework is the result of thorough analysis of FL-320 implementation, California Judicial Council form standards, and best practices in legal software development.*
