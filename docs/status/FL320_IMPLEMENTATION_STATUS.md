# FL-320 Implementation Status & Next Steps
## Current Progress & Remaining Work

**Last Updated**: November 15, 2025
**Branch**: `claude/optimize-pdf-viewer-bundle-01UKQUUXKGPvzUihsn88upEY`
**Status**: In Progress - TypeScript Interface Complete, Component Updates Needed

---

## ✅ Completed Work

### Phase 1: Research & Analysis (COMPLETE)
- ✅ Visual analysis of actual fl320.pdf using Claude Vision
- ✅ Research of California Courts official documentation
- ✅ Identification of form pattern (Response/Consent structure)
- ✅ Complete field inventory and mapping

**Documents Created**:
- FL320_VISUAL_ANALYSIS_CORRECTIONS.md
- FL320_COMPLETE_FIELD_GUIDE.md
- SYSTEMATIC_FORM_IMPLEMENTATION_GUIDE.md

### Phase 2: TypeScript Interface (COMPLETE)
- ✅ Removed 6 incorrect child fields (child1Name, child1BirthDate, etc.)
- ✅ Added 8 missing header fields
- ✅ Implemented correct consent/non-consent structure for all 9 items
- ✅ Added alternative order text fields
- ✅ Added "Filed FL-150/158" declaration checkboxes
- ✅ Applied proper naming conventions

**File**: `src/types/FormData.ts`
**Fields**: 52 total (all matching actual FL-320 PDF)
**Status**: ✅ COMMITTED (commit 150964f)

---

## 🚧 In Progress Work

### Phase 3: Component Updates (IN PROGRESS)
**Next Immediate Steps**:

#### Step 1: Update FormViewer.tsx
**File**: `src/components/FormViewer.tsx`

**Required Changes**:

**A. Update fieldNameToIndex mapping (lines 52-72)**:
```typescript
const fieldNameToIndex: Record<string, number> = {
  // Header - Party Info (0-12)
  partyName: 0,
  firmName: 1,
  streetAddress: 2,
  mailingAddress: 3,
  city: 4,
  state: 5,
  zipCode: 6,
  telephoneNo: 7,
  faxNo: 8,
  email: 9,
  attorneyFor: 10,
  stateBarNumber: 11,

  // Header - Court Info (12-16)
  county: 12,
  courtStreetAddress: 13,
  courtMailingAddress: 14,
  courtCityAndZip: 15,
  branchName: 16,

  // Header - Case Info (17-21)
  petitioner: 17,
  respondent: 18,
  otherParentParty: 19,
  caseNumber: 20,
  hearingDate: 21,
  hearingTime: 22,
  hearingDepartment: 23,
  hearingRoom: 24,

  // Item 1: Restraining Order (25-26)
  restrainingOrderNone: 25,
  restrainingOrderActive: 26,

  // Item 2: Child Custody/Visitation (27-31)
  childCustodyConsent: 27,
  visitationConsent: 28,
  childCustodyDoNotConsent: 29,
  visitationDoNotConsent: 30,
  custodyAlternativeOrder: 31,

  // Item 3: Child Support (32-36)
  childSupportFiledFL150: 32,
  childSupportConsent: 33,
  childSupportGuidelineConsent: 34,
  childSupportDoNotConsent: 35,
  childSupportAlternativeOrder: 36,

  // Item 4: Spousal Support (37-40)
  spousalSupportFiledFL150: 37,
  spousalSupportConsent: 38,
  spousalSupportDoNotConsent: 39,
  spousalSupportAlternativeOrder: 40,

  // Item 5: Property Control (41-43)
  propertyControlConsent: 41,
  propertyControlDoNotConsent: 42,
  propertyControlAlternativeOrder: 43,

  // Item 6: Attorney Fees (44-48)
  attorneyFeesFiledFL150: 44,
  attorneyFeesFiledFL158: 45,
  attorneyFeesConsent: 46,
  attorneyFeesDoNotConsent: 47,
  attorneyFeesAlternativeOrder: 48,

  // Item 7: Domestic Violence (49-51)
  domesticViolenceConsent: 49,
  domesticViolenceDoNotConsent: 50,
  domesticViolenceAlternativeOrder: 51,

  // Item 8: Other Orders (52-54)
  otherOrdersConsent: 52,
  otherOrdersDoNotConsent: 53,
  otherOrdersAlternativeOrder: 54,

  // Item 9: Time for Service (55-57)
  timeForServiceConsent: 55,
  timeForServiceDoNotConsent: 56,
  timeForServiceAlternativeOrder: 57,

  // Item 10: Facts (58-59)
  facts: 58,
  factsAttachment: 59,

  // Signature (60-63)
  declarationUnderPenalty: 60,
  signatureDate: 61,
  printName: 62,
  signatureName: 63,
};
```

