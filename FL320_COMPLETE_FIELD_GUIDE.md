# FL-320 Responsive Declaration to Request for Order
## Complete Field Guide from California Courts Research

**Source**: California Judicial Council Form FL-320 (Rev. July 1, 2025)
**Reference**: California Rules of Court, rule 5.92 | Code of Civil Procedure, § 1005

---

## Purpose

FL-320 allows you to respond to a Request for Order (FL-300) filed by the other party. You use this form to:
- Tell the court and the other party if you **agree** or **disagree** with the orders requested
- Describe the orders you want the court to make **instead** of those requested
- Provide facts to support your position

**IMPORTANT**: This is a **consent/response form**, not a data collection form. Child names, birthdates, and other details are already established in the original Request for Order (FL-300).

---

## Filing Requirements

### Timeline
- **Must file** at least **9 court days** before the hearing date listed on FL-300
- **Must serve** a copy to the other parent/party at least 9 days before the hearing

### Required Attachments (depending on issue)
1. **If responding to child support or spousal support**:
   - Income and Expense Declaration (FL-150), OR
   - Financial Statement (Simplified) (FL-155) if eligible

2. **If responding to attorney's fees**:
   - Supporting Declaration for Attorney's Fees and Costs Attachment (FL-158), OR
   - Declaration addressing the factors covered in FL-158

3. **Facts section (Item 10)**:
   - Cannot exceed 10 pages unless court gives permission
   - Can use Attachment 10 for additional pages

---

## Field-by-Field Guide

### HEADER SECTION

