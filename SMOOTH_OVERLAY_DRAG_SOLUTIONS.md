# Solutions for Smooth Form Field Overlay Movement in React

## Critical Issues & Solutions

### 1. Transform on Parent Breaking position:fixed ✅ SOLUTION
**Problem**: Parent elements with `transform` create new containing blocks, making `position: fixed` behave like `position: absolute`

**Solutions**:
- ✅ Use `position: absolute` relative to page container (already implemented)
- ✅ Ensure overlays are direct children of page container, not nested in transformed elements
- ✅ Use `will-change: transform` on dragged element for GPU acceleration

### 2. Stale getBoundingClientRect() ✅ SOLUTION
**Problem**: `parentRect` captured once at drag start becomes stale if parent resizes or scrolls

**Solution**:
- ✅ Recalculate `getBoundingClientRect()` on each pointer move
- ✅ Use ref to parent element and call `getBoundingClientRect()` fresh each frame
- ✅ Store parent element ref, not just the rect

### 3. React Re-renders Mid-Drag ✅ SOLUTION
**Problem**: State updates during drag cause re-renders, making movement janky

**Solution**:
- ✅ Use `useRef` for drag state (already implemented)
- ✅ Only update DOM directly via `style.transform` during drag
- ✅ Batch state updates after drag ends
- ✅ Use `requestAnimationFrame` for smooth updates (already implemented)

### 4. Event Listeners Not Cleaning Up ✅ SOLUTION
**Problem**: Event listeners leak if drag ends unexpectedly

**Solution**:
- ✅ Centralized cleanup function (already implemented)
- ✅ Cleanup on unmount
- ✅ Cleanup when edit mode disabled
- ✅ Handle `pointerleave` events

### 5. Z-index Stacking Context ✅ SOLUTION
**Problem**: Dragged element might be behind other elements

**Solution**:
- ✅ Set `z-50` on dragging element (already implemented)
- ✅ Ensure parent doesn't create new stacking context
- ✅ Use `isolation: isolate` if needed

### 6. Pointer Events: None on Overlay ✅ SOLUTION
**Problem**: Overlay might have `pointer-events: none` preventing interaction

**Solution**:
- ✅ Set `pointerEvents: 'auto'` on field containers (already implemented)
- ✅ Ensure no parent has `pointer-events: none`

### 7. PDF.js Re-rendering ✅ SOLUTION
**Problem**: PDF re-renders during drag causing position jumps

**Solution**:
- ✅ Use `memo` to prevent unnecessary re-renders
- ✅ Keep drag state in refs, not state
- ✅ Only update PDF when drag ends

### 8. Performance Optimization ✅ SOLUTION
**Problem**: Too many calculations per frame

**Solution**:
- ✅ Use `requestAnimationFrame` (already implemented)
- ✅ Cancel previous RAF before scheduling new one
- ✅ Use `will-change: transform` for GPU acceleration
- ✅ Minimize DOM reads (getBoundingClientRect) during drag

## Implementation Checklist

- [x] Use position: absolute (not fixed)
- [x] Recalculate getBoundingClientRect on each move
- [x] Use refs for drag state
- [x] Use requestAnimationFrame
- [x] Cleanup event listeners properly
- [x] Set high z-index on dragging element
- [x] Set pointer-events: auto
- [ ] Add will-change: transform for GPU acceleration
- [ ] Store parent element ref instead of rect
- [ ] Prevent React re-renders during drag