**B. Update fieldOverlays array (lines 277-301)**:

Remove current field overlays and replace with:

```typescript
const fieldOverlays: { page: number; fields: FieldOverlay[] }[] = [
  {
    page: 1,
    fields: [
      // Header - Party Information (Left Column)
      { type: 'input', field: 'partyName', top: '8', left: '5', width: '40%', placeholder: 'NAME' },
      { type: 'input', field: 'firmName', top: '11', left: '5', width: '40%', placeholder: 'FIRM NAME' },
      { type: 'input', field: 'streetAddress', top: '14', left: '5', width: '40%', placeholder: 'STREET ADDRESS' },
      { type: 'input', field: 'mailingAddress', top: '17', left: '5', width: '40%', placeholder: 'MAILING ADDRESS' },
      { type: 'input', field: 'city', top: '20', left: '5', width: '20%', placeholder: 'CITY' },
      { type: 'input', field: 'state', top: '20', left: '26', width: '8%', placeholder: 'STATE' },
      { type: 'input', field: 'zipCode', top: '20', left: '35', width: '10%', placeholder: 'ZIP' },
      { type: 'input', field: 'telephoneNo', top: '23', left: '5', width: '18%', placeholder: 'TELEPHONE' },
      { type: 'input', field: 'faxNo', top: '23', left: '24', width: '18%', placeholder: 'FAX' },
      { type: 'input', field: 'email', top: '26', left: '5', width: '40%', placeholder: 'E-MAIL' },
      { type: 'input', field: 'attorneyFor', top: '29', left: '5', width: '35%', placeholder: 'ATTORNEY FOR' },
      { type: 'input', field: 'stateBarNumber', top: '29', left: '41', width: '10%', placeholder: 'BAR #' },

      // Header - Court Information (Center)
      { type: 'input', field: 'county', top: '35', left: '25', width: '30%', placeholder: 'COUNTY' },
      { type: 'input', field: 'courtStreetAddress', top: '38', left: '15', width: '40%', placeholder: 'COURT STREET' },
      { type: 'input', field: 'courtMailingAddress', top: '41', left: '15', width: '40%', placeholder: 'COURT MAILING' },
      { type: 'input', field: 'courtCityAndZip', top: '44', left: '15', width: '40%', placeholder: 'COURT CITY/ZIP' },
      { type: 'input', field: 'branchName', top: '47', left: '15', width: '40%', placeholder: 'BRANCH' },

      // Header - Case Information (Right Box)
      { type: 'input', field: 'petitioner', top: '52', left: '55', width: '40%', placeholder: 'PETITIONER' },
      { type: 'input', field: 'respondent', top: '55', left: '55', width: '40%', placeholder: 'RESPONDENT' },
      { type: 'input', field: 'otherParentParty', top: '58', left: '55', width: '40%', placeholder: 'OTHER PARENT/PARTY' },
      { type: 'input', field: 'caseNumber', top: '63', left: '80', width: '15%', placeholder: 'CASE #' },
      { type: 'input', field: 'hearingDate', top: '66', left: '70', width: '12%', placeholder: 'DATE' },
      { type: 'input', field: 'hearingTime', top: '66', left: '83', width: '10%', placeholder: 'TIME' },
      { type: 'input', field: 'hearingDepartment', top: '69', left: '82', width: '13%', placeholder: 'DEPT/ROOM' },

      // Item 1: Restraining Order Information (around 72% from top)
      { type: 'checkbox', field: 'restrainingOrderNone', top: '74', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'restrainingOrderActive', top: '77', left: '8', placeholder: '' },

      // Item 2: Child Custody / Visitation (around 80-85% from top)
      { type: 'checkbox', field: 'childCustodyConsent', top: '82', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'visitationConsent', top: '85', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'childCustodyDoNotConsent', top: '88', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'visitationDoNotConsent', top: '88', left: '35', placeholder: '' },
      { type: 'input', field: 'custodyAlternativeOrder', top: '91', left: '20', width: '75%', placeholder: 'Alternative order' },
    ]
  },
  {
    page: 2,
    fields: [
      // Item 3: Child Support
      { type: 'checkbox', field: 'childSupportFiledFL150', top: '10', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'childSupportConsent', top: '15', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'childSupportGuidelineConsent', top: '18', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'childSupportDoNotConsent', top: '21', left: '8', placeholder: '' },
      { type: 'input', field: 'childSupportAlternativeOrder', top: '21', left: '45', width: '50%', placeholder: 'Alternative order' },

      // Item 4: Spousal Support
      { type: 'checkbox', field: 'spousalSupportFiledFL150', top: '30', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'spousalSupportConsent', top: '35', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'spousalSupportDoNotConsent', top: '38', left: '8', placeholder: '' },
      { type: 'input', field: 'spousalSupportAlternativeOrder', top: '38', left: '45', width: '50%', placeholder: 'Alternative order' },

      // Item 5: Property Control
      { type: 'checkbox', field: 'propertyControlConsent', top: '47', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'propertyControlDoNotConsent', top: '50', left: '8', placeholder: '' },
      { type: 'input', field: 'propertyControlAlternativeOrder', top: '50', left: '45', width: '50%', placeholder: 'Alternative order' },

      // Item 6: Attorney's Fees
      { type: 'checkbox', field: 'attorneyFeesFiledFL150', top: '58', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'attorneyFeesFiledFL158', top: '61', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'attorneyFeesConsent', top: '66', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'attorneyFeesDoNotConsent', top: '69', left: '8', placeholder: '' },
      { type: 'input', field: 'attorneyFeesAlternativeOrder', top: '69', left: '45', width: '50%', placeholder: 'Alternative order' },

      // Item 7: Domestic Violence Order
      { type: 'checkbox', field: 'domesticViolenceConsent', top: '77', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'domesticViolenceDoNotConsent', top: '80', left: '8', placeholder: '' },
      { type: 'input', field: 'domesticViolenceAlternativeOrder', top: '80', left: '45', width: '50%', placeholder: 'Alternative order' },

      // Item 8: Other Orders
      { type: 'checkbox', field: 'otherOrdersConsent', top: '87', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'otherOrdersDoNotConsent', top: '90', left: '8', placeholder: '' },
      { type: 'input', field: 'otherOrdersAlternativeOrder', top: '90', left: '45', width: '50%', placeholder: 'Alternative order' },

      // Item 9: Time for Service
      { type: 'checkbox', field: 'timeForServiceConsent', top: '97', left: '8', placeholder: '' },
      { type: 'checkbox', field: 'timeForServiceDoNotConsent', top: '100', left: '8', placeholder: '' },
      { type: 'input', field: 'timeForServiceAlternativeOrder', top: '100', left: '45', width: '50%', placeholder: 'Alternative order' },
    ]
  },
  {
    page: 3, // Assuming facts and signature might extend to page 3 or be on page 2
    fields: [
      // Item 10: Facts
      { type: 'textarea', field: 'facts', top: '10', left: '5', width: '90%', height: '60%', placeholder: 'FACTS TO SUPPORT (10-page limit)' },
      { type: 'checkbox', field: 'factsAttachment', top: '72', left: '85', placeholder: '' },

      // Signature Section
      { type: 'checkbox', field: 'declarationUnderPenalty', top: '80', left: '5', placeholder: '' },
      { type: 'input', field: 'signatureDate', top: '90', left: '5', width: '15%', placeholder: 'DATE' },
      { type: 'input', field: 'printName', top: '90', left: '25', width: '35%', placeholder: 'PRINT NAME' },
      { type: 'input', field: 'signatureName', top: '90', left: '65', width: '30%', placeholder: 'SIGNATURE' },
    ]
  }
];
```

