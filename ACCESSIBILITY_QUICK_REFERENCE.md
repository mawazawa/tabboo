# SwiftFill Pro - Accessibility Quick Reference Guide

## Critical Issues to Fix First

### 1. sr-only Class Missing (BLOCKING)
**Status**: Critical - prevents 7 components from working correctly
**File**: src/index.css
**Add this to src/index.css:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 2. Icon Buttons Need aria-label (~20+ buttons)
**Status**: Critical - screen readers can't announce buttons
**Files Affected**: 
- src/components/DraggableAIAssistant.tsx
- src/components/FormViewer.tsx
- src/components/FieldNavigationPanel.tsx

**Pattern to follow:**
```tsx
// BAD
<Button variant="ghost" size="icon" onClick={toggle}>
  <PanelLeftClose className="h-4 w-4" />
</Button>

// GOOD
<Button 
  variant="ghost" 
  size="icon" 
  onClick={toggle}
  aria-label="Toggle thumbnails panel"
>
  <PanelLeftClose className="h-4 w-4" />
</Button>
```

### 3. Form Field Overlays Not Labeled
**Status**: Critical - PDF fields completely inaccessible to screen readers
**File**: src/components/FormViewer.tsx (lines 811-850)

**Problem:**
```tsx
// Current - inaccessible
<input
  type="text"
  value={formData[overlay.field] || ''}
  onChange={(e) => updateField(overlay.field, e.target.value)}
/>
```

**Solution:**
```tsx
// Recommended
<input
  id={`field-${overlay.field}`}
  type="text"
  aria-label={overlay.label || overlay.field}
  aria-describedby={validationErrors[overlay.field] ? `error-${overlay.field}` : undefined}
  value={formData[overlay.field] || ''}
  onChange={(e) => updateField(overlay.field, e.target.value)}
/>
```

### 4. PDF Field Dragging Not Keyboard Accessible
**Status**: Critical - keyboard users cannot reposition fields
**File**: src/components/FormViewer.tsx

**Problem**: Only mouse drag available, no keyboard alternative

**Solution**: Add arrow key handler for field positioning
```tsx
const handleFieldKeyDown = (e: KeyboardEvent, fieldName: string) => {
  const field = fieldPositions[fieldName];
  if (!field) return;
  
  const step = e.shiftKey ? 10 : 1; // Shift for larger movements
  
  switch(e.key) {
    case 'ArrowUp':
      updateFieldPosition(fieldName, { ...field, top: field.top - step });
      break;
    case 'ArrowDown':
      updateFieldPosition(fieldName, { ...field, top: field.top + step });
      break;
    case 'ArrowLeft':
      updateFieldPosition(fieldName, { ...field, left: field.left - step });
      break;
    case 'ArrowRight':
      updateFieldPosition(fieldName, { ...field, left: field.left + step });
      break;
  }
};
```

---

## Keyboard Shortcuts to Document/Implement

| Shortcut | Action | Status |
|----------|--------|--------|
| Cmd/Ctrl+K | Open Command Palette | ✓ Implemented |
| Tab | Navigate form fields | ✓ Native HTML |
| Shift+Tab | Navigate backwards | ✓ Native HTML |
| Arrow Keys | Move selected field | ✗ NOT IMPLEMENTED |
| Arrow Keys (Panels) | Resize panels | ✗ NOT IMPLEMENTED |
| ? | Show keyboard help | ✗ NOT IMPLEMENTED |
| Escape | Close modals/panels | ✓ Implemented |

---

## Required ARIA Attributes by Component

### FormViewer.tsx
- [ ] Main PDF viewer container: `role="region"` + `aria-label="PDF form viewer"`
- [ ] Field inputs: `aria-label` + `aria-describedby` (for errors)
- [ ] Page indicator: `aria-live="polite"` (announce page changes)
- [ ] Loading state: `aria-label="Loading PDF"` on spinner

### DraggableAIAssistant.tsx
- [ ] Window container: `role="complementary"` + `aria-label="AI Assistant Chat"`
- [ ] Minimize button: `aria-label="Minimize AI assistant"`
- [ ] Maximize button: `aria-label="Maximize AI assistant"`
- [ ] Close button: `aria-label="Close AI assistant"`
- [ ] Messages: `aria-live="polite"` + `aria-relevant="additions"`

### CommandPalette.tsx
- [ ] Dialog: Already handled by Radix CommandDialog
- [ ] Input: Add `aria-label="Search commands"`
- [ ] Add help text: Show `aria-describedby` pointing to help

### FieldNavigationPanel.tsx
- [ ] Container: Change to `<nav aria-label="Form field navigation">`
- [ ] Field list: Wrap in `<ul><li>` structure
- [ ] Search: `aria-label="Search fields"`
- [ ] Error icons: Add `aria-live` region for errors

### PersonalDataVaultPanel.tsx
- [ ] Container: Change to `<aside aria-label="Personal data vault">`
- [ ] Form fields: Add descriptions with `aria-describedby`

---

## Focus Management Checklist

### Modal/Dialog Components
- [ ] Focus trapped within modal (cannot Tab out)
- [ ] First focusable element gets focus on open
- [ ] Focus returns to trigger on close
- [ ] Escape key closes modal

### Draggable Components
- [ ] Container is focusable: `tabIndex={0}`
- [ ] Has focus-visible styles
- [ ] Focus trap implemented if overlay

### Resizable Panels
- [ ] Handle is focusable
- [ ] Has focus-visible indicator
- [ ] Arrow keys resize panels (preferred over mouse)

