# UX Improvements TODO List

## Overview
Implement smooth field navigation, unified positioning controls, bi-directional field selection, synchronized highlighting system, enhanced thumbnail sidebar, field position presets, and JSON template system for crowdsourcing form mappings.

---

## 🚨 CRITICAL ISSUES - USER FEEDBACK (Nov 11, 2025)

### Field Movement & Interaction Issues
- [ ] **FIX: Keyboard arrow keys not working intuitively**
  - Up arrow should move field UP (decrease Y), not right (increase X)
  - Down arrow should move field DOWN (increase Y)
  - Left arrow should move field LEFT (decrease X)
  - Right arrow should move field RIGHT (increase X)
  - Current implementation has axes mixed up in the Adjust controls

- [ ] **FIX: Fields are not draggable**
  - User reports fields cannot be dragged on the PDF viewer
  - Investigate pointer events and drag handlers in FormViewer.tsx
  - Ensure drag handle is working properly

- [ ] **FIX: Fields feel sluggish when moving**
  - Optimize drag performance in FormViewer
  - Reduce unnecessary re-renders during drag operations
  - Consider using requestAnimationFrame for smoother movement

- [ ] **FIX: Fields not scaling with PDF zoom**
  - Fields remain static size when zooming in/out
  - Need to apply transform: scale() to field overlays based on zoom level
  - Ensure field content (text, inputs) scales proportionally

### Visual Polish & Design System
- [ ] **ENHANCE: Blue icons need refined polish + slight 3D look**
  - Add subtle depth to primary/accent colored components (buttons, badges, icons)
  - Implement component-level variants (not custom CSS)
  - Use shadow-sm, shadow-md with primary color tints
  - Add subtle gradients using design tokens (--gradient-primary)
  - Update Button, Badge, and icon wrapper components

- [ ] **REDESIGN: Form Field Controls layout is inefficient**
  - Current layout is cramped and cluttered
  - Reorganize control panel for better information hierarchy
  - Consider collapsible sections for less-used controls
  - Improve spacing and grouping of related controls
  - Add better visual separation between sections

- [ ] **ENHANCE: AI Assistant modal glassmorphism**
  - Current implementation is "jittery" - investigate animation issues
  - Improve backdrop-blur effect for true glassmorphic look
  - Smooth out drag animations (reduce jank)
  - Add proper spring physics to floating animation
  - Fix z-index layering issues

### Functional Bugs
- [ ] **FIX: "Scale to Fit" button doesn't work**
  - Button exists but doesn't trigger PDF scaling
  - Implement proper zoom calculation to fit PDF to viewport
  - Ensure it works with current zoom state management

### General UX Improvements
- [ ] **IMPROVE: Overall UI feels cluttered**
  - Audit all panels for unnecessary elements
  - Increase whitespace and breathing room
  - Simplify toolbar icons and actions
  - Consider hiding advanced features behind "More" menus
  - Make primary actions more prominent

- [ ] **IMPROVE: Not user-friendly for non-technical users**
  - Add contextual help tooltips
  - Simplify terminology in UI labels
  - Add visual cues for interactive elements
  - Improve onboarding flow with progressive disclosure

---

## Latest: Field Position Presets & Template System

### Feature 1: Field Position Presets
Quick positioning tools to speed up form field placement:
- **Snap to Grid**: Align fields to 5%, 10%, or custom grid increments
- **Align Left/Right/Center**: Align selected field(s) horizontally
- **Align Top/Middle/Bottom**: Align selected field(s) vertically
- **Distribute Evenly**: Space multiple fields evenly (horizontal or vertical)

### Feature 2: JSON Template System
Crowdsourceable form field mapping system:
- **Export Templates**: Save current field positions as JSON template
- **Import Templates**: Upload JSON to apply pre-mapped field positions
- **Template Library**: Local storage for saved templates
- **Settings Integration**: Upload/manage templates via settings menu
- **Template Format**: Standardized JSON schema for form field coordinates

### Template JSON Schema:
```json
{
  "formId": "FL-320",
  "formName": "Response to Request for Restraining Orders",
  "version": "1.0",
  "createdAt": "ISO date",
  "author": "optional",
  "fields": {
    "partyName": { "top": 15.8, "left": 5, "width": "40%", "height": "auto" },
    ...
  }
}
```

### Implementation Plan:

#### Phase 1: Template Utilities & Schema
- [ ] Create `src/utils/templateManager.ts` with import/export functions
- [ ] Define TypeScript interfaces for template format
- [ ] Add JSON validation functions
- [ ] Implement local storage management for templates

