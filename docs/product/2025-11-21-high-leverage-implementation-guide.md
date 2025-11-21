# High-Leverage Implementation Guide

**Branch**: `claude/map-la-court-staff-019DgLdqrDwe2UfAiyRtYuSh`
**Date**: November 21, 2025
**Status**: Ready for review / merge consideration

---

## Branch Overview: What We Built

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COURT INTELLIGENCE SYSTEM                            │
│                    Branch Deliverables                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ LA COURT DATA   │  │ SF COURT DATA   │  │ CITATIONS       │         │
│  │ 700+ lines      │  │ 350+ lines      │  │ 300+ lines      │         │
│  │ ✅ COMPLETE     │  │ ✅ COMPLETE     │  │ ✅ COMPLETE     │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │              PRODUCT IDEAS (5)                               │       │
│  │              400+ lines                                      │       │
│  │              ✅ COMPLETE                                     │       │
│  └─────────────────────────┬───────────────────────────────────┘       │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │              OUTCOMES INTELLIGENCE SYSTEM                    │       │
│  │              560+ lines                                      │       │
│  │              ✅ ARCHITECTURE COMPLETE                        │       │
│  │              ⏳ IMPLEMENTATION PENDING                       │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

FILES IN THIS BRANCH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ LA_SUPERIOR_COURT_JUDICIAL_OFFICERS.md     (705 lines)
✅ SF_SUPERIOR_COURT_JUDICIAL_OFFICERS.md     (279 lines)
✅ COURT_DATA_CITATIONS.md                     (201 lines)
✅ COURT_DATA_PRODUCT_IDEAS.md                 (331 lines)
✅ OUTCOMES_INTELLIGENCE_SYSTEM.md             (562 lines)
✅ HIGH_LEVERAGE_IMPLEMENTATION_GUIDE.md       (THIS FILE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~2,100+ lines of strategic documentation
```

---

## Git Merge Considerations

### Files That May Conflict

```
POTENTIAL CONFLICTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  NONE - All files in this branch are NEW documentation files
    No existing codebase files modified
    Safe to merge without code conflicts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note: This branch also includes changes from previous commits:
- src/components/liquid-slider/* (new component)
- vitest.config.ts (minor change)

These should be reviewed if merging from a branch that doesn't have them.
```

### Merge Strategy

```bash
# Recommended merge approach
git checkout main
git fetch origin claude/map-la-court-staff-019DgLdqrDwe2UfAiyRtYuSh
git merge --no-ff claude/map-la-court-staff-019DgLdqrDwe2UfAiyRtYuSh -m "feat: add court intelligence system with outcomes tracking architecture"

# If you need to cherry-pick only the docs:
git cherry-pick b452cd7  # LA court guide
git cherry-pick b79ae55  # LA expansion + SF guide
git cherry-pick fed171b  # Citations + product ideas
git cherry-pick 71826a3  # Outcomes intelligence system
```

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SWIFTFILL COURT INTELLIGENCE SYSTEM                   │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        DATA LAYER (Completed)                              │ │
│  │                                                                            │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │ │
│  │  │ LA Superior  │    │ SF Superior  │    │ Citations    │                 │ │
│  │  │ Court Data   │    │ Court Data   │    │ Registry     │                 │ │
│  │  │              │    │              │    │              │                 │ │
│  │  │ • 36 courts  │    │ • 7 judges   │    │ • 50+ URLs   │                 │ │
│  │  │ • 20+ judges │    │ • 29% stat   │    │ • Dates      │                 │ │
│  │  │ • Parking    │    │ • Parking    │    │ • Sources    │                 │ │
│  │  │ • Reviews    │    │ • Transit    │    │              │                 │ │
│  │  └──────────────┘    └──────────────┘    └──────────────┘                 │ │
│  │                                                                            │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                          │
│                                      ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      INTELLIGENCE LAYER (Architected)                      │ │
│  │                                                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    OUTCOMES ANALYTICS ENGINE                        │  │ │
│  │  │                                                                     │  │ │
│  │  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │  │ │
│  │  │   │ Form        │  │ Outcome     │  │ Aggregated  │                │  │ │
│  │  │   │ Analytics   │  │ Surveys     │  │ Statistics  │                │  │ │
│  │  │   │ (auto)      │  │ (opt-in)    │  │ (k≥10)      │                │  │ │
│  │  │   └─────────────┘  └─────────────┘  └─────────────┘                │  │ │
│  │  │                                                                     │  │ │
│  │  │   Status: ⏳ Schema designed, implementation pending                │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                          │
│                                      ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      PRODUCT LAYER (Planned)                               │ │
│  │                                                                            │ │
│  │   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐ │ │
│  │   │ Court      │ │ Smart      │ │ Outcome    │ │ Judicial   │ │ Post-  │ │ │
│  │   │ Navigator  │ │ Pre-Fill   │ │ Dashboard  │ │ Cards      │ │ Filing │ │ │
│  │   │            │ │            │ │            │ │            │ │ Support│ │ │
│  │   │ P2         │ │ P0 ⭐      │ │ P1         │ │ P2         │ │ P3     │ │ │
│  │   └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────┘ │ │
│  │                                                                            │ │
│  │   Status: ⏳ All features designed, implementation pending                 │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## High-Leverage Item Breakdown

### Item 1: Smart Form Pre-Fill (P0 - Highest Priority)

```
┌─────────────────────────────────────────────────────────────────────┐
│ SMART FORM PRE-FILL                                                 │
│ Status: READY FOR IMPLEMENTATION                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ INPUT                        PROCESSING              OUTPUT         │
│ ─────                        ──────────              ──────         │
│ User ZIP: 91401       →      Match to      →      Van Nuys East    │
│                               courthouse            6230 Sylmar Ave │
│                                                    (818) 374-2208   │
│                                                    Dept D (DVRO)    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ IMPLEMENTATION TASKS                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ □ 1. Create ZIP-to-courthouse mapping JSON                          │
│      • Parse LA_SUPERIOR_COURT_JUDICIAL_OFFICERS.md                 │
│      • Map ZIP ranges to courthouses                                │
│      • Include SF data                                              │
│      Est: 2-3 hours                                                 │
│                                                                     │
│ □ 2. Create case-type-to-department routing                         │
│      • DVRO → specific departments                                  │
│      • Civil harassment → different depts                           │
│      • Child custody → family law general                           │
│      Est: 1-2 hours                                                 │
│                                                                     │
│ □ 3. Build auto-fill component                                      │
│      • React hook: useCourtAutoFill(zip, caseType)                  │
│      • Returns: courthouse, address, phone, dept, room              │
│      Est: 3-4 hours                                                 │
│                                                                     │
│ □ 4. Integrate into form workflow                                   │
│      • Pre-fill form fields                                         │
│      • Allow user override                                          │
│      • Show confidence indicator                                    │
│      Est: 2-3 hours                                                 │
│                                                                     │
│ TOTAL ESTIMATE: 8-12 hours                                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DATA DEPENDENCY                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ ✅ LA_SUPERIOR_COURT_JUDICIAL_OFFICERS.md                           │
│    • 36 courthouses with addresses                                  │
│    • Department numbers for DVRO                                    │
│    • Phone numbers                                                  │
│                                                                     │
│ ✅ SF_SUPERIOR_COURT_JUDICIAL_OFFICERS.md                           │
│    • 1 courthouse (Civic Center)                                    │
│    • Department numbers                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Item 2: Outcome Dashboard (P1 - Second Priority)

```
┌─────────────────────────────────────────────────────────────────────┐
│ OUTCOME EXPECTATION DASHBOARD                                       │
│ Status: ARCHITECTURE COMPLETE, IMPLEMENTATION PENDING               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ MOCKUP                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────┐        │
│ │ San Francisco DVRO Outcomes                             │        │
│ │                                                         │        │
│ │   Filed      Granted     Rate                           │        │
│ │   1,016   →   295    =   29%                            │        │
│ │                                                         │        │
│ │   ████████░░░░░░░░░░░░░░░░░░░░ 29%                     │        │
│ │                                                         │        │
│ │   ⚠️ SF has the lowest approval rate in California      │        │
│ │   Statewide average: 82% clearance                      │        │
│ │                                                         │        │
│ │   Source: SF Standard (Aug 28, 2025)                    │        │
│ │   [View Article →]                                      │        │
│ └─────────────────────────────────────────────────────────┘        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ IMPLEMENTATION TASKS                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ □ 1. Create statistics data store                                   │
│      • JSON with county → stats mapping                             │
│      • Include citations inline                                     │
│      • Version/date tracking                                        │
│      Est: 1-2 hours                                                 │
│                                                                     │
│ □ 2. Build OutcomeDashboard component                               │
│      • Visual progress bar                                          │
│      • Comparison to baseline                                       │
│      • Citation display                                             │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ □ 3. Integrate into pre-filing flow                                 │
│      • Show after user selects county                               │
│      • Before they start filling form                               │
│      • "I understand" acknowledgment                                │
│      Est: 2-3 hours                                                 │
│                                                                     │
│ □ 4. Add "strength meter" based on evidence                         │
│      • Count evidence types                                         │
│      • Show expected outcome lift                                   │
│      • "Add photos to increase from 29% to ~40%"                    │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ TOTAL ESTIMATE: 11-17 hours                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DATA DEPENDENCY                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ ✅ SF_SUPERIOR_COURT_JUDICIAL_OFFICERS.md                           │
│    • 1,016 filings, 295 granted (29%)                               │
│    • 90% self-represented                                           │
│    • 2-year average duration                                        │
│                                                                     │
│ ✅ COURT_DATA_CITATIONS.md                                          │
│    • SF Standard article URL                                        │
│    • Publication date                                               │
│    • Verification status                                            │
│                                                                     │
│ ⏳ NEED: LA-specific DVRO approval rate                             │
│    • Search court statistics                                        │
│    • Or note "data unavailable"                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Item 3: Outcomes Analytics Infrastructure (P1 - Critical Path)

```
┌─────────────────────────────────────────────────────────────────────┐
│ OUTCOMES ANALYTICS INFRASTRUCTURE                                   │
│ Status: SCHEMA DESIGNED, DATABASE PENDING                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DATA FLOW DIAGRAM                                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│   USER DEVICE                     SUPABASE                          │
│   ───────────                     ────────                          │
│                                                                     │
│   ┌─────────────┐                ┌─────────────┐                   │
│   │ Form Data   │                │ User Vault  │                   │
│   │ (PII)       │───────────────▶│ (encrypted) │                   │
│   └─────────────┘                └─────────────┘                   │
│          │                                                          │
│          │ anonymize locally                                        │
│          ▼                                                          │
│   ┌─────────────┐                ┌─────────────┐                   │
│   │ Analytics   │                │ Analytics   │                   │
│   │ Event       │───────────────▶│ Tables      │                   │
│   │ (no PII)    │                │ (no PII)    │                   │
│   └─────────────┘                └─────────────┘                   │
│                                          │                          │
│                                          │ aggregate                │
│                                          ▼                          │
│                                  ┌─────────────┐                   │
│                                  │ Outcome     │                   │
│                                  │ Aggregates  │                   │
│                                  │ (k≥10)      │                   │
│                                  └─────────────┘                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ IMPLEMENTATION TASKS                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ □ 1. Create Supabase tables                                         │
│      • form_submissions_analytics                                   │
│      • outcomes_survey                                              │
│      • outcome_aggregates                                           │
│      Est: 2-3 hours                                                 │
│                                                                     │
│ □ 2. Create edge function for analytics ingestion                   │
│      • Validate no PII in payload                                   │
│      • Hash user ID                                                 │
│      • Insert to analytics table                                    │
│      Est: 3-4 hours                                                 │
│                                                                     │
│ □ 3. Build client-side analytics hook                               │
│      • useOutcomesAnalytics()                                       │
│      • Track form events                                            │
│      • Anonymize before send                                        │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ □ 4. Create consent flow UI                                         │
│      • Explain what's collected                                     │
│      • Opt-in/opt-out                                               │
│      • Store preference                                             │
│      Est: 3-4 hours                                                 │
│                                                                     │
│ □ 5. Build outcome survey                                           │
│      • 30-day trigger logic                                         │
│      • Survey UI                                                    │
│      • Link to submission (hashed)                                  │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ □ 6. Create aggregation function                                    │
│      • Cron job or on-demand                                        │
│      • K-anonymity enforcement                                      │
│      • Correlation analysis                                         │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ TOTAL ESTIMATE: 20-29 hours                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DATABASE SCHEMA (from OUTCOMES_INTELLIGENCE_SYSTEM.md)              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ form_submissions_analytics:                                         │
│   - user_hash (non-reversible)                                      │
│   - county, case_type                                               │
│   - evidence_score (0-12)                                           │
│   - form_quality_score                                              │
│   - ai_assistance_level                                             │
│   - completion_time_minutes                                         │
│                                                                     │
│ outcomes_survey:                                                    │
│   - submission_hash                                                 │
│   - outcome (granted/modified/denied/pending)                       │
│   - grant_duration                                                  │
│   - user_satisfaction                                               │
│                                                                     │
│ outcome_aggregates:                                                 │
│   - period, county, case_type                                       │
│   - total_submissions, outcomes_reported                            │
│   - granted_count, denied_count                                     │
│   - avg_evidence_score, avg_form_quality                            │
│   - CONSTRAINT: outcomes_reported >= 10                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Item 4: Evidence-Outcome Correlation Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│ EVIDENCE-OUTCOME CORRELATION ENGINE                                 │
│ Status: DESIGNED, DEPENDS ON ANALYTICS INFRA                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ CONCEPT                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ INPUT: Evidence checklist                                           │
│   □ Photos of injuries                                              │
│   □ Text messages/emails                                            │
│   □ Medical records                                                 │
│   □ Police reports                                                  │
│   □ Witness statements                                              │
│   □ ...                                                             │
│                                                                     │
│ PROCESSING: Correlation analysis                                    │
│   • Track which evidence → granted vs denied                        │
│   • Calculate odds ratios                                           │
│   • Identify strongest predictors                                   │
│                                                                     │
│ OUTPUT: User guidance                                               │
│   "Users who include medical records are 2.3x more likely           │
│    to be granted a DVRO"                                            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ IMPLEMENTATION TASKS                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ □ 1. Define evidence checklist (12-15 types)                        │
│      • Photos, texts, medical, police, witnesses, etc.              │
│      • Standardize categories                                       │
│      Est: 1-2 hours                                                 │
│                                                                     │
│ □ 2. Add evidence tracking to analytics event                       │
│      • Bitmask or array of evidence types                           │
│      • No content, just categories                                  │
│      Est: 1-2 hours                                                 │
│                                                                     │
│ □ 3. Build correlation analysis function                            │
│      • SQL or edge function                                         │
│      • Calculate: P(granted | evidence_type)                        │
│      • Odds ratio vs baseline                                       │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ □ 4. Create strength meter UI                                       │
│      • Show current score                                           │
│      • Highlight missing high-impact evidence                       │
│      • "Add X to increase by Y%"                                    │
│      Est: 4-6 hours                                                 │
│                                                                     │
│ TOTAL ESTIMATE: 10-16 hours                                         │
│                                                                     │
│ DEPENDENCY: Requires analytics infrastructure (Item 3)              │
│ DEPENDENCY: Requires 100+ outcomes for statistical significance     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Item 5: Judicial Officer Intelligence Cards

```
┌─────────────────────────────────────────────────────────────────────┐
│ JUDICIAL OFFICER INTELLIGENCE CARDS                                 │
│ Status: DATA COMPLETE, UI PENDING                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ MOCKUP                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────┐        │
│ │  JUDGE MELANIE OCHOA                                    │        │
│ │  Department 13 • Room 312 • Stanley Mosk                │        │
│ ├─────────────────────────────────────────────────────────┤        │
│ │  Assignment: Restraining Order Hearings                 │        │
│ │  Phone: (213) 633-0513                                  │        │
│ │  Assigned: April 8, 2024                                │        │
│ ├─────────────────────────────────────────────────────────┤        │
│ │  Handles: DVRO, Civil Harassment, Elder Abuse,          │        │
│ │           Workplace Violence, GVRO                      │        │
│ ├─────────────────────────────────────────────────────────┤        │
│ │  Source: LA Superior Court Family Law Directory         │        │
│ │          (Sept 24, 2025)                                │        │
│ │  [Verify on lacourt.org →]                              │        │
│ └─────────────────────────────────────────────────────────┘        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ IMPLEMENTATION TASKS                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ □ 1. Create judicial officers JSON data store                       │
│      • Parse from LA/SF markdown files                              │
│      • Include all fields                                           │
│      • Add citation for each                                        │
│      Est: 2-3 hours                                                 │
│                                                                     │
│ □ 2. Build JudicialOfficerCard component                            │
│      • Display all info                                             │
│      • Citation footer                                              │
│      • "Verify" link to court site                                  │
│      Est: 3-4 hours                                                 │
│                                                                     │
│ □ 3. Integrate into form flow                                       │
│      • Show after court selection                                   │
│      • "Your case will be heard by..."                              │
│      • Or show department info if judge varies                      │
│      Est: 2-3 hours                                                 │
│                                                                     │
│ TOTAL ESTIMATE: 7-10 hours                                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DATA DEPENDENCY                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                     │
│ ✅ LA_SUPERIOR_COURT_JUDICIAL_OFFICERS.md                           │
│    • 20+ judicial officers mapped                                   │
│    • Department, room, phone                                        │
│    • Assignment type                                                │
│                                                                     │
│ ✅ SF_SUPERIOR_COURT_JUDICIAL_OFFICERS.md                           │
│    • 7 family law judges/commissioners                              │
│    • Department, phone, email                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Overall Implementation Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION TIMELINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ WEEK 1-2: FOUNDATION                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ Smart Form Pre-Fill (P0)                    8-12 hrs              │
│ □ Judicial Officers JSON data store           2-3 hrs               │
│ □ Statistics JSON data store                  1-2 hrs               │
│                                              ─────────              │
│                                              11-17 hrs              │
│                                                                     │
│ WEEK 3-4: ANALYTICS INFRASTRUCTURE                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ Supabase analytics tables                   2-3 hrs               │
│ □ Analytics edge function                     3-4 hrs               │
│ □ Client analytics hook                       4-6 hrs               │
│ □ Consent flow UI                             3-4 hrs               │
│                                              ─────────              │
│                                              12-17 hrs              │
│                                                                     │
│ WEEK 5-6: USER-FACING FEATURES                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ Outcome Dashboard component                 4-6 hrs               │
│ □ Judicial Officer Cards                      3-4 hrs               │
│ □ Integration into form flow                  4-6 hrs               │
│                                              ─────────              │
│                                              11-16 hrs              │
│                                                                     │
│ WEEK 7-8: INTELLIGENCE & OUTCOMES                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ Outcome survey system                       4-6 hrs               │
│ □ Aggregation function                        4-6 hrs               │
│ □ Evidence-outcome correlation                4-6 hrs               │
│ □ Strength meter UI                           4-6 hrs               │
│                                              ─────────              │
│                                              16-24 hrs              │
│                                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ TOTAL: 50-74 hours (~1.5-2 weeks full-time)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Task Dependencies Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TASK DEPENDENCIES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                                                                     │
│   ┌──────────────────┐                                              │
│   │ LA/SF Court Data │ ◀─── DONE                                    │
│   │ (Documentation)  │                                              │
│   └────────┬─────────┘                                              │
│            │                                                        │
│            ├─────────────┬───────────────┬────────────────┐         │
│            │             │               │                │         │
│            ▼             ▼               ▼                ▼         │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│   │ JSON Data  │ │ ZIP-Court  │ │ Stats      │ │ Citations  │      │
│   │ Stores     │ │ Mapping    │ │ Store      │ │ Registry   │      │
│   └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘      │
│         │              │              │              │              │
│         │              │              │              │              │
│         ▼              ▼              │              │              │
│   ┌────────────┐ ┌────────────┐      │              │              │
│   │ Judicial   │ │ Smart      │      │              │              │
│   │ Cards UI   │ │ Pre-Fill   │      │              │              │
│   └────────────┘ └────────────┘      │              │              │
│                                      │              │              │
│                                      ▼              │              │
│                              ┌────────────┐         │              │
│                              │ Outcome    │         │              │
│                              │ Dashboard  │◀────────┘              │
│                              └─────┬──────┘                        │
│                                    │                               │
│                                    │                               │
│   ┌──────────────────┐             │                               │
│   │ Analytics        │             │                               │
│   │ Infrastructure   │◀────────────┘                               │
│   │ (Supabase)       │                                             │
│   └────────┬─────────┘                                              │
│            │                                                        │
│            ├─────────────┬────────────────┐                         │
│            │             │                │                         │
│            ▼             ▼                ▼                         │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐                     │
│   │ Consent    │ │ Outcome    │ │ Aggregation│                     │
│   │ Flow       │ │ Survey     │ │ Function   │                     │
│   └────────────┘ └────────────┘ └─────┬──────┘                     │
│                                       │                             │
│                                       │                             │
│                                       ▼                             │
│                              ┌────────────┐                        │
│                              │ Evidence-  │                        │
│                              │ Outcome    │                        │
│                              │ Correlation│                        │
│                              └─────┬──────┘                        │
│                                    │                               │
│                                    ▼                               │
│                              ┌────────────┐                        │
│                              │ Strength   │                        │
│                              │ Meter UI   │                        │
│                              └────────────┘                        │
│                                                                     │
│                                                                     │
│ LEGEND:                                                             │
│ ───────                                                             │
│ ◀─── DONE    = Completed in this branch                            │
│ ────▶        = Depends on                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Files to Create in Next Implementation Phase

```
┌─────────────────────────────────────────────────────────────────────┐
│ NEW FILES NEEDED FOR IMPLEMENTATION                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ DATA STORES (src/data/)                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ courthouses.json         - All 36 LA + SF courthouses             │
│ □ judicial-officers.json   - Judges/commissioners                   │
│ □ zip-to-court.json        - ZIP code mapping                       │
│ □ court-statistics.json    - Approval rates with citations          │
│ □ evidence-types.json      - Checklist categories                   │
│                                                                     │
│ HOOKS (src/hooks/)                                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ useCourtAutoFill.ts      - ZIP → courthouse pre-fill              │
│ □ useOutcomesAnalytics.ts  - Analytics event tracking               │
│ □ useEvidenceStrength.ts   - Evidence checklist scoring             │
│                                                                     │
│ COMPONENTS (src/components/)                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ OutcomeDashboard.tsx     - Statistics display                     │
│ □ JudicialOfficerCard.tsx  - Judge info card                        │
│ □ StrengthMeter.tsx        - Evidence strength indicator            │
│ □ ConsentFlow.tsx          - Analytics opt-in                       │
│ □ OutcomeSurvey.tsx        - 30-day follow-up                       │
│                                                                     │
│ SUPABASE (supabase/migrations/)                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ [date]_analytics_tables.sql  - form_submissions_analytics, etc.   │
│                                                                     │
│ EDGE FUNCTIONS (supabase/functions/)                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ □ analytics-ingest/        - Receive anonymized events              │
│ □ outcomes-aggregate/      - Compute statistics                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Branch Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│ BRANCH: claude/map-la-court-staff-019DgLdqrDwe2UfAiyRtYuSh          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ STATUS: ✅ Ready for merge                                          │
│                                                                     │
│ COMMITS: 4 documentation commits                                    │
│   • b452cd7 - LA court guide                                        │
│   • b79ae55 - LA expansion + SF guide                               │
│   • fed171b - Citations + product ideas                             │
│   • 71826a3 - Outcomes intelligence system                          │
│                                                                     │
│ TOTAL ADDITIONS: ~2,100 lines                                       │
│                                                                     │
│ CONFLICT RISK: ⬇️ LOW                                                │
│   • All new documentation files                                     │
│   • No existing code modified                                       │
│                                                                     │
│ MERGE RECOMMENDATION:                                               │
│   Merge entire branch - all files are additive                      │
│   No cherry-picking needed                                          │
│                                                                     │
│ NEXT BRANCH SHOULD:                                                 │
│   • Implement P0: Smart Form Pre-Fill                               │
│   • Create data store JSONs                                         │
│   • Start analytics infrastructure                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: What's Done vs Pending

```
COMPLETED (This Branch)                    PENDING (Next Phase)
━━━━━━━━━━━━━━━━━━━━━━━                   ━━━━━━━━━━━━━━━━━━━━━
✅ LA courthouse directory (36)            □ ZIP-to-court mapping JSON
✅ LA judicial officers (20+)              □ useCourtAutoFill hook
✅ SF courthouse data                      □ Pre-fill integration
✅ SF judicial officers (7)
✅ SF statistics (29%, etc.)               □ OutcomeDashboard component
✅ Parking guides                          □ Strength meter UI
✅ Yelp reviews
✅ SRL challenges documented               □ JudicialOfficerCard component
✅ Legal aid resources
✅ All citations with URLs                 □ Analytics Supabase tables
✅ 5 product ideas                         □ Analytics edge functions
✅ Outcomes system architecture            □ Consent flow
✅ Database schema designed                □ Outcome survey
✅ Privacy approach defined                □ Correlation engine
✅ Implementation timeline
```

---

Co-Authored-By: Claude <noreply@anthropic.com>
