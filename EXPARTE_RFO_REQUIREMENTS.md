# Ex Parte RFO Requirements - San Francisco Superior Court

**Date Compiled**: November 19, 2025
**Source**: SF Superior Court Local Rules, CA Judicial Council Forms (2025)

## Overview

Ex parte applications (emergency orders) in family law require specific forms and procedures. This document outlines requirements for San Francisco Superior Court, with procedures applicable statewide.

---

## Required Forms for Ex Parte RFO Packet

### Core Forms (Mandatory)

1. **FL-300: Request for Order**
   - **Revised**: July 1, 2025 (latest version)
   - **Purpose**: Primary request document
   - **Page Limit**: Supporting facts cannot exceed 10 pages (unless court permits)
   - **Official PDF**: https://courts.ca.gov/system/files?file=2025-07/fl300.pdf

2. **FL-303: Declaration Regarding Notice and Service**
   - **Revised**: July 1, 2020
   - **Purpose**: Declares how/when other party was notified
   - **Note**: Do NOT use for domestic violence restraining orders
   - **Official PDF**: https://www.courts.ca.gov/documents/fl303.pdf

3. **FL-305: Temporary Emergency (Ex Parte) Orders**
   - **Revised**: July 1, 2016 (still current)
   - **Purpose**: Proposed temporary orders for court to sign
   - **Service**: Must be personally served with all documents
   - **Official PDF**: Available via https://selfhelp.courts.ca.gov/jcc-form/FL-305

### Optional/Conditional Forms

- **FL-306**: Information Sheet - Application for Order and Supporting Declaration
- **FL-157**: Notice of Hearing (if hearing scheduled)
- **Additional Declarations**: MC-030 or custom declarations
- **Income & Expense Declarations**: FL-150 (if requesting financial orders)

---

## Filing Requirements - San Francisco Superior Court

### Timing & Deadlines

- **E-Filing Deadline**: No later than **2 hours prior** to hearing time
- **Courtesy Copy Delivery**: Must be delivered to assigned department by hearing time
  - **Dept. 301**: Odd-numbered cases
  - **Dept. 302**: Even-numbered cases
- **Hearing Time**: 11:00 AM daily (by CourtCall, no in-person appearances)

### Service Requirements

**Emergency Nature**: Ex parte orders must address:
- Immediate loss or irreparable harm to a party or children
- Immediate loss/damage to property
- Emergency hearing/trial procedure changes

**Notice to Other Party**:
- Emergency ex parte RFOs must be served within **a few hours** of filing
- Other party may have **no time** before hearing to respond
- Personal service required for FL-305 orders
- Shorter notice than standard RFOs (typically 16 court days)

**What Qualifies as Emergency**:
- "Blood on the floor" standard - actual or imminent harm
- **NOT for**: Expedited support orders, car loan payments, routine requests

### Document Preparation

**First Page Requirements**:
- Case number
- Hearing date, time, location
- Hearing judge name
- Title of each attached document (except exhibits)
- Date action was filed
- Trial date (if set)

**Page Limitations**:
- Supporting facts: 10-page maximum (unless court permits more)
- Declarations should be concise and focused on emergency nature

**Courtesy Copies**:
- Required for documents needing court review/action/signature
- Paper format
- Due by 1:30 PM next business day after e-filing
- **Exception**: Ex parte documents due at hearing time

---

## Legal Standards for Ex Parte Orders

### Family Code § 3064 (Child Custody/Visitation)

Applications must include:
- **Full, detailed description** of most recent incidents
- Evidence of **immediate harm** to child
- Evidence of **immediate risk** child will be removed from California

### General Ex Parte Standards

From California Rules of Court, Rule 5.151:
- Cannot use for routine matters
- Emergency must be genuine and immediate
- Courts may grant orders with or without emergency hearing
- Local court rules vary - always check local procedures

---

## Workflow Sequence

### User Journey (Self-Represented Litigant)

1. **Determine Emergency Qualifies**
   - Real harm occurring or imminent
   - Cannot wait for regular RFO calendar (16+ days)

2. **Complete FL-300**
   - Check "Temporary Emergency Orders" box
   - Describe emergency clearly and concisely
   - Attach supporting evidence/declarations

3. **Complete FL-303**
   - Declare notice given to other party (or why not)
   - Specify date/time/method of notice

4. **Complete FL-305**
   - Draft specific orders requested
   - Court will sign this if granted

5. **E-File at Least 2 Hours Before Hearing**
   - Upload all forms via SF Court e-filing portal
   - Pay filing fee (if first filing in case)

