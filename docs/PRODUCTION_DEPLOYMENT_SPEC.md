# SwiftFill Production Deployment Specification
## Complete Path to MVP for 100 Test Users

**Document Version**: 1.0
**Date**: November 23, 2025
**Target**: Production-ready MVP with 100 test users
**Total Estimated Effort**: 94-126 hours

---

## Executive Summary

This specification provides a complete, granular task list for deploying SwiftFill to production. Every task is designed to be executable by Claude Code Web, with clear handoff points for user actions.

**Current State**: 80% ready (255/286 tests passing, build works)
**Target State**: 100% production-ready for 100 beta users

---

## Task Execution Legend

| Symbol | Meaning |
|--------|---------|
| 🤖 | Claude Code Web can fully execute |
| 👤 | Requires user action |
| 🔄 | Claude creates, user executes |
| ⏱️ | Estimated time in minutes |

---

## Phase 1: Critical Blockers (Day 1)
**Total: 4-6 hours**

### 1.1 Fix Test Infrastructure
**Blocks**: All CI/CD, deployment confidence

| Task | Type | Time | Details |
|------|------|------|---------|
| 1.1.1 Switch jsdom to happy-dom in vitest.config.ts | 🤖 | 5m | `environment: 'happy-dom'` |
| 1.1.2 Install happy-dom | 🤖 | 2m | `npm install -D happy-dom` |
| 1.1.3 Fix FormViewerIntegration.test.tsx prop types | 🤖 | 30m | Match FormFieldMapping interface |
| 1.1.4 Fix useFormAutoSave.test.ts timer mocks | 🤖 | 45m | Use vi.useFakeTimers() correctly |
| 1.1.5 Fix useGroqStream.test.ts async assertions | 🤖 | 20m | Proper waitFor usage |
| 1.1.6 Run full test suite | 🤖 | 5m | `npm run test` |
| 1.1.7 Verify 286/286 tests pass | 🤖 | 5m | Check output |

**Subtotal**: 112 minutes (1.9 hours)

### 1.2 Fix Supabase Security Warnings
**Blocks**: Production deployment approval

| Task | Type | Time | Details |
|------|------|------|---------|
| 1.2.1 Create migration file | 🤖 | 5m | `20251123_fix_security_advisories.sql` |
| 1.2.2 Add search_path to refresh_field_analytics() | 🤖 | 5m | `ALTER FUNCTION ... SET search_path` |
| 1.2.3 Add search_path to get_field_reuse_summary() | 🤖 | 5m | Same pattern |
| 1.2.4 Add search_path to get_top_reused_fields() | 🤖 | 5m | Same pattern |
| 1.2.5 Add search_path to update_updated_at_column() | 🤖 | 5m | Same pattern |
| 1.2.6 Add RLS performance indexes | 🤖 | 15m | Index on user_id columns |
| 1.2.7 Push migration | 🔄 | 2m | User runs: `npx supabase db push` |
| 1.2.8 Enable Leaked Password Protection | 👤 | 5m | Supabase Dashboard → Auth → Settings |
| 1.2.9 Verify 0 security warnings | 👤 | 5m | Check Supabase Dashboard |

**Subtotal**: 52 minutes (0.9 hours)

### 1.3 Fix React Hooks Lint Warnings
**Blocks**: Runtime stability

| Task | Type | Time | Details |
|------|------|------|---------|
| 1.3.1 Fix useTROWorkflow.ts dependencies (16 warnings) | 🤖 | 60m | Add missing useCallback deps |
| 1.3.2 Fix OverlayLayer.tsx ref cleanup | 🤖 | 15m | Copy ref to variable |
| 1.3.3 Fix use-document-processing.ts ref cleanup | 🤖 | 15m | Same pattern |
| 1.3.4 Fix focus-trap.tsx ref cleanup | 🤖 | 15m | Same pattern |
| 1.3.5 Fix Fast Refresh violations (8 files) | 🤖 | 30m | Extract constants |
| 1.3.6 Run lint | 🤖 | 2m | `npm run lint` |
| 1.3.7 Verify 0 warnings | 🤖 | 2m | Check output |

