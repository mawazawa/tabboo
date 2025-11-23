# Comprehensive Testing Protocol for Claude Code Web Agent

**Date:** November 23, 2025  
**Purpose:** Verify all WelcomeTour pointer-events fixes and complete application functionality  
**Test Duration:** 30-45 minutes  
**Required:** Browser with dev tools open

---

## 🎯 CRITICAL: Your Mission

You are Claude Code Web Agent. Your job is to **RIGOROUSLY TEST** every single aspect of the SwiftFill application, especially the WelcomeTour component which has undergone multiple pointer-events fixes. **DO NOT SKIP ANY STEPS.** If something doesn't work, document it with screenshots and console errors.

---

## 📋 Pre-Test Setup

### 1. Environment Verification
```bash
# Check Node version (must be >=20.16.0)
node --version

# Check dev server is running on port 8080
curl http://localhost:8080 || echo "Server not running"

# If server not running, start it:
npm run dev
```

### 2. Browser Setup
- ✅ Open Chrome/Firefox with DevTools (F12)
- ✅ Console tab visible (watch for errors)
- ✅ Network tab recording
- ✅ Zoom at 100%
- ✅ Window size: 1920x1080 or larger

### 3. Reset Tour State
```javascript
// Run in browser console:
localStorage.removeItem('swiftfill-tour-completed');
localStorage.clear();
location.reload();
```

---

## 🔬 PHASE 1: Authentication & Initial Load (5 min)

### Test 1.1: Auth Page Accessibility
1. Navigate to `http://localhost:8080/`
2. **VERIFY:** Redirects to `/auth` page
3. **VERIFY:** Email input is clickable
4. **VERIFY:** Password input is clickable
5. **VERIFY:** "Sign in" button is clickable
6. **VERIFY:** "Sign up" toggle link is clickable
7. **TEST:** Type in email field → should accept input
8. **TEST:** Type in password field → should accept input and mask characters
9. **SCREENSHOT:** Auth page with inputs filled

### Test 1.2: Login Flow
1. Use credentials: `mathieuwauters@gmail.com` / `Karmaisabitch2025$`
2. Click "Sign in" button
3. **VERIFY:** Loading indicator appears
4. **VERIFY:** Successful redirect to main app (CanvasView)
5. **VERIFY:** No console errors during login
6. **SCREENSHOT:** Successful login state

---

## 🎪 PHASE 2: Welcome Tour - Critical Tests (15 min)

### Test 2.1: Tour Initial Render
1. **VERIFY:** Welcome tour overlay appears on first login
2. **VERIFY:** Tour card is visible and centered
3. **VERIFY:** Spotlight effect highlights the correct element
4. **VERIFY:** Progress bar shows at top of card (0% for first step)
5. **VERIFY:** Step counter dots appear at bottom (5 dots total)
6. **VERIFY:** Keyboard icon with "Press Tab" hint visible
7. **SCREENSHOT:** Tour initial state

### Test 2.2: Pointer-Events Layer Testing (CRITICAL)

**Layer 1: Parent Div (pointer-events-none)**
1. Try clicking OUTSIDE the tour card but on the overlay
2. **EXPECTED:** Clicks are blocked, cannot interact with background
3. **VERIFY:** Navigation menu items are NOT clickable through overlay
4. **CONSOLE:** No click events registered for background elements

**Layer 2: SVG Overlay (pointer-events-none)**
1. Try clicking on the semi-transparent dark area
2. **EXPECTED:** Clicks pass through, do not activate anything
3. **VERIFY:** SVG does not capture pointer events

**Layer 3: Spotlight Ring (pointer-events-none)**
1. Try clicking on the animated ring around spotlight
2. **EXPECTED:** Clicks pass through to highlighted element below
3. **VERIFY:** Can interact with spotlighted element

**Layer 4: Intermediate Wrapper (pointer-events-auto)** ⚠️ NEW FIX
1. Try clicking on the card's padding/margin area
2. **EXPECTED:** Clicks are captured (not passed to parent)
3. **VERIFY:** Wrapper does not block events to Card

**Layer 5: Tour Card (pointer-events-auto)**
1. Try clicking on tour card background
2. **EXPECTED:** Clicks are captured, card is interactive
3. Try clicking "Press Esc to skip" button
4. **EXPECTED:** Button responds with hover effect
5. Click button → tour should close
6. **VERIFY:** Tour closes successfully

### Test 2.3: Tour Navigation - Tab Key
1. Reset tour: `localStorage.removeItem('swiftfill-tour-completed'); location.reload();`
2. Press **Tab** key
3. **VERIFY:** Tour advances to Step 2
4. **VERIFY:** Tab press count increments ("Tab presses: 1 - You're getting it!")
5. **VERIFY:** Progress bar advances (20% → 40%)
6. **VERIFY:** Step counter updates (dot 2 becomes active)
7. **VERIFY:** Spotlight moves to new element
8. Press **Tab** 3 more times to complete tour
9. **VERIFY:** Each step advances correctly
10. **VERIFY:** Tour closes after Step 5
11. **VERIFY:** Tour doesn't reappear on page reload
12. **SCREENSHOT:** Each of the 5 tour steps

