# SwiftFill Testing Guide

## Overview

This testing suite was created in response to a critical failure: **we had 264 passing tests, but the drag-and-drop feature was broken**. The tests gave us false confidence to ship.

**The Problem**: We tested utility functions and hooks in isolation, but never tested:
- ❌ User workflows
- ❌ UI interactions
- ❌ Component rendering
- ❌ Integration between systems
- ❌ The actual features users care about

**The Solution**: This test suite focuses on **what users actually do**, not internal implementation details.

---

## Test Structure

### 🔴 Critical Tests (Must Pass Before Release)

#### 1. Smoke Tests (`src/__tests__/smoke.test.ts`)
**Purpose**: Verify core features work in real browser

**What it tests**:
- ✅ PDF form renders
- ✅ User can fill text fields
- ✅ **Drag-and-drop works** (WOULD HAVE CAUGHT THE BUG!)
- ✅ Data persists across page refresh
- ✅ AI assistant responds
- ✅ Field navigation works
- ✅ Checkbox fields toggle
- ✅ Personal vault autofill
- ✅ Logout functionality
- ✅ Error handling

**Run with**:
```bash
npm run test:smoke
```

**Pass criteria**: ALL tests must pass. If these pass but product is broken, we failed.

---

#### 2. Workflow Tests (`src/__tests__/workflows.test.ts`)
**Purpose**: Verify complete user journeys from start to finish

**What it tests**:
- ✅ New user fills out entire FL-320 form
- ✅ User uses personal vault to autofill
- ✅ User repositions fields to align with PDF
- ✅ User gets help from AI assistant
- ✅ User navigates multi-page form
- ✅ User handles validation errors
- ✅ User saves and exports form
- ✅ User works offline
- ✅ User uses keyboard shortcuts
- ✅ User recovers from browser crash

**Run with**:
```bash
npm run test:workflows
```

**Pass criteria**: Real-world scenarios users will encounter must work end-to-end.

---

### 🟡 Component Integration Tests (Important)

#### 3. FormViewer Integration (`src/components/__tests__/FormViewer.integration.test.tsx`)
**Purpose**: Test FormViewer with realistic interactions

**What it tests**:
- ✅ PDF rendering with fields
- ✅ Text input functionality
- ✅ Edit mode toggle
- ✅ **Drag-and-drop with pointer events**
- ✅ Validation error display
- ✅ Field highlighting
- ✅ Zoom functionality
- ✅ Keyboard navigation
- ✅ Vault autofill indicators
- ✅ Position constraints

**Technology**: Vitest + Testing Library (jsdom)

---

#### 4. AI Assistant Integration (`src/components/__tests__/AIAssistant.integration.test.tsx`)
**Purpose**: Test AI assistant with user interactions

**What it tests**:
- ✅ Component renders
- ✅ User can send messages
- ✅ Loading state display
- ✅ Error handling
- ✅ Cancel stream functionality
- ✅ Message history display
- ✅ Form context integration
- ✅ Empty message prevention
- ✅ Draggable functionality
- ✅ Resize functionality
- ✅ Close/minimize
- ✅ Keyboard shortcuts

**Technology**: Vitest + Testing Library (jsdom)

---

#### 5. Auto-Save Integration (`src/hooks/__tests__/useFormAutoSave.integration.test.tsx`)
**Purpose**: Test auto-save with realistic timing and errors

**What it tests**:
- ✅ Auto-save after 5-second delay
- ✅ Debouncing rapid changes
- ✅ Success toast notifications
- ✅ Error handling
- ✅ Network error retry logic
- ✅ No save when data unchanged
- ✅ Save on unmount (data loss prevention)
- ✅ beforeunload warning
- ✅ Field position changes trigger save
- ✅ Multiple documents don't interfere
- ✅ Offline handling
- ✅ Performance with large data

**Technology**: Vitest + Testing Library (React hooks)

---

## Running Tests

