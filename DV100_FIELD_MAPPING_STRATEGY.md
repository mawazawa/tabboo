# DV-100 Field Mapping Strategy

**Created**: November 19, 2025
**Purpose**: Systematic approach to mapping all 837 DV-100 fields to database schema

---

## Executive Summary

- **Form**: DV-100 (Request for Domestic Violence Restraining Order)
- **Total Fields**: 837 fields across 13 pages
- **Total Items**: 34 numbered items
- **Database Pattern**: Following FL-320 implementation (canonical_fields + form_field_mappings)
- **Position System**: Percentage-based (0-100% top/left) with DECIMAL(5,2) precision

---

## Field Categories by Section

### Header Section (Page 1)
**Category**: `header`
**Fields**: 18 fields
- Court information (superior court, branch, street, city/zip)
- Attorney information (name, bar number, address, phone, fax, email, attorney for)
- Case information (petitioner, respondent)

### Item 1: Person Asking for Protection (Page 1)
**Category**: `party_info`
**Subcategory**: `petitioner`
**Fields**: 10 fields
- Full name, date of birth, age, sex, race, height, weight, hair color, eye color, distinguishing features

### Item 2: Person You Want Protection From (Page 1)
**Category**: `party_info`
**Subcategory**: `respondent`
**Fields**: 5 fields
- Full name, date of birth, sex, relationship, other information

### Item 3: Relationship (Pages 1-2)
**Category**: `relationship`
**Fields**: 25+ fields (13+ checkboxes with nested conditionals)
- Checkboxes for relationship types (spouse, partner, dating, parent, child, etc.)
- Conditional fields for dates, addresses, children information

### Item 4: Other Restraining Orders (Page 2)
**Category**: `existing_orders`
**Fields**: 20+ fields
- Multiple checkboxes and conditional text fields
- Case numbers, counties, dates