**Subtotal**: 139 minutes (2.3 hours)

---

## Phase 2: Core Feature Completion (Days 2-4)
**Total: 16-22 hours**

### 2.1 DV-100 Field Position Extraction
**Blocks**: 2nd major form functionality

| Task | Type | Time | Details |
|------|------|------|---------|
| 2.1.1 Create PDF-to-image conversion script | 🤖 | 30m | Using pdf-lib or similar |
| 2.1.2 Convert DV-100 pages 1-4 to 300dpi images | 🤖 | 15m | Store in temp directory |
| 2.1.3 Convert DV-100 pages 5-8 to 300dpi images | 🤖 | 15m | Same |
| 2.1.4 Convert DV-100 pages 9-13 to 300dpi images | 🤖 | 15m | Same |
| 2.1.5 Create field extraction script using pdf-lib | 🤖 | 60m | Extract AcroForm fields |
| 2.1.6 Extract coordinates from pages 1-4 | 🤖 | 30m | Parse field positions |
| 2.1.7 Extract coordinates from pages 5-8 | 🤖 | 30m | Same |
| 2.1.8 Extract coordinates from pages 9-13 | 🤖 | 30m | Same |
| 2.1.9 Map field names to DV100FormData interface | 🤖 | 60m | Match 837 fields |
| 2.1.10 Generate SQL INSERT statements | 🤖 | 30m | For form_field_mappings table |
| 2.1.11 Create migration file | 🤖 | 10m | Consolidate inserts |
| 2.1.12 Push migration | 🔄 | 2m | `npx supabase db push` |
| 2.1.13 Visual validation - page 1 | 🤖 | 15m | Screenshot comparison |
| 2.1.14 Visual validation - pages 2-13 | 🤖 | 45m | Same |
| 2.1.15 Fix misaligned fields | 🤖 | 60m | Adjust coordinates |

**Subtotal**: 447 minutes (7.5 hours)

### 2.2 DV-105 Field Position Extraction
**Blocks**: 3rd major form functionality

| Task | Type | Time | Details |
|------|------|------|---------|
| 2.2.1 Convert DV-105 pages 1-6 to 300dpi images | 🤖 | 15m | All 6 pages |
| 2.2.2 Extract coordinates from all pages | 🤖 | 45m | 466 fields |
| 2.2.3 Map field names to DV105FormData interface | 🤖 | 45m | Match fields |
| 2.2.4 Generate SQL migration | 🤖 | 20m | INSERT statements |
| 2.2.5 Push migration | 🔄 | 2m | `npx supabase db push` |
| 2.2.6 Visual validation all pages | 🤖 | 30m | Screenshot comparison |
| 2.2.7 Fix misaligned fields | 🤖 | 30m | Adjust coordinates |

**Subtotal**: 187 minutes (3.1 hours)

**Solution for PDF Field Extraction Roadblock**:
Rather than external AI services, use pdf-lib to read AcroForm field definitions directly from the PDF. California Judicial Council forms are fillable PDFs with embedded field coordinates.

```javascript
// Solution: Extract from PDF AcroForm
import { PDFDocument } from 'pdf-lib';
const pdfDoc = await PDFDocument.load(pdfBytes);
const form = pdfDoc.getForm();
const fields = form.getFields();
fields.forEach(field => {
  const widgets = field.acroField.getWidgets();
  const rect = widgets[0].getRectangle(); // {x, y, width, height}
});
```

### 2.3 E2E Test Suite with Playwright
**Blocks**: Deployment confidence, regression prevention

