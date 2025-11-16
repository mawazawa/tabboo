# FL-320 Precise Field Coordinates

**Analysis Date**: 2025-11-15
**Source**: Visual analysis of /public/fl320.pdf

## Coordinate System
- Percentages based on page dimensions (0-100% horizontal, 0-100% vertical)
- Top-left is (0, 0)
- Measurements based on standard 8.5" x 11" letter size

---

## PAGE 1

### HEADER SECTION (0-30%)

#### Left Column - Party/Attorney Information
| Field | Top (%) | Left (%) | Width (%) | Type |
|-------|---------|----------|-----------|------|
| NAME | 3.5 | 2 | 38 | input |
| FIRM NAME | 6.5 | 2 | 38 | input |
| STREET ADDRESS | 9.5 | 2 | 38 | input |
| CITY | 12.5 | 2 | 18 | input |
| STATE | 12.5 | 21 | 6 | input |
| ZIP CODE | 12.5 | 28 | 10 | input |
| TELEPHONE NO | 15.5 | 2 | 18 | input |
| FAX NO | 15.5 | 21 | 17 | input |
| E-MAIL ADDRESS | 18.5 | 2 | 38 | input |
| ATTORNEY FOR (name) | 21.5 | 2 | 28 | input |
| STATE BAR NUMBER | 21.5 | 31 | 9 | input |

#### Center Column - Court Information
| Field | Top (%) | Left (%) | Width (%) | Type |
|-------|---------|----------|-----------|------|
| COUNTY OF | 4.5 | 42 | 30 | input |
| STREET ADDRESS | 7.5 | 42 | 30 | input |
| MAILING ADDRESS | 10 | 42 | 30 | input |
| CITY AND ZIP CODE | 12.5 | 42 | 30 | input |
| BRANCH NAME | 15 | 42 | 30 | input |

#### Right Column - Case Information
| Field | Top (%) | Left (%) | Width (%) | Type |
|-------|---------|----------|-----------|------|
| PETITIONER | 19 | 74 | 24 | input |
| RESPONDENT | 21 | 74 | 24 | input |
| OTHER PARENT/PARTY | 23 | 74 | 24 | input |
| CASE NUMBER | 27.5 | 74 | 24 | input |
| HEARING DATE | 29 | 74 | 11 | input |
| TIME | 29 | 86 | 6 | input |
| DEPT OR ROOM | 29 | 93 | 5 | input |

---

### ITEM 1: RESTRAINING ORDER INFORMATION (33-37%)

| Field | Top (%) | Left (%) | Type | Notes |
|-------|---------|----------|------|-------|
| restrainingOrderNone | 34 | 6.5 | checkbox | "No domestic violence..." |
| restrainingOrderActive | 36 | 6.5 | checkbox | "I agree that one or more..." |

---

### ITEM 2: CHILD CUSTODY / VISITATION (38-56%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| childCustodyConsent | 42 | 6.5 | - | checkbox | "I consent to... child custody" |
| visitationConsent | 44 | 6.5 | - | checkbox | "I consent to... visitation" |
| childCustodyDoNotConsent | 46.5 | 6.5 | - | checkbox | "I do not consent... child custody" |
| visitationDoNotConsent | 46.5 | 32 | - | checkbox | "visitation (parenting time)" |
| custodyAlternativeOrder | 48 | 9 | 89 | input | "but I consent to the following order:" |

---

### ITEM 3: CHILD SUPPORT (57-76%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| childSupportFiledFL150 | 59.5 | 6.5 | - | checkbox | "I have completed and filed... FL-150" |
| childSupportConsent | 64 | 6.5 | - | checkbox | "I consent to the order requested" |
| childSupportGuidelineConsent | 66 | 6.5 | - | checkbox | "I consent to guideline support" |
| childSupportDoNotConsent | 68 | 6.5 | - | checkbox | "I do not consent..." |
| childSupportAlternativeOrder | 68 | 35 | 63 | input | "but I consent to the following order:" |

---

### ITEM 4: SPOUSAL OR DOMESTIC PARTNER SUPPORT (77-96%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| spousalSupportFiledFL150 | 82 | 6.5 | - | checkbox | "I have completed and filed... FL-150" |
| spousalSupportConsent | 87 | 6.5 | - | checkbox | "I consent to the order requested" |
| spousalSupportDoNotConsent | 89.5 | 6.5 | - | checkbox | "I do not consent..." |
| spousalSupportAlternativeOrder | 89.5 | 35 | 63 | input | "but I consent to the following order:" |

