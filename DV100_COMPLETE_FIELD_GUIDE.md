# DV-100 Request for Domestic Violence Restraining Order
## Complete Field Guide from California Courts Research

**Source**: California Judicial Council Form DV-100 (Rev. January 1, 2025)
**Reference**: Family Code, § 6200 et seq.

---

## Purpose

DV-100 is the primary form to request a Domestic Violence Restraining Order in California. This form allows you to:
- Request court protection from domestic violence
- Describe abuse incidents
- Request specific protective orders
- Request temporary custody/visitation orders
- Request financial orders (support, fees)

**IMPORTANT**: This is a **request form**, not a response form. The person filing this form is seeking protection from abuse.

---

## Filing Requirements

### Timeline
- File IMMEDIATELY when seeking protection
- No deadline - can file anytime after abuse occurs
- Temporary orders (TRO) granted same day if approved
- Court hearing scheduled approximately 3 weeks out

### Required Attachments
1. **Form DV-110**: Temporary Restraining Order (court completes items 1-3)
2. **Form DV-109**: Notice of Court Hearing (court completes items 1-2)
3. **Form CLETS-001**: Confidential Information for Law Enforcement
4. **If requesting child custody/visitation**:
   - Form DV-105: Request for Child Custody and Visitation Orders
   - Form DV-140: Child Custody and Visitation Order
5. **If requesting child/spousal support**:
   - Form FL-150: Income and Expense Declaration
   - OR Form FL-155: Financial Statement (Simplified) - if eligible
6. **If requesting child abduction prevention**:
   - Form DV-108: Request for Orders to Prevent Child Abduction
7. **If need more space for abuse description**:
   - Form DV-101: Description of Abuse

---

## Field-by-Field Guide

### HEADER SECTION (Page 1)

#### Court Information (Top Right)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Superior Court of California, County of** | input | ✓ | County where filing |
| **Street address** | input | ✓ | Court's street address |
| **Case Number** | input | | Court fills in when filed |

---

## ITEM 1: Person Asking for Protection

**Purpose**: Your identifying information and contact details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. Your name** | input | ✓ | Full legal name |
| **b. Your age** | input | ✓ | Current age |
| **c. Address** | input | ✓ | Where court can send papers |
| **c. City** | input | ✓ | City name |
| **c. State** | input | ✓ | State abbreviation (CA) |
| **c. Zip** | input | ✓ | ZIP code |
| **d. Telephone** | input | Optional | Safe phone number |
| **d. Fax** | input | Optional | Fax number |
| **d. Email Address** | input | Optional | Safe email address |
| **e. Your lawyer's Name** | input | If applicable | Attorney name |
| **e. State Bar No.** | input | If applicable | Attorney bar number |
| **e. Firm Name** | input | If applicable | Law firm name |

**Field Names in SwiftFill**:
- `item1a_yourName`
- `item1b_yourAge`
- `item1c_address`, `item1c_city`, `item1c_state`, `item1c_zip`
- `item1d_telephone`, `item1d_fax`, `item1d_email`
- `item1e_lawyerName`, `item1e_stateBarNo`, `item1e_firmName`

---

## ITEM 2: Person You Want Protection From

**Purpose**: Identifying information about the respondent

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. Full name** | input | ✓ | Respondent's full legal name |
| **b. Age** | input | ✓ | Estimate if unknown |
| **c. Date of birth** | input | If known | MM/DD/YYYY |
| **d. Gender** | checkbox | ✓ | M, F, or Nonbinary |
| **e. Race** | input | Optional | For identification |

**Field Names in SwiftFill**:
- `item2a_fullName`
- `item2b_age`
- `item2c_dateOfBirth`
- `item2d_genderM`, `item2d_genderF`, `item2d_genderNonbinary`
- `item2e_race`

---

## ITEM 3: Your Relationship to the Person in 2

**Purpose**: Establish qualifying domestic relationship for DV restraining order

