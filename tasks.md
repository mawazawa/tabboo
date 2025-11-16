# SwiftFill Pro – UX Priorities

This file tracks high-priority UX / interaction tasks derived from annotated design reviews.

## Task 1 – FL‑320 Main Screen UX Polish (Annotated Screenshot Pass)

**Goal:** Implement the annotated UX feedback from the FL‑320 main screen screenshot, in order of highest impact and lowest effort, to reduce friction and create “reverse friction” (forward momentum) when filling complex legal forms.

> Execution note for Claude Code Web agent: when working on these tasks, (1) run regular web searches (e.g. Exa / web search) to validate UX and implementation decisions instead of guessing, (2) treat visual and interaction quality as needing to meet or exceed the standard of Apple or Linear (anything less is a rejected outcome), and (3) write down your stepwise self-evaluation for each subtask in `agent-self-evaluation.md` so we can follow your chain of thought.

#### UX/UI Evaluation Metric (10-point rubric)

For each UI-facing subtask, score the resulting screen from **1 (unacceptable)** to **5 (world-class)** on each criterion below, then record the scores and a short justification in `agent-self-evaluation.md`:

1. **Visual hierarchy & focus** – Is the primary action and information hierarchy immediately clear?
2. **Typography & spacing** – Are type scales, line heights, and spacing harmonious and consistent?
3. **Color & contrast** – Are colors balanced, accessible, and free of visual noise or clashes?
4. **Component consistency** – Do buttons, inputs, and cards follow a coherent system with no off-pattern outliers?
5. **Interaction clarity** – Is it always obvious what is clickable, draggable, or editable, and what will happen next?
6. **Motion & feedback** – Are transitions/hover states subtle, responsive, and helpful (never gratuitous)?
7. **Error & validation UX** – Are errors and validation states clear, calm, and easy to recover from?
8. **Keyboard & accessibility** – Are key flows keyboard-accessible with sensible focus states and shortcuts?
9. **Cognitive load** – Is the interface as simple as it can be while still powerful (no unnecessary options or duplication)?
10. **Benchmark comparison** – Compared side-by-side with a similar Apple or Linear surface, does this feel equal or better in craftsmanship and coherence?

If any criterion scores below 4, treat that as a signal to iterate again before marking the subtask complete.

### 1.1 Planning & Prioritization
- [ ] Copy the current prioritized UX table into `UX_STRATEGIC_ANALYSIS.md` under a clearly labeled section (e.g., "FL‑320 Main Screen – UX Priority Matrix").
- [ ] For each row in the table, assign a short identifier (e.g., `UX-01-Autofill-Hero`, `UX-02-Field-Movement`).
- [ ] Link each identifier to a corresponding subtask list item below (e.g., `1.2.1` references `UX-01-Autofill-Hero`).
- [ ] Add a brief “Definition of Done” paragraph at the top of Task 1 explaining that each subtask should be delivered as a separate PR where possible.

### 1.2 Header & Global Toolbar
- [ ] **1.2.1 – Autofill as hero action (UX-01-Autofill-Hero)**
  - [ ] Identify the current primary button component used in the app (e.g., `variant="default"`).
  - [ ] Update the Autofill button in `Index.tsx` to use the primary style and ensure it appears before other secondary actions.
  - [ ] Increase its width and padding slightly so it reads as the main call-to-action.
  - [ ] Verify in the browser at common widths (1280px, 1440px) that Autofill is visually dominant but not overwhelming.
- [ ] **1.2.2 – AI actions cluster**
  - [ ] Locate the existing AI-related buttons (e.g., AI Chat Fill / AI Magic Fill).
  - [ ] Wrap these buttons in a single flex container with consistent spacing.
  - [ ] Normalize labels to a consistent pattern (e.g., "AI Chat" and "AI Magic Fill") and ensure they share iconography and size.
  - [ ] Add short tooltips explaining each AI option’s purpose.
- [ ] **1.2.3 – Toolbar spacing & button shape**
  - [ ] Audit the header toolbar for any square/rectangular buttons that do not match the design system.
  - [ ] Update those buttons to use the same radius and variant classes as the primary/secondary buttons.
  - [ ] Adjust horizontal spacing so groups of controls (Autofill, AI cluster, zoom, font-size, Tools/Logout) have consistent gaps.
