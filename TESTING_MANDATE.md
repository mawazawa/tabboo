# TESTING MANDATE: Write Tests That Actually Matter

## Context: Our Testing Failure

**What happened:**
- We have 264 passing tests (93-99% pass rate)
- All tests pass ✅
- **THE PRODUCT IS BROKEN** ❌
- Core feature (drag-and-drop fields) doesn't work
- Tests gave us false confidence to ship

**Root cause:**
We tested utility functions and hooks in isolation, but NEVER tested:
- ❌ User workflows
- ❌ UI interactions
- ❌ Component rendering
- ❌ Integration between systems
- ❌ The actual features users care about

## Your Mission

Write a comprehensive test suite that would have **CAUGHT THE DRAG-AND-DROP BUG**.

If your tests pass but the product is broken, **YOU FAILED**.

---

## Test Priority Matrix

### 🔴 CRITICAL (Must Have) - These tests would have caught our bug

**1. Core User Workflows (E2E Tests)**
Test the COMPLETE user journey, not isolated functions:

```typescript
// ❌ BAD: Testing a validator function
test('validates email format', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

// ✅ GOOD: Testing user can actually complete the workflow
test('user can fill out FL-320 form and submit', async () => {
  await user.login();
  await user.openForm('FL-320');
  await user.fillField('partyName', 'Jane Doe');
  await user.clickSave();
  await expect(page.getByText('Saved successfully')).toBeVisible();
  
  // Verify persistence
  await user.reloadPage();
  await expect(page.getByLabel('Party Name')).toHaveValue('Jane Doe');
});
```

**2. UI Component Integration Tests**
Test components AS USERS SEE THEM:

```typescript
// ❌ BAD: Testing props in isolation
test('FormViewer renders with correct props', () => {
  render(<FormViewer formData={{}} updateField={vi.fn()} />);
  expect(screen.getByRole('document')).toBeInTheDocument();
});

// ✅ GOOD: Testing actual user interaction
test('user can drag a field to reposition it', async () => {
  render(<FormViewerWithContext />);
  
  // Enable edit mode
  const editButton = screen.getByRole('button', { name: /edit mode/i });
  await user.click(editButton);
  
  // Get initial field position
  const field = screen.getByLabelText('Party Name');
  const initialPosition = field.getBoundingClientRect();
  
  // Drag the field
  await user.pointer([
    { keys: '[MouseLeft>]', target: field },
    { coords: { x: 100, y: 50 } },
    { keys: '[/MouseLeft]' }
  ]);
  
  // Verify field moved
  const newPosition = field.getBoundingClientRect();
  expect(newPosition.x).not.toBe(initialPosition.x);
  expect(newPosition.y).not.toBe(initialPosition.y);
  
  // Verify position persisted
  await user.reload();
  const persistedPosition = screen.getByLabelText('Party Name').getBoundingClientRect();
  expect(persistedPosition.x).toBe(newPosition.x);
});
```

**3. Critical Path Smoke Tests**
Test the MUST-WORK features:

```typescript
describe('Critical Product Features', () => {
  test('user can view PDF form', async () => { /* ... */ });
  test('user can fill out text fields', async () => { /* ... */ });
  test('user can drag fields to reposition', async () => { /* ... */ }); // THIS WOULD HAVE CAUGHT OUR BUG
  test('user can use AI assistant', async () => { /* ... */ });
  test('data auto-saves every 5 seconds', async () => { /* ... */ });
  test('user can autofill from vault', async () => { /* ... */ });
  test('form data persists across page refresh', async () => { /* ... */ });
});
```

---

## 🟡 IMPORTANT (Should Have)

**4. State Management Integration Tests**
Test that state changes affect the UI correctly:

```typescript
test('enabling edit mode makes fields draggable', async () => {
  const { user } = render(<FormViewer />);
  
  const field = screen.getByLabelText('Party Name');
  
  // Field should NOT be draggable initially
  expect(field).not.toHaveClass('cursor-move');
  
  // Enable edit mode
  await user.click(screen.getByRole('button', { name: /edit mode/i }));
  
  // Field should now be draggable
  expect(field).toHaveClass('cursor-move');
  expect(screen.getByText(/drag mode active/i)).toBeVisible();
});
```

**5. API Integration Tests**
Test real API calls (mocked, but realistic):

```typescript
test('form saves to Supabase on auto-save trigger', async () => {
  const mockSupabase = createMockSupabaseClient();
  
  render(<App supabaseClient={mockSupabase} />);
  
  await user.type(screen.getByLabelText('Party Name'), 'Jane Doe');
  
  // Wait for auto-save (5 seconds)
  await waitFor(() => {
    expect(mockSupabase.from('form_data').upsert).toHaveBeenCalledWith(
      expect.objectContaining({ partyName: 'Jane Doe' })
    );
  }, { timeout: 6000 });
});
```

---

