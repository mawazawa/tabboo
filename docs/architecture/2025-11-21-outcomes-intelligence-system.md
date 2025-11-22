# SwiftFill Outcomes Intelligence System

**Date**: November 21, 2025
**Purpose**: High-leverage data collection infrastructure for tracking user success metrics while preserving privacy

---

## The Strategic Imperative

**The Moat**: If SwiftFill can demonstrate that users achieve **higher approval rates** than the baseline (SF: 29%, LA: ~50%), that becomes:
1. **Marketing gold** - "SwiftFill users are 2x more likely to be granted a DVRO"
2. **Product feedback loop** - Know which features actually improve outcomes
3. **Competitive moat** - No one else has this data
4. **Trust builder** - Transparency about what works

---

## Data Collection Framework

### Tier 1: Essential Metrics (Must Have)

| Metric | What to Collect | Privacy Level | How to Collect |
|--------|-----------------|---------------|----------------|
| **Filing Completion** | Did user complete and download form? | Low risk | App analytics |
| **Outcome (Self-Reported)** | Was TRO/DVRO granted? | Medium risk | Optional survey |
| **Jurisdiction** | County/courthouse | Low risk | Form data (anonymized) |
| **Case Type** | DVRO, Civil Harassment, Elder Abuse | Low risk | Form data |
| **Representation Status** | Self-rep or attorney-assisted | Low risk | Form data |

### Tier 2: Quality Metrics (Should Have)

| Metric | What to Collect | Privacy Level | How to Collect |
|--------|-----------------|---------------|----------------|
| **Evidence Completeness** | # of evidence types included | Low risk | Form analysis |
| **Form Quality Score** | Validation errors, completeness % | Low risk | App analytics |
| **Time to Complete** | How long to fill form | Low risk | App analytics |
| **AI Assistance Usage** | Did user use AI help? How much? | Low risk | App analytics |
| **Revisions** | How many times edited before filing | Low risk | App analytics |

### Tier 3: Outcome Details (Nice to Have)

| Metric | What to Collect | Privacy Level | How to Collect |
|--------|-----------------|---------------|----------------|
| **Hearing Date** | When was hearing? | Medium risk | Optional input |
| **Grant Type** | TRO only, full DVRO, modified, denied | Medium risk | Survey |
| **Duration Granted** | 1yr, 3yr, 5yr | Medium risk | Survey |
| **Modifications** | What judge changed | High risk | Survey |
| **Case Duration** | Filing to final order | Medium risk | Survey |

---

## Privacy-Preserving Architecture

### Principle: Collect Aggregate, Not Individual

```
┌─────────────────────────────────────────────┐
│ USER DEVICE                                 │
│                                             │
│ ┌─────────────┐    ┌──────────────────┐    │
│ │ Form Data   │───▶│ Local Processing │    │
│ │ (PII)       │    │ (Anonymization)  │    │
│ └─────────────┘    └────────┬─────────┘    │
│                             │              │
│                    ┌────────▼─────────┐    │
│                    │ Anonymized       │    │
│                    │ Metrics Only     │    │
│                    └────────┬─────────┘    │
└─────────────────────────────┼──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────┐
│ SWIFTFILL ANALYTICS (No PII)               │
│                                             │
│ • County: Los Angeles                       │
│ • Case Type: DVRO                           │
│ • Evidence Score: 8/12                      │
│ • Outcome: Granted                          │
│ • User ID: [hashed, non-reversible]         │
└─────────────────────────────────────────────┘
```

### Technical Implementation

**1. Differential Privacy**
- Add statistical noise to individual data points
- Only report aggregates with k-anonymity (k≥10)
- Never report if sample size <10 for any cohort

**2. Data Minimization**
- Only collect what's needed for the metric
- No names, addresses, case numbers in analytics
- Hash user IDs (non-reversible)

**3. Opt-In with Clear Value**
- "Help improve approval rates for future users"
- Show aggregate stats back to user
- Easy opt-out, data deletion

**4. Separation of Concerns**
- Form data (PII) stored in user's vault (encrypted)
- Analytics data (no PII) stored separately
- No cross-reference possible

---

## Data Collection Mechanisms

### Mechanism 1: In-App Analytics (Automatic)

**What**: Track app usage patterns without PII

