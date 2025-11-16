# User Acceptance Test for Self-Represented Litigants
## FL-320 Response to Request for Order

### What is this test for?
This test helps ensure that SwiftFill is easy to use for people representing themselves in family court, without an attorney. We want to make sure the form is professional, accurate, and acceptable for filing in California courts.

---

## Before You Start

**You'll need**:
- 15-20 minutes
- A computer or tablet
- Your case information handy (optional, can use sample data)

**What you're testing**:
- Is the form easy to fill out?
- Does it look professional and court-ready?
- Can you find all the fields you need?
- Would you feel confident filing this with the court?

---

## Quick Start

1. **Open the app**: Go to http://localhost:8080
2. **Log in or sign up** (if required)
3. **Load the FL-320 form** (Response to Request for Order)

---

## Test Scenario: Fill Out a Response

**Your Role**: You are Jane Smith, responding to a request for custody modification.

**The Situation**:
- Your ex-spouse (John Doe) filed a Request for Order
- You need to respond about custody and visitation
- You have 3 children and want to explain your position
- You're representing yourself (no attorney)

---

## Step-by-Step Test

### Part 1: Your Contact Information (2 minutes)

Fill in these fields:

| Field | Sample Data | Easy to Find? | Looks Right? |
|-------|-------------|---------------|--------------|
| Your Name | Jane Smith | ☐ | ☐ |
| Street Address | 123 Main Street | ☐ | ☐ |
| City | Los Angeles | ☐ | ☐ |
| State | CA | ☐ | ☐ |
| ZIP Code | 90001 | ☐ | ☐ |
| Telephone | (555) 123-4567 | ☐ | ☐ |
| Fax | (555) 123-4568 | ☐ | ☐ |
| Email | jane.smith@example.com | ☐ | ☐ |

**Questions**:
1. Were the fields easy to find? YES / NO
2. Did the text appear clearly in each box? YES / NO
3. Did "Self-Represented" work for Attorney For? YES / NO
4. Was anything confusing? __________________

---

### Part 2: Case Information (1 minute)

| Field | Sample Data | Easy to Find? | Looks Right? |
|-------|-------------|---------------|--------------|
| County | Los Angeles | ☐ | ☐ |
| Petitioner | John Doe | ☐ | ☐ |
| Respondent | Jane Smith | ☐ | ☐ |
| Case Number | FL12345678 | ☐ | ☐ |

**Questions**:
1. Was it clear which fields are for case info? YES / NO
2. Do you understand Petitioner vs Respondent? YES / NO

---

### Part 3: Hearing Information (1 minute)

The court scheduled a hearing. Fill in:

| Field | Sample Data |
|-------|-------------|
| Hearing Date | 12/15/2025 |
| Hearing Time | 9:00 AM |
| Department | Dept 3 |
| Room | 301 |

**Questions**:
1. Were all 4 hearing fields visible and easy to fill? YES / NO
2. Was the date format clear (MM/DD/YYYY)? YES / NO
3. Could you easily see where to put each piece of info? YES / NO

---

### Part 4: Children's Information (2 minutes)

List your children:

**Child 1**:
- Name: Emily Jane Smith
- Birth Date: 03/15/2015

**Child 2**:
- Name: Michael John Smith
- Birth Date: 07/22/2018

**Child 3**:
- Name: Sarah Ann Smith
- Birth Date: 11/08/2020

**Questions**:
1. Was it easy to find fields for all 3 children? YES / NO
2. Did the names and birthdates line up clearly? YES / NO
3. What if you had more than 3 children? Could you tell how to add more? YES / NO

---

### Part 5: What Orders Are You Responding To? (1 minute)

Check the boxes that apply to your case:

- ☑ Child Custody
- ☑ Visitation (Parenting Time)
- ☐ Child Support
- ☐ Spousal Support (Alimony)
- ☐ Attorney Fees
- ☐ Property Control
- ☑ Other: Temporary restraining order

**Questions**:
1. Were the checkboxes easy to click/tap? YES / NO
2. Were the labels clear and understandable? YES / NO
3. Did the "Other" text box work well? YES / NO

---

### Part 6: Your Response (1 minute)

Choose ONE option:

- ☐ I do not agree to any of the orders requested
- ☐ I agree to the orders requested
- ☐ I consent to custody being ordered
- ☑ I consent to visitation (parenting time) being ordered