## 🟢 NICE TO HAVE (After Critical Tests)

**6. Edge Cases**
Only after critical paths work:

```typescript
test('handles network failure during save gracefully', async () => { /* ... */ });
test('prevents drag when not in edit mode', async () => { /* ... */ });
test('shows validation errors for invalid email', async () => { /* ... */ });
```

**7. Performance Tests**
```typescript
test('drag performance maintains 60fps', async () => { /* ... */ });
test('PDF renders within 2 seconds', async () => { /* ... */ });
```

---

## Test Implementation Strategy

### Phase 1: Critical Smoke Tests (DO THIS FIRST)
**Goal**: Catch showstopper bugs like our drag-and-drop failure

**Time**: 2-4 hours  
**File**: `src/__tests__/smoke.test.tsx`  
**Tests**: 10-15 tests covering critical user workflows

```typescript
// src/__tests__/smoke.test.tsx
import { test, expect } from '@playwright/test';

test.describe('Critical Product Features (Smoke Tests)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('PDF form renders correctly', async ({ page }) => {
    await expect(page.locator('.react-pdf__Document')).toBeVisible();
    await expect(page.locator('.react-pdf__Page')).toHaveCount(2);
  });

  test('user can enable edit mode and drag fields', async ({ page }) => {
    // Click first field
    const field = page.locator('[data-field="partyName"]').first();
    await field.click();
    
    // Enable edit mode
    await page.getByRole('button', { name: /edit mode/i }).click();
    
    // Verify edit mode active
    await expect(page.getByText(/drag mode active/i)).toBeVisible();
    
    // Get initial position
    const initialBox = await field.boundingBox();
    expect(initialBox).toBeTruthy();
    
    // Drag the field
    await field.dragTo(page.locator('body'), {
      targetPosition: { 
        x: initialBox!.x + 100, 
        y: initialBox!.y + 50 
      }
    });
    
    // Verify position changed
    const newBox = await field.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox!.x);
    expect(newBox!.y).toBeGreaterThan(initialBox!.y);
  });

  test('user can fill fields and data persists', async ({ page }) => {
    await page.fill('[data-field="partyName"]', 'Jane Smith');
    await page.fill('[data-field="email"]', 'jane@example.com');
    
    // Wait for auto-save
    await page.waitForTimeout(6000);
    
    // Reload page
    await page.reload();
    
    // Verify data persisted
    await expect(page.locator('[data-field="partyName"]')).toHaveValue('Jane Smith');
    await expect(page.locator('[data-field="email"]')).toHaveValue('jane@example.com');
  });

  test('AI assistant responds to queries', async ({ page }) => {
    await page.click('[aria-label="AI Assistant"]');
    await page.fill('[placeholder="Ask me anything"]', 'What is a TRO?');
    await page.press('[placeholder="Ask me anything"]', 'Enter');
    
    // Wait for AI response (max 10 seconds)
    await expect(page.getByText(/restraining order/i)).toBeVisible({ timeout: 10000 });
  });
});
```

### Phase 2: Component Integration Tests
**Goal**: Test component behavior in realistic contexts

**Time**: 4-6 hours  
**Files**: `src/components/__tests__/*.integration.test.tsx`

### Phase 3: Hook Integration Tests
**Goal**: Test hooks with actual React components, not in isolation

**Time**: 2-3 hours  
**Files**: `src/hooks/__tests__/*.integration.test.tsx`

---

## Testing Tools Required

Install these:

```bash
npm install -D @playwright/test @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**Use Playwright for E2E** (not Vitest for critical UI tests):
- Playwright runs in real browser
- Catches CSS issues, z-index problems, event handling bugs
- Tests what users actually experience

**Use Testing Library for Component Tests**:
- Focus on user behavior, not implementation
- Query by labels, roles, text (what users see)
- Not by test IDs or class names

---

## Test Writing Rules

### ✅ DO THIS:

1. **Write tests from user perspective**
   - "User can drag a field" ✅
   - Not "handlePointerDown sets isDragging state" ❌

2. **Test complete workflows**
   - Login → Fill form → Save → Reload → Verify ✅
   - Not just "form data updates when updateField called" ❌

3. **Use real browser rendering**
   - Playwright E2E for critical paths ✅
   - Not jsdom for UI interaction tests ❌

4. **Query by user-visible attributes**
   - `screen.getByRole('button', { name: /save/i })` ✅
   - Not `screen.getByTestId('save-button')` ❌

5. **Test failure modes**
   - What happens when network fails? ✅
   - What happens when user drags out of bounds? ✅

### ❌ DON'T DO THIS:

1. **Don't test implementation details**
   ```typescript
   // ❌ BAD
   expect(component.state.isDragging).toBe(true);
   
   // ✅ GOOD
   expect(field).toHaveClass('cursor-grabbing');
   ```

2. **Don't mock everything**
   ```typescript
   // ❌ BAD - mocking so much you're not testing real behavior
   vi.mock('@dnd-kit/core');
   vi.mock('react-pdf');
   vi.mock('supabase');
   
   // ✅ GOOD - use real implementations, mock only external APIs
   const mockSupabase = createRealSupabaseClient({ mock: true });
   ```

3. **Don't write tests that can't fail**
   ```typescript
   // ❌ BAD - this test will always pass
   test('component renders', () => {
     render(<Component />);
     expect(true).toBe(true);
   });
   ```

4. **Don't test utility functions in isolation**
   ```typescript
   // ❌ BAD - this doesn't test if drag actually works
   test('calculateNewPosition returns correct position', () => {
     expect(calculateNewPosition(10, 20, 5)).toBe(25);
   });
   
   // ✅ GOOD - test the drag feature end-to-end
   test('dragging field updates its position visually', async () => {
     // ... actual drag interaction test
   });
   ```

---

## Success Criteria

Your test suite PASSES this mandate if:

✅ **If the drag-and-drop bug exists, your tests FAIL**  
✅ **All critical user workflows are tested E2E**  
✅ **Tests use real browser rendering (Playwright)**  
✅ **Tests would catch regression in any core feature**  
✅ **Code coverage focuses on user-facing code, not utilities**  
✅ **New features can't be merged without corresponding workflow tests**

Your test suite FAILS this mandate if:

❌ All tests pass but core features are broken  
❌ Tests only cover utility functions and hooks  
❌ Tests use heavy mocking that hides real issues  
❌ Tests check implementation details, not user behavior  
❌ Critical workflows (login, save, drag, AI) have no tests  

---

## Deliverables

Create these test files:

```
src/
├── __tests__/
│   ├── smoke.test.tsx                      # 10-15 critical path tests (Playwright)
│   └── workflows.test.tsx                  # User workflow tests (Playwright)
├── components/
│   └── __tests__/
│       ├── FormViewer.integration.test.tsx  # FormViewer with real interactions
│       ├── AIAssistant.integration.test.tsx
│       └── FieldNavigationPanel.integration.test.tsx
└── hooks/
    └── __tests__/
        ├── useFormDrag.integration.test.tsx # Test drag hook WITH FormViewer
        └── useAutoSave.integration.test.tsx # Test auto-save WITH real component
```

---

## Example: The Test That Would Have Caught Our Bug

```typescript
// This test would have FAILED and caught the drag bug
test('user can drag field in edit mode', async ({ page }) => {
  // Setup
  await page.goto('http://localhost:8080/forms/fl-320');
  const field = page.locator('[data-field="partyName"]').first();
  await field.click();
  
  // Enable edit mode
  const editButton = page.getByRole('button', { name: /edit mode|move/i });
  await editButton.click();
  
  // Verify edit mode is active
  await expect(page.getByText(/drag mode active/i)).toBeVisible();
  
  // Get initial position
  const initialPos = await field.boundingBox();
  expect(initialPos).toBeTruthy();
  
  // Attempt to drag
  await page.mouse.move(initialPos!.x + 10, initialPos!.y + 10);
  await page.mouse.down();
  await page.mouse.move(initialPos!.x + 100, initialPos!.y + 50, { steps: 10 });
  await page.mouse.up();
  
  // THIS WOULD FAIL because drag is broken
  const newPos = await field.boundingBox();
  expect(newPos!.x).toBeGreaterThan(initialPos!.x + 50); // ❌ FAILS - field didn't move
  expect(newPos!.y).toBeGreaterThan(initialPos!.y + 25); // ❌ FAILS - field didn't move
  
  // Also verify persistence
  await page.reload();
  const persistedPos = await field.boundingBox();
  expect(persistedPos!.x).toBe(newPos!.x); // ❌ FAILS - not saved
});
```

---

## Final Instructions

1. **Start with smoke tests** - get critical paths covered FIRST
2. **Use Playwright for E2E** - real browser, real interactions
3. **Write tests that users would write** - think about what matters to them
4. **If your tests pass but the product is broken, you failed** - period.
5. **Don't optimize for code coverage %** - optimize for catching real bugs

Now go write tests that would have saved us from this drag-and-drop disaster.

---

## Questions to Ask Yourself

Before marking your testing PR as complete, answer these:

1. ❓ **Would these tests have caught the drag-and-drop bug?**
2. ❓ **If I break a core feature, will these tests fail?**
3. ❓ **Am I testing what users see, or internal implementation?**
4. ❓ **Are these tests running in a real browser or just jsdom?**
5. ❓ **Would these tests give false confidence like the previous 264 did?**

If you answer "no" or "unsure" to any of these, **keep writing**.

---

**Remember**: The goal is NOT to hit 100% code coverage.  
**The goal is**: Tests pass = Product works. Tests fail = Product broken.

That's it. That's the only metric that matters.
