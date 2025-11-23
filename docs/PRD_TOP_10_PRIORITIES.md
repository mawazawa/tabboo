# SwiftFill Production Readiness PRD
## Top 10 Highest Impact Priorities

**Document Version**: 1.0
**Date**: November 23, 2025
**Status**: Draft
**Estimated Total Effort**: 56-73 hours

---

## Executive Summary

This PRD defines the requirements, success metrics, and atomic task breakdown for the 10 highest-impact priorities blocking SwiftFill's production readiness. Current project completion is 72%. Completing these priorities will bring the application to production-ready status.

---

## Priority 1: DV-100/DV-105 Field Position Mappings

### Overview
**Impact**: CRITICAL | **Complexity**: HIGH | **Estimate**: 10-14 hours

Two major California Judicial Council forms (DV-100: 837 fields, DV-105: 466 fields) have TypeScript interfaces and validation schemas but zero database field position mappings, making them non-functional in the FormViewer.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Field mapping completion | 100% | All 1,303 fields in `form_field_mappings` table |
| Position accuracy | 95%+ | Visual QA pass rate on rendered fields |
| Render performance | <500ms | Time to render all fields on page load |
| Validation score | 100/100 | `field-position-validator.mjs` output |

### Atomic Task List

#### Phase 1: DV-100 Field Extraction (6-8 hours)
- [ ] **1.1** Extract page 1 field coordinates from `/public/dv100.pdf` using Mistral OCR
- [ ] **1.2** Extract page 2-4 field coordinates
- [ ] **1.3** Extract page 5-8 field coordinates
- [ ] **1.4** Extract page 9-13 field coordinates
- [ ] **1.5** Populate `20251122_populate_dv100_phase1_fields.sql` with coordinates
- [ ] **1.6** Populate `20251122_populate_dv100_phase2_fields.sql` with coordinates
- [ ] **1.7** Populate `20251122_populate_dv100_phase3_fields.sql` with coordinates
- [ ] **1.8** Populate `20251122_populate_dv100_phase4_fields.sql` with coordinates
- [ ] **1.9** Run migrations: `npx supabase db push`
- [ ] **1.10** Visual QA: Verify all 837 fields render correctly over PDF

#### Phase 2: DV-105 Field Extraction (4-6 hours)
- [ ] **2.1** Extract page 1-2 field coordinates from `/public/dv105.pdf`
- [ ] **2.2** Extract page 3-4 field coordinates
- [ ] **2.3** Extract page 5-6 field coordinates
- [ ] **2.4** Populate `20251122_populate_dv105_fields.sql` with coordinates
- [ ] **2.5** Run migrations: `npx supabase db push`
- [ ] **2.6** Visual QA: Verify all 466 fields render correctly over PDF
- [ ] **2.7** Run `node field-position-validator.mjs` for both forms
- [ ] **2.8** Fix any overlapping or out-of-bounds fields

### Acceptance Criteria
- [ ] All 837 DV-100 fields visible and correctly positioned over PDF
- [ ] All 466 DV-105 fields visible and correctly positioned over PDF
- [ ] Zero field overlaps reported by validator
- [ ] Zero out-of-bounds fields
- [ ] Fields accept input and save to database
- [ ] FormViewer `formType` prop works for all three forms

### Dependencies
- Mistral OCR API access (configured)
- `/public/dv100.pdf` and `/public/dv105.pdf` present

---

## Priority 2: FormViewer Test Failures

### Overview
**Impact**: HIGH | **Complexity**: HIGH | **Estimate**: 6-8 hours

30 integration tests failing due to PDF.js worker not available in test environment. Tests cannot find field overlays, blocking CI/CD pipeline.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test pass rate | 100% | All 30 tests passing |
| Test execution time | <30s | Total test suite runtime |
| Coverage | >80% | FormViewer component coverage |
| CI pipeline | Green | GitHub Actions passes |

### Atomic Task List

#### Phase 1: Test Environment Setup (2-3 hours)
- [ ] **3.1** Create PDF.js mock in `src/test/mocks/pdfjs.ts`
- [ ] **3.2** Configure Vitest to use PDF.js mock globally
- [ ] **3.3** Create mock PDF document with controllable pages
- [ ] **3.4** Create mock field position data matching `FormFieldMapping` interface
- [ ] **3.5** Update `src/test/setup.ts` with PDF.js mocks

