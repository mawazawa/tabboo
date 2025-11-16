# 🚀 SwiftFill Test Execution Guide

**Created**: November 15, 2025
**Purpose**: Validate testing strategy prevents production bugs
**Status**: Ready to execute

---

## Quick Start (5 Minutes)

```bash
# 1. Install Playwright browsers (one-time setup)
npx playwright install --with-deps chromium

# 2. Run critical smoke tests
npm run test:smoke

# 3. Expected results:
# ✅ All tests pass = Features work
# ❌ Tests fail = Features broken (GOOD - tests work!)
```

---

## Phase 1: Validate Tests Catch Real Bugs

### Step 1: Run Tests With Working Features

```bash
# Start from PR branch (has tests)
git checkout claude/integration-tests-critical-paths-01A9C4acPtTJs5FEPVgP4FaS

# Run smoke tests
npm run test:smoke

# Expected: All tests should PASS ✅
```

**What this proves:** Tests can pass when features work.

### Step 2: Intentionally Break Drag-and-Drop

**File**: `src/components/FormViewer.tsx`

Find the drag handler and comment it out:

```typescript
// Around line 150-200 (search for "onPointerMove" or "handleDrag")
const handlePointerMove = (e: React.PointerEvent) => {
  // TEMPORARILY COMMENTED TO TEST IF TESTS CATCH BUG
  return; // <-- Add this line to break drag

  if (!isDragging || !selectedField) return;
  // ... rest of function
};
```

### Step 3: Run Tests Again

```bash
npm run test:smoke
```

**Expected Result:** Test #3 "user can drag field in edit mode" should **FAIL** ❌

**If test FAILS:**
```
❌ FAIL  src/__tests__/smoke.test.ts > user can drag field in edit mode
  Expected: field moved > 50px horizontally or > 25px vertically
  Received: field moved 0px (no movement detected)
```

**This proves the test works!** ✅

### Step 4: Fix and Re-run

```bash
# Remove the "return;" line you added
# Save the file

# Run tests again
npm run test:smoke

# Expected: All tests PASS ✅
```

**Result:** You've proven tests catch real bugs! 🎉

---

## Phase 2: Run Full Test Suite

### Integration Tests (Vitest)

```bash
# Run all integration tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode (during development)
npm run test:watch

# Run with UI
npm run test:ui
```

**Expected Results:**
- FormViewer integration tests: 10/10 pass
- AI Assistant integration tests: 12/12 pass
- Auto-Save integration tests: 12/12 pass
- **Total: 34/34 pass** ✅

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:smoke          # Critical smoke tests only
npm run test:workflows      # User workflow tests only
```

**Expected Results:**
- Smoke tests: 10/10 pass
- Workflow tests: 10/10 pass
- **Total: 20/20 E2E tests pass** ✅

### Everything Together

```bash
# Run ALL tests (unit + integration + E2E)
npm run test:all

# Expected total: 54 tests pass
# - 34 integration tests (Vitest)
# - 20 E2E tests (Playwright)
```

---

## Phase 3: Mutation Testing (Test Quality Measurement)

### Install Stryker Mutator

```bash
npm install -D @stryker-mutator/core \
               @stryker-mutator/typescript-checker \
               @stryker-mutator/vitest-runner
```

### Run Mutation Testing

```bash
# Run mutation testing (takes 10-30 minutes first time)
npx stryker run

# View results
open reports/mutation/mutation-report.html
```

### Understanding Mutation Score

**Mutation testing injects bugs into your code and checks if tests catch them.**

**Example:**
```typescript
// Original code
const add = (a, b) => a + b;

// Mutant #1: Changed + to -
const add = (a, b) => a - b;

// If your test catches this → Mutant "killed" ✅
// If your test still passes → Mutant "survived" ❌
```

**Score Interpretation:**
- **80-100%**: Excellent test quality ✅
- **60-79%**: Good, room for improvement
- **40-59%**: Needs work
- **0-39%**: Poor test quality ❌

**Target Score:** >80% (industry standard)

**Current Estimate:** Will likely be 50-70% initially, improve over time.

---

## Phase 4: CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml` (already created)

