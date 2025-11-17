# E-Filing Requirements - Los Angeles Superior Court

**Last Updated**: November 17, 2025
**Scope**: Domestic Violence Temporary Restraining Order (TRO) Packets
**Court**: Los Angeles Superior Court, Family Law Division

---

## Overview

This document outlines the electronic filing requirements for Domestic Violence TRO packets in Los Angeles Superior Court. SwiftFill's packet assembly system must comply with these requirements to generate court-ready filing packages.

---

## E-Filing Availability

### Self-Represented Litigants (SRLs)
- ✅ **Optional**: E-filing is available but NOT required for self-represented litigants
- ✅ **Alternative Methods**: SRLs may file in-person at the court or by mail
- ✅ **Guide and File Program**: LA Superior Court offers free "Guide and File" program on website
- ❌ **Email/Fax**: As of November 15, 2021, email and fax filing are NO LONGER available

### Filing Fees
- ✅ **No Filing Fee**: Domestic violence restraining orders have NO filing fee
- ✅ **E-Filing Fee Waived**: LA Superior Court waives the e-filing fee for DV cases

---

## PDF Format Requirements

### Page Specifications
| Requirement | Value | Authority |
|------------|-------|-----------|
| **Page Size** | 8.5" × 11" | CA Rules of Court 2.107 |
| **Left Margin** | ≥ 1.0 inch | CA Rules of Court 2.107 |
| **Right Margin** | ≥ 0.5 inch | CA Rules of Court 2.107 |
| **Top Margin** | ≥ 1.0 inch | CA Rules of Court 2.107 |
| **Bottom Margin** | ≥ 1.0 inch | CA Rules of Court 2.107 |

### PDF Technical Requirements
- ✅ **Text-Searchable**: All PDFs MUST be text-searchable (OCR required for scanned docs)
- ✅ **Maximum File Size**: 25 MB per filing
- ✅ **Page Numbering**: Consecutive Arabic numerals starting from page 1 on cover/first page
- ✅ **Format**: PDF/A recommended for long-term archival

### Electronic Bookmarks (Optional for SRLs)
- **Required**: For represented parties only
- **Optional**: Self-represented litigants are exempt from bookmark requirements
- **Best Practice**: Include bookmarks for better usability
  - Bookmark each exhibit with: "Exhibit [Letter/Number], [Brief Description]"
  - Example: "Exhibit A, Income and Expense Declaration FL-150"
  - Example: "Exhibit B, Text Messages from April 2025"
  - Bookmarks must link to first page of each exhibit
  - Bookmarks must retain reader's zoom setting

---

## Required Forms for TRO Packet

### Primary Filing Form
1. **DV-100**: Request for Domestic Violence Restraining Order
   - **Role**: Main request form (always required)
   - **Order**: First in packet

### Conditional Attachment Forms
2. **DV-105**: Request for Child Custody and Visitation Orders
   - **When Required**: If requesting child custody or visitation orders
   - **Order**: Attach to DV-100 (second in packet)

3. **FL-150**: Income and Expense Declaration
   - **When Required**: If requesting ANY financial relief (child support, spousal support, attorney fees, property control)
   - **Order**: After DV-100 and DV-105 (third in packet)

4. **CLETS-001**: Confidential CLETS Information
   - **When Required**: Always (law enforcement notification)
   - **Order**: Last in packet (confidential, not public record)
   - **Note**: Separate filing, not included in public packet

### Court-Issued Forms (Not Filed by Petitioner)
- **DV-109**: Notice of Court Hearing (court issues after review)
- **DV-110**: Temporary Restraining Order (court issues if granted)
- **DV-140**: Child Custody and Visitation Order (court issues if applicable)

---

## Packet Assembly Order

### Recommended Filing Sequence
```
1. DV-100 (Request for DV Restraining Order) ...................... Page 1+
2. DV-105 (Child Custody/Visitation) [if applicable] .............. Page X+
3. FL-150 (Income & Expense Declaration) [if applicable] .......... Page Y+
4. Supporting Evidence (exhibits, declarations, etc.) ............. Page Z+
5. CLETS-001 (Confidential - filed separately) .................... Separate filing
```

### Packet Validation Rules
Before assembly, validate:
- ✅ DV-100 is always included (required)
- ✅ If DV-100 requests child custody/visitation → DV-105 must be included
- ✅ If DV-100 requests ANY financial relief → FL-150 must be included
- ✅ CLETS-001 is completed (filed separately, not in main packet)
- ✅ All forms have same case number (if case already exists)
- ✅ All forms have consistent party names (petitioner/respondent)
- ✅ All dates are in MM/DD/YYYY format

---

## E-Filing Workflow (Guide and File Program)