#### Party/Attorney Information (Left Side)
| Field | Required | Notes |
|-------|----------|-------|
| **PARTY WITHOUT ATTORNEY OR ATTORNEY** | ✓ | Check which applies |
| **NAME** | ✓ | Your full legal name |
| **FIRM NAME** | If applicable | Law firm name if represented |
| **STREET ADDRESS** | ✓ | Physical address |
| **MAILING ADDRESS** | If different | P.O. Box or separate mailing address |
| **CITY** | ✓ | City name |
| **STATE** | ✓ | CA |
| **ZIP CODE** | ✓ | 5-digit ZIP |
| **TELEPHONE NO** | ✓ | (###) ###-#### |
| **FAX NO** | If available | (###) ###-#### |
| **E-MAIL ADDRESS** | ✓ | Valid email |
| **ATTORNEY FOR (name)** | ✓ | "Self-Represented" if no attorney |
| **STATE BAR NUMBER** | If attorney | Attorney's bar number |

#### Court Information (Center)
| Field | Required | Notes |
|-------|----------|-------|
| **SUPERIOR COURT OF CALIFORNIA, COUNTY OF** | ✓ | County where case is filed |
| **STREET ADDRESS** | ✓ | Court's street address |
| **MAILING ADDRESS** | If different | Court's P.O. Box |
| **CITY AND ZIP CODE** | ✓ | Court's city and ZIP |
| **BRANCH NAME** | If applicable | Court branch/division name |

#### Case Information (Right Box)
| Field | Required | Notes |
|-------|----------|-------|
| **PETITIONER** | ✓ | Name from original petition |
| **RESPONDENT** | ✓ | Name from original petition |
| **OTHER PARENT/PARTY** | If applicable | Third party name |
| **CASE NUMBER** | ✓ | Case number from FL-300 |

#### Hearing Information (Right Box)
| Field | Required | Notes |
|-------|----------|-------|
| **HEARING DATE** | ✓ | Date from FL-300 |
| **TIME** | ✓ | Time from FL-300 |
| **DEPARTMENT OR ROOM** | ✓ | Dept/Room from FL-300 |

**FOR COURT USE ONLY** box: Leave blank - clerk will fill this in.

---

## MAIN CONTENT SECTIONS

### Item 1: RESTRAINING ORDER INFORMATION
**Purpose**: Declare whether domestic violence restraining/protective orders exist

**Options** (check ONE):
- ☐ a. No domestic violence restraining/protective orders are now in effect between the parties in this case.
- ☐ b. I agree that one or more domestic violence restraining/protective orders are now in effect between the parties in this case.

**Field Names in SwiftFill**:
- `restrainingOrderNone` (checkbox a)
- `restrainingOrderActive` (checkbox b)

---

### Item 2: CHILD CUSTODY / VISITATION (PARENTING TIME)
**Purpose**: State your position on custody and visitation orders

**Options**:
- ☐ a. I consent to the order requested for child custody (legal and physical custody).
- ☐ b. I consent to the order requested for visitation (parenting time).
- ☐ c. I do not consent to the order requested for:
  - ☐ child custody
  - ☐ visitation (parenting time)
  - but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `childCustodyConsent` (checkbox 2.a)
- `visitationConsent` (checkbox 2.b)
- `childCustodyDoNotConsent` (checkbox 2.c child custody)
- `visitationDoNotConsent` (checkbox 2.c visitation)
- `custodyAlternativeOrder` (text field for alternative)

---

### Item 3: CHILD SUPPORT
**Purpose**: State your position on child support orders + confirm financial documents filed

**Options**:
- a. I have completed and filed a current *Income and Expense Declaration* (form FL-150) or, if eligible, a current *Financial Statement (Simplified)* (form FL-155) to support my responsive declaration.
- ☐ b. I consent to the order requested.
- ☐ c. I consent to guideline support.
- ☐ d. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `childSupportFiledFL150` (checkbox 3.a - required if responding to support)
- `childSupportConsent` (checkbox 3.b)
- `childSupportGuidelineConsent` (checkbox 3.c)
- `childSupportDoNotConsent` (checkbox 3.d)
- `childSupportAlternativeOrder` (text field for alternative)

**IMPORTANT**: Item 3.a is a **declaration**, not an option - you MUST file FL-150 or FL-155 if responding to child support.

---

### Item 4: SPOUSAL OR DOMESTIC PARTNER SUPPORT
**Purpose**: State your position on spousal support orders + confirm financial documents filed

**Options**:
- a. I have completed and filed a current *Income and Expense Declaration* (form FL-150) to support my responsive declaration.
- ☐ b. I consent to the order requested.
- ☐ c. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `spousalSupportFiledFL150` (checkbox 4.a - required if responding to support)
- `spousalSupportConsent` (checkbox 4.b)
- `spousalSupportDoNotConsent` (checkbox 4.c)
- `spousalSupportAlternativeOrder` (text field for alternative)

**IMPORTANT**: Item 4.a is a **declaration**, not an option - you MUST file FL-150 if responding to spousal support.

---

### Item 5: PROPERTY CONTROL
**Purpose**: State your position on property control orders

**Options**:
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `propertyControlConsent` (checkbox 5.a)
- `propertyControlDoNotConsent` (checkbox 5.b)
- `propertyControlAlternativeOrder` (text field for alternative)

---

### Item 6: ATTORNEY'S FEES AND COSTS
**Purpose**: State your position on attorney's fees + confirm financial documents filed

**Options**:
- a. I have completed and filed a current *Income and Expense Declaration* (form FL-150) to support my responsive declaration.
- b. I have completed and filed with this form a *Supporting Declaration for Attorney's Fees and Costs Attachment* (form FL-158) or a declaration that addresses the factors covered in that form.
- ☐ c. I consent to the order requested.
- ☐ d. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `attorneyFeesFiledFL150` (checkbox 6.a - required if responding to fees)
- `attorneyFeesFiledFL158` (checkbox 6.b - required if responding to fees)
- `attorneyFeesConsent` (checkbox 6.c)
- `attorneyFeesDoNotConsent` (checkbox 6.d)
- `attorneyFeesAlternativeOrder` (text field for alternative)

---

### Item 7: DOMESTIC VIOLENCE ORDER
**Purpose**: State your position on domestic violence restraining orders

**Options**:
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `domesticViolenceConsent` (checkbox 7.a)
- `domesticViolenceDoNotConsent` (checkbox 7.b)
- `domesticViolenceAlternativeOrder` (text field for alternative)

**NOTE**: This is different from Item 1 - Item 1 declares existing orders, Item 7 responds to request for NEW orders.

---

### Item 8: OTHER ORDERS REQUESTED
**Purpose**: Respond to any other orders not covered in Items 2-7

**Options**:
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `otherOrdersConsent` (checkbox 8.a)
- `otherOrdersDoNotConsent` (checkbox 8.b)
- `otherOrdersAlternativeOrder` (text field for alternative)

---

### Item 9: TIME FOR SERVICE / TIME UNTIL HEARING
**Purpose**: Respond to requests about service timing or hearing continuance

**Options**:
- ☐ a. I consent to the order requested.
- ☐ b. I do not consent to the order requested ☐ but I consent to the following order: ______________________________

**Field Names in SwiftFill**:
- `timeForServiceConsent` (checkbox 9.a)
- `timeForServiceDoNotConsent` (checkbox 9.b)
- `timeForServiceAlternativeOrder` (text field for alternative)

---

### Item 10: FACTS TO SUPPORT
**Purpose**: Provide detailed facts supporting your responsive declaration

**Instructions**:
- Write your facts in the space provided or on attached pages
- **Maximum 10 pages** unless court gives permission
- Use "Attachment 10" if you need additional pages
- Be specific, factual, and relevant to the orders requested

**Field Names in SwiftFill**:
- `facts` (large textarea)
- `factsAttachment` (checkbox for Attachment 10)

**What to include**:
- Chronological timeline of relevant events
- Specific facts supporting your position
- Why you consent or don't consent to requested orders
- Why your alternative orders are appropriate
- How orders affect children (if applicable)

**What NOT to include**:
- Personal attacks or inflammatory language
- Irrelevant information
- Legal arguments (save for court hearing)
- More than 10 pages without court permission

---

## SIGNATURE SECTION

### Declaration Under Penalty of Perjury
**Required**: You MUST sign this declaration

**Text**: "I declare under penalty of perjury under the laws of the State of California that the information provided in this form and all attachments is true and correct."

**Fields**:
| Field | Required | Notes |
|-------|----------|-------|
| **Date** | ✓ | Date you sign the form |
| **(TYPE OR PRINT NAME)** | ✓ | Your full legal name (printed) |
| **(SIGNATURE OF DECLARANT)** | ✓ | Your signature |

**Field Names in SwiftFill**:
- `signatureDate` (date field)
- `printName` (text input for printed name)
- `signatureName` (signature input)

**IMPORTANT**:
- Sign AFTER all information is complete
- Signature must be original (not typed)
- False statements are perjury (criminal offense)

---

## Common Mistakes to Avoid

1. ❌ **Not filing FL-150** when responding to support requests
2. ❌ **Missing the 9-day deadline** before hearing
3. ❌ **Not serving** the other party
4. ❌ **Writing more than 10 pages** in Facts section
5. ❌ **Not signing** the declaration
6. ❌ **Checking multiple conflicting boxes** (e.g., both "consent" and "do not consent")
7. ❌ **Leaving alternative order blank** when checking "do not consent but..."
8. ❌ **Using inflammatory language** in facts section
9. ❌ **Not attaching required forms** (FL-150, FL-158)
10. ❌ **Using old form version** (must be July 2025 version)

---

## Tips for Self-Represented Litigants

### Before Filling Out the Form
1. Read the Request for Order (FL-300) carefully
2. Identify which orders you agree/disagree with
3. Gather supporting documents (paystubs, bills, evidence)
4. Complete FL-150 or FL-155 if support is requested
5. Make copies of everything

### While Filling Out the Form
1. Type or print clearly in black ink
2. Check boxes carefully (only one option per item usually)
3. Be specific in "alternative order" text fields
4. Keep facts section factual, not emotional
5. Proofread before signing

### After Completing the Form
1. Make 3 copies (court, other party, your records)
2. File with court clerk (get filed-stamped copy)
3. Serve other party (proof of service required)
4. Keep all copies in safe place
5. Bring copies to hearing

---

## Related Forms You May Need

- **FL-300**: Request for Order (the form you're responding to)
- **FL-320-INFO**: Information Sheet for FL-320
- **FL-150**: Income and Expense Declaration
- **FL-155**: Financial Statement (Simplified)
- **FL-158**: Supporting Declaration for Attorney's Fees
- **FL-330**: Proof of Service by Mail
- **MC-030**: Declaration (for additional facts)

---

## Legal References

- **California Rules of Court, rule 5.92**: Responsive declaration requirements
- **Code of Civil Procedure, § 1005**: Filing and service timelines
- **Family Code provisions**: Specific to type of order (custody, support, etc.)

---

## Where to Get Help

- **California Courts Self-Help**: selfhelp.courts.ca.gov
- **County Family Law Facilitator**: Available at your courthouse
- **Legal Aid Organizations**: Free/low-cost legal help
- **Law Library**: Legal research assistance
- **Family Law Attorney**: Professional legal representation

---

**Form Information**:
- Form Number: FL-320
- Revision Date: July 1, 2025
- Mandatory Use: Yes (Judicial Council form)
- Fee: Check with court clerk

**Last Updated**: November 2025 (based on July 2025 form)

---

*This guide is for informational purposes only and does not constitute legal advice. Consult with an attorney for specific legal guidance.*