**Questions**:
1. Was it clear you should only pick one? YES / NO
2. Do you understand the difference between each option? YES / NO

---

### Part 7: Explain Your Position (3 minutes)

In the Facts box, type:

> "Respondent requests modification of custody arrangement due to change in work schedule. New schedule allows for increased parenting time during weekdays. Both children have expressed desire to spend more time with respondent. All parties agree modification is in children's best interests."

**Questions**:
1. Was the text box big enough? YES / NO
2. Could you see multiple lines of text at once? YES / NO
3. Was the text readable (not too small)? YES / NO
4. Did it feel professional? YES / NO

---

### Part 8: Declaration and Signature (1 minute)

1. **Check the box**: ☑ I declare under penalty of perjury under the laws of California that the information above is true and correct.

2. **Sign the form**:
   - Date: 11/15/2025
   - Signature: Jane Smith
   - Print Name: JANE SMITH

**Questions**:
1. Was the declaration checkbox clearly visible? YES / NO
2. Did you understand what you're declaring? YES / NO
3. Were all 3 signature fields easy to find? YES / NO
4. Does it look official/professional? YES / NO

---

## Overall Experience

Now that you've filled out the entire form, answer these questions:

### Ease of Use (Rate 1-5, 5 = Excellent)

1. **How easy was it to find the fields you needed?**
   - ☐ 1 (Very Hard) ☐ 2 (Hard) ☐ 3 (Okay) ☐ 4 (Easy) ☐ 5 (Very Easy)

2. **How clear were the field labels and instructions?**
   - ☐ 1 (Very Confusing) ☐ 2 (Confusing) ☐ 3 (Okay) ☐ 4 (Clear) ☐ 5 (Very Clear)

3. **How professional does the filled form look?**
   - ☐ 1 (Not Professional) ☐ 2 (Poor) ☐ 3 (Acceptable) ☐ 4 (Good) ☐ 5 (Excellent)

4. **How confident are you filing this with the court?**
   - ☐ 1 (Not Confident) ☐ 2 (Unsure) ☐ 3 (Somewhat) ☐ 4 (Confident) ☐ 5 (Very Confident)

5. **How long did it take you to complete the form?**
   - ☐ < 5 minutes ☐ 5-10 minutes ☐ 10-15 minutes ☐ 15-20 minutes ☐ > 20 minutes

---

### Critical Questions

**Would you use this app for your real court case?** YES / NO

Why or why not? _______________________________________________

**What was the BEST part of using SwiftFill?**

_______________________________________________

**What was the WORST or most frustrating part?**

_______________________________________________

**What would you change or improve?**

_______________________________________________

---

## Mobile Test (If Using Phone/Tablet)

If you're on a mobile device, also check:

1. **Can you tap all fields easily?** YES / NO
2. **Is the text big enough to read?** YES / NO
3. **Can you see the PDF and form at the same time?** YES / NO
4. **Does the keyboard cover important parts?** YES / NO

**Device used**: _______________

---

## Court Acceptance

**Imagine you are standing at the court clerk's window filing this form.**

1. **Does it look like an official court form?** YES / NO
2. **Is all your information clearly visible?** YES / NO
3. **Would the clerk be able to read everything?** YES / NO
4. **Do you think it would be accepted?** YES / NO

---

## Final Recommendations

Based on your experience, what's your recommendation?

☐ **Ready for Production** - This works great, launch it!

☐ **Ready with Minor Fixes** - Good, but fix these issues first: _______________

☐ **Needs Improvement** - Several problems need fixing before launch

☐ **Not Ready** - Major issues, don't launch yet

---

## Thank You!

**Your feedback matters.**  This test helps make SwiftFill better for people like you who are navigating the legal system without an attorney.

**Tester Info** (Optional):
- Name: _______________
- Date: _______________
- How long have you been representing yourself? _______________
- Have you filed court forms before? YES / NO
- If yes, how many times? _______________

---

**Test Results Summary**:
- Total "YES" answers: ___/40
- Average rating (Q1-4): ___/5
- Time to complete: ___ minutes
- Overall recommendation: _______________

**Production Ready?** ☐ YES ☐ NO

---

*This test is designed for California family law forms (FL-320). SwiftFill is a tool to help self-represented litigants prepare court forms more easily.*

*Last Updated: 2025-11-15*
