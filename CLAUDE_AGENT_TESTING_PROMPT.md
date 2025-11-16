# 🎯 MASTERFUL PROMPT: Transform SwiftFill Testing Strategy

**Agent Type:** General-Purpose (with access to all tools)
**Priority:** P0 - CRITICAL
**Time Estimate:** 2-4 hours for Phase 1
**Success Criteria:** Tests pass = Product works, Tests fail = Product broken

---

## Mission Brief

You are tasked with transforming SwiftFill's broken testing strategy into a world-class, graph-validated testing suite that would have caught the drag-and-drop bug that escaped to production.

**Context:** We have 260+ passing tests (93-99% pass rate) but shipped a completely broken drag-and-drop feature. This is a catastrophic testing failure that created false confidence.

**Your Goal:** Implement a research-backed, graph-validated testing strategy that catches real bugs before production.

---

## Phase 1: Critical Smoke Tests (START HERE)

### Objective
Write 10-15 Playwright E2E tests that validate critical user workflows. These tests should FAIL with the current drag-drop bug, proving they would have caught the production issue.

### Setup (15 minutes)

1. **Install Playwright:**
```bash
npm install -D @playwright/test
```

2. **Create Playwright config:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

3. **Create test directory:**
```bash
mkdir -p e2e
```

### Critical Test Cases (2-3 hours)

Create `e2e/smoke.spec.ts` with these tests:

#### Test #1: The Bug-Catching Test (HIGHEST PRIORITY)
```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
});

test.describe('Critical Product Features', () => {
  test('user can drag field in edit mode', async ({ page }) => {
    // This test should FAIL with current bug - that's the point!

    // Click first field to select it
    const field = page.locator('[data-field="partyName"]').first();
    await field.click();

    // Enable edit mode
    const editButton = page.getByRole('button', { name: /edit mode|move/i });
    await editButton.click();

    // Verify edit mode is active
    await expect(page.getByText(/drag mode active/i)).toBeVisible({ timeout: 5000 });

    // Get initial field position
    const initialBox = await field.boundingBox();
    expect(initialBox).toBeTruthy();
    console.log('Initial position:', initialBox);

    // Attempt to drag the field 100px right, 50px down
    await field.dragTo(page.locator('body'), {
      targetPosition: {
        x: initialBox!.x + 100,
        y: initialBox!.y + 50
      }
    });

    // Wait for position update
    await page.waitForTimeout(500);

    // Verify field moved (THIS WILL FAIL - that's good!)
    const newBox = await field.boundingBox();
    console.log('New position:', newBox);

    expect(newBox!.x).toBeGreaterThan(initialBox!.x + 50);
    expect(newBox!.y).toBeGreaterThan(initialBox!.y + 25);

    // Bonus: Verify persistence after reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    const persistedBox = await field.boundingBox();
    expect(persistedBox!.x).toBeCloseTo(newBox!.x, 0);
    expect(persistedBox!.y).toBeCloseTo(newBox!.y, 0);
  });
});
```

**Expected Result:** This test should FAIL, proving it would have caught the production bug.

#### Test #2: PDF Rendering
```typescript
test('PDF form renders correctly', async ({ page }) => {
  // Verify PDF document loads
  await expect(page.locator('.react-pdf__Document')).toBeVisible({ timeout: 10000 });

  // Verify we have 2 pages (FL-320 is 2 pages)
  const pages = page.locator('.react-pdf__Page');
  await expect(pages).toHaveCount(2);

  // Verify field overlays are present
  const fields = page.locator('[data-field]');
  await expect(fields.first()).toBeVisible();

  // Count total fields (FL-320 has 41 fields)
  const fieldCount = await fields.count();
  expect(fieldCount).toBeGreaterThan(30); // At least 30 fields
});
```

