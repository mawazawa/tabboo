# Manual Visual Testing Guide for SwiftFill FL-320

## Purpose
This guide provides step-by-step instructions for manually testing the FL-320 form field positioning and UX to ensure it meets California court standards and is ready for self-represented litigants (SRLs).

## Prerequisites
- Dev server running: `npm run dev`
- Browser open to: `http://localhost:8080`
- PDF form loaded: FL-320 (Response to Request for Order)

## Test Data Set
Use this standardized test data to fill all form fields:

```json
{
  "partyName": "Jane Smith",
  "streetAddress": "123 Main Street",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "telephoneNo": "(555) 123-4567",
  "faxNo": "(555) 123-4568",
  "email": "jane.smith@example.com",
  "attorneyFor": "Self-Represented",
  "attorneyBarNumber": "N/A",
  "county": "Los Angeles",
  "petitioner": "John Doe",
  "respondent": "Jane Smith",
  "caseNumber": "FL12345678",
  "hearingDate": "12/15/2025",
  "hearingTime": "9:00 AM",
  "hearingDepartment": "Dept 3",
  "hearingRoom": "301",
  "child1Name": "Emily Jane Smith",
  "child1BirthDate": "03/15/2015",
  "child2Name": "Michael John Smith",
  "child2BirthDate": "07/22/2018",
  "child3Name": "Sarah Ann Smith",
  "child3BirthDate": "11/08/2020",
  "orderChildCustody": true,
  "orderVisitation": true,
  "orderChildSupport": false,
  "orderSpousalSupport": false,
  "orderAttorneyFees": false,
  "orderPropertyControl": false,
  "orderOther": true,
  "orderOtherText": "Temporary restraining order",
  "noOrders": false,
  "agreeOrders": false,
  "consentCustody": false,
  "consentVisitation": true,
  "facts": "Respondent requests modification of custody arrangement due to change in work schedule. New schedule allows for increased parenting time during weekdays. Both children have expressed desire to spend more time with respondent.",
  "declarationUnderPenalty": true,
  "signatureDate": "11/15/2025",
  "signatureName": "Jane Smith",
  "printName": "JANE SMITH"
}
```

## Testing Checklist

### Phase 1: Field Sizing Compliance (California Rules of Court)

**Objective**: Verify all fields meet California court standards

| Test | Expected Result | Pass/Fail |
|------|----------------|-----------|
| Input field height | 24px (h-6) | ☐ |
| Font size | 12pt minimum | ☐ |
| Font family | Monospace (Courier-style) | ☐ |
| Textarea height | 48px minimum (2 lines at 12pt) | ☐ |
| Checkbox size | 16-20px | ☐ |

**How to Test**:
1. Open browser DevTools (F12)
2. Inspect any input field
3. Check computed styles:
   - `height: 24px` (h-6 class)
   - `font-size: 12pt`
   - `font-family` includes monospace

**Screenshot Required**: `01-field-sizing-devtools.png`

---

### Phase 2: Field Positioning Accuracy

**Objective**: Verify field overlays align with PDF form fields

**Test Procedure**:
1. Fill all fields with test data (use copy-paste from JSON above)
2. Enable "Edit Positions" mode (top-right button)
3. Visually inspect each field group

**Field Groups to Verify**:

#### Group A: Attorney/Party Information (Left Column)
- ☐ All fields align vertically at 5% left margin
- ☐ Fields don't overlap with each other
- ☐ Fields align with PDF form lines
- ☐ Text is readable at 12pt

**Screenshot Required**: `02-attorney-info-alignment.png`

#### Group B: Case Information (Right Column)
- ☐ All fields align vertically at 55% left margin
- ☐ Clear separation from left column
- ☐ Fields align with PDF form lines
- ☐ "County" field at top right

**Screenshot Required**: `03-case-info-alignment.png`

#### Group C: Hearing Information (Item 2)
- ☐ Four fields in one row: Date, Time, Dept, Room
- ☐ Horizontally aligned at 38% from top
- ☐ Proper spacing between fields
- ☐ Date field wide enough for MM/DD/YYYY

**Screenshot Required**: `04-hearing-info-row.png`

#### Group D: Child Information (Item 3)
- ☐ Three rows of (Name, Birthdate) pairs
- ☐ Names align at 20% left
- ☐ Birthdates align at 57% left
- ☐ 3% vertical spacing between rows
- ☐ Names wider than birthdates (35% vs 15%)

**Screenshot Required**: `05-child-info-grid.png`

#### Group E: Order Types (Items 4-7)
- ☐ Seven checkboxes vertically aligned at 5%
- ☐ 3% vertical spacing between checkboxes
- ☐ "Other" text field extends to right
- ☐ Checkboxes are 16-20px square

**Screenshot Required**: `06-order-checkboxes.png`

#### Group F: Facts Textarea
- ☐ Wide textarea (90% width)
- ☐ 8% height (visible multi-line area)
- ☐ Text wraps properly
- ☐ Starts at 85% from top

**Screenshot Required**: `07-facts-textarea.png`

#### Group G: Signature Row
- ☐ Three fields: Date, Signature, Print Name
- ☐ Horizontally aligned at 96% from top
- ☐ Equal spacing across bottom
- ☐ Date field smaller (15% width)
- ☐ Signature and Print Name equal (30% each)

