# FL-320 Visual Analysis - Critical Corrections Required

## 🚨 CRITICAL FINDING

After analyzing the actual FL-320 PDF form using vision capabilities, I discovered that **we have been implementing fields that do not exist on this form**.

The FL-320 "Responsive Declaration to Request for Order" is primarily a **consent/response form**, not a data collection form for children.

---

## ✅ Correct Fields (Match the Form)

### Header Section - Party Information
- ✅ NAME (partyName)
- ✅ FIRM NAME - **MISSING** (need to add)
- ✅ STREET ADDRESS (streetAddress)
- ✅ **MAILING ADDRESS - MISSING** (need to add separate field)
- ✅ CITY (city)
- ✅ STATE (state)
- ✅ ZIP CODE (zipCode)
- ✅ TELEPHONE NO (telephoneNo)
- ✅ FAX NO (faxNo)
- ✅ E-MAIL ADDRESS (email)
- ✅ ATTORNEY FOR (attorneyFor)
- ✅ STATE BAR NUMBER (attorneyBarNumber) ✅

### Header Section - Court Information
- ✅ SUPERIOR COURT OF CALIFORNIA, COUNTY OF (county)
- ✅ STREET ADDRESS - **Court's address** (not currently separate)
- ✅ MAILING ADDRESS - **Court's mailing** (not currently separate)
- ✅ CITY AND ZIP CODE - **Court's city/zip** (not currently separate)
- ✅ BRANCH NAME - **MISSING** (need to add)

### Header Section - Case Information
- ✅ PETITIONER (petitioner)
- ✅ RESPONDENT (respondent)
- ✅ **OTHER PARENT/PARTY - MISSING** (need to add)
- ✅ CASE NUMBER (caseNumber)
- ✅ HEARING DATE (hearingDate) ✅
- ✅ TIME (hearingTime) ✅
- ✅ DEPARTMENT OR ROOM (hearingDepartment + hearingRoom) ✅

---

## ❌ INCORRECT Fields (Not on FL-320)

These fields **DO NOT EXIST** on the FL-320 form:

### Incorrectly Added Child Information Fields
- ❌ child1Name - **DOES NOT EXIST**
- ❌ child1BirthDate - **DOES NOT EXIST**
- ❌ child2Name - **DOES NOT EXIST**
- ❌ child2BirthDate - **DOES NOT EXIST**
- ❌ child3Name - **DOES NOT EXIST**
- ❌ child3BirthDate - **DOES NOT EXIST**

**Why**: FL-320 is a response form. Child names are already established in the original Request for Order. This form only asks whether you **consent** to orders about the children, not to list the children.

---

## 📋 Correct Form Structure

### Item 1: RESTRAINING ORDER INFORMATION
- ☐ a. No domestic violence restraining/protective orders are now in effect between the parties in this case.
- ☐ b. I agree that one or more domestic violence restraining/protective orders are now in effect between the parties in this case.

**Our Implementation**:
- We have `noOrders` and `agreeOrders` but these are for Item 2, not Item 1
- **Need to add**: `restrainingOrderNone`, `restrainingOrderActive`

### Item 2: CHILD CUSTODY / VISITATION (PARENTING TIME)
- ☐ a. I consent to the order requested for child custody (legal and physical custody).
- ☐ b. I consent to the order requested for visitation (parenting time).
- ☐ c. I do not consent to the order requested for:
  - ☐ child custody
  - ☐ visitation (parenting time)
  - but I consent to the following order: __________

**Our Implementation**:
- ✅ `orderChildCustody` (maps to checkbox 2.a)
- ✅ `orderVisitation` (maps to checkbox 2.b)
- ✅ `consentCustody` (maps to checkbox 2.c child custody)
- ✅ `consentVisitation` (maps to checkbox 2.c visitation)
- **But naming is confusing** - these aren't "orders", they're consent responses