### LA Superior Court's Guide and File System
1. **Interactive Interview**: Step-by-step guided questions
2. **Form Completion**: System auto-fills forms based on answers
3. **Save Progress**: Can save and return later
4. **Attach Documents**: Upload exhibits and supporting documents
5. **Electronic Signature**: Add e-signature to forms
6. **Review**: System generates PDFs for review
7. **Submit Options**:
   - **E-File**: Submit directly through Guide and File
   - **Download**: Download PDFs to print and file in-person

### SwiftFill Integration Strategy
SwiftFill complements Guide and File by:
- ✅ Providing AI-powered form completion assistance
- ✅ Offering drag-and-drop field positioning
- ✅ Enabling offline form work with auto-save
- ✅ Generating court-ready PDF packets for either:
  - **E-filing** through Guide and File (download → upload)
  - **In-person filing** (download → print → file)

---

## E-Filing Output Specifications

### For SwiftFill E-Filing Export

#### Primary Packet PDF
```
Filename: [CaseNumber]_DV_TRO_Packet_[Date].pdf
Example: FL12345678_DV_TRO_Packet_20251117.pdf

Contents:
- DV-100 (pages 1-4)
- DV-105 (pages 5-8, if applicable)
- FL-150 (pages 9-14, if applicable)
- Exhibits (pages 15+, if any)

Metadata:
- Title: "Domestic Violence TRO Packet - [Case Number]"
- Author: "SwiftFill"
- Subject: "Request for Domestic Violence Restraining Order"
- Keywords: "DV-100, TRO, Family Law"
- Creator: "SwiftFill v1.0"
```

#### Separate CLETS-001 PDF
```
Filename: [CaseNumber]_CLETS001_[Date].pdf
Example: FL12345678_CLETS001_20251117.pdf

Note: CONFIDENTIAL - Not part of public packet
```

#### Optional: Individual Form PDFs
For users who prefer filing forms separately:
```
[CaseNumber]_DV100_[Date].pdf
[CaseNumber]_DV105_[Date].pdf
[CaseNumber]_FL150_[Date].pdf
```

---

## In-Person Filing Requirements

### Printing Specifications
- **Paper**: White, 8.5" × 11", standard 20lb
- **Print Quality**: Laser or high-quality inkjet (no thermal receipts)
- **Single-Sided**: All forms must be printed single-sided (one side only)
- **Stapling**: Do NOT staple; use paper clips
- **Originals**: Must submit original forms (no photocopies of signatures)
- **Copies**: Bring 2 extra copies:
  - 1 for respondent (court will serve)
  - 1 for petitioner's records

### Filing Location
**Stanley Mosk Courthouse**
111 N. Hill Street
Los Angeles, CA 90012
Room 100 (Family Law Filing Window)

**Hours**: Monday-Friday, 8:30 AM - 4:30 PM

### Required Steps for In-Person Filing
1. ✅ Print all forms single-sided
2. ✅ Sign all forms in ORIGINAL ink (no digital signatures for in-person)
3. ✅ Bring 2 copies of all forms
4. ✅ Bring photo ID
5. ✅ Go to Family Law filing window (Room 100)
6. ✅ Clerk will review forms for completeness
7. ✅ Clerk will file-stamp and return copies
8. ✅ Clerk will schedule hearing (usually 21 days out)
9. ✅ Clerk will provide DV-109 (Notice of Hearing) and DV-110 (TRO if granted)

---

## Common E-Filing Errors to Prevent

### PDF Format Errors
- ❌ **Non-searchable PDF**: Scanned images without OCR
  - **Fix**: Run OCR before export
- ❌ **Wrong page size**: A4 (8.27" × 11.69") instead of Letter (8.5" × 11")
  - **Fix**: Always use US Letter size
- ❌ **File too large**: Over 25 MB
  - **Fix**: Compress images, remove unnecessary pages
- ❌ **Incorrect margins**: Less than required
  - **Fix**: Validate margins before export

### Form Completion Errors
- ❌ **Missing required forms**: DV-100 without FL-150 when requesting support
  - **Fix**: Validate dependencies before assembly
- ❌ **Inconsistent party names**: "John Smith" vs "John A. Smith"
  - **Fix**: Normalize names across all forms
- ❌ **Missing signatures**: Unsigned declarations
  - **Fix**: Signature validation before export
- ❌ **Wrong date format**: "17 Nov 2025" instead of "11/17/2025"
  - **Fix**: Standardize date format to MM/DD/YYYY

### Page Numbering Errors
- ❌ **Starting from page 0**: Page numbering must start at 1
- ❌ **Roman numerals**: Must use Arabic numerals only
- ❌ **Non-consecutive**: Skipped page numbers
  - **Fix**: Validate continuous pagination