**What it does:**
1. **On every PR**: Runs smoke tests + integration tests
2. **On main branch**: Runs full E2E suite
3. **Uploads reports**: Test results, screenshots, videos

### Enable in GitHub

```bash
# Commit the workflow file
git add .github/workflows/test.yml
git commit -m "ci: add automated testing workflow"
git push

# Workflow runs automatically on next PR/push
```

### Check CI Status

```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

---

## Phase 5: Pre-Commit Hooks (Optional but Recommended)

### Install Husky

```bash
npm install -D husky
npx husky init
```

### Create Pre-Commit Hook

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running smoke tests before commit..."
npm run test:smoke

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed! Fix tests before committing."
  exit 1
fi

echo "✅ All smoke tests passed!"
```

### Make Executable

```bash
chmod +x .husky/pre-commit
```

**Result:** Can't commit broken code! 🎉

---

## Debugging Failed Tests

### Playwright Debugging

```bash
# Run with UI inspector
npm run test:e2e:ui

# Run with headed browser (see what's happening)
npm run test:e2e:headed

# Run with debug mode
npm run test:e2e:debug

# Run specific test
npx playwright test smoke.test.ts --grep "drag field"
```

### View Test Reports

```bash
# Playwright HTML report
npx playwright show-report

# View screenshots/videos
open test-results/

# View traces
npx playwright show-trace test-results/.../trace.zip
```

### Common Issues

**Issue**: Tests timeout waiting for element

**Solution:**
```typescript
// Increase timeout for specific assertion
await expect(element).toBeVisible({ timeout: 10000 });
```

**Issue**: Tests are flaky (sometimes pass, sometimes fail)

**Solution:**
```typescript
// Use Playwright's auto-waiting
await expect(element).toBeVisible(); // Auto-waits up to 5s

// DON'T use manual waits
await page.waitForTimeout(1000); // ❌ Flaky!
```

**Issue**: Auth failing in tests

**Solution:**
```typescript
// Check if test user exists in Supabase
// Update credentials in smoke.test.ts loginUser() function
```

---

## Performance Benchmarks

### Expected Test Execution Times

| Test Type | Count | Time | Cost |
|-----------|-------|------|------|
| Smoke Tests | 10 | 2-3 min | ⚡ Fast |
| Integration Tests | 34 | 1-2 min | ⚡ Fast |
| Full E2E Suite | 20 | 5-10 min | 🐢 Slower |
| **Total** | **54** | **8-15 min** | ✅ Acceptable |

**CI Minutes Usage:**
- Per PR: ~5 min (smoke + integration only)
- Per main push: ~15 min (full E2E suite)
- Monthly estimate: ~500-1000 minutes
- GitHub Free tier: 2000 minutes/month ✅

---

## Success Criteria Checklist

### ✅ Phase 1: Validation
- [ ] Playwright browsers installed
- [ ] Smoke tests run successfully
- [ ] **Drag test FAILS when drag is broken** (proof tests work!)
- [ ] Drag test PASSES when drag is fixed
- [ ] All 10 smoke tests pass

### ✅ Phase 2: Full Suite
- [ ] All 34 integration tests pass
- [ ] All 20 E2E tests pass
- [ ] Total: 54/54 tests passing
- [ ] Test execution time < 15 minutes
- [ ] HTML reports generated

### ✅ Phase 3: Mutation Testing
- [ ] Stryker installed and configured
- [ ] Mutation testing run completed
- [ ] Mutation score calculated
- [ ] Target: >60% initially, >80% eventually
- [ ] Action plan for improvement

### ✅ Phase 4: CI/CD
- [ ] GitHub Actions workflow created
- [ ] Workflow runs on PRs automatically
- [ ] Test results uploaded as artifacts
- [ ] PR checks show pass/fail status
- [ ] Team can see test reports

### ✅ Phase 5: Process Integration
- [ ] Pre-commit hooks optional installed
- [ ] Team trained on running tests
- [ ] Testing guide documented
- [ ] Quarterly review scheduled
- [ ] New features require tests (policy)