```typescript
// Example analytics event (no PII)
analytics.track('form_completed', {
  county: 'los_angeles',
  case_type: 'dvro',
  evidence_types_count: 8,
  ai_prompts_used: 3,
  completion_time_minutes: 45,
  validation_errors_fixed: 2,
  form_quality_score: 0.85
});
```

**Privacy**: No names, addresses, or case details. Just patterns.

### Mechanism 2: Outcome Survey (Opt-In)

**Timing**: 30 days after form download (typical hearing window)

**Survey Design**:
```
┌─────────────────────────────────────────────┐
│ Help Us Help Others                         │
│                                             │
│ Your feedback improves approval rates for   │
│ future users. All responses are anonymous.  │
│                                             │
│ 1. Was your restraining order granted?      │
│    ○ Yes, fully granted                     │
│    ○ Yes, with modifications                │
│    ○ No, denied                             │
│    ○ Case still pending                     │
│    ○ Prefer not to say                      │
│                                             │
│ 2. How helpful was SwiftFill? (1-5 stars)   │
│                                             │
│ [Submit Anonymously]  [Skip]                │
└─────────────────────────────────────────────┘
```

**Privacy**:
- No case numbers
- No names
- Aggregated with k≥10
- Optional

### Mechanism 3: Court Records Research (Passive)

**Concept**: Research public court records to validate self-reported data

**Approach**:
- Use aggregate patterns, not individual tracking
- Research published court statistics
- Compare SwiftFill cohort patterns to baseline
- Never tie back to individual users

**Legal**: Court outcomes are public record, but we don't track individuals.

---

## Database Schema

### Analytics Tables (No PII)

```sql
-- Anonymized form submissions
CREATE TABLE form_submissions_analytics (
  id UUID PRIMARY KEY,
  user_hash TEXT NOT NULL,  -- SHA-256, non-reversible
  county TEXT NOT NULL,
  case_type TEXT NOT NULL,
  evidence_score INTEGER,  -- 0-12
  form_quality_score DECIMAL,
  ai_assistance_level TEXT,  -- 'none', 'light', 'heavy'
  completion_time_minutes INTEGER,
  created_at TIMESTAMPTZ,

  -- No names, addresses, case numbers, or reversible IDs
);

-- Self-reported outcomes
CREATE TABLE outcomes_survey (
  id UUID PRIMARY KEY,
  submission_hash TEXT NOT NULL,  -- Links to form, not user
  outcome TEXT,  -- 'granted', 'modified', 'denied', 'pending'
  grant_duration TEXT,  -- '1yr', '3yr', '5yr'
  user_satisfaction INTEGER,  -- 1-5
  submitted_at TIMESTAMPTZ,

  -- Cannot be tied back to individual user
);

-- Aggregate statistics (pre-computed)
CREATE TABLE outcome_aggregates (
  id UUID PRIMARY KEY,
  period TEXT NOT NULL,  -- '2025-Q4', '2025-11'
  county TEXT NOT NULL,
  case_type TEXT NOT NULL,
  total_submissions INTEGER,
  outcomes_reported INTEGER,
  granted_count INTEGER,
  denied_count INTEGER,
  avg_evidence_score DECIMAL,
  avg_form_quality DECIMAL,

  -- Only stored if sample size >= 10 (k-anonymity)
  CONSTRAINT min_sample CHECK (outcomes_reported >= 10)
);
```

### Row-Level Security

```sql
-- Analytics tables have NO RLS - they contain no PII
-- Access controlled at application level
-- Only aggregate queries allowed
```

---

## Success Metrics Dashboard

### Key Performance Indicators

**Primary KPI**:
```
SwiftFill Approval Rate vs Baseline

SF Baseline: 29%
SwiftFill SF Users: ???% (target: 45%+)
Lift: +55% improvement
```

**Secondary KPIs**:

| KPI | Baseline | Target | Why It Matters |
|-----|----------|--------|----------------|
| Approval Rate | SF: 29%, LA: ~50% | +50% lift | Core value prop |
| Form Completion | ~60% (est.) | 85%+ | Usability |
| Evidence Score | 4/12 (est.) | 8/12 | Quality indicator |
| Time to Complete | 3-4 hours (est.) | <1 hour | Efficiency |
| User Satisfaction | N/A | 4.5/5 | NPS proxy |