### All Tests
```bash
npm run test:all
```
Runs both unit/integration tests (Vitest) and E2E tests (Playwright)

### Unit & Integration Tests Only
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Visual UI
npm run test:coverage     # With coverage report
```

### E2E Tests Only
```bash
npm run test:e2e          # Headless (CI mode)
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:debug    # Debug mode with inspector
npm run test:e2e:headed   # See browser while tests run
```

### Specific Test Suites
```bash
npm run test:smoke        # Critical smoke tests only
npm run test:workflows    # User workflow tests only
```

---

## Test Philosophy

### ✅ DO THIS:

1. **Write tests from user perspective**
   ```typescript
   // ✅ GOOD
   test('user can drag a field', async ({ page }) => {
     // ... simulate actual user dragging
   });

   // ❌ BAD
   test('handlePointerDown sets isDragging state', () => {
     // ... testing implementation detail
   });
   ```

2. **Test complete workflows**
   ```typescript
   // ✅ GOOD
   test('user fills form, saves, reloads, data persists', () => {
     // ... complete flow
   });

   // ❌ BAD
   test('updateField function updates state', () => {
     // ... isolated function
   });
   ```

3. **Use real browser for critical UI tests**
   ```typescript
   // ✅ GOOD - Playwright E2E
   test('drag field updates position visually', async ({ page }) => {
     await page.mouse.move(...);
     await page.mouse.down();
     // ... real drag interaction
   });

   // ❌ BAD - jsdom can't test pointer events accurately
   test('drag field', () => {
     fireEvent.pointerDown(...);
     // ... won't catch real bugs
   });
   ```

4. **Query by user-visible attributes**
   ```typescript
   // ✅ GOOD
   screen.getByRole('button', { name: /save/i })

   // ❌ BAD
   screen.getByTestId('save-button')
   ```

### ❌ DON'T DO THIS:

1. **Don't test implementation details**
   - Don't check internal state
   - Don't test private methods
   - Don't verify CSS classes (unless critical to UX)

2. **Don't mock everything**
   - Only mock external APIs (Supabase, Groq)
   - Use real components, real DOM
   - Test integrations, not isolated units

3. **Don't write tests that can't fail**
   ```typescript
   // ❌ BAD
   test('component renders', () => {
     render(<Component />);
     expect(true).toBe(true); // Always passes
   });
   ```

4. **Don't test utilities in isolation**
   - Test utilities through the features that use them
   - Example: Don't test `validateEmail()` alone
   - Instead: Test that form shows error for invalid email

---

## Success Criteria

✅ **Your test suite PASSES if**:
- When drag-and-drop is broken, tests FAIL
- When AI stops responding, tests FAIL
- When auto-save fails, tests FAIL
- When data doesn't persist, tests FAIL
- Tests verify user-visible behavior, not internals
- Tests run in real browser for UI features

❌ **Your test suite FAILS if**:
- All tests pass but core features are broken
- Tests only cover utility functions
- Tests use heavy mocking that hides bugs
- Tests check implementation details
- Critical workflows have no tests

---

## CI/CD Integration

### GitHub Actions (Recommended)
```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hook
```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run test:smoke
if [ $? -ne 0 ]; then
  echo "Smoke tests failed. Commit aborted."
  exit 1
fi
```

---

## Adding New Tests

### When to Add Tests

**Always add tests when**:
1. Adding a new user-facing feature
2. Fixing a bug (write test that would have caught it)
3. Changing critical workflows

**Test Priority**:
1. 🔴 Critical: User workflows that MUST work
2. 🟡 Important: Integration between components
3. 🟢 Nice: Edge cases, performance

### Test Template

```typescript
/**
 * [Feature Name] Tests
 *
 * Purpose: [What user need does this verify?]
 *
 * Critical?: [Yes/No - Would failure block release?]
 */

test('user can [do something valuable]', async ({ page }) => {
  // Step 1: Setup (login, navigate, etc.)

  // Step 2: Perform user action

  // Step 3: Verify user-visible outcome

  // Step 4: Verify persistence (if applicable)
});
```