- [ ] **1.2.4 – Tools / Logout alignment**
  - [ ] Ensure Tools and Logout buttons are vertically centered with the logo and primary actions.
  - [ ] Confirm their font sizes and icon sizes match the rest of the header.
  - [ ] Verify that on smaller widths they do not wrap awkwardly; introduce responsive behavior if needed.

### 1.3 Pages Sidebar
- [ ] **1.3.1 – Thumbnail interactivity**
  - [ ] Add hover styles to page thumbnails (e.g., subtle border or shadow) to indicate clickability.
  - [ ] Ensure the active page has a clear, high-contrast outline different from the hover state.
  - [ ] Confirm that clicking a thumbnail always navigates to the correct PDF page and updates any "current page" state.
- [ ] **1.3.2 – Page delete affordance**
  - [ ] Decide on a delete control pattern (e.g., small trash icon on hover in the thumbnail corner).
  - [ ] Implement the delete control so it is only fully visible on hover or focus, to avoid visual clutter.
  - [ ] Add a confirmation step (modal or inline confirm) before actually deleting a page.
  - [ ] Ensure deletion updates both the PDF page list and any associated field overlays cleanly.
- [ ] **1.3.3 – Sidebar width control**
  - [ ] Verify the ResizablePanel or similar mechanism controlling the Pages sidebar width.
  - [ ] Set sensible `minSize` and `maxSize` values so the panel can be narrow but still usable.
  - [ ] Ensure the visual style (background, border) remains light and does not overpower the main canvas.

### 1.4 PDF Form Area & Field Overlays
- [ ] **1.4.1 – Single-field movement correctness (UX-02-Field-Movement)**
  - [ ] Inspect the `fieldPositions` data structure and how overlay components resolve their position by field name.
  - [ ] Verify that each overlay field (`overlay.field`) maps to a unique key in `fieldPositions`.
  - [ ] Add a small logging utility (dev-only) to log which field’s position is being updated when keyboard/drag actions occur.
  - [ ] Confirm that moving Email does not update Petitioner’s `fieldPositions` entry, and vice versa.
- [ ] **1.4.2 – Keyboard movement targeting**
  - [ ] In `FormViewer` and `FieldNavigationPanel`, ensure arrow-key movement functions determine the target field from the focused overlay/input, not from an ambiguous shared index.
  - [ ] Update handlers so they accept an explicit `fieldName` and pass that through to `updateFieldPosition`.
  - [ ] Add a small test or manual checklist: click into Email, press arrow keys, verify only Email moves.
- [ ] **1.4.3 – Hover / focus affordances**
  - [ ] Define CSS classes for active, hovered, and selected overlays with distinct but subtle differences (e.g., border color, shadow).
  - [ ] Apply these classes consistently in `FormViewer` based on `currentFieldIndex`, hover state, and multi-select state.
  - [ ] Verify visually that the active field is clearly indicated without creating heavy rectangles.
- [ ] **1.4.4 – Zoom / fit behavior**
  - [ ] Test the existing Fit control at 1280px and 1440px widths.
  - [ ] Adjust the calculation for `pdfZoom` (if necessary) so that Fit shows the entire page with minimal horizontal scroll.
  - [ ] Ensure the zoom label updates to either `Fit` or a percentage consistently.

### 1.5 Right Panel – Field Navigation & Controls
- [ ] **1.5.1 – Prev/Next and header row cleanup**
  - [ ] Identify the components rendering Prev/Next and the field index (e.g., `Field 28/64`).
  - [ ] Standardize their typography and spacing so they match the main header style.
  - [ ] Confirm keyboard shortcuts (if any) align with these actions and are documented.
- [ ] **1.5.2 – Alignment/distribution icon row**
  - [ ] Audit the icons used for align left/center/right, top/middle/bottom, and distribute horizontally/vertically.
  - [ ] Ensure icons have tooltips explaining the action in plain language.
  - [ ] Adjust spacing and grouping (e.g., align group vs. distribute group) to minimize visual complexity.