---

## Metrics to Track

### Primary Metric: Defect Detection Rate

```
DDR = (Bugs Found by Tests / Total Bugs Found) × 100
```

**Before Testing Strategy:**
- Bugs found by tests: 0
- Bugs found by users: 1 (drag-drop)
- **DDR: 0%** ❌

**After Testing Strategy:**
- Goal: DDR > 80%
- Track in bug tickets with `source` field:
  - `testing`: Bug caught by automated tests ✅
  - `manual-qa`: Bug caught by QA team
  - `production`: Bug reported by users ❌

### Secondary Metrics

1. **Test Distribution**
   - Target: 70% unit, 20% integration, 10% E2E
   - Current: Will measure after cleanup

2. **Mutation Score**
   - Target: >80%
   - Track monthly

3. **Flaky Test Rate**
   - Target: <5%
   - Track in CI

4. **Test Execution Time**
   - Target: <10 min for critical path
   - Monitor in CI

---

## Next Steps After Validation

### Immediate (This Week)
1. ✅ Validate tests catch drag bug
2. ✅ Create GitHub Actions workflow
3. ✅ Run mutation testing baseline
4. ✅ Document results in PR #13

### Short Term (Next Sprint)
1. Clean up old unit tests (remove useless ones)
2. Add tests for new features
3. Setup Codecov for flaky test detection
4. Team training session

### Long Term (Ongoing)
1. Every bug fix gets regression test
2. Every feature gets workflow test
3. Monthly mutation score review
4. Quarterly test suite health check
5. Maintain >80% defect detection rate

---

## Questions & Troubleshooting

### Q: Tests are too slow, how to speed up?

**A:**
1. Run smoke tests only in pre-commit (2-3 min)
2. Run full suite only in CI
3. Use Playwright test sharding for parallel execution
4. Optimize slow tests (remove unnecessary waits)

### Q: What if tests fail in CI but pass locally?

**A:**
1. Check environment differences (auth, data, timing)
2. Add retries in Playwright config for flaky tests
3. Use `test.skip()` for known flaky tests temporarily
4. Debug with trace viewer (`--trace on`)

### Q: How often should we run mutation testing?

**A:**
1. Monthly for baseline measurement
2. Before major releases
3. After adding significant test coverage
4. When test quality is questioned

### Q: What if mutation score is low (<50%)?

**A:**
1. Identify which tests let mutants survive
2. Add assertions to catch those specific bugs
3. Focus on high-value code (critical features)
4. Don't aim for 100% (diminishing returns)

---

## Resources

**Documentation:**
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Stryker Docs](https://stryker-mutator.io)
- [Testing Library](https://testing-library.com)

**Internal Docs:**
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Philosophy & best practices
- [TEST_SUITE_SUMMARY.md](./TEST_SUITE_SUMMARY.md) - What was built
- [TESTING_MANDATE.md](./TESTING_MANDATE.md) - The crisis that led here
- [TESTING_STRATEGY_ANALYSIS_REPORT.md](./TESTING_STRATEGY_ANALYSIS_REPORT.md) - Full analysis

**Reports:**
- Playwright: `playwright-report/index.html`
- Mutation: `reports/mutation/mutation-report.html`
- Coverage: `coverage/index.html`

---

## Team Agreement

**Testing Principles:**
1. **Tests pass = Product works**
2. **Tests fail = Product broken**
3. **No exceptions**

**Definition of Done:**
- [ ] Feature works manually ✅
- [ ] E2E test added for feature ✅
- [ ] Integration tests added if needed ✅
- [ ] Smoke tests still pass ✅
- [ ] PR approved ✅
- [ ] **Tests pass in CI** ✅ ← Required!

**No Merge Without Tests.**

---

**Ready to execute? Let's prove our testing strategy works!** 🚀

**Next:** Follow Phase 1 to validate the drag test catches real bugs.

Co-Authored-By: Claude <noreply@anthropic.com>
