# Field Positioning UX Improvements Plan

**Date**: November 15, 2025
**Priority**: HIGH - User Experience Critical

## Current Issues

1. **Edit Mode Not Discoverable**
   - Users can't move fields without clicking "Edit Positions" button
   - Button is in top-right corner - easy to miss
   - No visual indication that edit mode exists

2. **Panel Controls Cut Off**
   - Right panel is 20-40% width (too narrow)
   - Field positioning controls overflow horizontally
   - Toolbar buttons not fully visible

3. **No Global Keyboard Controls**
   - Arrow buttons exist in UI but require clicking
   - No keyboard shortcuts for field movement
   - Missing accessibility features

4. **Weak Visual Feedback**
   - Unclear when edit mode is active
   - Field movement not intuitive
   - No hover states showing draggability

## First Principles UX Design

### User Mental Model:
1. **See the field** → Clear visual indication
2. **Know it's movable** → Cursor changes, hover states
3. **Move it easily** → Drag OR keyboard arrows
4. **Get feedback** → Position updates, snap guides
5. **Lock it in** → Exit edit mode

### Accessibility Requirements:
- Keyboard-only operation must work
- Screen reader announcements
- High contrast mode support
- Touch-friendly targets (44x44px minimum)

## Implementation Plan

### Phase 1: Discoverability (IMMEDIATE)
- [ ] Add prominent edit mode indicator banner
- [ ] Show keyboard shortcuts hint on first load
- [ ] Add pulsing animation to "Edit Positions" button
- [ ] Display tooltip on field hover: "Click 'Edit Positions' to move"

### Phase 2: Panel Layout (IMMEDIATE)
- [ ] Increase right panel minSize from 20% to 25%
- [ ] Increase maxSize from 40% to 50%
- [ ] Add horizontal scroll to field controls if needed
- [ ] Use flexbox with wrap for toolbar buttons
- [ ] Stack controls vertically on narrow widths

### Phase 3: Keyboard Controls (HIGH)
- [ ] Add global keyboard shortcuts:
  - `E` - Toggle edit mode
  - `Arrow keys` - Move selected field (0.5% step)
  - `Shift + Arrow` - Move selected field (5% step, faster)
  - `Cmd/Ctrl + Arrow` - Move to edge
  - `Esc` - Exit edit mode
  - `Tab` - Cycle through fields
- [ ] Add keyboard shortcuts legend (? key)
- [ ] Show shortcuts in tooltips

### Phase 4: Visual Feedback (HIGH)
- [ ] **Edit Mode Active**:
  - Yellow/amber border around entire PDF area
  - "EDIT MODE" banner at top
  - All fields show move cursor on hover
  - Directional arrows visible on all fields

- [ ] **Field States**:
  - Default: Subtle border
  - Hover: Brighter border + cursor: move
  - Selected: Primary color ring
  - Dragging: Shadow + scale + z-index boost
  - Locked: Gray border + cursor: default

- [ ] **Dragging Feedback**:
  - Real-time position % display
  - Snap guides with percentages
  - Ghost image of field while dragging
  - Haptic feedback on snap (if supported)

### Phase 5: Advanced Features (NICE-TO-HAVE)
- [ ] Multi-select fields (Shift + Click)
- [ ] Group movement
- [ ] Undo/Redo (Cmd+Z / Cmd+Shift+Z)
- [ ] Copy position (Cmd+C)
- [ ] Paste position (Cmd+V)
- [ ] Nudge with precision (0.1% steps with Alt+Arrow)

## Code Changes Required

### 1. FormViewer.tsx
```typescript
// Add keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Toggle edit mode with 'E'
    if (e.key === 'e' && !e.metaKey && !e.ctrlKey) {
      setIsGlobalEditMode(prev => !prev);
      return;
    }

    // Exit edit mode with Esc
    if (e.key === 'Escape' && isGlobalEditMode) {
      setIsGlobalEditMode(false);
      return;
    }

    // Move selected field with arrow keys
    if (isGlobalEditMode && currentFieldIndex >= 0) {
      const field = Object.keys(fieldNameToIndex).find(
        f => fieldNameToIndex[f] === currentFieldIndex
      );
      if (!field) return;

      const step = e.shiftKey ? 5 : 0.5; // Shift for faster movement

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        adjustPosition('up', field, step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        adjustPosition('down', field, step);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        adjustPosition('left', field, step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        adjustPosition('right', field, step);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isGlobalEditMode, currentFieldIndex]);

// Enhanced edit mode banner
{isGlobalEditMode && (
  <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-500/90 text-white rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-top">
    <div className="flex items-center gap-3">
      <Move className="h-5 w-5" />
      <div>
        <div className="font-bold">EDIT MODE ACTIVE</div>
        <div className="text-xs">Drag fields or use arrow keys • Press E or Esc to exit</div>
      </div>
    </div>
  </div>
)}
```

### 2. Index.tsx
```typescript
// Increase right panel sizes
<ResizablePanel
  id="right-panel"
  order={2}
  defaultSize={30}  // Changed from 25
  minSize={25}      // Changed from 20
  maxSize={50}      // Changed from 40
  collapsible={true}
  collapsedSize={0}
>
```

### 3. FieldNavigationPanel.tsx
```typescript
// Add responsive layout for controls
<div className="flex flex-wrap gap-2 justify-start">
  {/* Controls will wrap on narrow screens */}
  <Button size="sm">...</Button>
  <Button size="sm">...</Button>
</div>

// Or use horizontal scroll
<ScrollArea orientation="horizontal" className="w-full">
  <div className="flex gap-2 pb-2">
    {/* Controls in single row with scroll */}
  </div>
</ScrollArea>
```

## Success Metrics

- [ ] User can move fields within 5 seconds of opening app
- [ ] Zero horizontal scrolling needed on 1280px+ screens
- [ ] Keyboard-only field positioning works flawlessly
- [ ] Edit mode discoverable without documentation
- [ ] Field movement feels "butter smooth" (60fps)

## Testing Checklist

- [ ] Test on 1024px, 1280px, 1920px screen widths
- [ ] Test keyboard shortcuts (all combinations)
- [ ] Test drag and drop (smooth, no jank)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test touch on iPad/tablet
- [ ] Test undo/redo if implemented
- [ ] Performance: 60fps during drag
- [ ] Accessibility: Lighthouse score 100

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