| Task | Type | Time | Details |
|------|------|------|---------|
| 2.3.1 Install Playwright | 🤖 | 5m | `npm install -D @playwright/test` |
| 2.3.2 Install browsers | 🤖 | 5m | `npx playwright install` |
| 2.3.3 Create playwright.config.ts | 🤖 | 20m | Configure for Vite |
| 2.3.4 Create auth fixture | 🤖 | 30m | Supabase auth flow |
| 2.3.5 Create FormViewer page object | 🤖 | 30m | Selectors and actions |
| 2.3.6 Test: PDF loads correctly | 🤖 | 20m | Verify pages render |
| 2.3.7 Test: Fields overlay on PDF | 🤖 | 30m | Check positioning |
| 2.3.8 Test: Field input works | 🤖 | 20m | Type and verify |
| 2.3.9 Test: Auto-save triggers | 🤖 | 30m | Check network |
| 2.3.10 Test: Form switching (FL-320, DV-100, DV-105) | 🤖 | 30m | Each form type |
| 2.3.11 Test: AI Assistant opens | 🤖 | 20m | Chat UI |
| 2.3.12 Test: Keyboard navigation | 🤖 | 20m | Tab through fields |
| 2.3.13 Add to CI workflow | 🤖 | 15m | Update test.yml |

**Subtotal**: 275 minutes (4.6 hours)

### 2.4 TRO Workflow Engine Tests
**Blocks**: Critical business logic validation

| Task | Type | Time | Details |
|------|------|------|---------|
| 2.4.1 Create useTROWorkflow.test.ts | 🤖 | 10m | Test file setup |
| 2.4.2 Test startWorkflow for each packet type | 🤖 | 45m | 4 packet types |
| 2.4.3 Test all 18 state transitions | 🤖 | 60m | Valid transitions |
| 2.4.4 Test invalid transition rejection | 🤖 | 30m | Error cases |
| 2.4.5 Create workflowValidator.test.ts | 🤖 | 10m | Test file setup |
| 2.4.6 Test required field validation | 🤖 | 45m | DV-100, CLETS |
| 2.4.7 Test conditional requirements | 🤖 | 30m | FL-150 if support |
| 2.4.8 Create formDataMapper.test.ts | 🤖 | 10m | Test file setup |
| 2.4.9 Test DV-100 → CLETS-001 mapping | 🤖 | 30m | Field mapping |
| 2.4.10 Test all form-to-form mappings | 🤖 | 45m | 4 mappings |
| 2.4.11 Test progress calculations | 🤖 | 20m | Percentage |

**Subtotal**: 335 minutes (5.6 hours)

---

## Phase 3: Deployment Preparation (Day 5)
**Total: 6-8 hours**

### 3.1 Edge Function Deployment
**Blocks**: Backend functionality

| Task | Type | Time | Details |
|------|------|------|---------|
| 3.1.1 Create deploy-edge-functions.sh script | 🤖 | 15m | All 12 functions |
| 3.1.2 Fix clarification-api TODO (line 62) | 🤖 | 45m | Implement answer processing |
| 3.1.3 Fix plaid-exchange-token TODO (line 176) | 🤖 | 30m | Pass products from request |
| 3.1.4 Create .env.example with all secrets | 🤖 | 20m | Document all vars |
| 3.1.5 Create secrets-setup.sh template | 🤖 | 15m | User fills in values |
| 3.1.6 User sets GROQ_API_KEY | 👤 | 5m | `npx supabase secrets set` |
| 3.1.7 User sets MISTRAL_API_KEY | 👤 | 5m | Same |
| 3.1.8 User sets GEMINI_API_KEY | 👤 | 5m | Same |
| 3.1.9 User deploys all functions | 👤 | 10m | Run deploy script |
| 3.1.10 Verify functions are live | 🤖 | 10m | Test endpoints |

**Subtotal**: 160 minutes (2.7 hours)

### 3.2 Error Tracking Setup
**Blocks**: Production monitoring

| Task | Type | Time | Details |
|------|------|------|---------|
| 3.2.1 Install Sentry | 🤖 | 5m | `npm install @sentry/react` |
| 3.2.2 Create Sentry initialization | 🤖 | 20m | In main.tsx |
| 3.2.3 Implement errorTracking.ts TODO | 🤖 | 30m | Line 157 |
| 3.2.4 Implement ErrorBoundary.tsx TODO | 🤖 | 20m | Line 37 |
| 3.2.5 Add user context to errors | 🤖 | 15m | User ID, email |
| 3.2.6 Create Sentry project | 👤 | 10m | sentry.io |
| 3.2.7 Set SENTRY_DSN env var | 👤 | 5m | Lovable dashboard |