**Options** (check all that apply):

| Field | Type | Notes |
|-------|------|-------|
| **a. We have a child or children together** | checkbox | List names of children |
| **a. (names of children)** | textarea | Child names |
| **b. We are married or registered domestic partners** | checkbox | |
| **c. We used to be married or registered domestic partners** | checkbox | |
| **d. We are dating or used to date** | checkbox | |
| **e. We are or used to be engaged to be married** | checkbox | |
| **f. We are related** | checkbox | Check sub-options |
| **f. Parent, stepparent, or parent-in-law** | checkbox | |
| **f. Brother, sister, sibling, stepsibling, or sibling in-law** | checkbox | |
| **f. Child, stepchild, or legally adopted child** | checkbox | |
| **f. Grandparent, step-grandparent, or grandparent-in-law** | checkbox | |
| **f. Child's spouse** | checkbox | |
| **f. Grandchild, step-grandchild, or grandchild-in-law** | checkbox | |
| **g. We live together or used to live together** | checkbox | |
| **g. Yes - lived as family/household** | checkbox | Required if checked g |
| **g. No - just roommates** | checkbox | Disqualifies if only relationship |

**Field Names in SwiftFill**:
- `item3a_haveChildren`, `item3a_childrenNames`
- `item3b_married`
- `item3c_usedToBeMarried`
- `item3d_dating`
- `item3e_engaged`
- `item3f_related`, `item3f_parent`, `item3f_sibling`, `item3f_child`, `item3f_grandparent`, `item3f_childSpouse`, `item3f_grandchild`
- `item3g_liveTogether`, `item3g_asFamily`, `item3g_jusRoommates`

---

## ITEM 4: Other Restraining Orders and Court Cases

**Purpose**: Disclose existing orders and related cases

### 4a: Existing Restraining Orders

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. No existing orders** | checkbox | One required | |
| **a. Yes, existing orders** | checkbox | One required | Provide details below |
| **(1) Date of order** | input | If yes | |
| **(1) Date it expires** | input | If yes | |
| **(2) Date of order** | input | If yes | Second order |
| **(2) Date it expires** | input | If yes | |

### 4b: Other Court Cases

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **b. No other cases** | checkbox | One required | |
| **b. Yes, other cases** | checkbox | One required | Check case types below |
| **Custody** | checkbox | If yes | List details |
| **Divorce** | checkbox | If yes | List details |
| **Juvenile** | checkbox | If yes | Child welfare/justice |
| **Guardianship** | checkbox | If yes | |
| **Criminal** | checkbox | If yes | |
| **Other** | checkbox | If yes | Describe case type |

**Field Names in SwiftFill**:
- `item4a_noOrders`, `item4a_yesOrders`
- `item4a1_dateOfOrder`, `item4a1_dateExpires`
- `item4a2_dateOfOrder`, `item4a2_dateExpires`
- `item4b_noOtherCases`, `item4b_yesOtherCases`
- `item4b_custody`, `item4b_divorce`, `item4b_juvenile`, `item4b_guardianship`, `item4b_criminal`, `item4b_other`

---

## ITEMS 5-7: Describe Abuse

**Purpose**: Provide detailed facts about abuse incidents for judge to evaluate

### ITEM 5: Most Recent Abuse (Page 3)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. Date of abuse** | input | ✓ | Estimate if exact date unknown |
| **b. Did anyone else see/hear?** | checkbox | ✓ | I don't know / No / Yes |
| **b. If yes, give names** | textarea | If yes | Witness names |
| **c. Use/threaten gun or weapon?** | checkbox | ✓ | No / Yes |
| **c. If yes, describe** | textarea | If yes | Type of weapon |
| **d. Cause emotional/physical harm?** | checkbox | ✓ | No / Yes |
| **d. If yes, describe harm** | textarea | If yes | Injuries/harm |
| **e. Did police come?** | checkbox | ✓ | I don't know / No / Yes |
| **f. Give more details** | textarea | ✓ | Detailed incident description |
| **g. How often has this happened?** | checkbox | ✓ | Just once / 2-5 times / Weekly / Other |
| **g. Give dates or estimates** | textarea | If applicable | Timeline of incidents |