- [ ] **1.5.3 – Select All / Clear behavior**
  - [ ] Implement explicit state for `selectedFields.length` that drives the Clear button label (e.g., `Clear (3)`).
  - [ ] Make Select All select all fields currently in the filtered list (respecting any search filters).
  - [ ] Add a short description or tooltip clarifying what "Select All" operates on.
- [ ] **1.5.4 – Move vs Adjust semantics**
  - [ ] Decide the precise behavior for Move (e.g., nudge by 1% with arrow controls) vs Adjust (direct X/Y numeric entry).
  - [ ] Update button labels and/or icons so the distinction is obvious.
  - [ ] Wire Adjust to show X/Y inputs bound to the field’s `fieldPositions` entry and update on blur/Enter.
  - [ ] Verify that both Move and Adjust target exactly the same field set as the current selection model.
- [ ] **1.5.5 – Validation Rules section**
  - [ ] Review existing Validation Rules buttons and containers.
  - [ ] Add concise labels or helper text where rules may be confusing (e.g., what a given pattern enforces).
  - [ ] Ensure error messages in the right panel and on the PDF overlay share a consistent visual pattern.

### 1.6 Microcopy, Tooltips, and Consistency
- [ ] **1.6.1 – Terminology audit**
  - [ ] Grep the codebase for key terms (Fields, Overlays, Controls, AI, Autofill, Magic Fill).
  - [ ] Create a small glossary in `UX_STRATEGIC_ANALYSIS.md` that defines the preferred term for each concept.
  - [ ] Update labels in the UI to match the chosen glossary where reasonable.
- [ ] **1.6.2 – Tooltip coverage**
  - [ ] Inventory controls that currently lack tooltips but are non-obvious (as flagged in the screenshot).
  - [ ] Add short, action-oriented tooltips for these controls.
  - [ ] Confirm tooltips appear quickly but do not obstruct key UI elements.
- [ ] **1.6.3 – Dead / non-functional controls**
  - [ ] Identify any buttons or icons that are not wired to actions (e.g., placeholders for future features).
  - [ ] Either remove them from the UI or clearly mark them as "Coming soon" in a subtle way.
  - [ ] Ensure that no control appears clickable if it does nothing.

### 1.7 QA & Validation
- [ ] **1.7.1 – Manual test checklist**
  - [ ] Create a short markdown checklist (e.g., `INTERACTION_FIXES.md`) describing the key manual flows to verify after changes.
  - [ ] Include scenarios for single-field vs multi-field movement, Autofill flows, page add/delete, and key right-panel actions.
- [ ] **1.7.2 – Smoke tests for field movement**
  - [ ] Add or update a Playwright test that selects Email, moves it via keyboard, and asserts only that field’s overlay moved.
  - [ ] Add a similar test for another field (e.g., Petitioner) to guard against regression.
- [ ] **1.7.3 – Smoke tests for Pages and right panel**
  - [ ] Add a test that adds a page, deletes it through the new UI control, and confirms the thumbnail list updates correctly.
  - [ ] Add a test that uses Select All / Clear and verifies selection state and resulting Move/Adjust behavior.
 - [ ] **1.7.4 – Visual design acceptance criteria & self-evaluation**
   - [ ] For each UI-facing subtask, write explicit acceptance criteria describing the expected visual and interaction outcome (including references to Apple/Linear-level polish where applicable).
   - [ ] After implementing a subtask, step away and re-evaluate the screen objectively against those criteria; if it does not clearly meet or exceed the Apple/Linear standard, iterate before marking the subtask complete.
   - [ ] For each subtask, append a short, stepwise self-evaluation entry to `agent-self-evaluation.md` describing: (a) what you changed, (b) what you compared it against (including any web references), (c) why it does or does not yet meet the design bar, and (d) what you adjusted based on that evaluation.


> Implementation note: individual items should be picked up as separate branches / PRs, starting with the highest impact × lowest effort ones (e.g., header button prominence and obvious copy/tooltip fixes) before deeper behavioral changes (field movement model, multi-select semantics).