### Items 5-7: Abuse Documentation (Pages 3-5)
**Category**: `abuse_history`
**Fields**: ~90 fields (30 per incident × 3 incidents)
- Date of abuse
- Witnesses (yes/no/don't know + names)
- Weapons (yes/no + description)
- Harm (yes/no + description)
- Police called (yes/no/don't know)
- Details (large textarea)
- Frequency (checkboxes + dates)

### Item 8: Other Protected People (Page 6)
**Category**: `protected_parties`
**Fields**: 35+ fields
- Yes/no checkboxes
- Up to 4 people (name, age, relationship, lives with you yes/no)
- More people checkbox
- Why protection needed (textarea)

### Item 9: Firearms (Page 6)
**Category**: `firearms`
**Fields**: 21 fields
- Don't know / No / Yes checkboxes
- Up to 6 firearms (describe, number/amount, location)

### Items 10-22: Orders to Request (Pages 7-10)
**Category**: `orders_requested`
**Subcategories**: Varies by order type
**Fields**: ~400 fields (highly variable)

**Item 10**: Order to Not Abuse (1 checkbox)
**Item 11**: No-Contact Order (1 checkbox)
**Item 12**: Stay-Away Order (35+ fields - complex nested structure)
**Item 13**: Move Out Order (15+ fields)
**Item 14**: Other Orders (2 fields)
**Item 15**: Child Custody (1 checkbox + DV-105 requirement)
**Item 16**: Protect Animals (40+ fields - up to 4 animals)
**Item 17**: Control of Property (3 fields)
**Item 18**: Health Insurance (1 checkbox)
**Item 19**: Record Communications (1 checkbox)
**Item 20**: Property Restraint (1 checkbox)
**Item 21**: Extend Deadline (2 fields)
**Item 22**: Pay Debts (35+ fields - complex nested structure)

### Items 23-26: Court Hearing Orders (Page 11)
**Category**: `hearing_orders`
**Fields**: 35+ fields

**Item 23**: Pay Expenses (15+ fields - up to 4 expenses)
**Item 24**: Child Support (4 fields)
**Item 25**: Spousal Support (1 checkbox)
**Item 26**: Lawyer's Fees (1 checkbox)

### Items 27-31: Automatic Orders (Page 12)
**Category**: `automatic_orders`
**Fields**: 12 fields

**Item 27**: Batterer Program (1 checkbox)
**Item 28**: Wireless Transfer (8 fields - up to 4 numbers)
**Items 29-31**: Automatic (no fields, just informational text)

### Item 32: Additional Pages (Page 13)
**Category**: `metadata`
**Fields**: 1 field
- Number of extra pages

### Items 33-34: Signatures (Page 13)
**Category**: `signature`
**Fields**: 6 fields
- Petitioner signature, date, printed name
- Attorney signature, date, printed name

---

## Field Positioning Strategy

### Approach: Manual Positioning with PDF Measurement

**Why Manual?**
1. DV-100 PDF does not contain embedded form fields (scanned image PDF)
2. 837 fields require precise positioning for court-ready output
3. FL-320 precedent shows this approach works (64 fields positioned successfully)

**Tools**:
- PDF measurement tool (Adobe Acrobat or similar)
- SwiftFill edit mode for visual verification
- field-position-validator.mjs for validation

**Process**:
1. Open dv100.pdf in measurement tool
2. Measure each field's position from top-left corner
3. Convert pixel/point coordinates to percentages:
   - `position_top = (Y_coordinate / page_height) * 100`
   - `position_left = (X_coordinate / page_width) * 100`
4. Estimate field width and height as percentages
5. Insert into form_field_mappings table

**Estimated Time**: 12-18 hours for 837 fields (~1-1.3 minutes per field)

---

## Database Schema Plan

### Step 1: Insert Form Record

```sql
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  revision_date,
  total_field_count,
  is_current
) VALUES (
  'DV-100',
  'Request for Domestic Violence Restraining Order',
  'DV',
  'Petition for domestic violence restraining order with temporary orders',
  'request',
  'complex',
  90,
  '2025-01-01',
  837,
  TRUE
);
```

### Step 2: Create Canonical Fields

**Categories to create**:
- `header` - Court and attorney information
- `party_info` - Petitioner and respondent details
- `relationship` - Relationship documentation
- `existing_orders` - Prior restraining orders
- `abuse_history` - Abuse incident documentation
- `protected_parties` - Additional protected people
- `firearms` - Firearm information
- `orders_requested` - Relief requested
- `hearing_orders` - Orders for court date
- `automatic_orders` - Automatic protective orders
- `metadata` - Form metadata
- `signature` - Signature fields

**Semantic Types**:
- `person_name` - Full legal names
- `address` - Street addresses
- `phone` - Telephone numbers
- `email` - Email addresses
- `date` - Date fields
- `case_id` - Case numbers
- `currency` - Dollar amounts
- `boolean` - Yes/no/don't know
- `long_text` - Textareas for detailed descriptions

### Step 3: Map Fields to Form

For each of 837 fields:
```sql
INSERT INTO form_field_mappings (
  form_id,
  field_id,
  form_field_name,
  item_number,
  page_number,
  position_top,
  position_left,
  field_width,
  field_height,
  is_required,
  placeholder_text,
  help_text
) VALUES (
  -- Generated values based on field guide
);
```

---

## Prioritization Strategy

### Phase 1: Critical Path Fields (Priority 1)
**Estimated**: 150 fields, 2-3 hours

Fields absolutely required for minimum viable form:
- Header section (all 18 fields)
- Item 1: Person asking for protection (all 10 fields)
- Item 2: Person you want protection from (all 5 fields)
- Item 3: Relationship (core 13 checkboxes only)
- Item 5: Most recent abuse (all fields)
- Item 33: Signature section (all 3 fields)

**Rationale**: These fields allow user to file a basic DV-100 with one abuse incident.

### Phase 2: Common Use Cases (Priority 2)
**Estimated**: 250 fields, 4-5 hours

Fields used in 80% of DV-100 filings:
- Item 8: Other protected people (children)
- Item 9: Firearms information
- Item 10: Order to not abuse
- Item 11: No-contact order
- Item 12: Stay-away order
- Item 15: Child custody checkbox

### Phase 3: Comprehensive Coverage (Priority 3)
**Estimated**: 437 fields, 6-10 hours

All remaining fields for 100% form coverage:
- Items 6-7: Additional abuse incidents
- Items 13-14: Move out, other orders
- Items 16-22: Property, insurance, debts, expenses
- Items 23-28: Court hearing orders, automatic orders
- Item 32: Additional pages
- Item 34: Attorney signature

---

## Testing Strategy

### Automated Validation
```bash
node field-position-validator.mjs --form=DV-100
```

**Target Metrics**:
- 0 overlapping fields
- 0 out-of-bounds fields
- 100/100 alignment score
- All required fields present

### Manual Visual Testing
1. Load DV-100 in SwiftFill
2. Fill all fields with test data
3. Export to PDF
4. Compare with original dv100.pdf
5. Verify all text appears in correct positions
6. Print test to verify court-ready output

### User Acceptance Testing
- Test with self-represented litigant
- Measure completion time
- Identify confusing fields
- Verify accessibility (screen readers, keyboard navigation)

---

## Migration File Structure

**Filename**: `supabase/migrations/20251119_populate_dv100_fields.sql`

**Sections**:
1. Form record insertion
2. Canonical field definitions (grouped by category)
3. Field mappings with positions (grouped by page/item)
4. Comments and documentation
5. Validation queries

**Estimated Size**: 15,000-20,000 lines of SQL

---

## Next Steps

1. ✅ Complete field guide reading
2. 🔄 Create this strategy document
3. ⏳ Begin Phase 1 field positioning (150 critical fields)
4. ⏳ Create migration SQL file
5. ⏳ Apply migration to database
6. ⏳ Test DV-100 rendering in SwiftFill
7. ⏳ Continue Phases 2-3 field positioning
8. ⏳ Write E2E tests

---

**Author**: Claude (SwiftFill Development Team)
**Last Updated**: November 19, 2025