**Screenshot Required**: `08-signature-row.png`

---

### Phase 3: Field Coverage Completeness

**Objective**: Verify all FL-320 fields are present

| Section | Fields | Present | Notes |
|---------|--------|---------|-------|
| Item 1: Party Info | 10 fields | ☐ | Including bar number |
| Item 1: Case Info | 4 fields | ☐ | County, parties, case # |
| Item 2: Hearing | 4 fields | ☐ | Date, time, dept, room |
| Item 3: Children | 6 fields | ☐ | 3 children × 2 fields |
| Items 4-7: Orders | 8 fields | ☐ | 7 checkboxes + other text |
| Response Type | 4 checkboxes | ☐ | No orders, agree, consents |
| Facts | 1 textarea | ☐ | Large text area |
| Declaration | 1 checkbox | ☐ | Under penalty of perjury |
| Signature | 3 fields | ☐ | Date, signature, print name |
| **TOTAL** | **41 fields** | ☐ | All accounted for |

**Screenshot Required**: `09-field-navigation-panel.png` (showing all 41 fields)

---

### Phase 4: User Experience (SRL Perspective)

**Objective**: Assess real-world usability

#### Readability Test
- ☐ All text is legible at normal screen distance
- ☐ Font size feels professional (not too small/large)
- ☐ Field labels are clear and descriptive
- ☐ No text truncation or clipping

**Score**: ___/10

#### Navigation Test
- ☐ Tab key moves between fields logically
- ☐ Current field is highlighted
- ☐ Field navigation panel shows progress (1/41, 2/41, etc.)
- ☐ Can jump to specific field easily

**Score**: ___/10

#### Data Entry Test
1. Fill out entire form using only keyboard (no mouse)
2. Time how long it takes: _____ minutes
3. Note any friction points:

Expected time: < 5 minutes for experienced user

**Score**: ___/10

#### Mobile Responsiveness Test
1. Open on mobile device or resize browser to 375px width
2. Check:
   - ☐ Fields are tappable (not too small)
   - ☐ No horizontal scrolling in form panel
   - ☐ PDF scales appropriately
   - ☐ Navigation panel usable

**Score**: ___/10

**Screenshot Required**: `10-mobile-view.png`

---

### Phase 5: Print/Export Quality

**Objective**: Verify print output matches PDF form

#### Print Preview Test
1. Fill all fields with test data
2. Open browser print dialog (Ctrl/Cmd+P)
3. Preview the PDF output
4. Check:
   - ☐ Field text appears in correct positions
   - ☐ Text is 12pt (matches court requirement)
   - ☐ No text overflow or cutoff
   - ☐ Checkboxes appear as checked/unchecked
   - ☐ Professional appearance suitable for court filing

**Screenshot Required**: `11-print-preview.png`

#### PDF Export Test
1. Export/print to PDF
2. Open exported PDF in PDF reader
3. Verify:
   - ☐ All data present
   - ☐ Formatting preserved
   - ☐ File size reasonable (< 2 MB)
   - ☐ Text is searchable/selectable

**Screenshot Required**: `12-exported-pdf.png`

---

## Scoring Matrix

### Overall Production Readiness Score

| Category | Weight | Score (0-10) | Weighted Score |
|----------|--------|--------------|----------------|
| Field Sizing Compliance | 20% | ___ | ___ |
| Positioning Accuracy | 25% | ___ | ___ |
| Field Coverage | 20% | ___ | ___ |
| User Experience | 20% | ___ | ___ |
| Print/Export Quality | 15% | ___ | ___ |
| **TOTAL** | **100%** | **___** | **___/100** |

### Grade Scale
- **90-100**: A - Production ready for SRLs
- **80-89**: B - Ready with minor refinements
- **70-79**: C - Needs improvements before launch
- **60-69**: D - Significant issues to address
- **< 60**: F - Not ready for production

---

## Issue Tracking Template

If issues are found, document them here:

### Issue #1
- **Category**: [Field Sizing / Positioning / Coverage / UX / Print]
- **Severity**: [Critical / High / Medium / Low]
- **Description**:
- **Steps to Reproduce**:
- **Expected Behavior**:
- **Actual Behavior**:
- **Screenshot**:
- **Suggested Fix**:

---

## Test Completion

**Tester Name**: _______________
**Date**: _______________
**Environment**:
- Browser: _______________
- OS: _______________
- Screen Size: _______________

**Final Score**: ___/100
**Final Grade**: ___
**Production Ready**: YES / NO

**Notes**:


---

## Automated Validation

For reference, automated field position validation shows:

```
✅ No overlapping fields detected
✅ All fields within PDF bounds
✅ Proper alignment in columns and rows
🎯 Score: 100/100 (Grade: A)
```

Run validation anytime: `node field-position-validator.mjs`

---

## Next Steps After Testing

1. **If Grade A/B**:
   - Document test results
   - Proceed with user acceptance testing (UAT)
   - Plan production deployment

2. **If Grade C/D**:
   - Review issues logged
   - Prioritize fixes by severity
   - Implement corrections
   - Re-test affected areas

3. **If Grade F**:
   - Conduct detailed code review
   - Revisit design requirements
   - Consider architecture changes
   - Extensive re-testing required

---

**Last Updated**: 2025-11-15
**Version**: 1.0
**Form**: FL-320 (Response to Request for Order)