### Item 3: CHILD SUPPORT
- a. I have completed and filed a current Income and Expense Declaration (form FL-150)...
- ☐ b. I consent to the order requested.
- ☐ c. I consent to guideline support.
- ☐ d. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ✅ `orderChildSupport` (but should be `childSupportConsent`)
- ❌ Missing: `childSupportFiledFL150` checkbox
- ❌ Missing: `childSupportGuidelineConsent` checkbox
- ❌ Missing: `childSupportAlternativeOrder` text field

### Item 4: SPOUSAL OR DOMESTIC PARTNER SUPPORT
- a. I have completed and filed a current Income and Expense Declaration (form FL-150)...
- ☐ b. I consent to the order requested.
- ☐ c. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ✅ `orderSpousalSupport` (but should be `spousalSupportConsent`)
- ❌ Missing: `spousalSupportFiledFL150` checkbox
- ❌ Missing: `spousalSupportAlternativeOrder` text field

### Item 5: PROPERTY CONTROL
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ✅ `orderPropertyControl` (should be `propertyControlConsent`)
- ❌ Missing: `propertyControlAlternativeOrder` text field

### Item 6: ATTORNEY'S FEES AND COSTS
- a. I have completed and filed a current Income and Expense Declaration (form FL-150)...
- b. I have completed and filed with this form a Supporting Declaration for Attorney's Fees and Costs Attachment (form FL-158)...
- ☐ c. I consent to the order requested.
- ☐ d. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ✅ `orderAttorneyFees` (should be `attorneyFeesConsent`)
- ❌ Missing: `attorneyFeesFiledFL150` checkbox
- ❌ Missing: `attorneyFeesFiledFL158` checkbox
- ❌ Missing: `attorneyFeesAlternativeOrder` text field

### Item 7: DOMESTIC VIOLENCE ORDER
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ❌ **COMPLETELY MISSING** - We don't have domestic violence order fields at all!
- **Need to add**: `domesticViolenceConsent`, `domesticViolenceAlternativeOrder`

### Item 8: OTHER ORDERS REQUESTED
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ✅ `orderOther` (should be `otherOrdersConsent`)
- ✅ `orderOtherText` (maps to alternative order text) ✅

### Item 9: TIME FOR SERVICE / TIME UNTIL HEARING
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order:

**Our Implementation**:
- ❌ **COMPLETELY MISSING**
- **Need to add**: `timeForServiceConsent`, `timeForServiceAlternativeOrder`

### Item 10: FACTS TO SUPPORT
Large text area for facts (10-page limit unless court gives permission)

**Our Implementation**:
- ✅ `facts` (textarea) ✅
- ✅ Correctly implemented

### Declaration and Signature
- "I declare under penalty of perjury under the laws of the State of California that the information provided in this form and all attachments is true and correct."
- Date: __________
- (TYPE OR PRINT NAME) __________
- (SIGNATURE OF DECLARANT) __________

**Our Implementation**:
- ✅ `declarationUnderPenalty` (checkbox) ✅
- ✅ `signatureDate` ✅
- ✅ `printName` ✅
- ✅ `signatureName` ✅

---

## 🎯 Corrected Field Count

### Currently Implemented: 41 fields
### Actually Needed for FL-320: ~35-40 fields

**Fields to REMOVE** (6 fields):
- child1Name, child1BirthDate
- child2Name, child2BirthDate
- child3Name, child3BirthDate

**Fields to ADD** (~10 fields):
- firmName
- mailingAddress
- otherParentParty
- branchName
- restrainingOrderNone
- restrainingOrderActive
- childSupportFiledFL150
- childSupportGuidelineConsent
- spousalSupportFiledFL150
- domesticViolenceConsent
- timeForServiceConsent

**Fields to RENAME** (for clarity):
- orderChildCustody → childCustodyConsent
- orderVisitation → visitationConsent
- orderChildSupport → childSupportConsent
- orderSpousalSupport → spousalSupportConsent
- orderAttorneyFees → attorneyFeesConsent
- orderPropertyControl → propertyControlConsent
- orderOther → otherOrdersConsent