#### Phase 2: Test Fixes (3-4 hours)
- [ ] **3.6** Fix async rendering timing issues with proper `waitFor` usage
- [ ] **3.7** Fix field overlay queries to match actual DOM structure
- [ ] **3.8** Implement TODO at line 202: field selection test
- [ ] **3.9** Implement TODO at line 227: field navigation test
- [ ] **3.10** Implement TODO at line 264: drag-and-drop test
- [ ] **3.11** Add proper cleanup between tests

#### Phase 3: Validation (1 hour)
- [ ] **3.12** Run full test suite: `npm run test`
- [ ] **3.13** Verify coverage report: `npm run test:coverage`
- [ ] **3.14** Test in CI environment simulation

### Acceptance Criteria
- [ ] All 30 FormViewer integration tests pass
- [ ] No test timeouts
- [ ] Tests run in <30 seconds
- [ ] Coverage >80% for FormViewer.tsx
- [ ] Mocks properly clean up between tests

### Dependencies
- Priority 1 not required (tests use mock data)

---

## Priority 3: TRO Workflow Engine Tests

### Overview
**Impact**: HIGH | **Complexity**: HIGH | **Estimate**: 12 hours

Core workflow engine (18 states, 4 packet types, 9 form types) has zero test coverage. Critical business logic untested.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Unit test coverage | >90% | Coverage for useTROWorkflow.ts |
| Integration test coverage | >80% | Coverage for workflow flows |
| State transition coverage | 100% | All 18 states tested |
| Packet type coverage | 100% | All 4 packet types tested |

### Atomic Task List

#### Phase 1: Unit Tests - State Machine (3 hours)
- [ ] **4.1** Create `src/hooks/__tests__/useTROWorkflow.test.ts`
- [ ] **4.2** Test `startWorkflow` for each packet type
- [ ] **4.3** Test all valid state transitions
- [ ] **4.4** Test invalid state transition rejection
- [ ] **4.5** Test `transitionToNextForm` logic
- [ ] **4.6** Test `transitionToPreviousForm` logic
- [ ] **4.7** Test `getCurrentForm` for each state

#### Phase 2: Unit Tests - Validation (3 hours)
- [ ] **4.8** Create `src/lib/__tests__/workflowValidator.test.ts`
- [ ] **4.9** Test required field validation for DV-100
- [ ] **4.10** Test required field validation for CLETS-001
- [ ] **4.11** Test conditional field requirements
- [ ] **4.12** Test packet-level validation
- [ ] **4.13** Test data consistency checks
- [ ] **4.14** Test validation error message format

#### Phase 3: Unit Tests - Data Mapping (3 hours)
- [ ] **4.15** Create `src/lib/__tests__/formDataMapper.test.ts`
- [ ] **4.16** Test DV-100 → CLETS-001 mapping
- [ ] **4.17** Test DV-100 → DV-105 mapping
- [ ] **4.18** Test DV-100 → FL-150 mapping
- [ ] **4.19** Test Personal Data Vault → form mapping
- [ ] **4.20** Test partial data handling
- [ ] **4.21** Test data type conversions

#### Phase 4: Integration Tests (3 hours)
- [ ] **4.22** Create `src/hooks/__tests__/useTROWorkflow.integration.test.ts`
- [ ] **4.23** Test complete INITIATING_WITH_CHILDREN flow
- [ ] **4.24** Test complete INITIATING_NO_CHILDREN flow
- [ ] **4.25** Test complete RESPONSE flow
- [ ] **4.26** Test workflow persistence to database
- [ ] **4.27** Test workflow resume from saved state
- [ ] **4.28** Test progress percentage calculations
- [ ] **4.29** Test estimated time remaining calculations

### Acceptance Criteria
- [ ] >90% coverage on useTROWorkflow.ts
- [ ] >80% coverage on workflowValidator.ts
- [ ] >80% coverage on formDataMapper.ts
- [ ] All packet types have end-to-end test
- [ ] All state transitions documented and tested
- [ ] Error scenarios covered

### Dependencies
- None (uses mock data)

---