#### Test #3: Data Persistence
```typescript
test('form data persists across page reload', async ({ page }) => {
  // Fill multiple fields with test data
  const testData = {
    partyName: 'Jane Smith',
    streetAddress: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    email: 'jane.smith@example.com',
    telephoneNo: '(555) 123-4567',
  };

  // Fill fields
  for (const [field, value] of Object.entries(testData)) {
    const fieldLocator = page.locator(`[data-field="${field}"]`).first();
    await fieldLocator.fill(value);
  }

  // Wait for auto-save (5 seconds + 1 second buffer)
  await page.waitForTimeout(6000);

  // Reload page
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Verify all data persisted
  for (const [field, value] of Object.entries(testData)) {
    const fieldLocator = page.locator(`[data-field="${field}"]`).first();
    await expect(fieldLocator).toHaveValue(value);
  }
});
```

#### Test #4: AI Assistant Streaming
```typescript
test('AI assistant responds to queries', async ({ page }) => {
  // Open AI assistant
  const aiButton = page.getByRole('button', { name: /ai assistant/i });
  await aiButton.click();

  // Wait for AI panel to open
  await expect(page.getByPlaceholderText(/ask me anything/i)).toBeVisible({ timeout: 5000 });

  // Type query
  const input = page.getByPlaceholderText(/ask me anything/i);
  await input.fill('What is a TRO?');
  await input.press('Enter');

  // Wait for AI response (streaming, max 15 seconds)
  await expect(page.getByText(/restraining order/i))
    .toBeVisible({ timeout: 15000 });

  // Verify response is visible in chat
  const chatMessages = page.locator('[role="article"]'); // Chat messages
  await expect(chatMessages.last()).toContainText(/restraining/i);
});
```

#### Test #5: Auto-Save Functionality
```typescript
test('auto-save triggers every 5 seconds', async ({ page }) => {
  // Listen for Supabase API calls
  let saveCount = 0;
  page.on('request', request => {
    if (request.url().includes('supabase') && request.method() === 'POST') {
      saveCount++;
    }
  });

  // Fill a field
  const field = page.locator('[data-field="partyName"]').first();
  await field.fill('Test Name');

  // Wait 6 seconds (5 second auto-save + 1 second buffer)
  await page.waitForTimeout(6000);

  // Verify at least one save occurred
  expect(saveCount).toBeGreaterThan(0);

  // Make another change
  await field.fill('Updated Name');

  // Wait another 6 seconds
  await page.waitForTimeout(6000);

  // Verify another save occurred
  expect(saveCount).toBeGreaterThan(1);
});
```

#### Test #6: Edit Mode Toggle
```typescript
test('edit mode enables and disables field dragging', async ({ page }) => {
  const field = page.locator('[data-field="partyName"]').first();
  await field.click();

  // Initially, edit mode should be OFF
  await expect(page.getByText(/drag mode active/i)).not.toBeVisible();

  // Click edit mode button
  const editButton = page.getByRole('button', { name: /edit mode|move/i });
  await editButton.click();

  // Edit mode should now be ON
  await expect(page.getByText(/drag mode active/i)).toBeVisible();

  // Field should have draggable cursor
  const fieldClass = await field.getAttribute('class');
  expect(fieldClass).toContain('cursor-move');

  // Click edit mode button again to disable
  await editButton.click();

  // Edit mode should be OFF
  await expect(page.getByText(/drag mode active/i)).not.toBeVisible();
});
```

#### Test #7: Field Navigation Panel
```typescript
test('field navigation panel allows sequential field navigation', async ({ page }) => {
  // Open field navigation panel
  const navButton = page.getByRole('button', { name: /field navigation/i });
  await navButton.click();

  // Verify panel opens
  await expect(page.getByText(/navigate fields/i)).toBeVisible();

  // Click "Next Field" button
  const nextButton = page.getByRole('button', { name: /next/i });
  await nextButton.click();

  // Verify focus moved to next field
  const focusedField = page.locator(':focus');
  await expect(focusedField).toHaveAttribute('data-field');

  // Click "Previous Field" button
  const prevButton = page.getByRole('button', { name: /previous/i });
  await prevButton.click();

  // Verify focus moved back
  const newFocusedField = page.locator(':focus');
  await expect(newFocusedField).toHaveAttribute('data-field');
});
```

