# DV-105 Request for Child Custody and Visitation Orders
## Complete Field Guide from California Courts Research

**Source**: California Judicial Council Form DV-105 (Rev. January 1, 2024)
**Reference**: Family Code, §§ 3048, 3063, 6323, 6323.5

---

## Purpose

DV-105 is an attachment to DV-100 used specifically for requesting child custody and visitation orders in domestic violence cases. This form allows you to:
- Request legal and physical custody orders
- Request visitation (parenting time) orders
- Specify supervised or unsupervised visitation
- Limit travel with children
- Block access to children's records
- Prevent child abduction

**IMPORTANT**: This form is **ONLY** used with DV-100. It cannot be filed independently.

---

## Filing Requirements

### When to Use This Form
- You have children with the person in DV-100 Item 2
- You are requesting a domestic violence restraining order (DV-100)
- You need custody or visitation orders as part of the restraining order

### Required Attachments
- **DV-100**: Request for Domestic Violence Restraining Order (primary form)
- **DV-105(A)**: Additional Children's Residence Information (if children didn't live together for 5 years)
- **DV-108**: Request for Orders to Prevent Child Abduction (if risk of abduction)

---

## Field-by-Field Guide

### HEADER (Page 1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Case Number** | input | ✓ | From DV-100 |

---

## ITEM 1: Your Information