## Priority 4: useFormAutoSave Test Failures

### Overview
**Impact**: HIGH | **Complexity**: MEDIUM | **Estimate**: 4-6 hours

14 tests failing due to 5-second debounce timing issues and missing Supabase/Toast mocks.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test pass rate | 100% | All 14 tests passing |
| Test execution time | <10s | Auto-save test suite runtime |
| Flakiness rate | 0% | No intermittent failures |

### Atomic Task List

#### Phase 1: Mock Setup (2 hours)
- [ ] **5.1** Create Supabase client mock in `src/test/mocks/supabase.ts`
- [ ] **5.2** Create toast notification mock
- [ ] **5.3** Add mocks to `src/test/setup.ts`
- [ ] **5.4** Configure fake timers for debounce testing

#### Phase 2: Test Fixes (2-3 hours)
- [ ] **5.5** Update tests to use `vi.useFakeTimers()`
- [ ] **5.6** Add `vi.advanceTimersByTime(5000)` for debounce
- [ ] **5.7** Wrap state updates in `act()`
- [ ] **5.8** Use `waitFor` for async assertions
- [ ] **5.9** Fix timeout configuration (increase to 10000ms)
- [ ] **5.10** Add proper cleanup with `vi.useRealTimers()`

#### Phase 3: Validation (1 hour)
- [ ] **5.11** Run tests 10 times to check for flakiness
- [ ] **5.12** Verify coverage report
- [ ] **5.13** Document testing patterns for debounced hooks

### Acceptance Criteria
- [ ] All 14 auto-save tests pass
- [ ] No test timeouts
- [ ] Tests run in <10 seconds
- [ ] Zero flaky tests over 10 runs
- [ ] Mocks properly simulate Supabase responses

### Dependencies
- None

---

## Priority 5: Supabase Security Advisories

### Overview
**Impact**: HIGH | **Complexity**: LOW | **Estimate**: 1 hour

4 database functions vulnerable to SQL injection via mutable search paths. Leaked password protection disabled.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Security warnings | 0 | Supabase dashboard shows no advisories |
| Function hardening | 100% | All functions have fixed search_path |
| Password protection | Enabled | Leaked password protection active |

### Atomic Task List

- [ ] **6.1** Create migration `20251123_fix_security_advisories.sql`
- [ ] **6.2** Add `SET search_path = public, pg_temp` to `refresh_field_analytics()`
- [ ] **6.3** Add `SET search_path = public, pg_temp` to `get_field_reuse_summary()`
- [ ] **6.4** Add `SET search_path = public, pg_temp` to `get_top_reused_fields()`
- [ ] **6.5** Add `SET search_path = public, pg_temp` to `update_updated_at_column()`
- [ ] **6.6** Run migration: `npx supabase db push`
- [ ] **6.7** Enable Leaked Password Protection in Supabase dashboard → Authentication → Settings
- [ ] **6.8** Verify all security advisories cleared in dashboard

### Acceptance Criteria
- [ ] Supabase dashboard shows 0 security advisories
- [ ] All 4 functions have immutable search_path
- [ ] Leaked Password Protection enabled
- [ ] Migration documented and committed

### Dependencies
- Supabase dashboard access

---

## Priority 6: React Hooks Lint Warnings

### Overview
**Impact**: MEDIUM | **Complexity**: MEDIUM | **Estimate**: 3-4 hours

19 lint warnings causing potential stale closures and memory leaks. 16 in useTROWorkflow.ts alone.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lint warnings | 0 | `npm run lint` shows 0 warnings |
| Stale closure bugs | 0 | No runtime state inconsistencies |
| Fast Refresh violations | 0 | No HMR warnings in dev |

### Atomic Task List

#### Phase 1: useTROWorkflow.ts Fixes (2 hours)
- [ ] **7.1** Add `getNextForm` to useCallback dependencies (line 478)
- [ ] **7.2** Add `getPreviousForm` to useCallback dependencies
- [ ] **7.3** Add `areDependenciesMet` to useCallback dependencies
- [ ] **7.4** Add `validatePacket` to useCallback dependencies
- [ ] **7.5** Add `validateCurrentForm` to useCallback dependencies
- [ ] **7.6** Review all 16 warnings and fix systematically
- [ ] **7.7** Consider using `useReducer` if dependency arrays too complex