**Field Names in SwiftFill**:
- `item5a_dateOfAbuse`
- `item5b_witnessDontKnow`, `item5b_witnessNo`, `item5b_witnessYes`, `item5b_witnessNames`
- `item5c_weaponNo`, `item5c_weaponYes`, `item5c_weaponDescribe`
- `item5d_harmNo`, `item5d_harmYes`, `item5d_harmDescribe`
- `item5e_policeDontKnow`, `item5e_policeNo`, `item5e_policeYes`
- `item5f_details`
- `item5g_justOnce`, `item5g_2to5times`, `item5g_weekly`, `item5g_other`
- `item5g_dates`

### ITEM 6: Different Type of Abuse (Page 4)

Same field structure as Item 5, different incident.

**Field Names in SwiftFill**: Replace `item5` with `item6` prefix.

### ITEM 7: Other Abuse (Page 5)

Same field structure as Item 5, third incident.

**Field Names in SwiftFill**: Replace `item5` with `item7` prefix.

**Checkbox for additional space**:
- `item7_needMoreSpace` - Check to attach DV-101 or additional pages

---

## ITEM 8: Other Protected People (Page 6)

**Purpose**: List additional people who need protection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. No** | checkbox | One required | No other people need protection |
| **b. Yes** | checkbox | One required | Complete table below |
| **(1) Full name** | input | If yes | Up to 4 people |
| **(1) Age** | input | If yes | |
| **(1) Relationship to you** | input | If yes | |
| **(1) Lives with you?** | checkbox | If yes | Yes / No |
| **More people checkbox** | checkbox | If needed | Attach additional sheet |
| **(2) Why do these people need protection?** | textarea | If yes | Explanation |

**Field Names in SwiftFill**:
- `item8a_no`, `item8b_yes`
- `item8b1_person1Name`, `item8b1_person1Age`, `item8b1_person1Relationship`, `item8b1_person1LivesYes`, `item8b1_person1LivesNo`
- (Repeat for person2, person3, person4)
- `item8b_needMorePeople`
- `item8b2_whyProtection`

---

## ITEM 9: Firearms Information (Page 6)

**Purpose**: Identify firearms respondent may possess

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. I don't know** | checkbox | One required | |
| **b. No** | checkbox | One required | No firearms |
| **c. Yes** | checkbox | One required | Complete table below |
| **(1-6) Describe Firearms** | input | If yes | Up to 6 firearms |
| **(1-6) Number or Amount** | input | If yes | Quantity |
| **(1-6) Location** | input | If known | Where stored |

**Field Names in SwiftFill**:
- `item9a_dontKnow`, `item9b_no`, `item9c_yes`
- `item9c1_describe`, `item9c1_number`, `item9c1_location`
- (Repeat for items 2-6)

---

## ITEMS 10-22: Orders to Request (Pages 7-10)

### ITEM 10: Order to Not Abuse (Page 7)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Asks judge to order no harassment, assault, stalking, etc. |

**Field Names in SwiftFill**: `item10_orderToNotAbuse`

### ITEM 11: No-Contact Order (Page 7)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | No contact with you or Item 8 people |

**Field Names in SwiftFill**: `item11_noContact`

