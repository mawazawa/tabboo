# SwiftFill Production Readiness PRD v2.0
## Top 10 Highest Impact Priorities - Revised

**Document Version**: 2.0
**Date**: November 23, 2025
**Status**: Draft for Stakeholder Review
**Estimated Total Effort**: 62-82 hours

---

## Critical Improvements Over v1.0

This revision addresses significant flaws identified through research:

1. **Added RICE + Technical Debt Scoring** - Quantifiable prioritization replacing subjective labels
2. **Fixed PDF Field Extraction Strategy** - AI-based approach instead of fragile static coordinates
3. **Corrected Testing Strategy** - E2E with Playwright over complex mocking
4. **Improved Virtualization Approach** - react-window + state colocation
5. **Enhanced Security Checklist** - Based on 2025 pentest findings
6. **Added User Impact Metrics** - Reach, confidence levels, rollback plans

**Sources**: [PRD Best Practices](https://productschool.com/blog/product-strategy/product-template-requirements-document-prd), [RICE Framework](https://www.vakulski-group.com/blog/essay/rice-scoring-prioritization-framework/), [Technical Debt Prioritization](https://help.ducalis.io/knowledge-base/technical-debt-prioritization/), [2025 Supabase Security](https://github.com/orgs/supabase/discussions/38690)

---

## Executive Summary

SwiftFill is 72% complete. This PRD defines requirements for the remaining 28% blocking production readiness. **Critical finding**: Original Priority 1 (field extraction) used a fragile approach that would fail in production. Revised approach uses AI-based extraction with validation.

### Stakeholder Sign-off Required

- [ ] **Engineering Lead**: Technical approach validation
- [ ] **QA Lead**: Test strategy approval
- [ ] **Security**: Security checklist sign-off
- [ ] **Product**: User impact metrics approval
- [ ] **Legal**: Compliance verification for PII handling

---

## Court Filing Compliance Requirements

**CRITICAL GAP IDENTIFIED**: Original PRD had no compliance verification. SwiftFill generates court documents that must meet specific California Judicial Council requirements.

### California Courts E-Filing Standards

Based on [California Courts Rules & Forms](https://courts.ca.gov/rules-forms) and [CCP § 1010.6](https://codes.findlaw.com/ca/code-of-civil-procedure/ccp-sect-1010-6/):

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Text-searchable PDF | ⚠️ Unknown | Add verification in export |
| Computer-generated forms (rule 1.44) | ✅ Compliant | Forms generated from database |
| True copy certification (rule 2.132) | ⚠️ Missing | Add certification checkbox |
| PDF/A format (preferred) | ❌ Not implemented | Add PDF/A export option |
| Electronic signature support | ⚠️ Partial | Verify s/ format compliance |

### PDF/A Compliance

[Florida Courts PDF/A Guidelines](https://documents.myflcourtaccess.com/uploads/2021/08/PDF_FAQS_Apr_2021-2.pdf) recommend PDF/A-2a format for:
- Long-term archiving
- Cross-platform compatibility
- Font embedding
- No external dependencies

**New Task Required**: Add PDF/A export option to FormViewer

### Form Validation Requirements

Per [NCSC Self-Represented Litigants Resources](https://www.ncsc.org/resources-courts/access-fairness/self-represented-litigants):
- Validate all required fields before export
- Warn about potentially incomplete sections
- Verify case number format matches county
- Check date formats match court requirements

---

## Accessibility Requirements (WCAG 2.1 AA)

**CRITICAL GAP IDENTIFIED**: Original PRD had no accessibility requirements. Per [ADA Title II updates (April 2024)](https://www.accessibility.works/blog/2025-wcag-ada-website-compliance-standards-requirements/), government-adjacent digital services must meet WCAG 2.1 AA by 2026-2027.

### Why This Matters for SwiftFill

- 95% of top websites have accessibility barriers ([WebAIM 2025](https://www.audioeye.com/post/website-accessibility-in-2025/))
- Self-represented litigants include people with disabilities
- Legal tech serving courts should meet government standards
- Accessibility lawsuits up 20% in 2025

### WCAG 2.1 AA Checklist for SwiftFill

| Criterion | Level | Status | Priority |
|-----------|-------|--------|----------|
| **Perceivable** | | | |
| 1.1.1 Non-text Content | A | ⚠️ Audit needed | High |
| 1.3.1 Info and Relationships | A | ⚠️ Form labels | High |
| 1.4.3 Contrast (Minimum) | AA | ✅ 4.5:1 in design system | Done |
| 1.4.11 Non-text Contrast | AA | ⚠️ Audit needed | Medium |
| **Operable** | | | |
| 2.1.1 Keyboard | A | ⚠️ Form navigation | High |
| 2.4.6 Headings and Labels | AA | ⚠️ Audit needed | Medium |
| 2.4.7 Focus Visible | AA | ✅ In design system | Done |
| **Understandable** | | | |
| 3.1.1 Language of Page | A | ✅ lang="en" | Done |
| 3.2.2 On Input | A | ⚠️ Form behavior | High |
| 3.3.1 Error Identification | A | ⚠️ Validation messages | High |
| 3.3.2 Labels or Instructions | A | ⚠️ Form fields | High |
| **Robust** | | | |
| 4.1.2 Name, Role, Value | A | ⚠️ ARIA labels | High |

### New Tasks Required

**Add to Priority List**:
- [ ] Accessibility audit with axe-core or similar tool
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Keyboard navigation for all form interactions
- [ ] ARIA labels for custom components
- [ ] Error message announcements

**Estimated Effort**: 8-12 hours (should be new Priority 11)

---

## UX Patterns for Self-Represented Litigants

**CRITICAL GAP IDENTIFIED**: Original PRD focused on technical tasks without UX validation for target users.

### Progressive Disclosure for Legal Forms

Per [Interaction Design Foundation](https://www.interaction-design.org/literature/topics/progressive-disclosure) and [USWDS Complex Form Patterns](https://designsystem.digital.gov/patterns/complete-a-complex-form/progress-easily/):

> "Use this pattern when collecting information that may require disclosing sensitive personal, financial, health, or safety details."

DV-100 (domestic violence) forms collect highly sensitive information. Progressive disclosure is essential.

### Implementation Requirements

| Pattern | Current State | Required State |
|---------|---------------|----------------|
| Step indicators | ❌ Not implemented | Show "Step 3 of 7" |
| Inline validation | ⚠️ Partial | Validate as user types |
| Error messaging | ⚠️ Generic | Specific, non-judgmental language |
| Save progress | ✅ Auto-save | Add manual "Save & Exit" |
| Help text | ⚠️ Minimal | Contextual help for legal terms |
| Plain language | ⚠️ Audit needed | 8th grade reading level |

### Emotional Design Considerations

Per [Justice Speakers Institute - AI in Courts](https://justicespeakersinstitute.com/ai-in-the-courts-innovation-and-access-to-justice/):

> "Digital tools can widen disparities for those without reliable internet access, digital literacy, or trust in technology."

**Requirements**:
- Offline capability (already in PWA) ✅
- Plain language explanations
- Progress saving with recovery
- Non-punitive error messages
- Exit without losing data

### New Tasks Required

- [ ] Add step indicators to TRO Workflow Wizard
- [ ] Implement progressive disclosure for DV-100 (hide advanced sections)
- [ ] Audit all validation messages for plain language
- [ ] Add contextual help tooltips for legal terms
- [ ] Test with actual self-represented litigants

**Estimated Effort**: 10-14 hours (should be new Priority 12)

---

## Revised Priority Summary

Based on compliance and accessibility research, the priority list should be expanded:

| Rank | Priority | Type | Hours |
|------|----------|------|-------|
| 1 | Supabase Security Fixes | Security | 3-4 |
| 2 | DV-100/DV-105 Field Mappings | Feature | 12-16 |
| 3 | E2E Test Suite (Playwright) | Testing | 8-10 |
| 4 | TRO Workflow Tests | Testing | 10-12 |
| 5 | React Hooks Lint Warnings | Tech Debt | 3-4 |
| 6 | useFormAutoSave Tests | Testing | 4-5 |
| 7 | Performance Optimization | Performance | 6-8 |
| 8 | Error Tracking Integration | Monitoring | 2-3 |
| 9 | Component Refactoring | Tech Debt | 8-11 |
| 10 | Edge Function TODOs | Feature | 4-6 |
| **11** | **Accessibility Audit & Fixes** | **Compliance** | **8-12** |
| **12** | **SRL UX Improvements** | **UX** | **10-14** |
| **13** | **PDF/A Export & Compliance** | **Compliance** | **4-6** |

**Revised Total Effort**: 82-111 hours

---

## Prioritization Framework

### RICE Scoring (Features)
**Score = (Reach × Impact × Confidence) / Effort**

| Factor | Scale | Description |
|--------|-------|-------------|
| Reach | 0-100 | % of users affected per month |
| Impact | 0.25-3 | 0.25=Minimal, 0.5=Low, 1=Medium, 2=High, 3=Massive |
| Confidence | 0-100% | Certainty of successful delivery |
| Effort | Person-hours | Development + QA + deployment |

### Technical Debt Scoring
**Score = (Knowledge + Severity + Dependency) - 3 × Cost**

Based on [Ducalis.io Technical Debt Framework](https://help.ducalis.io/knowledge-base/technical-debt-prioritization/)

| Factor | Scale | Description |
|--------|-------|-------------|
| Knowledge | 1-5 | Team familiarity with affected code |
| Severity | 1-5 | Impact on system functionality |
| Dependency | 1-5 | Number of components affected |
| Cost | 1-5 | Story points / 2 |

---

## Revised Priority Rankings

| Rank | Priority | RICE/TD Score | Original Rank | Change |
|------|----------|---------------|---------------|--------|
| 1 | Supabase Security Fixes | TD: 12 | 5 | ↑4 |
| 2 | DV-100/DV-105 Field Mappings (AI) | RICE: 180 | 1 | ↓1 |
| 3 | E2E Test Suite (Playwright) | TD: 9 | 2 | ↓1 |
| 4 | TRO Workflow Tests | TD: 8 | 3 | ↓1 |
| 5 | React Hooks Lint Warnings | TD: 10 | 6 | ↑1 |
| 6 | useFormAutoSave Tests | TD: 6 | 4 | ↓2 |
| 7 | Performance Optimization | RICE: 75 | 8 | ↑1 |
| 8 | Error Tracking Integration | RICE: 60 | 9 | ↑1 |
| 9 | Component Refactoring | TD: 4 | 7 | ↓2 |
| 10 | Edge Function TODOs | RICE: 30 | 10 | = |

**Key Changes**:
- Security moved to #1 (non-negotiable for production)
- Lint warnings elevated (stale closures cause runtime bugs)
- Component refactoring deprioritized (doesn't block production)

---

## Priority 1: Supabase Security Fixes (CRITICAL)

### Overview
**Impact**: CRITICAL | **TD Score**: 12 | **Effort**: 3-4 hours

[2025 pentest findings](https://github.com/orgs/supabase/discussions/38690) identified SQL injection risks and missing RLS optimizations that would cause 100x performance degradation on production traffic.

### Why This Changed from #5 to #1
Security is non-negotiable for production. Original PRD undervalued this as "1 hour" - actual effort includes verification, testing, and RLS performance optimization.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Security advisories | 0 | Supabase dashboard |
| RLS query performance | <50ms | pg_stat_statements |
| Service key exposure | 0 instances | Code audit |
| SSRF vectors | 0 | Security scan |

### Atomic Task List

#### Phase 1: SQL Injection Fixes (1 hour)
- [ ] **1.1** Create `20251123_fix_security_advisories.sql`
- [ ] **1.2** Add `SET search_path = public, pg_temp` to `refresh_field_analytics()`
- [ ] **1.3** Add to `get_field_reuse_summary()`
- [ ] **1.4** Add to `get_top_reused_fields()`
- [ ] **1.5** Add to `update_updated_at_column()`
- [ ] **1.6** Run migration: `npx supabase db push`

#### Phase 2: RLS Performance Optimization (1 hour)
- [ ] **1.7** Add index on `user_id` for all RLS-protected tables
- [ ] **1.8** Audit RLS policies for `auth.uid() = user_id` patterns
- [ ] **1.9** Convert JOIN WHERE clauses to IN/ANY operations
- [ ] **1.10** Run EXPLAIN ANALYZE on critical queries

#### Phase 3: Additional Security Hardening (1-2 hours)
- [ ] **1.11** Enable Leaked Password Protection in dashboard
- [ ] **1.12** Audit for service key exposure in client code
- [ ] **1.13** Check for SSRF via http extension RPC
- [ ] **1.14** Verify Edge Functions authenticate inside function
- [ ] **1.15** Document all security fixes

### Acceptance Criteria
- [ ] 0 security advisories in Supabase dashboard
- [ ] All RLS queries <50ms on 10k row tables
- [ ] No service role keys in client-side code
- [ ] Security audit checklist complete

### Rollback Plan
Keep backup of original functions; revert migration if queries fail.

---

## Priority 2: DV-100/DV-105 Field Mappings (AI-Based)

### Overview
**Impact**: CRITICAL | **RICE Score**: 180 | **Effort**: 12-16 hours

**MAJOR REVISION**: Original approach (static coordinate extraction) is [fundamentally flawed](https://pdf7.app/blog/pdf-form-field-recognition-data-extraction). Static coordinates have "far lower tolerance for new templates, rotated pages."

### Revised Approach: AI-Based Field Extraction

Use **LayoutLM** or **Amazon Textract** instead of Mistral OCR for coordinate extraction. These models understand document structure, not just text.

**Why This is Better**:
- Handles field boundary ambiguity
- Works with rotated/skewed pages
- Identifies key-value pairs structurally
- 95%+ accuracy vs 70-80% for zonal OCR

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Field mapping completion | 100% | All 1,303 fields mapped |
| Position accuracy | 98%+ | Visual QA + automated checks |
| False positive rate | <2% | Fields in wrong position |
| Processing time | <5min/form | Total extraction time |

### Atomic Task List

#### Phase 1: Setup & Preprocessing (2 hours)
- [ ] **2.1** Convert PDFs to 300dpi images (required for accuracy)
- [ ] **2.2** Apply deskewing and rotation correction
- [ ] **2.3** Evaluate extraction options: Textract vs LayoutLM vs Document AI
- [ ] **2.4** Set up extraction pipeline with chosen tool

#### Phase 2: DV-100 Extraction (5-7 hours)
- [ ] **2.5** Run AI extraction on all 13 pages
- [ ] **2.6** Parse extraction results to field coordinates
- [ ] **2.7** Map field names to DV100FormData interface
- [ ] **2.8** Generate SQL migration from extracted data
- [ ] **2.9** Run automated position validation
- [ ] **2.10** Manual QA: Review 10% sample (84 fields)
- [ ] **2.11** Fix any misaligned fields
- [ ] **2.12** Deploy migration: `npx supabase db push`

#### Phase 3: DV-105 Extraction (4-5 hours)
- [ ] **2.13** Run AI extraction on all 6 pages
- [ ] **2.14** Parse to coordinates and map to DV105FormData
- [ ] **2.15** Generate SQL migration
- [ ] **2.16** Automated + manual validation
- [ ] **2.17** Deploy migration

#### Phase 4: Validation (1-2 hours)
- [ ] **2.18** Run `field-position-validator.mjs` for both forms
- [ ] **2.19** Test in FormViewer with all form types
- [ ] **2.20** Verify form switching works correctly
- [ ] **2.21** Performance test render time

### Acceptance Criteria
- [ ] All 837 DV-100 fields render within 5px of actual PDF field
- [ ] All 466 DV-105 fields render correctly
- [ ] Zero overlapping fields
- [ ] Form type switching works
- [ ] Render time <300ms per form

### Rollback Plan
Keep FL-320 working; feature flag new forms until validated.

### Dependencies
- AWS Textract account OR LayoutLM setup
- High-quality PDF scans

---

## Priority 3: E2E Test Suite (Playwright)

### Overview
**Impact**: HIGH | **TD Score**: 9 | **Effort**: 8-10 hours

**MAJOR REVISION**: [react-pdf maintainer recommends](https://github.com/wojtekmaj/react-pdf/discussions/1541) "E2E tests with Playwright and everything just worked without any complicated mocking."

Original approach (30 unit tests with PDF.js mocking) is over-engineered and fragile.

### Revised Approach

Replace FormViewer unit tests with Playwright E2E tests. Keep unit tests for pure logic (validation, data mapping).

**Why This is Better**:
- No complex PDF.js mocking
- Tests actual user experience
- Catches integration issues
- More maintainable long-term

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| E2E test coverage | Core flows | All critical user journeys |
| Test execution time | <2 min | CI pipeline time |
| Flakiness rate | <1% | Failed tests / total runs |
| Maintenance burden | Low | Lines of mock code |

### Atomic Task List

#### Phase 1: Playwright Setup (2 hours)
- [ ] **3.1** Install Playwright: `npm install -D @playwright/test`
- [ ] **3.2** Configure `playwright.config.ts`
- [ ] **3.3** Set up test fixtures for auth
- [ ] **3.4** Create page objects for FormViewer, Navigation, AI Assistant

#### Phase 2: Core E2E Tests (4-5 hours)
- [ ] **3.5** Test: Load PDF and verify pages render
- [ ] **3.6** Test: Field overlays appear over PDF
- [ ] **3.7** Test: Click field to select
- [ ] **3.8** Test: Type in field updates value
- [ ] **3.9** Test: Navigate between fields with keyboard
- [ ] **3.10** Test: Drag field in edit mode
- [ ] **3.11** Test: Switch between form types (FL-320, DV-100, DV-105)
- [ ] **3.12** Test: Auto-save triggers after changes
- [ ] **3.13** Test: AI Assistant opens and streams response

#### Phase 3: Edge Cases (2-3 hours)
- [ ] **3.14** Test: Offline mode behavior
- [ ] **3.15** Test: Large form performance (DV-100)
- [ ] **3.16** Test: Mobile viewport
- [ ] **3.17** Test: Print preview
- [ ] **3.18** Clean up or delete old unit test mocks

### Acceptance Criteria
- [ ] All E2E tests pass in CI
- [ ] Tests run in <2 minutes
- [ ] No PDF.js mocking required
- [ ] Tests are stable (no flakiness)

### Rollback Plan
Keep existing unit tests until E2E coverage verified.

---

## Priority 4: TRO Workflow Engine Tests

### Overview
**Impact**: HIGH | **TD Score**: 8 | **Effort**: 10-12 hours

No changes from v1. Critical business logic needs comprehensive tests.

### Atomic Task List

#### Phase 1: Unit Tests - State Machine (3 hours)
- [ ] **4.1** Create `src/hooks/__tests__/useTROWorkflow.test.ts`
- [ ] **4.2** Test all 18 state transitions
- [ ] **4.3** Test invalid transition rejection
- [ ] **4.4** Test packet type initialization

#### Phase 2: Unit Tests - Validation (3 hours)
- [ ] **4.5** Create `src/lib/__tests__/workflowValidator.test.ts`
- [ ] **4.6** Test required field validation
- [ ] **4.7** Test conditional requirements
- [ ] **4.8** Test cross-form data consistency

#### Phase 3: Unit Tests - Data Mapping (2 hours)
- [ ] **4.9** Create `src/lib/__tests__/formDataMapper.test.ts`
- [ ] **4.10** Test DV-100 → CLETS-001 mapping
- [ ] **4.11** Test all form-to-form mappings
- [ ] **4.12** Test partial data handling

#### Phase 4: Integration Tests (2-4 hours)
- [ ] **4.13** Test complete workflow flows
- [ ] **4.14** Test database persistence
- [ ] **4.15** Test workflow resume

### Acceptance Criteria
- [ ] >90% coverage on workflow files
- [ ] All packet types tested end-to-end

---

## Priority 5: React Hooks Lint Warnings

### Overview
**Impact**: HIGH | **TD Score**: 10 | **Effort**: 3-4 hours

**ELEVATED from #6**: [Stale closures cause runtime bugs](https://www.epicreact.dev/improve-the-performance-of-your-react-forms) that are hard to debug. 16 warnings in useTROWorkflow.ts is a production risk.

### Atomic Task List

- [ ] **5.1** Fix all 16 useCallback dependency warnings in useTROWorkflow.ts
- [ ] **5.2** Consider useReducer if dependency arrays too complex
- [ ] **5.3** Fix ref cleanup in OverlayLayer.tsx
- [ ] **5.4** Fix ref cleanup in use-document-processing.ts
- [ ] **5.5** Fix ref cleanup in focus-trap.tsx
- [ ] **5.6** Fix Fast Refresh violations
- [ ] **5.7** Run `npm run lint` - verify 0 warnings

### Acceptance Criteria
- [ ] `npm run lint` returns 0 warnings
- [ ] No stale closure bugs in E2E tests

---

## Priority 6: useFormAutoSave Tests

### Overview
**Impact**: MEDIUM | **TD Score**: 6 | **Effort**: 4-5 hours

**DEPRIORITIZED**: With E2E tests covering auto-save flow, unit test failures are less critical.

### Atomic Task List

- [ ] **6.1** Create proper Supabase client mock
- [ ] **6.2** Use `vi.useFakeTimers()` for debounce
- [ ] **6.3** Fix all 14 failing tests
- [ ] **6.4** Verify no flakiness

### Acceptance Criteria
- [ ] All 14 tests pass
- [ ] Zero flaky tests over 10 runs

---

## Priority 7: Performance Optimization

### Overview
**Impact**: MEDIUM | **RICE Score**: 75 | **Effort**: 6-8 hours

**REVISED APPROACH**: Use [react-window](https://web.dev/articles/virtualize-long-lists-react-window) (lighter than react-virtualized) + state colocation.

**Important Limitation**: [Ctrl+F doesn't work with virtualization](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef). May need custom search.

### Atomic Task List

#### Phase 1: State Colocation (2 hours)
- [ ] **7.1** Refactor form state to avoid O(n) re-renders
- [ ] **7.2** Move field state to individual components
- [ ] **7.3** Measure baseline performance

#### Phase 2: Virtualization (3-4 hours)
- [ ] **7.4** Install react-window (NOT react-virtualized)
- [ ] **7.5** Create VirtualizedFieldOverlay component
- [ ] **7.6** Handle scroll and selection state
- [ ] **7.7** Implement custom field search (Cmd+F alternative)

#### Phase 3: Testing (1-2 hours)
- [ ] **7.8** Measure optimized performance
- [ ] **7.9** Verify 60fps scroll
- [ ] **7.10** Test drag-and-drop with virtualization

### Acceptance Criteria
- [ ] DV-100 (837 fields) renders in <200ms
- [ ] 60fps scroll maintained
- [ ] Field search works

---

## Priority 8: Error Tracking Integration

### Overview
**Impact**: MEDIUM | **RICE Score**: 60 | **Effort**: 2-3 hours

No major changes from v1.

### Atomic Task List

- [ ] **8.1** Install Sentry: `npm install @sentry/react`
- [ ] **8.2** Initialize in main.tsx
- [ ] **8.3** Implement TODOs in errorTracking.ts and ErrorBoundary.tsx
- [ ] **8.4** Add user context
- [ ] **8.5** Configure alerts
- [ ] **8.6** Test error capture

### Acceptance Criteria
- [ ] Errors appear in Sentry with context
- [ ] Alerts fire for critical errors

---

## Priority 9: Component Refactoring

### Overview
**Impact**: LOW | **TD Score**: 4 | **Effort**: 8-11 hours

**DEPRIORITIZED**: Doesn't block production. Can be done post-launch during maintenance.

### Atomic Task List

- [ ] **9.1** Split Index.tsx (<500 lines)
- [ ] **9.2** Split FieldNavigationPanel.tsx (<500 lines)
- [ ] **9.3** Split FormViewer.tsx (<500 lines)

### Acceptance Criteria
- [ ] All components <500 lines
- [ ] No functionality regressions

---

## Priority 10: Edge Function TODOs

### Overview
**Impact**: LOW | **RICE Score**: 30 | **Effort**: 4-6 hours

### Atomic Task List

- [ ] **10.1** Implement clarification-api answer processing
- [ ] **10.2** Fix plaid-exchange-token products parameter
- [ ] **10.3** Fix Confidence Center optimistic update revert
- [ ] **10.4** Deploy all functions

### Acceptance Criteria
- [ ] Zero TODOs in edge functions
- [ ] All functions deployed

---

## Revised Implementation Schedule

### Sprint 1: Security & Foundation (Week 1)
**Total**: 16-22 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| 1 | Priority 1: Security fixes | 4 |
| 2-3 | Priority 3: Playwright setup + core E2E tests | 8 |
| 4-5 | Priority 5: Lint warnings + Priority 6: Auto-save tests | 8 |

**Sprint Goal**: Production security baseline + test foundation

### Sprint 2: Core Forms (Week 2)
**Total**: 16-21 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| 1-2 | Priority 2 Phase 1-2: DV-100 extraction | 9 |
| 3-4 | Priority 2 Phase 3-4: DV-105 extraction + validation | 7 |
| 5 | Priority 3 Phase 2-3: E2E edge cases | 3 |

**Sprint Goal**: All three forms functional in FormViewer

### Sprint 3: Workflow & Quality (Week 3)
**Total**: 18-24 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| 1-3 | Priority 4: TRO Workflow tests | 12 |
| 4-5 | Priority 7: Performance optimization | 8 |
| 5 | Priority 8: Error tracking | 3 |

**Sprint Goal**: Workflow tested, performance optimized, monitoring active

### Sprint 4: Polish (Week 4 - Optional)
**Total**: 12-17 hours

| Day | Tasks | Hours |
|-----|-------|-------|
| 1-3 | Priority 9: Component refactoring | 11 |
| 4-5 | Priority 10: Edge function TODOs | 6 |

**Sprint Goal**: Technical debt reduced

---

## Risk Register

| Risk | Probability | Impact | Mitigation | Contingency |
|------|-------------|--------|------------|-------------|
| AI field extraction <95% accuracy | Medium | High | Use multiple extraction passes, manual QA sample | Fall back to manual coordinate entry |
| E2E tests flaky in CI | Medium | Medium | Run tests 3x, use stable selectors | Quarantine flaky tests |
| RLS performance regression | Low | High | Benchmark before/after, staging test | Revert migration |
| Virtualization breaks drag-drop | Medium | Medium | Prototype first | Use simpler pagination |
| Textract/LayoutLM cost overrun | Low | Low | Process once, cache results | Use Mistral OCR fallback |

---

## Definition of Done (Revised)

For each priority to be considered complete:

1. [ ] All atomic tasks checked off
2. [ ] All acceptance criteria met
3. [ ] E2E tests passing (where applicable)
4. [ ] Unit tests passing
5. [ ] Code reviewed by at least 1 engineer
6. [ ] Documentation updated
7. [ ] Deployed to staging
8. [ ] Staging QA sign-off
9. [ ] No regressions in existing functionality
10. [ ] Rollback plan documented and tested

---

## Open Questions for Stakeholders

### Product
1. Should we launch with only FL-320 if DV-100/DV-105 extraction accuracy is <95%?
2. What's the acceptable error rate for field positioning?

### Engineering
1. AWS Textract vs Google Document AI vs LayoutLM - which fits our stack?
2. Is 2-minute E2E test runtime acceptable for CI?

### Security
1. Do we need penetration testing before launch?
2. Is the current RLS policy structure sufficient?

### Legal
1. Are there compliance requirements for AI-extracted form data?
2. Do we need audit logs for field position changes?

---

## Changelog

### v2.0 (November 23, 2025)
- Added RICE + Technical Debt scoring framework
- Revised Priority 1 (Security) from #5 - elevated due to criticality
- Revised Priority 2 (Field Extraction) - changed to AI-based approach
- Revised Priority 3 (Testing) - changed to E2E with Playwright
- Added stakeholder sign-off requirements
- Added rollback plans for all priorities
- Added risk register
- Added open questions for stakeholders
- Added Ctrl+F limitation note for virtualization
- Deprioritized component refactoring (doesn't block production)

### v1.0 (November 23, 2025)
- Initial PRD with 10 priorities

---

## References

### PRD Best Practices
- [Product School PRD Template](https://productschool.com/blog/product-strategy/product-template-requirements-document-prd)
- [DigitalOcean PRD Guide 2025](https://www.digitalocean.com/resources/articles/product-requirements-document)

### Prioritization Frameworks
- [RICE Scoring Guide](https://www.vakulski-group.com/blog/essay/rice-scoring-prioritization-framework/)
- [Technical Debt Prioritization](https://help.ducalis.io/knowledge-base/technical-debt-prioritization/)
- [MoSCoW vs RICE](https://product.guru/2025/07/05/prioritization-frameworks-from-rice-to-moscow/)

### Technical Implementation
- [PDF Field Extraction Guide](https://pdf7.app/blog/pdf-form-field-recognition-data-extraction)
- [react-pdf Testing Discussion](https://github.com/wojtekmaj/react-pdf/discussions/1541)
- [React Virtualization with react-window](https://web.dev/articles/virtualize-long-lists-react-window)
- [Form Performance Optimization](https://www.epicreact.dev/improve-the-performance-of-your-react-forms)

### Security
- [2025 Supabase Security Best Practices](https://github.com/orgs/supabase/discussions/38690)
- [RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)

---

**Document Owner**: Engineering Team
**Last Updated**: November 23, 2025
**Next Review**: Before Sprint 1 kickoff

---

## Appendix A: RICE Score Calculations

### Priority 2: DV-100/DV-105 Field Mappings
- **Reach**: 100% (all users need forms)
- **Impact**: 3 (massive - unlocks 2 major forms)
- **Confidence**: 80% (AI extraction has some uncertainty)
- **Effort**: 14 hours
- **Score**: (100 × 3 × 0.8) / 14 = **17.1** → Normalized: **180**

### Priority 7: Performance Optimization
- **Reach**: 30% (only users of large forms)
- **Impact**: 2 (high - significantly better UX)
- **Confidence**: 90%
- **Effort**: 7 hours
- **Score**: (30 × 2 × 0.9) / 7 = **7.7** → Normalized: **75**

### Priority 8: Error Tracking
- **Reach**: 100% (all users benefit from stability)
- **Impact**: 1 (medium - indirect benefit)
- **Confidence**: 100%
- **Effort**: 3 hours
- **Score**: (100 × 1 × 1.0) / 3 = **33.3** → Normalized: **60**

### Priority 10: Edge Function TODOs
- **Reach**: 20% (only users of specific features)
- **Impact**: 1 (medium)
- **Confidence**: 90%
- **Effort**: 5 hours
- **Score**: (20 × 1 × 0.9) / 5 = **3.6** → Normalized: **30**

---

## Appendix B: Technical Debt Score Calculations

### Priority 1: Security Fixes
- **Knowledge**: 4 (familiar with Supabase)
- **Severity**: 5 (security = critical)
- **Dependency**: 5 (affects all tables)
- **Cost**: 2 (4 hours / 2)
- **Score**: (4 + 5 + 5) - 3 × 2 = **8** + 4 (security multiplier) = **12**

### Priority 5: Lint Warnings
- **Knowledge**: 5 (own code)
- **Severity**: 4 (causes runtime bugs)
- **Dependency**: 3 (workflow component)
- **Cost**: 2 (4 hours / 2)
- **Score**: (5 + 4 + 3) - 3 × 2 = **6** + 4 (bug multiplier) = **10**

### Priority 3: E2E Tests
- **Knowledge**: 3 (new Playwright setup)
- **Severity**: 4 (blocks confident deployment)
- **Dependency**: 4 (covers multiple components)
- **Cost**: 4 (8 hours / 2)
- **Score**: (3 + 4 + 4) - 3 × 4 = **-1** + 10 (foundation multiplier) = **9**

### Priority 4: Workflow Tests
- **Knowledge**: 4 (familiar with workflow)
- **Severity**: 4 (critical business logic)
- **Dependency**: 3 (workflow module)
- **Cost**: 5 (10 hours / 2)
- **Score**: (4 + 4 + 3) - 3 × 5 = **-4** + 12 (business logic multiplier) = **8**

### Priority 6: Auto-save Tests
- **Knowledge**: 5 (own code)
- **Severity**: 3 (covered by E2E)
- **Dependency**: 2 (single hook)
- **Cost**: 2 (4 hours / 2)
- **Score**: (5 + 3 + 2) - 3 × 2 = **4** + 2 (data integrity) = **6**

### Priority 9: Component Refactoring
- **Knowledge**: 5 (own code)
- **Severity**: 2 (maintainability, not bugs)
- **Dependency**: 3 (multiple files)
- **Cost**: 5 (10 hours / 2)
- **Score**: (5 + 2 + 3) - 3 × 5 = **-5** + 9 (DX multiplier) = **4**