#### Phase 2: Ref Cleanup Fixes (1 hour)
- [ ] **7.8** Fix `OverlayLayer.tsx` ref cleanup pattern
- [ ] **7.9** Fix `use-document-processing.ts` ref cleanup
- [ ] **7.10** Fix `focus-trap.tsx` ref cleanup
- [ ] **7.11** Pattern: Copy ref to variable inside useEffect

#### Phase 3: Fast Refresh Fixes (1 hour)
- [ ] **7.12** Extract constants from components with violations
- [ ] **7.13** Move non-component exports to separate files
- [ ] **7.14** Run `npm run lint` to verify 0 warnings

### Acceptance Criteria
- [ ] `npm run lint` returns 0 warnings
- [ ] No stale closure bugs in manual testing
- [ ] Fast Refresh works correctly in dev
- [ ] All hooks have correct dependency arrays

### Dependencies
- None

---

## Priority 7: Component Size Refactoring

### Overview
**Impact**: MEDIUM | **Complexity**: MEDIUM | **Estimate**: 8-11 hours

Three components exceed 500-line guideline, reducing maintainability and increasing cognitive load.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Max component size | <500 lines | Line count per file |
| Code duplication | <5% | Duplicate code analysis |
| Import depth | <3 levels | Import chain analysis |

### Atomic Task List

#### Phase 1: Index.tsx Refactoring (3-4 hours)
- [ ] **8.1** Extract form state management to `useFormState` hook
- [ ] **8.2** Extract PDF viewer logic to `usePDFViewer` hook
- [ ] **8.3** Extract toolbar to `FormToolbar.tsx` component
- [ ] **8.4** Extract sidebar panels to separate components
- [ ] **8.5** Create `FormEditorLayout.tsx` for layout structure
- [ ] **8.6** Verify Index.tsx <500 lines

#### Phase 2: FieldNavigationPanel.tsx Refactoring (2-3 hours)
- [ ] **8.7** Extract field list rendering to `FieldList.tsx`
- [ ] **8.8** Extract search/filter logic to `useFieldSearch` hook
- [ ] **8.9** Extract field group logic to `useFieldGroups` hook
- [ ] **8.10** Create `FieldNavigationItem.tsx` for individual items
- [ ] **8.11** Verify FieldNavigationPanel.tsx <500 lines

#### Phase 3: FormViewer.tsx Refactoring (3-4 hours)
- [ ] **8.12** Extract field overlay rendering to `FieldOverlayLayer.tsx`
- [ ] **8.13** Extract PDF page rendering to `PDFPageRenderer.tsx`
- [ ] **8.14** Extract drag-and-drop logic to `useFieldDragDrop` hook
- [ ] **8.15** Create `FormViewerToolbar.tsx` for controls
- [ ] **8.16** Verify FormViewer.tsx <500 lines
- [ ] **8.17** Update all imports across codebase
- [ ] **8.18** Run tests to verify no regressions

### Acceptance Criteria
- [ ] All three components <500 lines
- [ ] No functionality regressions
- [ ] All tests pass
- [ ] Imports clean and organized
- [ ] Components have single responsibility

### Dependencies
- Priority 2 (FormViewer tests should pass first)

---

## Priority 8: Large Form Performance Optimization

### Overview
**Impact**: MEDIUM | **Complexity**: MEDIUM | **Estimate**: 6-8 hours

DV-100 (837 fields) and DV-105 (466 fields) will have poor render performance without virtualization.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial render time | <200ms | Performance profiler |
| Scroll performance | 60fps | Chrome DevTools FPS meter |
| Memory usage | <100MB | Chrome DevTools Memory |
| Time to interactive | <500ms | Lighthouse TTI |

### Atomic Task List

#### Phase 1: Performance Baseline (1 hour)
- [ ] **9.1** Measure current FL-320 render time (baseline)
- [ ] **9.2** Create performance test with 837 mock fields
- [ ] **9.3** Measure render time, memory, FPS
- [ ] **9.4** Document baseline metrics