### ITEM 12: Stay-Away Order (Page 7)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **a. Me** | checkbox | If checked | Stay away from you |
| **a. My home** | checkbox | If checked | Stay away from home |
| **a. My job or workplace** | checkbox | If checked | Stay away from work |
| **a. My vehicle** | checkbox | If checked | Stay away from vehicle |
| **a. My school** | checkbox | If checked | Stay away from school |
| **a. Each person in 8** | checkbox | If checked | Stay away from protected people |
| **a. My children's school or childcare** | checkbox | If checked | |
| **a. Other** | textarea | If checked | Specify location |
| **b. 100 yards (300 feet)** | checkbox | One required | Standard distance |
| **b. Other distance** | input | One required | Specify yards |
| **c. No - don't live together** | checkbox | | |
| **c. Yes - Live together** | checkbox | | Check sub-option |
| **c. Live in same building** | checkbox | If yes | |
| **c. Live in same neighborhood** | checkbox | If yes | |
| **c. Other** | textarea | If yes | Explain |
| **d. No - not same workplace/school** | checkbox | | |
| **d. Yes - same workplace/school** | checkbox | | Check sub-option |
| **d. Work together at** | input | If yes | Company name |
| **d. Go to same school** | input | If yes | School name |
| **d. Other** | textarea | If yes | Explain |

**Field Names in SwiftFill**:
- `item12_stayAway`
- `item12a_me`, `item12a_myHome`, `item12a_myJob`, `item12a_myVehicle`, `item12a_mySchool`, `item12a_item8People`, `item12a_childrensSchool`, `item12a_other`
- `item12b_100yards`, `item12b_otherDistance`
- `item12c_no`, `item12c_yes`, `item12c_liveTogether`, `item12c_sameBuilding`, `item12c_sameNeighborhood`, `item12c_other`
- `item12d_no`, `item12d_yes`, `item12d_workTogether`, `item12d_sameSchool`, `item12d_other`

### ITEM 13: Order to Move Out (Page 8)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **a. Address** | input | ✓ | Address to move out from |
| **b. I own the home** | checkbox | If checked | Reason for right to stay |
| **b. My name is on lease** | checkbox | If checked | |
| **b. I live at address with child(ren)** | checkbox | If checked | |
| **b. I have lived at address for __ years, __ months** | input | If checked | Duration |
| **b. I pay some/all rent or mortgage** | checkbox | If checked | |
| **b. Other** | textarea | If checked | Other reason |

**Field Names in SwiftFill**:
- `item13_moveOut`
- `item13a_address`
- `item13b_ownHome`, `item13b_nameOnLease`, `item13b_liveWithChildren`, `item13b_livedYears`, `item13b_livedMonths`, `item13b_payRent`, `item13b_other`

### ITEM 14: Other Orders (Page 8)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | |
| **Describe additional orders** | textarea | Free-form text for custom orders |

**Field Names in SwiftFill**: `item14_otherOrders`, `item14_describe`

### ITEM 15: Child Custody and Visitation (Page 8)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | MUST attach DV-105 if checked |

**Field Names in SwiftFill**: `item15_childCustody`

**IMPORTANT**: If checked, user MUST complete DV-105 form.

### ITEM 16: Protect Animals (Page 9)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **a. (1-4) Name/ID** | input | If checked | Up to 4 animals |
| **a. (1-4) Type** | input | If checked | Dog, cat, etc. |
| **a. (1-4) Breed** | input | If known | |
| **a. (1-4) Color** | input | If checked | |
| **b. (1) Stay away - 100 yards** | checkbox | If checked | |
| **b. (1) Stay away - Other yards** | input | If checked | Distance in yards |
| **b. (2) Not take, sell, hide, harm animals** | checkbox | If checked | |
| **b. (3) Give me sole possession** | checkbox | If checked | Check reasons |
| **b. (3) Person abuses animals** | checkbox | If (3) checked | |
| **b. (3) I take care of animals** | checkbox | If (3) checked | |
| **b. (3) I purchased animals** | checkbox | If (3) checked | |
| **b. (3) Other reason** | textarea | If (3) checked | |