**Subtotal**: 105 minutes (1.8 hours)

### 3.3 Performance Optimization
**Blocks**: DV-100/DV-105 usability (837+ fields)

| Task | Type | Time | Details |
|------|------|------|---------|
| 3.3.1 Install react-window | 🤖 | 5m | `npm install react-window` |
| 3.3.2 Create performance baseline script | 🤖 | 20m | Measure current |
| 3.3.3 Refactor form state for colocation | 🤖 | 60m | Reduce re-renders |
| 3.3.4 Create VirtualizedFieldOverlay.tsx | 🤖 | 90m | Virtual scrolling |
| 3.3.5 Implement field search (Cmd+F replacement) | 🤖 | 45m | Custom search |
| 3.3.6 Measure optimized performance | 🤖 | 15m | Compare baseline |
| 3.3.7 Verify 60fps scroll | 🤖 | 10m | Chrome DevTools |

**Subtotal**: 245 minutes (4.1 hours)

---

## Phase 4: Compliance & Accessibility (Days 6-7)
**Total: 18-24 hours**

### 4.1 WCAG 2.1 AA Accessibility
**Blocks**: Legal compliance for government-adjacent service

| Task | Type | Time | Details |
|------|------|------|---------|
| 4.1.1 Install axe-core | 🤖 | 5m | `npm install -D @axe-core/playwright` |
| 4.1.2 Create accessibility audit script | 🤖 | 30m | Playwright + axe |
| 4.1.3 Run initial audit | 🤖 | 10m | Get baseline |
| 4.1.4 Fix: Add ARIA labels to form fields | 🤖 | 60m | All custom inputs |
| 4.1.5 Fix: Keyboard navigation for FormViewer | 🤖 | 90m | Tab order, focus |
| 4.1.6 Fix: Error message announcements | 🤖 | 45m | aria-live regions |
| 4.1.7 Fix: Focus visible states | 🤖 | 30m | Focus indicators |
| 4.1.8 Fix: Non-text contrast | 🤖 | 30m | Icons, borders |
| 4.1.9 Fix: Labels for all inputs | 🤖 | 45m | htmlFor attributes |
| 4.1.10 Run final audit | 🤖 | 10m | Verify 0 critical |
| 4.1.11 Screen reader test (VoiceOver) | 👤 | 30m | Manual testing |

**Subtotal**: 385 minutes (6.4 hours)

### 4.2 SRL UX Improvements
**Blocks**: User success with complex legal forms

| Task | Type | Time | Details |
|------|------|------|---------|
| 4.2.1 Add step indicators to TROWorkflowWizard | 🤖 | 45m | "Step 3 of 7" |
| 4.2.2 Implement progressive disclosure for DV-100 | 🤖 | 90m | Accordion sections |
| 4.2.3 Create plain language validation messages | 🤖 | 60m | Audit all strings |
| 4.2.4 Add contextual help tooltips | 🤖 | 60m | Legal term glossary |
| 4.2.5 Add "Save & Exit" button | 🤖 | 30m | Manual save option |
| 4.2.6 Create reading level audit script | 🤖 | 30m | Flesch-Kincaid |
| 4.2.7 Rewrite text to 8th grade level | 🤖 | 90m | Simplify language |
| 4.2.8 Add progress persistence indicator | 🤖 | 30m | "Saved just now" |

**Subtotal**: 435 minutes (7.3 hours)

### 4.3 PDF/A Export & Court Compliance
**Blocks**: Court filing acceptance