#### Phase 2: Virtualization Implementation (4-5 hours)
- [ ] **9.5** Install `@tanstack/react-virtual` or `react-window`
- [ ] **9.6** Create `VirtualizedFieldOverlay.tsx` component
- [ ] **9.7** Implement viewport detection for visible fields
- [ ] **9.8** Only render fields within viewport + buffer
- [ ] **9.9** Handle scroll events efficiently
- [ ] **9.10** Maintain field selection state during virtualization
- [ ] **9.11** Handle drag-and-drop with virtualized fields

#### Phase 3: Optimization & Testing (1-2 hours)
- [ ] **9.12** Implement `useMemo` for field position calculations
- [ ] **9.13** Implement `useCallback` for event handlers
- [ ] **9.14** Add TODO at `src/lib/pdf-field-filler.ts:65` for multi-page
- [ ] **9.15** Measure optimized performance
- [ ] **9.16** Verify 60fps scroll performance
- [ ] **9.17** Test with DV-100 and DV-105 field counts

### Acceptance Criteria
- [ ] DV-100 renders in <200ms
- [ ] DV-105 renders in <200ms
- [ ] Scroll maintains 60fps
- [ ] Memory usage <100MB
- [ ] No visual glitches during scroll
- [ ] Drag-and-drop works correctly

### Dependencies
- Priority 1 (needs field mappings to test with real data)

---

## Priority 9: Error Tracking Integration

### Overview
**Impact**: MEDIUM | **Complexity**: LOW | **Estimate**: 2-3 hours

Error tracking TODOs prevent monitoring production errors and user issues.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Error capture rate | 100% | All unhandled errors captured |
| Error context | Complete | Stack trace + user context |
| Alert latency | <1 min | Time from error to alert |

### Atomic Task List

- [ ] **10.1** Choose error tracking service (Sentry recommended)
- [ ] **10.2** Install SDK: `npm install @sentry/react`
- [ ] **10.3** Create Sentry project and get DSN
- [ ] **10.4** Initialize Sentry in `src/main.tsx`
- [ ] **10.5** Implement TODO at `src/lib/errorTracking.ts:157`
- [ ] **10.6** Implement TODO at `src/components/ErrorBoundary.tsx:37`
- [ ] **10.7** Add user context (user ID, email) to errors
- [ ] **10.8** Configure environment-based sampling
- [ ] **10.9** Set up Slack/email alerts for critical errors
- [ ] **10.10** Test error capture with intentional error
- [ ] **10.11** Add `SENTRY_DSN` to environment variables

### Acceptance Criteria
- [ ] Unhandled errors appear in Sentry dashboard
- [ ] Errors include stack trace and user context
- [ ] Alerts fire for critical errors
- [ ] No sensitive data in error reports
- [ ] Environment correctly identified (dev/prod)

### Dependencies
- Sentry account (free tier available)

---

## Priority 10: Edge Function TODOs

### Overview
**Impact**: MEDIUM | **Complexity**: MEDIUM | **Estimate**: 4-6 hours

Incomplete edge function implementations affect clarification API and Plaid integration.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TODO count | 0 | No TODOs in edge functions |
| Function test coverage | >80% | Edge function tests |
| Deployment status | All deployed | `npx supabase functions list` |

### Atomic Task List

#### Phase 1: clarification-api (2 hours)
- [ ] **11.1** Review `supabase/functions/clarification-api/index.ts`
- [ ] **11.2** Implement TODO at line 62: answer processing logic
- [ ] **11.3** Add validation for answer format
- [ ] **11.4** Add error handling for invalid answers
- [ ] **11.5** Write unit tests for clarification logic
- [ ] **11.6** Deploy: `npx supabase functions deploy clarification-api`

#### Phase 2: plaid-exchange-token (1-2 hours)
- [ ] **11.7** Review `supabase/functions/plaid-exchange-token/index.ts`
- [ ] **11.8** Implement TODO at line 176: pass products from request
- [ ] **11.9** Add request validation for products array
- [ ] **11.10** Write unit tests
- [ ] **11.11** Deploy: `npx supabase functions deploy plaid-exchange-token`

#### Phase 3: Confidence Center (1-2 hours)
- [ ] **11.12** Review `src/components/confidence-center/ConfidenceCenterController.tsx`
- [ ] **11.13** Fix optimistic update revert logic at line 65
- [ ] **11.14** Add proper error state management
- [ ] **11.15** Test optimistic updates with network failures