---

## 📊 Visual Layout Analysis

Looking at the actual PDF:

### Page 1 Layout:

**Top Section (Header - ~25% of page)**:
- Party/Attorney info (left side)
- Court info (center)
- Case info (right side)
- FOR COURT USE ONLY box (top right)

**Main Section (Items 1-4 - ~75% of page)**:
- Item 1: Restraining Order (2 checkboxes)
- Item 2: Child Custody/Visitation (complex nested checkboxes)
- Item 3: Child Support (4 checkboxes + sub-options)
- Item 4: Spousal Support (3 checkboxes + sub-options)

### Page 2 Layout:

**Top Section**:
- Petitioner/Respondent/Other Parent repeat

**Main Section (Items 5-10)**:
- Item 5: Property Control (2 checkboxes)
- Item 6: Attorney's Fees (4 checkboxes)
- Item 7: Domestic Violence (2 checkboxes)
- Item 8: Other Orders (2 checkboxes)
- Item 9: Time for Service (2 checkboxes)
- Item 10: Facts (large text area)

**Bottom Section**:
- Declaration under penalty of perjury
- Signature line

---

## 🔧 Required Changes

### Immediate Priority (Critical):

1. **REMOVE child name/birthdate fields** - They don't exist on FL-320
2. **ADD missing header fields**:
   - firmName
   - mailingAddress
   - otherParentParty
   - branchName

3. **ADD missing consent fields**:
   - Item 1: restrainingOrderNone, restrainingOrderActive
   - Item 6: attorneyFeesFiledFL150, attorneyFeesFiledFL158
   - Item 7: domesticViolenceConsent, domesticViolenceAlternativeOrder
   - Item 9: timeForServiceConsent, timeForServiceAlternativeOrder

4. **RENAME fields for clarity** - Use "Consent" suffix instead of "order" prefix

### Secondary Priority (UX):

1. Update field labels to match exact form language
2. Group checkboxes by item number
3. Add sub-checkboxes for "but I consent to the following order" options
4. Add text fields for alternative orders

---

## 📏 Field Positioning Corrections

Based on visual analysis of actual PDF:

### Header Section:
- **Party name**: Should be top-left, ~8-10% from top
- **Firm name**: Immediately below party name
- **Street address**: Below firm name
- **City/State/ZIP**: Single line, below street
- **Phone/Fax**: Single line, below city
- **Email**: Below phone/fax
- **Attorney for**: Below email
- **State bar number**: Right side of attorney line

### Our Current Positions vs. Actual:
- ✅ partyName: 15.8% (CLOSE - should be ~8-10%)
- ✅ streetAddress: 19% (CLOSE - should be ~11-13%)
- ⚠️ Missing firmName field
- ⚠️ Missing mailingAddress field

---

## 🎯 Conclusion

**Status**: Our implementation has **significant structural issues**

**Key Problems**:
1. ❌ 6 fields that don't exist on the form (child names/birthdates)
2. ❌ 10+ missing fields that ARE on the form
3. ⚠️ Field naming doesn't match form intent (consent vs. order)
4. ⚠️ Missing alternative order text fields for each section

**Impact on Production Readiness**:
- Before this analysis: 85% ready
- After this analysis: **~55-60% ready** (structural issues discovered)

**Revised Estimate to 100%**:
- Remove incorrect fields: 2 hours
- Add missing fields: 4 hours
- Rename/reorganize fields: 2 hours
- Update positions: 1 hour
- Test and validate: 2 hours
- **Total: 11 hours (1-2 days)**

---

**Recommendation**: **DO NOT PROCEED to user testing until these structural issues are fixed.**

The current implementation would confuse users because it asks for information that doesn't belong on this form.

---

**Created**: 2025-11-15
**Analysis Method**: Claude Vision API analysis of actual FL-320 PDF
**Status**: CRITICAL CORRECTIONS REQUIRED
