# Arrow Key Movement Test - COMPREHENSIVE DIAGNOSTIC

**Date:** November 18, 2025  
**Status:** DEBUGGING IN PROGRESS

## Current Issue

User reports: "I cannot move the form fields with arrow keys like I could a few days ago"

## Expected Behavior

1. Click on a field on the PDF
2. Press arrow keys (↑ ↓ ← →)
3. Field should move in that direction

## Current Implementation

### The Logic Chain

```
User clicks field
  ↓
handleFieldClick() fires (FormViewer.tsx line 224)
  ↓
Gets fieldIndex from fieldNameToIndex mapping (line 251)
  ↓
Calls setCurrentFieldIndex(fieldIndex) (line 254)
  ↓
useEffect re-runs with new currentFieldIndex (FieldNavigationPanel.tsx line 406)
  ↓
New handleKeyDown function created with current value (line 409)
  ↓
User presses arrow key
  ↓
handleKeyDown checks if shouldMoveField (line 456)
  ↓
Calls adjustPosition(direction) (line 471)
  ↓
adjustPosition updates fieldPositions (line 374)
  ↓
updateFieldPosition prop called (line 397)
  ↓
Field moves on screen
```

## Diagnostic Logs

When you refresh and test, you should see these logs in THIS ORDER:

### 1. On Page Load
```
[FIELD MAPPING] Generated mapping with X fields: [...]
[KEYBOARD LISTENER] Arrow key listener ATTACHED. Current field index: -1
[KEYBOARD LISTENER] Event listeners attached. Dependencies: {...}
```

### 2. When You Click a Field
```
[FIELD CLICK] Field clicked: {field} Index: {number} Map: {...}
[FIELD CLICK] Set currentFieldIndex to: {number}
[KEYBOARD LISTENER] Event listeners REMOVED
[KEYBOARD LISTENER] Arrow key listener ATTACHED. Current field index: {number}
[KEYBOARD LISTENER] Event listeners attached. Dependencies: {...}
```

### 3. When You Press Arrow Key
```
[DEBUG] Arrow key pressed: ArrowUp {
  currentFieldIndex: {number},
  currentField: {fieldName},
  activeElement: "BODY",
  altKey: false
}
[DEBUG] Arrow key check: {
  isArrowKey: true,
  altKey: false,
  isActivelyTyping: false,
  shouldMoveField: true,
  ...
}
[ARROW KEY] Moving {fieldName} up
```

## Potential Issues

### Issue 1: fieldNameToIndex is Empty
**Symptom:** `[FIELD MAPPING]` shows 0 fields or is missing  
**Cause:** Database field mappings not loaded  
**Fix:** Check database connection, verify field_positions table has data

### Issue 2: Field Click Not Registering
**Symptom:** No `[FIELD CLICK]` logs when clicking field  
**Cause:** onClick not attached or being blocked  
**Fix:** Check z-index, pointer-events, event bubbling

### Issue 3: Field Not in Mapping
**Symptom:** `[FIELD CLICK]` shows `Index: undefined`  
**Cause:** Field name doesn't exist in fieldNameToIndex  
**Fix:** Verify field names match between database and overlay config

### Issue 4: useEffect Not Re-running
**Symptom:** `currentFieldIndex` stays -1 in arrow key logs  
**Cause:** useEffect dependencies wrong or closure issue  
**Fix:** Verify dependencies array includes currentFieldIndex

### Issue 5: shouldMoveField is False
**Symptom:** `shouldMoveField: false` in arrow key check  
**Cause:** isActivelyTyping is true when it shouldn't be  
**Fix:** Check if activeElement has .field-input class incorrectly

## Testing Steps

1. **Hard Refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
2. **Open Console:** Cmd+Option+J (Mac) or Ctrl+Shift+J (Windows)
3. **Check Page Load:** Look for `[FIELD MAPPING]` and `[KEYBOARD LISTENER]` logs
4. **Click a Field:** ANY field on the PDF, look for `[FIELD CLICK]` logs
5. **Press Arrow Key:** Look for `[DEBUG]` and `[ARROW KEY]` logs
6. **Report Results:** Copy-paste ALL console logs

## What to Copy-Paste

```
When testing, copy-paste these EXACT sections:

1. ALL logs that start with [FIELD MAPPING]
2. ALL logs that start with [KEYBOARD LISTENER]
3. ALL logs that start with [FIELD CLICK] (after clicking field)
4. ALL logs that start with [DEBUG] (after pressing arrow)
5. ALL logs that start with [ARROW KEY] (after pressing arrow)
```

## Expected Success Pattern

```
✅ [FIELD MAPPING] Generated mapping with 64 fields
✅ [KEYBOARD LISTENER] Arrow key listener ATTACHED. Current field index: -1
✅ [FIELD CLICK] Field clicked: partyName Index: 0
✅ [KEYBOARD LISTENER] Event listeners REMOVED
✅ [KEYBOARD LISTENER] Arrow key listener ATTACHED. Current field index: 0
✅ [DEBUG] Arrow key pressed: ArrowUp { currentFieldIndex: 0, currentField: "partyName", ... }
✅ [DEBUG] Arrow key check: { shouldMoveField: true, ... }
✅ [ARROW KEY] Moving partyName up
```

## If It STILL Doesn't Work

If you see ALL the correct logs but the field STILL doesn't move, then the issue is in:
- `adjustPosition()` function (line 374)
- `updateFieldPosition()` prop (line 397)
- Field position state not updating
- PDF re-render not happening

In that case, we need to add MORE logs to `adjustPosition()` to see if:
1. It's being called
2. It's calculating new position correctly
3. It's calling updateFieldPosition
4. The state is updating

---

**CURRENT STATUS:** Deployed with comprehensive logging  
**NEXT STEP:** User tests and reports console logs  
**BUILD:** a7475a5 (successful, 7.85s)