#### Phase 2: Preset Positioning Functions
- [ ] Create `src/utils/fieldPresets.ts` with positioning algorithms:
  - [ ] `snapToGrid(position, gridSize)` - Round to nearest grid increment
  - [ ] `alignHorizontal(fields, alignment: 'left'|'center'|'right')` - Align multiple fields
  - [ ] `alignVertical(fields, alignment: 'top'|'middle'|'bottom')` - Align multiple fields
  - [ ] `distributeEvenly(fields, direction: 'horizontal'|'vertical')` - Even spacing

#### Phase 3: UI Components
- [ ] Create `src/components/FieldPresetsToolbar.tsx` with preset buttons
- [ ] Create `src/components/TemplateManager.tsx` for upload/download UI
- [ ] Add settings section in toolbar for template management
- [ ] Add visual grid overlay toggle in FormViewer (optional)

#### Phase 4: Integration
- [ ] Add preset toolbar to FieldNavigationPanel header
- [ ] Wire up preset functions to field position state
- [ ] Add template upload button to settings dropdown
- [ ] Implement template export (download current positions as JSON)
- [ ] Add template selection dropdown (from saved templates)
- [ ] Add confirmation dialog when applying templates

#### Phase 5: Multi-Field Selection (Required for presets)
- [ ] Add Ctrl/Cmd+Click to select multiple fields
- [ ] Add visual indication for selected fields (blue border)
- [ ] Update preset functions to work with selected field array
- [ ] Add "Select All" / "Deselect All" buttons

### Success Criteria:
- [ ] Can snap any field to 5% grid with one click
- [ ] Can align multiple selected fields left/right/center
- [ ] Can distribute 3+ fields evenly with one click
- [ ] Can export current field positions as JSON file
- [ ] Can upload JSON template and apply to form
- [ ] Templates persist in local storage
- [ ] Template format is documented and shareable
- [ ] All presets follow design system tokens
- [ ] No performance degradation with presets

---

## Previous: Synchronized Highlighting & Thumbnail Fixes

### Problem 1: Form Field Controls Jumping & Lack of Visual Sync
The form field controls currently scroll/jump when clicking Next, making it hard to use efficiently. Refactored design with:
- **Fixed top section**: Navigation buttons, positioning controls, and metadata stay anchored at the top
- **Scrollable field strip**: List of fields below that doesn't auto-scroll when navigating
- **Visual highlighter system**: A clear highlight indicator that moves synchronously across:
  1. The actual field on the PDF page
  2. The field in the scrollable strip
  3. A minimap indicator on the thumbnail sidebar
- **Low latency**: All highlights update instantly when navigating

### Problem 2: Thumbnail Shows Form Panel
The thumbnail sidebar currently includes the form fields control panel in its miniature view. It should only show the PDF document page layout itself, without any UI components.

### Success Criteria:

**Form Field Controls:**
- [✓] Top section remains fixed/anchored (navigation buttons, positioning widget, field count)
- [✓] Field list is independently scrollable without auto-scrolling on navigation
- [ ] Visual highlighter appears on the active field in the field strip
- [ ] Visual highlighter appears on the active field overlay in the PDF viewer
- [ ] Visual minimap indicator appears on the thumbnail for the active field's position
- [ ] All three highlighters update simultaneously with no noticeable lag
- [✓] Keyboard navigation (Tab/Shift+Tab, arrow keys) updates all highlighters
- [ ] Clicking a field in any location (PDF, field strip, or thumbnail area) syncs all highlighters

**Thumbnail Sidebar:**
- [ ] Thumbnails only render the PDF page content
- [ ] No UI components (form panel, controls) visible in thumbnail miniatures
- [ ] Thumbnails remain centered in the sidebar
- [ ] Current page indicator still works correctly

---

## Phase 1: Smooth Scrolling Navigation
### Tasks
- [✓] Add smooth scroll behavior to field list when Previous/Next buttons are clicked
- [✓] Implement `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` for active field
- [✓] Keep Field Control Panel header fixed/persistent during navigation
- [✓] Add transition animations for focus state changes
- [✓] Prevent abrupt jumps by using `block: 'nearest'` instead of `block: 'center'`

### Success Criteria
- ✓ Clicking Previous/Next scrolls smoothly to the target field without jarring jumps
- ✓ Control panel header remains stationary during navigation
- ✓ Field list scrolls automatically to keep active field visible
- ✓ Smooth animation takes ~300-500ms for optimal perceived performance

---