---

## PAGE 2

### HEADER (0-5%)
Same fields as Page 1 header (PETITIONER, RESPONDENT, OTHER PARENT/PARTY, CASE NUMBER) - positions TBD

---

### ITEM 5: PROPERTY CONTROL (7-13%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| propertyControlConsent | 9 | 6.5 | - | checkbox | "I consent to the order requested" |
| propertyControlDoNotConsent | 11 | 6.5 | - | checkbox | "I do not consent..." |
| propertyControlAlternativeOrder | 11 | 35 | 63 | input | "but I consent to the following order:" |

---

### ITEM 6: ATTORNEY'S FEES AND COSTS (15-33%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| attorneyFeesFiledFL150 | 18 | 6.5 | - | checkbox | "I have completed and filed... FL-150" |
| attorneyFeesFiledFL158 | 21 | 6.5 | - | checkbox | "I have completed and filed... FL-158" |
| attorneyFeesConsent | 25 | 6.5 | - | checkbox | "I consent to the order requested" |
| attorneyFeesDoNotConsent | 27 | 6.5 | - | checkbox | "I do not consent..." |
| attorneyFeesAlternativeOrder | 27 | 35 | 63 | input | "but I consent to the following order:" |

---

### ITEM 7: DOMESTIC VIOLENCE ORDER (35-43%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| domesticViolenceConsent | 38 | 6.5 | - | checkbox | "I consent to the order requested" |
| domesticViolenceDoNotConsent | 40.5 | 6.5 | - | checkbox | "I do not consent..." |
| domesticViolenceAlternativeOrder | 40.5 | 35 | 63 | input | "but I consent to the following order:" |

---

### ITEM 8: OTHER ORDERS REQUESTED (45-53%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| otherOrdersConsent | 48 | 6.5 | - | checkbox | "I consent to the order requested" |
| otherOrdersDoNotConsent | 50.5 | 6.5 | - | checkbox | "I do not consent..." |
| otherOrdersAlternativeOrder | 50.5 | 35 | 63 | input | "but I consent to the following order:" |

---

### ITEM 9: TIME FOR SERVICE / TIME UNTIL HEARING (55-63%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| timeForServiceConsent | 58 | 6.5 | - | checkbox | "I consent to the order requested" |
| timeForServiceDoNotConsent | 60.5 | 6.5 | - | checkbox | "I do not consent..." |
| timeForServiceAlternativeOrder | 60.5 | 35 | 63 | input | "but I consent to the following order:" |

---

### ITEM 10: FACTS TO SUPPORT (68-83%)

| Field | Top (%) | Left (%) | Width (%) | Height (%) | Type | Notes |
|-------|---------|----------|-----------|------------|------|-------|
| facts | 70 | 2 | 96 | 12 | textarea | Large text area |
| factsAttachment | 82.5 | 72 | - | - | checkbox | "Attachment 10" |

---

### SIGNATURE SECTION (88-97%)

| Field | Top (%) | Left (%) | Width (%) | Type | Notes |
|-------|---------|----------|-----------|------|-------|
| declarationUnderPenalty | 85 | 2 | - | checkbox | "I declare under penalty of perjury..." |
| signatureDate | 90 | 2 | 15 | input | "Date:" |
| printName | 93.5 | 2 | 35 | input | "(TYPE OR PRINT NAME)" |
| signatureName | 93.5 | 50 | 48 | input | "(SIGNATURE OF DECLARANT)" |

---

## NOTES

1. **Checkbox Positioning**: All checkboxes are at left: 6.5% (aligned with indent after item numbers)
2. **Alternative Order Fields**: All "but I consent to the following order:" fields start at left: 35%
3. **Standard Width for Alternative Orders**: 63% width
4. **Vertical Spacing**: ~2-3% between related checkboxes, ~5-8% between items
5. **Page 2 Header**: Minimal - only party names and case number, much smaller than Page 1

---

## ADJUSTMENT STRATEGY

1. Start with Page 1 header fields (most critical for form identification)
2. Move to Item 1-4 on Page 1
3. Test and iterate with visual comparison
4. Move to Page 2 Items 5-10
5. Final signature section
6. Overall validation with field-position-validator.mjs