| Task | Type | Time | Details |
|------|------|------|---------|
| 4.3.1 Research PDF/A generation in browser | 🤖 | 30m | pdf-lib capabilities |
| 4.3.2 Create PDF/A export option | 🤖 | 90m | Add to FormViewer |
| 4.3.3 Add text-searchable verification | 🤖 | 30m | Check before export |
| 4.3.4 Add true copy certification checkbox | 🤖 | 30m | Rule 2.132 |
| 4.3.5 Validate case number format | 🤖 | 30m | County patterns |
| 4.3.6 Test export with California Court specs | 🤖 | 30m | Verify compliance |

**Subtotal**: 240 minutes (4.0 hours)

**Solution for PDF/A Roadblock**:
pdf-lib doesn't directly support PDF/A, but we can:
1. Use jsPDF with PDF/A profile plugin
2. Generate compliant PDFs server-side via Edge Function
3. Use client-side generation with proper metadata

```javascript
// Solution: Server-side PDF/A via Edge Function
import { PDFDocument, StandardFonts } from 'pdf-lib';
// Embed all fonts, include metadata, set PDF/A conformance
pdfDoc.setTitle('DV-100 Request for Domestic Violence Restraining Order');
pdfDoc.setProducer('SwiftFill');
// Add XMP metadata for PDF/A compliance
```

---

## Phase 5: Deployment & Launch (Day 8)
**Total: 4-6 hours**

### 5.1 Pre-Deployment Checklist
**Blocks**: Production stability

| Task | Type | Time | Details |
|------|------|------|---------|
| 5.1.1 Create DEPLOYMENT_CHECKLIST.md | 🤖 | 30m | Complete runbook |
| 5.1.2 Run full test suite | 🤖 | 5m | All tests pass |
| 5.1.3 Run build | 🤖 | 2m | `npm run build` |
| 5.1.4 Run lint | 🤖 | 2m | 0 warnings |
| 5.1.5 Run E2E tests | 🤖 | 5m | All pass |
| 5.1.6 Run accessibility audit | 🤖 | 5m | 0 critical |
| 5.1.7 Verify all env vars documented | 🤖 | 10m | .env.example |
| 5.1.8 Create deployment validation script | 🤖 | 30m | Post-deploy checks |

**Subtotal**: 89 minutes (1.5 hours)

### 5.2 Production Deployment
**Blocks**: User access

| Task | Type | Time | Details |
|------|------|------|---------|
| 5.2.1 Push all migrations | 👤 | 5m | `npx supabase db push` |
| 5.2.2 Deploy all edge functions | 👤 | 10m | Run deploy script |
| 5.2.3 Set all Supabase secrets | 👤 | 15m | API keys |
| 5.2.4 Configure Lovable env vars | 👤 | 10m | Dashboard |
| 5.2.5 Deploy to production | 👤 | 5m | Lovable → Publish |
| 5.2.6 Run validation script | 🤖 | 10m | Verify endpoints |
| 5.2.7 Test critical flows manually | 👤 | 30m | Auth, forms, AI |

**Subtotal**: 85 minutes (1.4 hours)

### 5.3 Beta User Onboarding
**Blocks**: User acquisition

| Task | Type | Time | Details |
|------|------|------|---------|
| 5.3.1 Create beta signup form | 🤖 | 45m | Supabase form |
| 5.3.2 Create welcome email template | 🤖 | 30m | Onboarding steps |
| 5.3.3 Create user feedback form | 🤖 | 30m | In-app feedback |
| 5.3.4 Create beta user documentation | 🤖 | 60m | Quick start guide |
| 5.3.5 Set up feedback tracking | 🤖 | 30m | Database table |
| 5.3.6 Invite first 10 users | 👤 | 30m | Send emails |
| 5.3.7 Monitor for issues | 👤 | ongoing | Sentry + feedback |

**Subtotal**: 225 minutes (3.8 hours)

---

## Phase 6: Component Refactoring (Post-Launch)
**Optional: Technical debt reduction**
**Total: 8-11 hours**

| Task | Type | Time | Details |
|------|------|------|---------|
| 6.1 Split Index.tsx | 🤖 | 120m | <500 lines |
| 6.2 Split FieldNavigationPanel.tsx | 🤖 | 90m | Extract logic |
| 6.3 Split FormViewer.tsx | 🤖 | 120m | Modularize |
| 6.4 Update all imports | 🤖 | 60m | Fix references |
| 6.5 Run tests | 🤖 | 10m | Verify no regression |