---

## Debugging Failed Tests

### Playwright E2E Tests

```bash
# See browser while test runs
npm run test:e2e:headed

# Step through test with debugger
npm run test:e2e:debug

# Interactive UI mode
npm run test:e2e:ui
```

**View screenshots/videos**:
- Failed tests auto-capture screenshots
- Videos saved in `test-results/`
- HTML report: `npx playwright show-report`

### Vitest Integration Tests

```bash
# Run specific test file
npx vitest src/components/__tests__/FormViewer.integration.test.tsx

# Run in watch mode with UI
npm run test:ui
```

---

## Common Test Failures

### "Test timeout exceeded"
**Cause**: Waiting for element that never appears
**Fix**: Check selectors, increase timeout, verify feature works manually

### "Element not visible"
**Cause**: Element rendered but hidden by CSS
**Fix**: Check z-index, display, visibility styles

### "expect(received).toHaveValue(expected)"
**Cause**: Data didn't save or load
**Fix**: Check auto-save timing, verify Supabase mock, check network tab

### "Pointer events not working in test"
**Cause**: Using jsdom instead of real browser
**Fix**: Move test to Playwright E2E suite

---

## Test Coverage Goals

**NOT**: 100% code coverage (meaningless metric)

**INSTEAD**: 100% critical path coverage

### Critical Paths to Cover:
- [ ] User can fill form and data persists
- [ ] User can drag fields and position persists
- [ ] User can get AI help
- [ ] User can autofill from vault
- [ ] User can navigate multi-page form
- [ ] User can export form
- [ ] User can work offline
- [ ] User can recover from errors

**Current Coverage**: See `npm run test:coverage`

---

## Maintenance

### Monthly Review
- [ ] Run `npm run test:all` on main branch
- [ ] Check for flaky tests (pass/fail randomly)
- [ ] Update selectors if UI changed
- [ ] Remove obsolete tests
- [ ] Add tests for new features

### When Tests Become Slow
1. Parallelize more tests
2. Reduce unnecessary waits
3. Use `test.skip` for non-critical tests
4. Consider splitting into smoke vs. full suite

---

## Questions?

**"My test passes but the feature is broken. What now?"**
→ Your test is testing the wrong thing. Rewrite to test user behavior.

**"Should I test this utility function?"**
→ Only if it's critical and complex. Otherwise, test through features.

**"How do I test drag-and-drop?"**
→ Use Playwright E2E with real mouse events. See smoke.test.ts line 67.

**"Tests are flaky. Help?"**
→ Add proper waits (`waitFor`), avoid hardcoded delays, use retry logic.

**"Do I need 100% coverage?"**
→ No. Focus on critical paths. 100% coverage with bad tests is worse than 60% with good tests.

---

## Remember

> "Tests pass = Product works. Tests fail = Product broken."
>
> That's the only metric that matters.

If your tests can pass while the product is broken, **rewrite the tests**.

---

## Test Suite Manifest

```
src/
├── __tests__/
│   ├── smoke.test.ts              # 10 critical smoke tests (Playwright)
│   └── workflows.test.ts          # 10 user workflow tests (Playwright)
├── components/
│   └── __tests__/
│       ├── FormViewer.integration.test.tsx     # 10 FormViewer tests
│       └── AIAssistant.integration.test.tsx    # 12 AI assistant tests
└── hooks/
    └── __tests__/
        └── useFormAutoSave.integration.test.tsx # 12 auto-save tests

Total: 54 integration/E2E tests
Previous: 264 unit tests
New Focus: USER BEHAVIOR > CODE COVERAGE
```

---

**Last Updated**: 2025-11-16
**Created By**: Claude (in response to drag-and-drop failure)
**Purpose**: Never ship broken features again