**Purpose**: Identify the person requesting protection (same as DV-100 Item 1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Name** | input | ✓ | Your full name |
| **Relationship to children - Parent** | checkbox | One required | |
| **Relationship to children - Legal Guardian** | checkbox | One required | |
| **Relationship to children - Other** | checkbox + input | One required | Describe if other |

**Field Names in SwiftFill**:
- `item1_name`
- `item1_relationshipParent`, `item1_relationshipGuardian`, `item1_relationshipOther`, `item1_relationshipOtherDescribe`

---

## ITEM 2: Person You Want Protection From

**Purpose**: Identify the respondent (same as DV-100 Item 2)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Name** | input | ✓ | Respondent's full name |
| **Relationship to children - Parent** | checkbox | One required | |
| **Relationship to children - Legal Guardian** | checkbox | One required | |
| **Relationship to children - Other** | checkbox + input | One required | Describe if other |

**Field Names in SwiftFill**:
- `item2_name`
- `item2_relationshipParent`, `item2_relationshipGuardian`, `item2_relationshipOther`, `item2_relationshipOtherDescribe`

---

## ITEM 3: Children Under 18 Years Old

**Purpose**: List all minor children (oldest to youngest)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **a. Name** | input | ✓ | First child's name |
| **a. Date of birth** | input | ✓ | MM/DD/YYYY |
| **b. Name** | input | If applicable | Second child |
| **b. Date of birth** | input | If applicable | |
| **c. Name** | input | If applicable | Third child |
| **c. Date of birth** | input | If applicable | |
| **d. Name** | input | If applicable | Fourth child |
| **d. Date of birth** | input | If applicable | |
| **Checkbox - need more space** | checkbox | If >4 children | Attach additional sheet |

**Field Names in SwiftFill**:
- `item3a_name`, `item3a_dateOfBirth`
- `item3b_name`, `item3b_dateOfBirth`
- `item3c_name`, `item3c_dateOfBirth`
- `item3d_name`, `item3d_dateOfBirth`
- `item3_needMoreSpace`

---

## ITEM 4: City and State Where Children Lived

**Purpose**: 5-year residence history for jurisdictional purposes

### 4a: Lived Together?

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Yes** | checkbox | One required | All children lived together - complete 4b |
| **No** | checkbox | One required | Children lived separately - use DV-105(A) instead |

**Field Names in SwiftFill**: `item4a_yes`, `item4a_no`

### 4b: Residence History (Table)

**Note**: Only complete if 4a is "Yes"

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Dates - From (month/year)** | input | ✓ | Start date of residence |
| **Dates - To present / Until** | input | ✓ | "To present" or end date |
| **City, State, and Tribal Land** | input | ✓ | Location |
| **Checkbox - keep current location private** | checkbox | Optional | List state only |
| **Children lived with - Me** | checkbox | ✓ | Check all that apply |
| **Children lived with - Person in 2** | checkbox | ✓ | |
| **Children lived with - Other** | checkbox | ✓ | |
| **Other* (relationship to child)** | input | If Other checked | Describe relationship |

**Field Names in SwiftFill** (up to 7 rows):
- `item4b_row1_fromDate`, `item4b_row1_toPresent`, `item4b_row1_toDate`, `item4b_row1_location`
- `item4b_row1_keepPrivate`
- `item4b_row1_withMe`, `item4b_row1_withPerson2`, `item4b_row1_withOther`
- `item4b_otherRelationship`
- (Repeat for rows 2-7)

---

## ITEM 5: History of Court Cases Involving Your Children (Page 2)

**Purpose**: Disclose existing court cases

### 5a: Know About Other Cases?

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No** | checkbox | One required | |
| **Yes** | checkbox | One required | Complete below |
| **Custody** | checkbox | If yes | |
| **Divorce** | checkbox | If yes | |
| **Juvenile Court** | checkbox | If yes | Child welfare/juvenile justice |
| **Guardianship** | checkbox | If yes | |
| **Criminal** | checkbox | If yes | |
| **Other** | checkbox + input | If yes | Example: child support case |

**Field Names in SwiftFill**:
- `item5a_no`, `item5a_yes`
- `item5a_custody`, `item5a_divorce`, `item5a_juvenile`, `item5a_guardianship`, `item5a_criminal`, `item5a_other`

### 5b: Current Custody/Visitation Order?

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No** | checkbox | One required | |
| **Yes** | checkbox | One required | Complete below |
| **What did judge order?** | textarea | If yes | Current custody/visitation schedule |
| **Why change order?** | textarea | If yes | Reason for modification |

**Field Names in SwiftFill**:
- `item5b_no`, `item5b_yes`
- `item5b_currentOrder`
- `item5b_whyChange`

### 5c: Other Parent or Legal Guardian?

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Name** | input | If applicable | Third parent/guardian |
| **Parent** | checkbox | If applicable | |
| **Legal Guardian** | checkbox | If applicable | |

**Field Names in SwiftFill**: `item5c_name`, `item5c_parent`, `item5c_legalGuardian`

---

## ITEMS 6-8: Orders to Protect Children (Page 3)

### ITEM 6: Limit Travel with Children

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No** | checkbox | One required | Don't want travel limits |
| **Yes** | checkbox | One required | Complete below |
| **The county of** | checkbox + input | If yes | Specific county |
| **California** | checkbox | If yes | Cannot leave CA |
| **Other places** | checkbox + input | If yes | Specify locations |

**Field Names in SwiftFill**:
- `item6_no`, `item6_yes`
- `item6_county`, `item6_countyName`
- `item6_california`
- `item6_otherPlaces`, `item6_otherPlacesDescribe`

### ITEM 7: Access to Children's Records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Yes - allow access** | checkbox | One required | |
| **No - do not allow access** | checkbox | One required | Complete below |

**7a: Which children?**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **All children listed in 3** | checkbox | If No above | |
| **Only children listed here** | checkbox + input | If No above | List names |

**7b: Which records?**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Medical, dental, and mental health** | checkbox | If No above | |
| **School and daycare** | checkbox | If No above | |
| **Extracurricular activity** | checkbox | If No above | Camps, sports |
| **Child's employment** | checkbox | If No above | Including volunteer |
| **Other** | checkbox + input | If No above | Describe |

**Field Names in SwiftFill**:
- `item7_yes`, `item7_no`
- `item7a_allChildren`, `item7a_onlyThese`, `item7a_names`
- `item7b_medical`, `item7b_school`, `item7b_extracurricular`, `item7b_employment`, `item7b_other`, `item7b_otherDescribe`

### ITEM 8: Risk of Child Abduction

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No** | checkbox | One required | |
| **Yes** | checkbox | One required | Must complete DV-108 |

**Field Names in SwiftFill**: `item8_no`, `item8_yes`

**IMPORTANT**: If "Yes" is checked, user MUST complete form DV-108.

---

## ITEM 9: Child Custody (Page 4)

**Purpose**: Request legal and/or physical custody orders

### Background Information Box:
- **Legal custody** = decisions about health, education, welfare
- **Physical custody** = where child lives
- **Sole custody** = one parent has custody
- **Joint custody** = both parents share custody

### Custody Request:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No** | checkbox | One required | Don't want custody orders |
| **Yes** | checkbox | One required | Complete below |

**Legal Custody** (check one):
| Field | Type | Notes |
|-------|------|-------|
| **Sole to me** | checkbox | Full legal custody to petitioner |
| **Sole to person in 2** | checkbox | Full legal custody to respondent |
| **Jointly (shared)** | checkbox | Both parents share legal custody |
| **Other** | checkbox + input | Custom arrangement |

**Physical Custody** (check one):
| Field | Type | Notes |
|-------|------|-------|
| **Sole to me** | checkbox | Child lives with petitioner |
| **Sole to person in 2** | checkbox | Child lives with respondent |
| **Jointly (shared)** | checkbox | Both parents share physical custody |
| **Other** | checkbox + input | Custom arrangement |

**Field Names in SwiftFill**:
- `item9_no`, `item9_yes`
- `item9_legalSoleToMe`, `item9_legalSoleToPerson2`, `item9_legalJoint`, `item9_legalOther`, `item9_legalOtherDescribe`
- `item9_physicalSoleToMe`, `item9_physicalSoleToPerson2`, `item9_physicalJoint`, `item9_physicalOther`, `item9_physicalOtherDescribe`

---

## ITEM 10: Visitation Decision (Page 4)

**Purpose**: Decide if respondent should have visits with children

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No, I ask judge to order no visits** | checkbox | One required | Stop here if checked |
| **Yes** | checkbox | One required | Go to Item 11 |

**Field Names in SwiftFill**: `item10_no`, `item10_yes`

---

## ITEM 11: Supervised vs Unsupervised Visits (Page 4)

**Purpose**: Decide if visits should be monitored

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Yes - supervised visits** | checkbox | One required | Go to Item 12 |
| **No - unsupervised visits** | checkbox | One required | Go to Item 13 |

**Field Names in SwiftFill**: `item11_yes`, `item11_no`

---

## ITEM 12: Details of Supervised Visits (Page 5)

**Purpose**: Specify supervised visitation details

### 12a: Who Supervises?

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Nonprofessional** | checkbox + input | One required | Friend/relative, list name if known |
| **Professional** | checkbox + input | One required | List name if known |
| **Professional fees - Me %** | input | If professional | Percentage paid by petitioner |
| **Professional fees - Person in 2 %** | input | If professional | Percentage paid by respondent |
| **Professional fees - Other %** | input | If professional | Percentage paid by other party |

**Field Names in SwiftFill**:
- `item12a_nonprofessional`, `item12a_nonprofessionalName`
- `item12a_professional`, `item12a_professionalName`
- `item12a_feesMe`, `item12a_feesPerson2`, `item12a_feesOther`

### 12b: Frequency and Duration

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Once a week, for __ hours** | checkbox + input | One required | |
| **Twice a week, for __ hours each visit** | checkbox + input | One required | |
| **Other** | checkbox + textarea | One required | Describe schedule |
| **Check to use schedule chart** | checkbox | Optional | Use table below |

**Field Names in SwiftFill**:
- `item12b_onceWeek`, `item12b_onceWeekHours`
- `item12b_twiceWeek`, `item12b_twiceWeekHours`
- `item12b_other`, `item12b_otherDescribe`
- `item12b_useChart`

### Schedule for Supervised Visits (Table)

| Field | Type | Notes |
|-------|------|-------|
| **Monday - Start** | input | Start time |
| **Monday - End, if applies** | input | End time |
| **Monday - Person to bring children** | input | Who transports |
| **Monday - Location** | input | Drop-off/pick-up location |
| (Repeat for Tuesday-Sunday) | | |
| **Follow schedule - Every week** | checkbox | |
| **Follow schedule - Every other week** | checkbox | |
| **Follow schedule - Other** | checkbox + input | |
| **Start date for visits** | input | MM/DD/YYYY |

**Field Names in SwiftFill**:
- `item12_mondayStart`, `item12_mondayEnd`, `item12_mondayPerson`, `item12_mondayLocation`
- (Repeat for all 7 days)
- `item12_everyWeek`, `item12_everyOtherWeek`, `item12_otherSchedule`
- `item12_startDate`

**IMPORTANT**: If completed Item 12, skip Item 13.

---

## ITEM 13: Details of Unsupervised Visits (Page 6)

**Purpose**: Specify unsupervised visitation details

### 13a: Supervised Exchanges?

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **No** | checkbox | One required | Drop-off/pick-up not supervised |
| **Yes** | checkbox | One required | Complete below |

**Who supervises exchanges?**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Nonprofessional** | checkbox + input | If Yes above | Friend/relative, list name if known |
| **Professional** | checkbox + input | If Yes above | List name if known |
| **Professional fees - Me %** | input | If professional | Percentage paid by petitioner |
| **Professional fees - Person in 2 %** | input | If professional | Percentage paid by respondent |
| **Professional fees - Other %** | input | If professional | Percentage paid by other party |

**Field Names in SwiftFill**:
- `item13a_no`, `item13a_yes`
- `item13a_nonprofessional`, `item13a_nonprofessionalName`
- `item13a_professional`, `item13a_professionalName`
- `item13a_feesMe`, `item13a_feesPerson2`, `item13a_feesOther`

### 13b: Parenting Time Schedule

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Describe parenting time** | textarea | ✓ | Free-form description OR use chart |

### Schedule for Unsupervised Visits (Table)

| Field | Type | Notes |
|-------|------|-------|
| **Monday - Start** | input | Start time |
| **Monday - End, if applies** | input | End time |
| **Monday - Person to bring children** | input | Who transports |
| **Monday - Location** | input | Drop-off/pick-up location |
| (Repeat for Tuesday-Sunday) | | |
| **Follow schedule - Every week** | checkbox | |
| **Follow schedule - Every other week** | checkbox | |
| **Follow schedule - Other** | checkbox + input | |
| **Start date for visits** | input | MM/DD/YYYY |

**Field Names in SwiftFill**:
- `item13b_describe`
- `item13_mondayStart`, `item13_mondayEnd`, `item13_mondayPerson`, `item13_mondayLocation`
- (Repeat for all 7 days)
- `item13_everyWeek`, `item13_everyOtherWeek`, `item13_otherSchedule`
- `item13_startDate`

---

## Common Mistakes to Avoid

1. ❌ **Not completing if requesting custody** - DV-105 is required if Item 15 checked on DV-100
2. ❌ **Filing DV-105 without DV-100** - Must be attached to DV-100
3. ❌ **Incomplete 5-year residence history** - Required for jurisdiction
4. ❌ **Not using DV-105(A)** when children lived separately
5. ❌ **Requesting abduction prevention** without completing DV-108
6. ❌ **Vague visitation schedules** - Be specific with days, times, locations
7. ❌ **Not addressing exchanges** - Must specify how children are transferred
8. ❌ **Inconsistent with DV-100** - Make sure names/dates match
9. ❌ **Not considering child's age** - Infant schedules differ from teenagers
10. ❌ **Forgetting to specify supervisor** if requesting supervised visits

---

## Tips for Self-Represented Litigants

### Before Filling Out the Form
1. Review custody laws in California (legal vs physical, sole vs joint)
2. Consider child's best interests (not just your preferences)
3. Gather documentation: existing orders, school records, abuse evidence
4. Think through realistic visitation schedules
5. Consider child's age and needs

### While Filling Out the Form
1. Be honest about residence history
2. List ALL court cases involving children
3. Be specific about visitation schedules (days, times, locations)
4. Consider safety when proposing schedules
5. Think about holidays and vacation schedules

### After Completing the Form
1. Attach to DV-100 (cannot file separately)
2. Make copies for your records
3. Serve respondent with all forms
4. Bring evidence to court hearing
5. Be prepared to explain why your requests are in child's best interest

---

## Related Forms You May Need

- **DV-100**: Request for Domestic Violence Restraining Order (required primary form)
- **DV-105(A)**: Additional Children's Residence Information (if children didn't live together)
- **DV-108**: Request for Orders to Prevent Child Abduction (if risk of abduction)
- **DV-140**: Child Custody and Visitation Order (court completes)
- **FL-150**: Income and Expense Declaration (if requesting child support)
- **FL-155**: Financial Statement (Simplified)
- **FL-341**: Child Custody and Visitation Application Attachment

---

## Legal Concepts Explained

### Legal Custody
The right and responsibility to make important decisions about the child's:
- Health and medical care
- Education and schooling
- Religious upbringing
- General welfare

### Physical Custody
Determines:
- Where the child lives
- Daily care and supervision
- Time spent with each parent

### Sole vs Joint Custody
- **Sole**: One parent has full custody rights
- **Joint**: Both parents share custody rights
- Can have joint legal but sole physical (or vice versa)

### Visitation (Parenting Time)
- Schedule when non-custodial parent spends time with child
- Can be:
  - **Supervised**: Third party monitors visits
  - **Unsupervised**: Parent and child alone
  - **Virtual**: Video calls, phone calls
  - **No visitation**: If unsafe for child

---

## Form Information

- **Form Number**: DV-105
- **Revision Date**: January 1, 2024
- **Pages**: 6
- **Total Items**: 13
- **Mandatory Use**: Yes (Judicial Council form) when requesting custody/visitation with DV-100
- **Cannot be filed alone**: Must be attached to DV-100

---

**Last Updated**: November 2025 (based on January 2024 form)

---

*This guide is for informational purposes only and does not constitute legal advice. Consult with an attorney for specific legal guidance.*
