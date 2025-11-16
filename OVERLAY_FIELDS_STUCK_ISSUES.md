# ALL WAYS OVERLAY FIELDS CAN GET STUCK ON CANVAS IN VITE/REACT

## Critical Issues Found & Fixed

### 1. **Event Listener Cleanup Failure** ✅ FIXED
**Problem**: Event listeners not properly removed when drag ends
- `pointerup` and `pointercancel` use `{ once: true }` but also manually remove listeners
- If cleanup happens before event fires, listeners can persist
- Missing `pointerleave` handler for when pointer leaves window

**Fix**: Centralized cleanup function + added `pointerleave` handler

### 2. **Transform CSS Persistence** ✅ FIXED
**Problem**: `transform: translate()` stays on element if `pointerup` never fires
- If user drags outside window, `pointerup` might not fire
- Transform stays applied, field appears stuck in wrong position
- No fallback cleanup mechanism

**Fix**: Added `pointerleave` handler + cleanup on edit mode toggle

### 3. **Edit Mode Toggle During Drag** ✅ FIXED
**Problem**: If edit mode is disabled while dragging, drag state never cleans up
- Event listeners remain attached
- Transform stays applied
- `isDragging` state stuck
- Refs not cleared

**Fix**: Added `useEffect` to detect edit mode disabled during drag and force cleanup

### 4. **Component Unmount During Drag** ✅ FIXED
**Problem**: If component unmounts while dragging, cleanup doesn't happen
- Event listeners leak
- Transform persists
- Memory leaks

**Fix**: Enhanced unmount cleanup in `useEffect`

### 5. **Race Condition with RAF** ✅ FIXED
**Problem**: `requestAnimationFrame` callback might execute after cleanup
- RAF callback tries to access cleared refs
- Can cause errors or stuck state

**Fix**: Proper RAF cancellation + null checks

## Other Potential Issues (Not Currently Present But Possible)

### 6. **Multiple Simultaneous Drags**
**Problem**: If user somehow triggers multiple drags
- Multiple event listeners attached
- Conflicting transforms
- State corruption

**Prevention**: Check `isDragging` before starting new drag

### 7. **Pointer Events Disabled**
**Problem**: CSS `pointer-events: none` on parent
- Events don't fire
- Drag never starts or never ends
- State stuck

**Prevention**: Ensure parent has `pointer-events: auto`

### 8. **Z-Index Conflicts**
**Problem**: Overlay behind another element
- Pointer events hit wrong element
- Drag doesn't work
- Appears stuck

**Prevention**: Ensure drag handles have high z-index

### 9. **State Update Race Conditions**
**Problem**: Multiple rapid state updates
- `updateFieldPosition` called multiple times
- Position updates conflict
- Field jumps or sticks

**Prevention**: Debounce position updates or use refs for drag

### 10. **Browser Tab Switch During Drag**
**Problem**: User switches tabs while dragging
- `pointerup` might not fire
- Drag state persists
- Field stuck when tab returns

**Prevention**: Add `visibilitychange` listener to cleanup

### 11. **Touch vs Mouse Pointer Confusion**
**Problem**: Touch device triggers both touch and pointer events
- Multiple event handlers fire
- State conflicts
- Field stuck

**Prevention**: Use pointer events consistently, not touch events

### 12. **CSS Transform Conflicts**
**Problem**: Multiple transforms applied (zoom + drag)
- Transforms compound incorrectly
- Field position wrong
- Appears stuck

**Prevention**: Use single transform or combine properly

### 13. **Parent Element Resize**
**Problem**: Parent container resizes during drag
- `parentRect` becomes stale
- Position calculations wrong
- Field jumps or sticks

**Prevention**: Recalculate parentRect on resize

### 14. **React Strict Mode Double Render**
**Problem**: Strict mode causes double renders
- Event listeners attached twice
- Cleanup happens twice
- State inconsistencies

**Prevention**: Use refs for event handlers, not closures

### 15. **Vite HMR During Drag**
**Problem**: Hot module reload happens while dragging
- Component remounts
- State lost
- Transform persists from old instance

**Prevention**: Cleanup on unmount (already fixed)

## Summary of Fixes Applied

1. ✅ Centralized cleanup function
2. ✅ Added `pointerleave` handler
3. ✅ Cleanup when edit mode disabled during drag
4. ✅ Enhanced unmount cleanup
5. ✅ Proper RAF cancellation
6. ✅ Null checks before accessing refs

## Testing Checklist

- [ ] Drag field and release normally
- [ ] Drag field and move pointer outside window
- [ ] Drag field and toggle edit mode off
- [ ] Drag field and switch browser tabs
- [ ] Drag field and refresh page
- [ ] Drag field and close browser
- [ ] Rapidly toggle edit mode while dragging
- [ ] Multiple fields dragged in sequence
- [ ] Component unmounts during drag (hard to test)