---

## SwiftFill Implementation Checklist

### PDF Generation (`eFilingExporter.ts`)
- [ ] Generate text-searchable PDFs (not images)
- [ ] Set page size to 8.5" × 11"
- [ ] Apply margins: Left 1", Right 0.5", Top/Bottom 1"
- [ ] Add consecutive page numbers (Arabic numerals, starting at 1)
- [ ] Embed metadata (title, author, subject, keywords)
- [ ] Validate file size ≤ 25 MB
- [ ] Add PDF/A compliance for archival

### Packet Assembly (`packetAssembler.ts`)
- [ ] Enforce form order: DV-100 → DV-105 → FL-150 → Exhibits
- [ ] Validate form dependencies (FL-150 if requesting support)
- [ ] Normalize party names across all forms
- [ ] Validate date formats (MM/DD/YYYY)
- [ ] Check for required signatures
- [ ] Generate separate CLETS-001 PDF (confidential)
- [ ] Create optional individual form PDFs

### Packet Validation (`PacketValidator.tsx`)
- [ ] Check DV-100 is present (required)
- [ ] Validate DV-105 if child custody requested
- [ ] Validate FL-150 if financial relief requested
- [ ] Check all forms have consistent case number
- [ ] Check all forms have consistent party names
- [ ] Verify all required fields completed
- [ ] Verify all required signatures present
- [ ] Show clear error messages with fixes

### Print Support (`printPacket.ts`)
- [ ] Generate print-optimized PDF (single-sided layout)
- [ ] Include filing checklist
- [ ] Add court location and hours
- [ ] Add "bring 2 copies" reminder
- [ ] Add "sign in original ink" reminder
- [ ] Include filing fee waiver info (no fee for DV)

### User Interface
- [ ] **Export Options**:
  - "Download for E-Filing" (combined PDF)
  - "Download for In-Person Filing" (with checklist)
  - "Download Individual Forms" (separate PDFs)
- [ ] **Validation Feedback**:
  - Green checkmarks for completed forms
  - Yellow warnings for optional improvements
  - Red errors for required fixes
- [ ] **Filing Instructions**:
  - E-filing: "Upload to LA Court Guide and File"
  - In-person: "Print, sign, bring 2 copies to Stanley Mosk Courthouse"

---

## Testing Checklist

### PDF Format Testing
- [ ] Validate page size is exactly 8.5" × 11"
- [ ] Verify margins meet minimum requirements
- [ ] Confirm text is searchable (Ctrl+F works)
- [ ] Test file size is under 25 MB
- [ ] Verify page numbering is consecutive Arabic numerals

### Packet Assembly Testing
- [ ] Test DV-100 only (minimal packet)
- [ ] Test DV-100 + DV-105 (child custody)
- [ ] Test DV-100 + FL-150 (financial relief)
- [ ] Test DV-100 + DV-105 + FL-150 (complete packet)
- [ ] Test with exhibits attached
- [ ] Verify CLETS-001 generates separately

### Form Validation Testing
- [ ] Test missing required form (should error)
- [ ] Test inconsistent party names (should warn)
- [ ] Test missing signatures (should error)
- [ ] Test wrong date format (should error)
- [ ] Test empty required fields (should error)

### Print Output Testing
- [ ] Verify single-sided layout
- [ ] Verify filing checklist included
- [ ] Verify instructions are clear
- [ ] Test printing on actual printer (8.5" × 11" paper)

---

## References

### California Rules of Court
- **Rule 2.107**: Format of documents to be filed
- **Rule 2.256**: Electronic exhibits
- **Rule 3.1110**: Format of documents filed in civil cases
- **Rule 8.74**: Format of electronic documents (appellate)

### Los Angeles Superior Court Resources
- **Guide and File**: https://www.lacourt.org/forms/pdf/LASC_GUIDE_FILE.pdf
- **Family Law E-Filing**: http://publichealth.lacounty.gov/dvcouncil/minutes/2021/12/Family Law Efiling webinar notes.pdf
- **Self-Help Center**: https://selfhelp.lacourt.org/

### California Judicial Council Forms
- **DV-100**: https://www.courts.ca.gov/documents/dv100.pdf
- **DV-105**: https://www.courts.ca.gov/documents/dv105.pdf
- **FL-150**: https://www.courts.ca.gov/documents/fl150.pdf
- **CLETS-001**: https://www.courts.ca.gov/documents/clets001.pdf

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-17 | 1.0 | Initial research and documentation |

---

**Maintained by**: SwiftFill Development Team
**Questions**: Refer to CLAUDE.md or LA Superior Court Self-Help Center
