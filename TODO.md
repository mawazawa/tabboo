# UX Improvements TODO List

## Overview
Implement smooth field navigation, unified positioning controls, and bi-directional field selection between PDF preview and control panel.

---

## Phase 1: Smooth Scrolling Navigation
### Tasks
- [ ] Add smooth scroll behavior to field list when Previous/Next buttons are clicked
- [ ] Implement `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` for active field
- [ ] Keep Field Control Panel header fixed/persistent during navigation
- [ ] Add transition animations for focus state changes
- [ ] Prevent abrupt jumps by using `block: 'nearest'` instead of `block: 'center'`

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
- [ ] Add keyboard shortcuts (Tab/Shift+Tab) to navigate fields while maintaining smooth scroll
- [ ] Ensure positioning control updates immediately when switching fields
- [ ] Handle edge case: user adjusts position while another field is loading
- [ ] Add subtle transition animations for field selection state changes
- [ ] Test with all field types (text, textarea, checkbox)
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
- [ ] Use semantic tokens from index.css (--primary, --accent, --border, etc.)
- [ ] Apply consistent border-radius using design system (rounded-xl, rounded-lg)
- [ ] Use shadow utilities (shadow-soft, shadow-medium) for depth
- [ ] Implement transitions using `transition-all duration-300`
- [ ] Active state uses primary color with appropriate opacity
- [ ] Hover states follow Apple HIG principles

### Success Criteria
- ✓ No hardcoded colors (e.g., no `text-blue-500`, use semantic tokens)
- ✓ Consistent rounded corners and shadows throughout
- ✓ Smooth transitions on all interactive elements
- ✓ Design feels cohesive with existing AI Assistant widget

---

## Testing Checklist
- [ ] Test Previous/Next navigation smoothness
- [ ] Test positioning control with all fields
- [ ] Test clicking field overlays in PDF preview
- [ ] Test clicking field rows in control panel
- [ ] Verify no functionality breaks during refactor
- [ ] Check console for errors
- [ ] Verify performance (no lag during animations)

---

## Files to Modify
- `src/components/FieldNavigationPanel.tsx` - Add smooth scroll, unified positioning widget
- `src/components/FormViewer.tsx` - Add click handlers, field highlighting
- `src/pages/Index.tsx` - Add shared activeField state management
- `src/config/fieldPositions.ts` - May need updates if positioning logic changes

---

## Success Metrics
**User Experience:**
- Navigation feels natural and fluid
- User can quickly locate and edit any field
- Positioning adjustments are intuitive
- Visual feedback is immediate and clear

**Technical:**
- No performance degradation
- Clean, maintainable code
- Follows DRY principles
- Proper React patterns (state management, event handling)