**Field Names in SwiftFill**:
- `item16_protectAnimals`
- `item16a1_name`, `item16a1_type`, `item16a1_breed`, `item16a1_color`
- (Repeat for animals 2-4)
- `item16b1_stayAway100`, `item16b1_stayAwayOther`
- `item16b2_notTakeSellHarm`
- `item16b3_giveMePossession`, `item16b3_personAbuses`, `item16b3_iTakeCare`, `item16b3_iPurchased`, `item16b3_other`

### ITEM 17: Control of Property (Page 9)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **a. Property description** | textarea | ✓ | Describe property |
| **b. Why you want control** | textarea | ✓ | Explanation |

**Field Names in SwiftFill**: `item17_controlProperty`, `item17a_describe`, `item17b_why`

### ITEM 18: Health and Other Insurance (Page 9)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Order no changes to insurance |

**Field Names in SwiftFill**: `item18_insurance`

### ITEM 19: Record Communications (Page 9)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Permission to record violations |

**Field Names in SwiftFill**: `item19_recordCommunications`

### ITEM 20: Property Restraint (Page 10)

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Only if married/registered domestic partners |

**Field Names in SwiftFill**: `item20_propertyRestraint`

### ITEM 21: Extend Deadline to Serve (Page 10)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **Explain why need more time** | textarea | ✓ | Reason for extension |

**Field Names in SwiftFill**: `item21_extendDeadline`, `item21_explain`

### ITEM 22: Pay Debts (Page 10)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **a. (1-3) Pay to** | input | If checked | Payee name |
| **a. (1-3) For** | input | If checked | What debt is for |
| **a. (1-3) Amount $** | input | If checked | Dollar amount |
| **a. (1-3) Due date** | input | If checked | When payment due |
| **Explain why** | textarea | ✓ | Why person should pay |
| **b. Special finding - No** | checkbox | | Don't want special finding |
| **b. Special finding - Yes** | checkbox | | Want special finding |
| **b. (1) Which debts?** | checkbox | If yes | a(1), a(2), a(3) |
| **b. (2) Know how debt made - No** | checkbox | If yes | |
| **b. (2) Know how debt made - Yes** | checkbox | If yes | Explain below |
| **b. (2) Explanation** | textarea | If yes | How debt was made |

**Field Names in SwiftFill**:
- `item22_payDebts`
- `item22a1_payTo`, `item22a1_for`, `item22a1_amount`, `item22a1_dueDate`
- (Repeat for 2-3)
- `item22_explainWhy`
- `item22b_specialFindingNo`, `item22b_specialFindingYes`
- `item22b1_a1`, `item22b1_a2`, `item22b1_a3`
- `item22b2_knowNo`, `item22b2_knowYes`, `item22b2_explain`

---

## ITEMS 23-26: Orders for Court Date (Page 11)

**Note**: These orders cannot be granted immediately, only at court hearing.

### ITEM 23: Pay Expenses Caused by Abuse

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **(1-4) Pay to** | input | If checked | Payee name |
| **(1-4) For** | input | If checked | What expense is for |
| **(1-4) Amount $** | input | If checked | Dollar amount |

**Field Names in SwiftFill**: `item23_payExpenses`, `item23_1through4` (array fields)

### ITEM 24: Child Support

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Only if have minor child with person in 2 |
| **a. No order, want one** | checkbox | Check if applicable |
| **b. Have order, want changed** | checkbox | Check if applicable, attach copy |
| **c. Receive/applied for TANF/Welfare/CalWORKS** | checkbox | Check if applicable |

**Field Names in SwiftFill**: `item24_childSupport`, `item24a_noOrder`, `item24b_haveOrder`, `item24c_tanf`

### ITEM 25: Spousal Support

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Must be married/registered domestic partner |

**Field Names in SwiftFill**: `item25_spousalSupport`

### ITEM 26: Lawyer's Fees and Costs

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | Court must award if order granted and respondent can afford |

**Field Names in SwiftFill**: `item26_lawyerFees`

---

## ITEMS 27-31: Automatic Orders (Page 12)