#### Test #8: PDF Thumbnail Navigation
```typescript
test('PDF thumbnails navigate between pages', async ({ page }) => {
  // Verify page 1 is visible
  await expect(page.locator('.react-pdf__Page[data-page-number="1"]'))
    .toBeVisible();

  // Click page 2 thumbnail
  const page2Thumbnail = page.getByRole('button', { name: /page 2/i });
  await page2Thumbnail.click();

  // Verify scrolled to page 2
  await page.waitForTimeout(500); // Wait for scroll animation

  // Check page 2 is in viewport
  const page2Visible = await page.locator('.react-pdf__Page[data-page-number="2"]')
    .isVisible();
  expect(page2Visible).toBeTruthy();
});
```

#### Test #9: Personal Data Vault
```typescript
test('personal data vault autofills form fields', async ({ page }) => {
  // Open personal data vault
  const vaultButton = page.getByRole('button', { name: /personal data vault/i });
  await vaultButton.click();

  // Verify vault panel opens
  await expect(page.getByText(/saved information/i)).toBeVisible();

  // Click "Autofill" button
  const autofillButton = page.getByRole('button', { name: /autofill/i });
  await autofillButton.click();

  // Verify at least one field was filled
  const filledFields = page.locator('[data-field][value]');
  const count = await filledFields.count();
  expect(count).toBeGreaterThan(0);
});
```

#### Test #10: Template Save/Load
```typescript
test('templates can be saved and loaded', async ({ page }) => {
  // Fill some fields
  await page.locator('[data-field="partyName"]').first().fill('Template Test');
  await page.locator('[data-field="city"]').first().fill('Test City');

  // Open template manager
  const templateButton = page.getByRole('button', { name: /template/i });
  await templateButton.click();

  // Save template
  const saveButton = page.getByRole('button', { name: /save template/i });
  await saveButton.click();

  // Enter template name
  const nameInput = page.getByPlaceholder(/template name/i);
  await nameInput.fill('Test Template');
  await page.getByRole('button', { name: /save/i }).click();

  // Clear form
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Load template
  await templateButton.click();
  const loadButton = page.getByRole('button', { name: /Test Template/i });
  await loadButton.click();

  // Verify fields were filled
  await expect(page.locator('[data-field="partyName"]').first())
    .toHaveValue('Template Test');
  await expect(page.locator('[data-field="city"]').first())
    .toHaveValue('Test City');
});
```

### Running Tests

1. **Run all tests:**
```bash
npx playwright test
```

2. **Run in UI mode (for debugging):**
```bash
npx playwright test --ui
```

3. **Run specific test:**
```bash
npx playwright test e2e/smoke.spec.ts --grep "user can drag field"
```

4. **View HTML report:**
```bash
npx playwright show-report
```

### Expected Results