### Dashboard Mockup

```
┌─────────────────────────────────────────────────────────┐
│ SwiftFill Outcomes Intelligence                         │
│ Period: November 2025                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│ │ 47%         │  │ 156         │  │ 4.3/5       │      │
│ │ Approval    │  │ Forms Filed │  │ Satisfaction│      │
│ │ (+62% vs SF)│  │ (+23% MoM)  │  │             │      │
│ └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                         │
│ Approval Rate by County                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                         │
│ LA County:    52% ████████████░░ (n=89)                │
│ SF County:    41% █████████░░░░░ (n=34)                │
│ Orange:       48% ██████████░░░░ (n=21)                │
│                                                         │
│ Correlation: Evidence Score → Approval                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                         │
│ 10-12 types: 68% approval                              │
│ 7-9 types:   51% approval                              │
│ 4-6 types:   32% approval                              │
│ 0-3 types:   18% approval                              │
│                                                         │
│ ⚠️ All data anonymized, k≥10 for all cohorts           │
└─────────────────────────────────────────────────────────┘
```

---

## High-Leverage Data Opportunities

### 1. Evidence-Outcome Correlation Engine

**Concept**: Determine which evidence types most strongly correlate with approval.

**Data to Collect**:
- Checklist of evidence types included (photos, texts, medical, etc.)
- Outcome (granted/denied)
- Aggregate correlation analysis

**High-Leverage Output**:
```
"Users who include medical records are 2.3x more likely to be granted a DVRO"

Source: SwiftFill aggregate analysis, n=234 (Nov 2025)
```

**Product Integration**:
- Show "strength meter" based on evidence included
- Prompt: "Add medical records to increase approval likelihood"

### 2. Judicial Officer Outcome Patterns

**Concept**: Track outcomes by department (not individual judge names).

**Data to Collect**:
- Department number
- Outcome
- Aggregated only

**High-Leverage Output**:
```
"Department 13 (Stanley Mosk) grants 58% of DVROs"
"Department 405 (SF) grants 34% of DVROs"
```

**Ethical Consideration**: Use department, not judge name. Focus on preparation, not judge shopping.

### 3. AI Assistance Impact

**Concept**: Does AI help improve outcomes?

**Data to Collect**:
- AI prompts used (count)
- AI suggestions accepted
- Outcome

**High-Leverage Output**:
```
"Users who use AI assistance have 31% higher approval rates"
```

**Product Integration**: Encourage AI usage, improve AI based on outcomes.

### 4. Time-of-Day/Day-of-Week Patterns

**Concept**: Are there optimal filing times?

**Data to Collect**:
- Filing timestamp
- Outcome

**High-Leverage Output**:
```
"Forms filed Tuesday-Thursday have 12% higher approval rates than Monday/Friday"
```

**Hypothesis**: Mid-week = less rushed judges, better preparation time.

### 5. Iteration Correlation

**Concept**: Do users who revise their forms have better outcomes?

**Data to Collect**:
- Number of revisions before download
- Outcome

**High-Leverage Output**:
```
"Users who make 3+ revisions have 28% higher approval rates"
```

**Product Integration**: Encourage review, add "revision coach" feature.

---

## Responsible Data Practices

### User Consent Flow

```
┌─────────────────────────────────────────────┐
│ Help Improve Approval Rates                 │
│                                             │
│ SwiftFill collects anonymized usage data    │
│ to improve outcomes for all users.          │
│                                             │
│ We collect:                                 │
│ ✓ Form completion patterns                  │
│ ✓ Evidence types used                       │
│ ✓ Self-reported outcomes (optional survey)  │
│                                             │
│ We NEVER collect:                           │
│ ✗ Your name or address                      │
│ ✗ Case numbers                              │
│ ✗ Specific incident details                 │
│                                             │
│ [View Privacy Policy]                       │
│                                             │
│ [Accept & Continue]  [Decline Analytics]    │
│                                             │
│ You can change this anytime in Settings.    │
└─────────────────────────────────────────────┘
```

### Compliance Checklist

- [ ] **GDPR**: Right to deletion, data portability, consent
- [ ] **CCPA**: Disclosure of data collected, opt-out
- [ ] **HIPAA**: Medical info handling (if applicable)
- [ ] **Court Rules**: Ensure no confidential info in analytics
- [ ] **Ethics**: No manipulation, no judge shopping, help all users