#### Phase 4: Verification
- [ ] **11.16** Run `npx supabase functions list` to verify all deployed
- [ ] **11.17** Test each function endpoint
- [ ] **11.18** Verify no TODOs remain in edge functions

### Acceptance Criteria
- [ ] Zero TODOs in edge function code
- [ ] All functions deployed and accessible
- [ ] Error handling complete
- [ ] Optimistic updates revert correctly on failure

### Dependencies
- Plaid API credentials (for testing)

---

## Implementation Schedule

### Week 1: Critical Security & Testing Foundation
- **Day 1-2**: Priority 5 (Security - 1h) + Priority 4 (Auto-save tests - 6h)
- **Day 3-5**: Priority 2 (FormViewer tests - 8h)

### Week 2: Core Functionality
- **Day 1-3**: Priority 1 Phase 1 (DV-100 mappings - 8h)
- **Day 4-5**: Priority 1 Phase 2 (DV-105 mappings - 6h)

### Week 3: Workflow & Quality
- **Day 1-3**: Priority 3 (TRO Workflow tests - 12h)
- **Day 4**: Priority 6 (Lint warnings - 4h)
- **Day 5**: Priority 9 (Error tracking - 3h) + Priority 10 (Edge functions - 3h)

### Week 4: Performance & Polish
- **Day 1-3**: Priority 7 (Component refactoring - 11h)
- **Day 4-5**: Priority 8 (Performance optimization - 8h)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDF field coordinate extraction inaccurate | HIGH | Use multiple extraction methods, manual QA |
| Test mocking complexity | MEDIUM | Create shared test utilities, document patterns |
| Workflow state machine bugs | HIGH | Comprehensive state transition tests |
| Performance optimization breaks features | MEDIUM | Feature flags, A/B testing |
| Security fixes break existing queries | LOW | Test in staging first |

---

## Definition of Done

For each priority to be considered complete:

1. [ ] All atomic tasks checked off
2. [ ] All acceptance criteria met
3. [ ] All tests passing
4. [ ] Code reviewed
5. [ ] Documentation updated
6. [ ] Deployed to staging
7. [ ] QA sign-off

---

## Appendix: File References

### Priority 1
- `/public/dv100.pdf`
- `/public/dv105.pdf`
- `/supabase/migrations/20251122_populate_dv100_phase*_fields.sql`
- `/supabase/migrations/20251122_populate_dv105_fields.sql`
- `DV100_COMPLETE_FIELD_GUIDE.md`
- `DV105_COMPLETE_FIELD_GUIDE.md`

### Priority 2
- `src/components/__tests__/FormViewerIntegration.test.tsx`
- `src/components/FormViewer.tsx`
- `src/test/setup.ts`

### Priority 3
- `src/hooks/useTROWorkflow.ts`
- `src/lib/workflowValidator.ts`
- `src/lib/formDataMapper.ts`
- `src/types/WorkflowTypes.ts`

### Priority 4
- `src/hooks/useFormAutoSave.ts`
- `src/hooks/__tests__/useFormAutoSave.test.ts`

### Priority 5
- Supabase Dashboard → Database → Functions

### Priority 6
- `src/hooks/useTROWorkflow.ts` (lines 478-971)
- `src/components/OverlayLayer.tsx`
- `src/hooks/use-document-processing.ts`
- `src/components/ui/focus-trap.tsx`

### Priority 7
- `src/pages/Index.tsx` (930 lines)
- `src/components/FieldNavigationPanel.tsx` (853 lines)
- `src/components/FormViewer.tsx` (724 lines)

### Priority 8
- `src/lib/pdf-field-filler.ts`
- `src/components/FormViewer.tsx`

### Priority 9
- `src/lib/errorTracking.ts`
- `src/components/ErrorBoundary.tsx`

### Priority 10
- `supabase/functions/clarification-api/index.ts`
- `supabase/functions/plaid-exchange-token/index.ts`
- `src/components/confidence-center/ConfidenceCenterController.tsx`

---

**Document Owner**: Engineering Team
**Last Updated**: November 23, 2025
**Next Review**: November 30, 2025