**NOTE**: These positions are ESTIMATES and will need refinement based on actual PDF overlay testing.

---

#### Step 2: Update FieldNavigationPanel.tsx
**File**: `src/components/FieldNavigationPanel.tsx`

**Required Changes**:

**A. Update FIELD_CONFIG array (lines 62-119)**:

Replace entire array with:

```typescript
const FIELD_CONFIG: FieldConfig[] = [
  // Header - Party Information
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
  { field: 'attorneyFor', label: 'Attorney For', type: 'input', placeholder: 'Attorney for or Self-Represented', vaultField: 'attorney_name' },
  { field: 'stateBarNumber', label: 'State Bar Number', type: 'input', placeholder: 'State bar number' },

  // Header - Court Information
  { field: 'county', label: 'County', type: 'input', placeholder: 'County' },
  { field: 'courtStreetAddress', label: 'Court Street Address', type: 'input', placeholder: 'Court street address' },
  { field: 'courtMailingAddress', label: 'Court Mailing Address', type: 'input', placeholder: 'Court P.O. Box' },
  { field: 'courtCityAndZip', label: 'Court City and ZIP', type: 'input', placeholder: 'Court city and ZIP' },
  { field: 'branchName', label: 'Branch Name', type: 'input', placeholder: 'Court branch name' },

  // Header - Case Information
  { field: 'petitioner', label: 'Petitioner', type: 'input', placeholder: 'Petitioner name' },
  { field: 'respondent', label: 'Respondent', type: 'input', placeholder: 'Respondent name' },
  { field: 'otherParentParty', label: 'Other Parent/Party', type: 'input', placeholder: 'Other parent or party name' },
  { field: 'caseNumber', label: 'Case Number', type: 'input', placeholder: 'Case number' },

  // Header - Hearing Information
  { field: 'hearingDate', label: 'Hearing Date', type: 'input', placeholder: 'MM/DD/YYYY' },
  { field: 'hearingTime', label: 'Hearing Time', type: 'input', placeholder: 'HH:MM AM/PM' },
  { field: 'hearingDepartment', label: 'Department', type: 'input', placeholder: 'Department' },
  { field: 'hearingRoom', label: 'Room', type: 'input', placeholder: 'Room number' },

  // Item 1: Restraining Order Information
  { field: 'restrainingOrderNone', label: 'No restraining orders in effect', type: 'checkbox' },
  { field: 'restrainingOrderActive', label: 'Restraining orders are in effect', type: 'checkbox' },

  // Item 2: Child Custody / Visitation
  { field: 'childCustodyConsent', label: 'Consent to child custody order', type: 'checkbox' },
  { field: 'visitationConsent', label: 'Consent to visitation order', type: 'checkbox' },
  { field: 'childCustodyDoNotConsent', label: 'Do not consent to custody', type: 'checkbox' },
  { field: 'visitationDoNotConsent', label: 'Do not consent to visitation', type: 'checkbox' },
  { field: 'custodyAlternativeOrder', label: 'Alternative custody/visitation order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 3: Child Support
  { field: 'childSupportFiledFL150', label: 'Filed Income & Expense Declaration (FL-150)', type: 'checkbox' },
  { field: 'childSupportConsent', label: 'Consent to child support order', type: 'checkbox' },
  { field: 'childSupportGuidelineConsent', label: 'Consent to guideline support', type: 'checkbox' },
  { field: 'childSupportDoNotConsent', label: 'Do not consent to support order', type: 'checkbox' },
  { field: 'childSupportAlternativeOrder', label: 'Alternative child support order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 4: Spousal Support
  { field: 'spousalSupportFiledFL150', label: 'Filed Income & Expense Declaration (FL-150)', type: 'checkbox' },
  { field: 'spousalSupportConsent', label: 'Consent to spousal support order', type: 'checkbox' },
  { field: 'spousalSupportDoNotConsent', label: 'Do not consent to support order', type: 'checkbox' },
  { field: 'spousalSupportAlternativeOrder', label: 'Alternative spousal support order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 5: Property Control
  { field: 'propertyControlConsent', label: 'Consent to property control order', type: 'checkbox' },
  { field: 'propertyControlDoNotConsent', label: 'Do not consent to property order', type: 'checkbox' },
  { field: 'propertyControlAlternativeOrder', label: 'Alternative property control order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 6: Attorney's Fees
  { field: 'attorneyFeesFiledFL150', label: 'Filed Income & Expense Declaration (FL-150)', type: 'checkbox' },
  { field: 'attorneyFeesFiledFL158', label: 'Filed Attorney Fees Declaration (FL-158)', type: 'checkbox' },
  { field: 'attorneyFeesConsent', label: 'Consent to attorney fees order', type: 'checkbox' },
  { field: 'attorneyFeesDoNotConsent', label: 'Do not consent to fees order', type: 'checkbox' },
  { field: 'attorneyFeesAlternativeOrder', label: 'Alternative attorney fees order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 7: Domestic Violence Order
  { field: 'domesticViolenceConsent', label: 'Consent to domestic violence order', type: 'checkbox' },
  { field: 'domesticViolenceDoNotConsent', label: 'Do not consent to DV order', type: 'checkbox' },
  { field: 'domesticViolenceAlternativeOrder', label: 'Alternative DV order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 8: Other Orders
  { field: 'otherOrdersConsent', label: 'Consent to other orders requested', type: 'checkbox' },
  { field: 'otherOrdersDoNotConsent', label: 'Do not consent to other orders', type: 'checkbox' },
  { field: 'otherOrdersAlternativeOrder', label: 'Alternative other orders', type: 'input', placeholder: 'Describe alternative order' },

  // Item 9: Time for Service
  { field: 'timeForServiceConsent', label: 'Consent to time for service order', type: 'checkbox' },
  { field: 'timeForServiceDoNotConsent', label: 'Do not consent to service timing', type: 'checkbox' },
  { field: 'timeForServiceAlternativeOrder', label: 'Alternative service timing order', type: 'input', placeholder: 'Describe alternative order' },

  // Item 10: Facts
  { field: 'facts', label: 'Facts to Support Declaration', type: 'textarea', placeholder: 'Enter facts (10-page limit)' },
  { field: 'factsAttachment', label: 'Attachment 10 (additional facts)', type: 'checkbox' },

  // Signature
  { field: 'declarationUnderPenalty', label: 'Declaration under penalty of perjury', type: 'checkbox' },
  { field: 'signatureDate', label: 'Date', type: 'input', placeholder: 'MM/DD/YYYY' },
  { field: 'printName', label: 'Print Name', type: 'input', placeholder: 'Print your name', vaultField: 'full_name' },
  { field: 'signatureName', label: 'Signature', type: 'input', placeholder: 'Sign your name', vaultField: 'full_name' },
];
```