## Phase 2: Unified Positioning Control Widget
### Tasks
- [ ] Extract positioning control (Popover with arrow keys) from individual field rows
- [ ] Create a single positioning widget component in the control panel header
- [ ] Make widget context-aware: displays position of currently active field
- [ ] Remove gear icon from each field row (DRY principle)
- [ ] Position widget should only be visible when a field is actively selected
- [ ] Update `adjustPosition` function to work with active field context

### Success Criteria
- ✓ Single positioning button appears in control panel header
- ✓ Button shows current position of active field (e.g., "Position: 10.5%, 20.3%")
- ✓ Clicking button opens position adjustment popover
- ✓ Arrow keys in popover adjust the active field's position
- ✓ Gear icons removed from all field rows
- ✓ Positioning control is disabled/hidden when no field is selected

---

## Phase 3: Bi-Directional Field Selection
### Tasks
- [ ] Add click handlers to field overlays in FormViewer.tsx
- [ ] Create shared state (context or prop drilling) for `activeFieldName`
- [ ] Update FieldNavigationPanel to highlight and scroll to field when set externally
- [ ] Add visual feedback (border/highlight) to selected field in PDF preview
- [ ] Add visual feedback (background/border) to selected field in control panel
- [ ] Synchronize active state between FormViewer (left) and FieldNavigationPanel (right)
- [ ] Ensure clicking a field in control panel also highlights it in preview

### Success Criteria
- ✓ Clicking a field overlay in PDF preview activates it in the control panel
- ✓ Active field has visual highlight in PDF preview (e.g., blue border)
- ✓ Active field row has visual highlight in control panel (e.g., background color)
- ✓ Control panel auto-scrolls to show the selected field
- ✓ Clicking a field in control panel highlights the corresponding overlay in preview
- ✓ Only one field can be active at a time
- ✓ Visual feedback is consistent and follows design system tokens

---

## Phase 4: Polish & Edge Cases
### Tasks
- [✓] Add keyboard shortcuts (Tab/Shift+Tab) to navigate fields while maintaining smooth scroll
- [✓] Ensure positioning control updates immediately when switching fields
- [ ] Handle edge case: user adjusts position while another field is loading
- [✓] Add subtle transition animations for field selection state changes
- [✓] Test with all field types (text, textarea, checkbox)
- [ ] Verify mobile responsiveness (if applicable)

### Success Criteria
- ✓ Tab navigation works smoothly with scroll behavior
- ✓ No race conditions when rapidly switching fields
- ✓ All animations feel polished and intentional (~200-300ms transitions)
- ✓ Works consistently across all field types
- ✓ No console errors or warnings

---

## Design System Compliance
### Requirements
- [✓] Use semantic tokens from index.css (--primary, --accent, --border, etc.)
- [✓] Apply consistent border-radius using design system (rounded-xl, rounded-lg)
- [✓] Use shadow utilities (shadow-soft, shadow-medium) for depth
- [✓] Implement transitions using `transition-all duration-300`
- [✓] Active state uses primary color with appropriate opacity
- [✓] Hover states follow Apple HIG principles

### Success Criteria
- ✓ No hardcoded colors (e.g., no `text-blue-500`, use semantic tokens)
- ✓ Consistent rounded corners and shadows throughout
- ✓ Smooth transitions on all interactive elements
- ✓ Design feels cohesive with existing AI Assistant widget

---

## Testing Checklist
- [✓] Test Previous/Next navigation smoothness
- [✓] Test positioning control with all fields
- [ ] Test clicking field overlays in PDF preview
- [ ] Test clicking field rows in control panel
- [✓] Verify no functionality breaks during refactor
- [✓] Check console for errors
- [✓] Verify performance (no lag during animations)

---

## Files to Modify/Create

### New Files:
- `src/utils/templateManager.ts` - Template import/export/storage
- `src/utils/fieldPresets.ts` - Preset positioning algorithms
- `src/components/FieldPresetsToolbar.tsx` - Preset UI controls
- `src/components/TemplateManager.tsx` - Template upload/download UI

### Existing Files:
- `src/components/FieldNavigationPanel.tsx` - Add preset toolbar, multi-select
- `src/components/FormViewer.tsx` - Add multi-select, visual grid overlay
- `src/pages/Index.tsx` - Wire up template management
- `src/config/fieldPositions.ts` - Export for template generation

---

## Success Metrics
**User Experience:**
- Navigation feels natural and fluid
- User can quickly locate and edit any field
- Positioning adjustments are intuitive
- Visual feedback is immediate and clear
- Presets speed up form field placement significantly
- Templates enable instant form mapping from community library

**Technical:**
- No performance degradation
- Clean, maintainable code
- Follows DRY principles
- Proper React patterns (state management, event handling)
- Template format is standardized and extensible