**CRITICAL:** The drag-and-drop test (#1) should FAIL. This proves the test would have caught the production bug.

**Other tests:** Should mostly pass (except any other broken features).

### Deliverables

- [ ] `playwright.config.ts` configured
- [ ] `e2e/smoke.spec.ts` with 10+ tests
- [ ] All tests running in CI
- [ ] Test report showing drag-drop test FAILS
- [ ] Screenshot/video of failing drag-drop test

---

## Phase 2: Component Integration Tests (AFTER PHASE 1)

### Objective
Test DnD Kit + FormViewer integration that was completely missing from our test suite.

### Setup

1. **Update Vitest config for integration tests:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

2. **Install Testing Library:**
```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### Critical Integration Tests

#### FormViewer + DnD Kit Integration
```typescript
// src/components/__tests__/FormViewer.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormViewer } from '../FormViewer';

describe('FormViewer Integration Tests', () => {
  it('enables field dragging in edit mode', async () => {
    const user = userEvent.setup();
    render(<FormViewer />);

    const field = screen.getByLabelText('Party Name');

    // Field should NOT be draggable initially
    expect(field).not.toHaveClass('cursor-move');

    // Enable edit mode
    const editButton = screen.getByRole('button', { name: /edit mode/i });
    await user.click(editButton);

    // Field should now be draggable
    expect(field).toHaveClass('cursor-move');
    expect(screen.getByText(/drag mode active/i)).toBeVisible();
  });

  it('displays field overlays on PDF pages', async () => {
    render(<FormViewer />);

    // Wait for PDF to load
    await waitFor(() => {
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });

    // Verify field overlays are rendered
    const fields = screen.getAllByRole('textbox');
    expect(fields.length).toBeGreaterThan(30); // FL-320 has 41 fields
  });
});
```

#### DraggableAIAssistant + useGroqStream Integration
```typescript
// src/components/__tests__/DraggableAIAssistant.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraggableAIAssistant } from '../DraggableAIAssistant';

describe('DraggableAIAssistant Integration Tests', () => {
  it('streams AI responses when user asks question', async () => {
    const user = userEvent.setup();
    render(<DraggableAIAssistant />);

    // Type query
    const input = screen.getByPlaceholderText(/ask me anything/i);
    await user.type(input, 'What is a TRO?');
    await user.press(input, 'Enter');

    // Wait for streaming response (mock or real)
    await waitFor(() => {
      expect(screen.getByText(/restraining order/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('cancels stream when component unmounts', async () => {
    const { unmount } = render(<DraggableAIAssistant />);
    const user = userEvent.setup();

    // Start stream
    const input = screen.getByPlaceholderText(/ask me anything/i);
    await user.type(input, 'test query');
    await user.press(input, 'Enter');

    // Unmount before stream completes
    unmount();

    // Verify no memory leaks or errors (test passes if no errors thrown)
  });
});
```

### Running Integration Tests

```bash
npm run test
```

### Deliverables

- [ ] FormViewer integration tests
- [ ] DraggableAIAssistant integration tests
- [ ] Auto-save integration tests
- [ ] All tests passing (or failing correctly for known bugs)

---

## Phase 3: Mutation Testing (AFTER PHASES 1-2)

### Objective
Measure test quality with mutation testing to ensure tests actually catch bugs.

### Setup

1. **Install Stryker:**
```bash
npm install -D @stryker-mutator/core @stryker-mutator/typescript-checker @stryker-mutator/vitest-runner
```

2. **Configure Stryker:**
```javascript
// stryker.config.mjs
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
};
```

3. **Run mutation testing:**
```bash
npx stryker run
```

### Expected Results

**Mutation Score Target:** >80% (industry standard)

**Current Estimate:** <30% (based on test quality)

### Deliverables

- [ ] Stryker configured
- [ ] Baseline mutation score report
- [ ] Action plan to improve mutation score
- [ ] Monthly mutation testing scheduled

---

## Success Metrics & Validation

### Primary Metric: Defect Detection Rate

```
DDR = (Bugs Found by Tests / Total Bugs Found) × 100
```

**Before:** ~0% (drag-drop bug went straight to production)
**Target:** >80%

### Validation Steps

1. **Run Phase 1 tests BEFORE fixing drag-drop bug**
   - Test #1 (drag-drop) should FAIL ✅
   - This proves the test would have caught the production bug

2. **Fix the drag-drop bug**

3. **Re-run Phase 1 tests**
   - All tests should now PASS ✅
   - This proves the tests validate real functionality

4. **Break the drag-drop feature again (intentionally)**
   - Test #1 should FAIL again ✅
   - This proves the test prevents regressions

### Documentation

Update these files:
- [ ] `CLAUDE.md` - Add testing best practices
- [ ] `package.json` - Add test scripts
- [ ] `README.md` - Document how to run tests
- [ ] `.github/workflows/` - Add Playwright to CI

---

## Knowledge Graph Integration

### Graph Queries for Validation

Use Neo4j to validate testing strategy:

```cypher
// Find all testing gaps
MATCH (gap:TestingGap)
RETURN gap.name, gap.severity, gap.impact

// Trace from bug to solution
MATCH path = (bug:Bug)-[*]-(solution:Solution)
RETURN path

// Verify research informs solution
MATCH (research:Research)-[:INFORMS]->(solution:Solution)
RETURN research.key_finding, solution.name
```

### Memory MCP Usage

Store test results in Memory MCP:
```typescript
await createEntities([{
  name: "Phase 1 Test Results",
  entityType: "TestResult",
  observations: [
    "Drag-drop test FAILED as expected",
    "10/10 smoke tests implemented",
    "All tests running in CI",
    "Defect detection rate improved to 85%"
  ]
}]);
```

---

## Anti-Patterns to Avoid

### ❌ DON'T DO THIS:

1. **Testing Implementation Details**
```typescript
// ❌ BAD
expect(component.state.isDragging).toBe(true);

// ✅ GOOD
expect(field).toHaveClass('cursor-grabbing');
```

2. **Over-Mocking**
```typescript
// ❌ BAD
vi.mock('@dnd-kit/core');
vi.mock('react-pdf');

// ✅ GOOD
// Use real libraries, mock only external APIs
```

3. **Testing Functions, Not Features**
```typescript
// ❌ BAD
test('calculatePosition returns correct value', () => {
  expect(calculatePosition(10, 20)).toBe(30);
});

// ✅ GOOD
test('dragging field updates position on screen', async () => {
  // ... actual user interaction
});
```

4. **Writing Tests That Can't Fail**
```typescript
// ❌ BAD
test('component renders', () => {
  render(<Component />);
  expect(true).toBe(true); // Always passes!
});

// ✅ GOOD
test('component shows user name', () => {
  render(<Component user={{ name: 'Jane' }} />);
  expect(screen.getByText('Jane')).toBeVisible();
});
```

---

## Emergency Debugging Guide

### If Tests Are Flaky

1. **Use Playwright's auto-waiting:**
```typescript
await expect(element).toBeVisible(); // Auto-waits
// NOT: await element.isVisible(); // Flaky
```

2. **Add retry logic in config:**
```typescript
retries: process.env.CI ? 2 : 0,
```

3. **Use Codecov to detect flaky tests**

### If Tests Are Slow

1. **Run tests in parallel:**
```typescript
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
```

2. **Use test sharding for CI:**
```bash
npx playwright test --shard=1/4
```

3. **Optimize auto-save waits:**
```typescript
// Instead of: await page.waitForTimeout(6000);
// Use: await expect(saveIndicator).toBeVisible();
```

---

## Final Checklist

### Phase 1 Complete When:
- [ ] Playwright installed and configured
- [ ] 10+ E2E smoke tests written
- [ ] Drag-drop test FAILS (catches the bug)
- [ ] Tests running in CI
- [ ] HTML report generated
- [ ] Team demo completed

### Phase 2 Complete When:
- [ ] FormViewer integration tests written
- [ ] AI assistant integration tests written
- [ ] All integration tests passing
- [ ] Test coverage increased to 70-20-10 distribution

### Phase 3 Complete When:
- [ ] Stryker mutation testing configured
- [ ] Baseline mutation score >80%
- [ ] Monthly mutation testing scheduled
- [ ] Defect detection rate >80%

---

## Resources

**Documentation:**
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Stryker Mutator](https://stryker-mutator.io/)

**Knowledge Graph:**
- Neo4j Graph IDs: 76227-76234
- Memory MCP: SwiftFill Testing Crisis entities

**Reports:**
- `TESTING_STRATEGY_ANALYSIS_REPORT.md`
- `TESTING_MANDATE.md`

---

## Questions? Need Help?

**Neo4j Graph Query for Full Analysis:**
```cypher
MATCH (n:Problem {name: 'SwiftFill Testing Crisis'})-[*]-(m)
RETURN n, m
```

**Memory MCP Search:**
```typescript
await searchNodes("SwiftFill Testing");
```

**Exa Search for Latest Playwright Examples:**
```
"Playwright drag and drop testing November 2025"
```

---

**Remember:** The goal is not 100% coverage. The goal is:

> **Tests Pass = Product Works**
> **Tests Fail = Product Broken**

Not:
> "Tests pass = ??? (who knows if it actually works)"

---

**GO MAKE TESTING OUR SECRET WEAPON! 🚀**

Co-Authored-By: Claude <noreply@anthropic.com>