**B. Update getDefaultPosition function** (lines 210-307):

Replace entire function with positions matching field overlays above.

---

#### Step 3: Build and Test
```bash
npm run build  # Should succeed with 0 errors
npm run test   # Should pass all tests
node field-position-validator.mjs  # Will need updates for new fields
```

---

## 📋 Remaining Work Estimate

| Task | Time | Difficulty |
|------|------|------------|
| Update FormViewer.tsx | 2-3 hours | Medium |
| Update FieldNavigationPanel.tsx | 2-3 hours | Medium |
| Update field-position-validator.mjs | 1 hour | Easy |
| Visual testing & position refinement | 3-4 hours | Medium |
| Build & test fixes | 1 hour | Easy |
| Documentation updates | 1 hour | Easy |
| **TOTAL** | **10-15 hours** | **~1-2 days** |

---

## 🎯 Success Criteria

- [ ] TypeScript builds with 0 errors
- [ ] All 52 fields render correctly
- [ ] Field positions validated (100/100 score)
- [ ] No field overlaps
- [ ] All tests passing
- [ ] Visual inspection complete
- [ ] Documentation updated

---

## 📚 Key Documents Reference

1. **FL320_COMPLETE_FIELD_GUIDE.md** - Official field requirements
2. **FL320_VISUAL_ANALYSIS_CORRECTIONS.md** - What's wrong with current impl
3. **SYSTEMATIC_FORM_IMPLEMENTATION_GUIDE.md** - How to implement any form
4. **FL320_IMPLEMENTATION_STATUS.md** (this file) - Current status

---

## 🔄 Next Session Start Here

1. Open `src/components/FormViewer.tsx`
2. Update `fieldNameToIndex` mapping (copy from above)
3. Update `fieldOverlays` array (copy from above)
4. Open `src/components/FieldNavigationPanel.tsx`
5. Update `FIELD_CONFIG` array (copy from above)
6. Update `getDefaultPosition` function
7. Build: `npm run build`
8. Fix any TypeScript errors
9. Test visually
10. Refine positions
11. Commit and push

---

## 🚀 After FL-320 Complete

Apply SYSTEMATIC_FORM_IMPLEMENTATION_GUIDE.md to:

**Priority 1**: DV-100, DV-110, DV-120 (Domestic Violence forms)
**Priority 2**: FL-100, FL-150, FL-300 (Core family law forms)
**Priority 3**: Supporting forms (FL-330, FL-335, FL-157, FL-158)

Each form: 15-24 hours (2-3 days) using systematic framework

---

**Last Commit**: 150964f (FormData interface corrected)
**Ready for**: Component updates (FormViewer + FieldNavigationPanel)
**Estimated Completion**: 1-2 days for 100% accurate FL-320