### Data Retention

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Form analytics | 2 years | Trend analysis |
| Outcome surveys | 2 years | Pattern detection |
| Aggregates | Indefinite | Historical comparison |
| Raw PII (vault) | User-controlled | Their data |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Create analytics database tables
- [ ] Implement event tracking in app
- [ ] Add user consent flow
- [ ] Build basic dashboard

### Phase 2: Outcome Collection (Week 3-4)

- [ ] Design outcome survey
- [ ] Implement 30-day follow-up trigger
- [ ] Build survey UI
- [ ] Connect to analytics DB

### Phase 3: Intelligence (Week 5-6)

- [ ] Build correlation analysis
- [ ] Create evidence-outcome engine
- [ ] Implement "strength meter" UI
- [ ] A/B test AI assistance impact

### Phase 4: Marketing (Week 7-8)

- [ ] Generate first "SwiftFill vs Baseline" report
- [ ] Create public transparency page
- [ ] PR/marketing around approval lift
- [ ] User testimonials (with consent)

---

## Other High-Leverage Opportunities

### 1. Court API Integration

**Concept**: If courts offer APIs, integrate for auto-population and status tracking.

**High-Leverage**: Real-time case status, hearing reminders, outcome verification.

**Status**: Most CA courts don't have public APIs yet. Monitor courts.ca.gov.

### 2. Legal Aid Partnership

**Concept**: Partner with LAFLA/NLSLA to share (anonymized) insights.

**High-Leverage**:
- They get data to improve services
- We get credibility and referrals
- Users get better overall support

### 3. Judicial Council Research

**Concept**: Contribute to official court statistics research.

**High-Leverage**:
- Academic credibility
- Policy influence
- Data validation

### 4. Form Template Optimization

**Concept**: A/B test different form UX to maximize completion and outcomes.

**High-Leverage**:
- "Version A users have 15% higher approval rates"
- Continuous improvement loop
- Every optimization helps all future users

### 5. Predictive Outcome Model

**Concept**: ML model that predicts likelihood of approval based on inputs.

**High-Leverage**:
- "Your current application has 62% predicted approval"
- "Add medical records to increase to 78%"
- Personalized guidance

**Ethical Guardrails**:
- Never discourage filing
- Always show as guidance, not guarantee
- "Many factors affect outcomes beyond this form"

---

## Success Scenario

**6 Months from Now**:

```
┌─────────────────────────────────────────────┐
│ SWIFTFILL IMPACT REPORT                     │
│ Q2 2026                                     │
├─────────────────────────────────────────────┤
│                                             │
│ 1,247 forms completed                       │
│ 523 outcomes reported                       │
│                                             │
│ APPROVAL RATE                               │
│ SwiftFill Users: 51%                        │
│ SF Baseline: 29%                            │
│ LA Baseline: ~50%                           │
│                                             │
│ SwiftFill users are 76% more likely to      │
│ be granted a DVRO in San Francisco.         │
│                                             │
│ TOP CORRELATING FACTORS                     │
│ 1. Medical documentation (+34%)             │
│ 2. Photo evidence (+28%)                    │
│ 3. 3+ form revisions (+22%)                 │
│ 4. AI assistance usage (+18%)               │
│                                             │
│ Source: SwiftFill anonymized analytics      │
│ Methodology: [View Details]                 │
└─────────────────────────────────────────────┘
```

**Marketing Copy**:
> "SwiftFill users in San Francisco are granted DVROs at nearly twice the rate of the county average. Our AI-powered form assistance and evidence guidance helps self-represented litigants present stronger cases."

---

## Next Steps

1. **Approve this architecture** - Get stakeholder buy-in on privacy approach
2. **Legal review** - Ensure compliance with all applicable laws
3. **Implement Phase 1** - Basic analytics infrastructure
4. **Design outcome survey** - UX for 30-day follow-up
5. **Set baseline** - Establish first cohort for comparison

---

**This system transforms SwiftFill from a form filler into an outcomes engine.**

Every user who reports their outcome helps the next user succeed.

---

Co-Authored-By: Claude <noreply@anthropic.com>