**Note**: These orders are automatic if restraining order is granted.

### ITEM 27: Batterer Intervention Program

| Field | Type | Notes |
|-------|------|-------|
| **Checkbox to request** | checkbox | 52-week program |

**Field Names in SwiftFill**: `item27_battererProgram`

### ITEM 28: Transfer of Wireless Phone Account

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Checkbox to request** | checkbox | | Main checkbox |
| **a-d. My number** | checkbox | If checked | Up to 4 numbers |
| **a-d. Number of child in my care** | input | If checked | Child's number with area code |

**Field Names in SwiftFill**:
- `item28_wirelessTransfer`
- `item28a_myNumber`, `item28a_childNumber`
- (Repeat for b-d)

### ITEM 29: No Firearms (Automatic)

**Note**: Automatic order, no checkbox needed.

### ITEM 30: No Body Armor (Automatic)

**Note**: Automatic order, no checkbox needed.

### ITEM 31: Cannot Look for Protected People (Automatic)

**Note**: Automatic order, no checkbox needed.

---

## ITEM 32: Additional Pages (Page 13)

| Field | Type | Notes |
|-------|------|-------|
| **Number of extra pages** | input | If used additional pages |

**Field Names in SwiftFill**: `item32_additionalPages`

---

## ITEM 33: Your Signature (Page 13)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Date** | input | ✓ | Date signed |
| **Type or print your name** | input | ✓ | Printed name |
| **Sign your name** | signature | ✓ | Handwritten signature |

**Field Names in SwiftFill**:
- `item33_date`
- `item33_printName`
- `item33_signName`

**Declaration**: "I declare under penalty of perjury under the laws of the State of California that the information above is true and correct."

---

## ITEM 34: Your Lawyer's Signature (Page 13)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Date** | input | If lawyer | Date signed |
| **Lawyer's name** | input | If lawyer | Printed name |
| **Lawyer's signature** | signature | If lawyer | Handwritten signature |

**Field Names in SwiftFill**:
- `item34_date`
- `item34_lawyerName`
- `item34_lawyerSignature`

---

## Common Mistakes to Avoid

1. ❌ **Not checking relationship** in Item 3 - Must have qualifying relationship
2. ❌ **Insufficient abuse details** in Items 5-7 - Be specific and detailed
3. ❌ **Not listing all people needing protection** in Item 8
4. ❌ **Requesting child custody** without completing DV-105
5. ❌ **Not requesting stay-away orders** when living together
6. ❌ **Forgetting to attach required forms** (CLETS-001, DV-105, FL-150)
7. ❌ **Using inflammatory language** - Stick to facts
8. ❌ **Not signing** the declaration
9. ❌ **Incomplete firearm information** - Important for safety
10. ❌ **Not serving** respondent after filing

---

## Related Forms You May Need

- **DV-110**: Temporary Restraining Order (court completes)
- **DV-109**: Notice of Court Hearing (court completes)
- **CLETS-001**: Confidential Information for Law Enforcement (required)
- **DV-105**: Request for Child Custody and Visitation Orders (if have children)
- **DV-140**: Child Custody and Visitation Order
- **DV-108**: Request for Orders to Prevent Child Abduction
- **DV-101**: Description of Abuse (if need more space)
- **FL-150**: Income and Expense Declaration (if requesting support)
- **FL-155**: Financial Statement (Simplified)
- **DV-570**: Domestic Violence Information Sheet
- **SER-001**: Request for Sheriff to Serve Court Papers

---

## Form Information

- **Form Number**: DV-100
- **Revision Date**: January 1, 2025
- **Pages**: 13
- **Total Items**: 34
- **Mandatory Use**: Yes (Judicial Council form)
- **Fee**: Check with court clerk (may be waived if low income)

---

**Last Updated**: November 2025 (based on January 2025 form)

---

*This guide is for informational purposes only and does not constitute legal advice. Consult with an attorney for specific legal guidance.*