### Test 2.4: Tour Navigation - Escape Key
1. Reset tour
2. Press **Esc** key on Step 1
3. **VERIFY:** Tour closes immediately
4. **VERIFY:** Tour marked as completed (doesn't reappear)
5. **VERIFY:** Can interact with navigation normally

### Test 2.5: Tour Navigation - Skip Button
1. Reset tour
2. Click "Press Esc to skip" button
3. **VERIFY:** Button hover state works (color change)
4. **VERIFY:** Tour closes on click
5. **VERIFY:** No console errors

### Test 2.6: Tour Spotlight Accuracy
For each of the 5 tour steps:
1. **VERIFY:** Spotlight cutout aligns with target element
2. **VERIFY:** Ring animation is smooth (no jank)
3. **VERIFY:** Card positioning is appropriate (not overlapping spotlight)
4. **VERIFY:** Can interact with spotlighted element

**Tour Steps to Verify:**
- Step 1: Toolbar (top of page)
- Step 2: Navigation Rail (left sidebar)
- Step 3: Form Viewer (center canvas)
- Step 4: Field Navigation Panel (right sidebar)
- Step 5: Data Vault / AI Assistant panel

---

## 🧭 PHASE 3: Navigation After Tour (10 min)

### Test 3.1: Left Navigation Rail (CRITICAL - Previous Bug Location)
1. Complete or skip tour
2. Try clicking each navigation item:
   - ✅ **Court Topology** (Users icon)
   - ✅ **Forms** (FileText icon)  
   - ✅ **Procedural Tube** (Layers icon)
   - ✅ **Data Vault** (Database icon)
3. **VERIFY:** Each item is clickable
4. **VERIFY:** Hover states work
5. **VERIFY:** Active state styling appears
6. **VERIFY:** View changes on click
7. **SCREENSHOT:** Each navigation view

### Test 3.2: Top Toolbar Actions
1. Click each toolbar button:
   - ✅ Command Palette (Cmd+K icon)
   - ✅ Export PDF
   - ✅ Save
   - ✅ Settings/Profile
2. **VERIFY:** All buttons responsive
3. **VERIFY:** Modals/dropdowns open correctly

### Test 3.3: Form Interactions
1. Navigate to Forms view
2. Select FL-320 form
3. **VERIFY:** PDF loads and renders
4. Try clicking on a form field
5. **VERIFY:** Field becomes editable
6. Type in field
7. **VERIFY:** Text appears in field
8. **VERIFY:** Auto-save indicator appears

---

## ⌨️ PHASE 4: Keyboard Shortcuts (5 min)

### Test 4.1: Global Shortcuts
Test each keyboard shortcut:
1. **Cmd/Ctrl+K** → Opens command palette
2. **Cmd/Ctrl+S** → Saves form
3. **Cmd/Ctrl+P** → Exports PDF
4. **Esc** → Closes modals/dialogs
5. **Tab** → Navigates between fields
6. **Shift+Tab** → Reverse field navigation
7. **Arrow Keys** → Navigate field positions (in edit mode)

**VERIFY:** Each shortcut works consistently

### Test 4.2: Field Navigation
1. Open a form with multiple fields
2. Press **Tab** to jump to next field
3. Press **Shift+Tab** to jump to previous field
4. Press **E** to toggle edit mode
5. **VERIFY:** Keyboard navigation is smooth and logical

---

## 🐛 PHASE 5: Edge Cases & Stress Tests (5 min)

### Test 5.1: Rapid Interactions
1. Reset tour
2. **RAPID CLICKS:** Click tour card area 20 times quickly
3. **VERIFY:** No crashes or freezes
4. **RAPID TABS:** Press Tab key 10 times quickly
5. **VERIFY:** Tour advances smoothly (doesn't skip steps)

### Test 5.2: Tour Interruption
1. Reset tour
2. Mid-tour (Step 2), click browser back button
3. **VERIFY:** Tour state persists or closes gracefully
4. Mid-tour (Step 3), refresh page
5. **VERIFY:** Tour restarts from Step 1 or stays closed

### Test 5.3: Multiple Tabs
1. Open app in two browser tabs
2. Complete tour in Tab 1
3. Switch to Tab 2
4. **VERIFY:** Tour doesn't reappear (localStorage sync)

### Test 5.4: Responsive Behavior
1. Resize browser window to:
   - 1920x1080 (desktop)
   - 1366x768 (laptop)
   - 768x1024 (tablet)
   - 375x667 (mobile)
2. **VERIFY:** Tour card scales appropriately
3. **VERIFY:** Spotlight doesn't break layout

---

## 🎨 PHASE 6: Visual Regression (5 min)

### Test 6.1: Overlay Appearance
1. **VERIFY:** Semi-transparent dark overlay (rgba(0,0,0,0.7))
2. **VERIFY:** Spotlight cutout is perfectly shaped to target
3. **VERIFY:** Ring animation is smooth (60fps)
4. **VERIFY:** Card has proper shadow and depth

### Test 6.2: Typography & Colors
1. **VERIFY:** Tour text is readable (sufficient contrast)
2. **VERIFY:** Button hover states are visible
3. **VERIFY:** Progress bar uses correct brand colors
4. **VERIFY:** Icons render correctly (no broken images)

---

## 🔍 PHASE 7: Console & Network Inspection

### Test 7.1: Console Log Review
1. Open DevTools Console tab
2. Review all messages during tour:
   - ✅ No errors (red messages)
   - ✅ No uncaught exceptions
   - ✅ No "pointer-events" related warnings
   - ✅ No React warnings (key props, etc.)

### Test 7.2: Network Activity
1. Open DevTools Network tab
2. Complete tour interaction
3. **VERIFY:** No failed requests (4xx/5xx errors)
4. **VERIFY:** No unnecessary API calls during tour
5. **VERIFY:** PDF assets load successfully

---

## 📊 PHASE 8: Performance Metrics

### Test 8.1: Animation Performance
1. Open DevTools Performance tab
2. Start recording
3. Navigate through all 5 tour steps
4. Stop recording
5. **VERIFY:** 60fps (16ms/frame) maintained
6. **VERIFY:** No layout thrashing
7. **VERIFY:** No long tasks (>50ms)

### Test 8.2: Memory Leaks
1. Reset tour 10 times in a row
2. Open DevTools Memory tab
3. Take heap snapshot
4. **VERIFY:** No excessive memory growth
5. **VERIFY:** Event listeners are cleaned up

---

## ✅ SUCCESS CRITERIA

**Tour Functionality (MUST PASS ALL):**
- [ ] Tour appears on first login
- [ ] All 5 steps are navigable via Tab key
- [ ] Esc key closes tour at any step
- [ ] Skip button closes tour immediately
- [ ] Spotlight highlights correct elements
- [ ] Progress bar updates correctly
- [ ] Step counter updates correctly
- [ ] Tour doesn't reappear after completion

**Pointer-Events (MUST PASS ALL):**
- [ ] Parent div blocks background interactions
- [ ] SVG overlay doesn't capture clicks
- [ ] Spotlight ring doesn't capture clicks
- [ ] Intermediate wrapper allows clicks to Card
- [ ] Tour card buttons are fully clickable
- [ ] Can interact with spotlighted elements

**Navigation (MUST PASS ALL):**
- [ ] All navigation items clickable after tour
- [ ] Toolbar buttons functional
- [ ] Form fields editable
- [ ] Keyboard shortcuts work globally

**No Regressions (MUST PASS ALL):**
- [ ] Zero console errors
- [ ] Zero network errors
- [ ] No visual glitches
- [ ] Smooth animations (60fps)
- [ ] No memory leaks

---

## 🚨 FAILURE REPORTING

If ANY test fails, create a bug report with:

1. **Test Phase & Number:** "Phase 2, Test 2.2, Layer 4"
2. **Expected Behavior:** "Intermediate wrapper should allow clicks to Card"
3. **Actual Behavior:** "Clicks on card padding are blocked"
4. **Screenshot:** Annotated image showing issue
5. **Console Errors:** Copy/paste any red errors
6. **Steps to Reproduce:** Exact sequence to trigger bug
7. **Environment:** Browser version, OS, screen size

---

## 📝 FINAL REPORT TEMPLATE

After completing all tests, provide this summary:

```markdown
# Test Execution Report

**Date:** [Date]
**Tester:** Claude Code Web Agent
**Duration:** [X minutes]
**Browser:** [Chrome/Firefox version]

## Summary
- Total Tests: 40+
- Passed: X
- Failed: X
- Blocked: X

## Critical Issues Found
1. [Issue 1 with details]
2. [Issue 2 with details]

## Non-Critical Issues Found
1. [Issue 1 with details]

## Performance Metrics
- Average FPS: XX
- Page Load Time: XXms
- Tour Interaction Latency: XXms

## Recommendations
1. [Improvement suggestion 1]
2. [Improvement suggestion 2]

## Sign-Off
☑️ All critical functionality verified
☑️ Ready for production / ⚠️ Requires fixes
```

---

## 🎯 YOUR FIRST ACTION

1. Read this entire document
2. Confirm you understand all test requirements
3. Set up your browser environment
4. Begin with Phase 1, Test 1.1
5. **DO NOT SKIP ANY TESTS**
6. Document everything with screenshots

**Remember:** You are the last line of defense before this goes to users. Be thorough. Be critical. Be detailed.

Good luck! 🚀