**Subtotal**: 400 minutes (6.7 hours)

---

## Total Effort Summary

| Phase | Hours | Claude Code Web | User Action |
|-------|-------|-----------------|-------------|
| 1. Critical Blockers | 5.1 | 4.5h | 0.6h |
| 2. Core Features | 20.8 | 20.8h | 0h |
| 3. Deployment Prep | 8.6 | 7.3h | 1.3h |
| 4. Compliance/A11y | 17.7 | 16.7h | 1.0h |
| 5. Deployment | 6.7 | 4.3h | 2.4h |
| 6. Refactoring (optional) | 6.7 | 6.7h | 0h |
| **TOTAL** | **65.6** | **60.3h** | **5.3h** |

**With buffer (1.5x)**: 94-126 hours total

---

## Roadblock Solutions Summary

Every potential roadblock has a solution executable within Claude Code Web:

| Roadblock | Solution |
|-----------|----------|
| PDF field extraction needs AI | Use pdf-lib to read AcroForm fields directly from PDF |
| PDF/A generation not supported | Server-side Edge Function with proper metadata |
| Can't access Supabase dashboard | Write SQL migrations that accomplish the same |
| Can't set secrets | Create template scripts for user to run |
| Can't deploy to production | Create runbook with exact commands |
| E2E tests need running app | Playwright with Vite server integration |
| Performance testing needs metrics | Create benchmarking scripts |
| Accessibility testing needs screen reader | Automated axe-core + manual checklist |

---

## API Keys Required (User Must Obtain)

| Service | Key Name | Purpose | Required |
|---------|----------|---------|----------|
| Groq | GROQ_API_KEY | AI chat | YES |
| Mistral | MISTRAL_API_KEY | Document OCR | YES |
| Sentry | SENTRY_DSN | Error tracking | YES |
| Gemini | GEMINI_API_KEY | Form assistant | Optional |
| Neo4j | NEO4J_URI/USERNAME/PASSWORD | Knowledge graph | Optional |
| Plaid | PLAID_CLIENT_ID/SECRET | Financial | Optional |

**Minimum for MVP**: Groq, Mistral, Sentry (3 services)

---

## Success Metrics for 100 Beta Users

| Metric | Target | Measurement |
|--------|--------|-------------|
| Forms completed | >50 | Database count |
| Form completion rate | >70% | Started vs completed |
| Error rate | <1% | Sentry errors / sessions |
| Page load time | <3s | Lighthouse |
| Accessibility score | >90 | axe-core |
| User satisfaction | >4/5 | Feedback form |
| Support tickets | <10/week | Feedback tracking |

---

## Execution Timeline

**Aggressive Schedule (8 days)**:
- Day 1: Phase 1 (Critical Blockers)
- Days 2-4: Phase 2 (Core Features)
- Day 5: Phase 3 (Deployment Prep)
- Days 6-7: Phase 4 (Compliance/A11y)
- Day 8: Phase 5 (Deployment)

**Conservative Schedule (12 days)**:
- Add 2-day buffer after Phase 2
- Add 2-day buffer after Phase 4

---

## Commit Strategy

Each phase should be committed separately:

```bash
# Phase 1
git commit -m "fix: test infrastructure and security warnings"

# Phase 2
git commit -m "feat: DV-100/DV-105 field mappings and E2E tests"

# Phase 3
git commit -m "feat: edge functions and error tracking"

# Phase 4
git commit -m "feat: WCAG accessibility and SRL UX improvements"

# Phase 5
git commit -m "docs: deployment checklist and beta onboarding"
```

---

## Next Steps

1. **Immediate**: Start Phase 1.1 (fix test infrastructure)
2. **Today**: Complete all Phase 1 tasks
3. **Tomorrow**: Begin Phase 2 field extraction

Ready to execute? Reply with "Start Phase 1" to begin.