6. **Deliver Courtesy Copy**
   - Print and deliver to Dept. 301 or 302
   - Include all exhibits
   - Deliver by hearing time

7. **Attend Hearing via CourtCall**
   - Call in at 11:00 AM
   - No in-person appearances permitted

8. **Serve Other Party**
   - Personal service of all documents + granted orders
   - Within hours of filing
   - Proof of service filed afterward

---

## Technical Implementation Requirements

### Form Field Extraction

Each form requires:
- Field names (e.g., `petitioner_name`, `case_number`)
- Field types (text, checkbox, date, textarea)
- Field positions (x, y coordinates, width, height)
- Validation rules (required, format, max length)

### Database Schema

Tables needed:
- `exparte_workflows` - Workflow state tracking
- `form_field_mappings` - PDF coordinate mappings
- `canonical_fields` - Reusable field definitions
- Existing: `legal_documents`, `personal_info`

### Auto-Fill Logic

Data mapping:
- **FL-300 → FL-303**: Case number, party names, filing date
- **FL-300 → FL-305**: Case number, party names, requested orders
- **Personal Vault → All Forms**: Name, address, contact, attorney info

### Validation Rules

**FL-300 Validation**:
- Required: Case number, petitioner name, respondent name
- Required: At least one request checked
- Required: Emergency justification (if ex parte)
- Format: Case number pattern validation
- Length: Supporting facts ≤ 10 pages

**FL-303 Validation**:
- Required: Notice method selected OR good cause declaration
- Required: Date/time of notice (if given)
- Conditional: If no notice, reason required

**FL-305 Validation**:
- Required: At least one order specified
- Required: Expiration date (if temporary)
- Consistency: Orders must match FL-300 requests

---

## UX Design Requirements

### Anxiety Reduction Features

Self-represented litigants face high anxiety with ex parte filings:
- **Process Transparency**: Show all steps upfront
- **Time Estimates**: "This form takes ~15 minutes"
- **Auto-Save**: Save every 5 seconds
- **Progress Tracking**: "2 of 3 forms complete"
- **Smart Validation**: Real-time feedback, not after submission
- **Plain Language**: Avoid legal jargon where possible

### Workflow Wizard UI

```
Step 1: Emergency Qualification Check
  - [ ] Is there immediate harm occurring or about to occur?
  - [ ] Can this wait 16+ days for a regular RFO?
  - [ ] Have you tried to notify the other party?

Step 2: FL-300 Request for Order
  - Auto-fill from Personal Data Vault
  - Real-time field validation
  - Character counters for text limits
  - Emergency justification guidance

Step 3: FL-303 Notice Declaration
  - Auto-populated case info from FL-300
  - Notice method selector
  - Date/time pickers

Step 4: FL-305 Proposed Orders
  - Auto-populated from FL-300 requests
  - Order expiration date calculator
  - Template language for common orders

Step 5: Review & File
  - PDF preview of all forms
  - Validation checklist
  - Filing instructions
  - CourtCall information
```

### Error Prevention

- **Pre-validation**: Check before allowing form submission
- **Smart Defaults**: Auto-fill common values
- **Conditional Fields**: Show/hide based on selections
- **Inline Help**: Tooltips, examples, explanations
- **Court-Specific Rules**: Highlight SF Superior Court requirements

---

## Next Steps (Implementation)

1. **Download PDFs**: FL-300, FL-303, FL-305
2. **Extract Fields**: Use pdf-lib or similar tool
3. **Create TypeScript Interfaces**: FL300FormData, FL303FormData, FL305FormData
4. **Create Zod Schemas**: Validation for each form
5. **Build FormViewer Components**: FL300FormViewer, FL303FormViewer, FL305FormViewer
6. **Create Workflow Engine**: ExParteWorkflowEngine hook
7. **Build Wizard Component**: ExPartePacketWizard
8. **Add Route**: /ex-parte-rfo page
9. **Test End-to-End**: Real case data validation

---

## References

- **SF Superior Court Local Rules**: https://sf.courts.ca.gov/system/files/local-rules/local-rules-court-effective-january-1-2024_0.pdf
- **CA Rules of Court, Rule 5.151**: https://courts.ca.gov/cms/rules/index/five/rule5_151
- **CA Judicial Council Forms**: https://www.courts.ca.gov/forms.htm
- **Self-Help Guide**: https://selfhelp.courts.ca.gov/

---

**Document Version**: 1.0
**Last Updated**: November 19, 2025
**Author**: Claude Code (SwiftFill Development Team)