### Form Fields
- [ ] Logical Tab order (top to bottom, left to right)
- [ ] Focus-visible styles on all inputs
- [ ] Related fields grouped with fieldsets if applicable

---

## Screen Reader Announcements

### Need aria-live Regions

**1. Chat Messages (AIAssistant.tsx)**
```tsx
<div aria-live="polite" aria-relevant="additions">
  {messages.map(msg => (
    <div key={msg.id} role="article">
      {msg.role === 'user' ? 'You: ' : 'Assistant: '}
      {msg.content}
    </div>
  ))}
</div>
```

**2. Validation Errors (FieldNavigationPanel.tsx)**
```tsx
<div aria-live="assertive" aria-relevant="additions removals">
  {Object.entries(validationErrors).map(([field, errors]) => (
    <div key={field} role="alert">
      {field}: {errors.join(', ')}
    </div>
  ))}
</div>
```

**3. Form Status (FormViewer.tsx)**
```tsx
<div aria-live="polite" aria-atomic="true">
  Page {currentPage} of {numPages} - {selectedFields.length} fields selected
</div>
```

**4. Loading States**
```tsx
{isLoading && <div aria-live="assertive">Loading...</div>}
```

---

## Accessibility Testing Checklist

### Before Shipping
- [ ] Run Axe DevTools scan (0 critical/serious issues)
- [ ] Test with NVDA (Windows) - all features work
- [ ] Test with JAWS (if available) - all features work
- [ ] Test with VoiceOver (Mac) - all features work
- [ ] Keyboard-only navigation - all features work
- [ ] Verify color contrast ratio with WebAIM tool
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Screen readers announce dynamic content

### Tools to Install
```bash
# Accessibility linting
npm install --save-dev eslint-plugin-jsx-a11y

# Automated testing
npm install --save-dev @axe-core/react jest-axe

# Browser extensions
# - Axe DevTools: https://www.deque.com/axe/devtools/
# - WAVE: https://wave.webaim.org/extension/
```

---

## Common Accessibility Patterns

### Icon Button
```tsx
<Button 
  variant="ghost" 
  size="icon"
  aria-label="Meaningful description"
  title="Meaningful description"
>
  <IconComponent className="h-4 w-4" />
</Button>
```

### Form Field with Validation
```tsx
<div>
  <label htmlFor="fieldName">Field Label</label>
  <input
    id="fieldName"
    aria-describedby={`fieldName-help ${errors.fieldName ? 'fieldName-error' : ''}`}
    aria-invalid={!!errors.fieldName}
    // ...
  />
  <div id="fieldName-help" className="text-xs text-muted-foreground">
    Help text describing the field
  </div>
  {errors.fieldName && (
    <div id="fieldName-error" role="alert" className="text-destructive">
      {errors.fieldName}
    </div>
  )}
</div>
```

### Skip Link
```tsx
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:bg-primary focus:text-primary-foreground focus:p-2 focus:z-50"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

### Loading State
```tsx
{isLoading && (
  <div role="status" aria-live="polite">
    <Loader2 className="animate-spin" aria-label="Loading" />
    <span className="sr-only">Loading...</span>
  </div>
)}
```

---

## Files That Need Accessibility Work

### Critical (Must fix for MVP)
1. src/components/FormViewer.tsx - Form fields not labeled
2. src/components/DraggableAIAssistant.tsx - No ARIA labels
3. src/index.css - Missing sr-only class
4. src/components/CommandPalette.tsx - No focus trap

### High Priority
5. src/components/FieldNavigationPanel.tsx - Not semantic HTML
6. src/components/PersonalDataVaultPanel.tsx - Missing descriptions
7. src/components/AIAssistant.tsx - Chat not announced

### Medium Priority
8. src/components/PDFThumbnailSidebar.tsx - No keyboard navigation
9. src/pages/Index.tsx - Add skip link
10. src/components/ui/resizable-handle-multi.tsx - Limited keyboard support

---

## Quick Reference: ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| aria-label | Provides accessible name | `<button aria-label="Close">X</button>` |
| aria-labelledby | Links to element providing label | `<h2 id="title">Form</h2> <form aria-labelledby="title">` |
| aria-describedby | Links to description | `<input aria-describedby="help-text">` |
| aria-live | Announces dynamic content | `<div aria-live="polite">Message updated</div>` |
| aria-invalid | Indicates field error | `<input aria-invalid="true">` |
| aria-required | Indicates required field | `<input aria-required="true">` |
| aria-hidden | Hides from screen readers | `<span aria-hidden="true">*</span>` |
| role | Defines element semantics | `<div role="button">` (avoid - use <button>) |
| tabindex | Controls focus order | `<div tabindex="0">` (use for custom widgets) |

---

## WCAG 2.1 Level A vs AA Checklist

### Level A (Minimum - Required)
- ✓ Text alternatives for non-text content
- ✓ Keyboard accessible
- ✗ Focus visible (needs work)
- ✗ Link purpose (form fields)
- ✗ Labels for inputs (form overlays)

### Level AA (Enhanced - Recommended)
- ✗ Enhanced color contrast (4.5:1)
- ✗ Audio descriptions for video
- ✓ Animations with prefers-reduced-motion
- ✗ Focus indicator more visible

---

## References

- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- Deque University: https://dequeuniversity.com/

---

## Questions?

See `/home/user/form-ai-forge/ACCESSIBILITY_AUDIT.md` for the full audit report with detailed analysis and examples.
