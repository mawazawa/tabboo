# Field Persistence Debugging Guide

## Issue Report
**User Feedback**: "when i change the location of a field... and if i log out of my account and then log back in, the positions of those fields will have been reset, and their state, and their content."

## Current Implementation Status

### ✅ Verified Working Components

1. **RLS Policies** (Confirmed via Supabase SQL)
   - ✅ Users can SELECT their own documents: `auth.uid() = user_id`
   - ✅ Users can INSERT their own documents: `auth.uid() = user_id`
   - ✅ Users can UPDATE their own documents: `auth.uid() = user_id`
   - ✅ Users can DELETE their own documents: `auth.uid() = user_id`

2. **Database Schema** (Confirmed via information_schema)
   ```sql
   legal_documents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     title TEXT NOT NULL,
     content JSONB DEFAULT '{}'::jsonb,
     metadata JSONB DEFAULT '{}'::jsonb,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )
   ```

3. **hasUnsavedChanges Flag** (Confirmed in use-field-operations.ts)
   - ✅ Set on `updateField()` (line 53)
   - ✅ Set on `updateFieldPosition()` (line 101)
   - ✅ Set on `handleAutofillAll()` (line 91)
   - ✅ Set on ALL field manipulation functions

4. **Auto-Save Logic** (src/hooks/use-document-persistence.ts:152-180)
   - ✅ Runs every 5 seconds via setInterval
   - ✅ Checks `documentId` and `hasUnsavedChanges.current`
   - ✅ Saves `formData`, `fieldPositions`, and `validationRules`
   - ✅ Resets `hasUnsavedChanges.current = false` on success

5. **Data Load Logic** (src/hooks/use-document-persistence.ts:101-150)
   - ✅ Loads on user authentication
   - ✅ Tries cache first (`queryClient.getQueryData`)
   - ✅ Falls back to Supabase fetch
   - ✅ Creates new document if none exists

## 🔍 Debugging Steps

### Step 1: Open Browser Console
1. Open SwiftFill in browser at http://localhost:8081
2. Press F12 or Cmd+Option+I to open DevTools
3. Go to Console tab
4. Clear console (Cmd+K or right-click → Clear console)

### Step 2: Watch for Auto-Save Logs
Expected logs every 5 seconds:
```
🔄 Auto-save check: {documentId: "uuid", hasUnsavedChanges: true/false, ...}
```

If you see:
- `⚠️ Cannot save: documentId is null` → Document creation failed
- `✅ No unsaved changes, skipping save` → Flag not being set
- `❌ Save failed:` → RLS or database error
- `✅ Save successful:` → Everything working

### Step 3: Test Field Changes
1. Enter text in any field
2. Watch console - should see `hasUnsavedChanges: true`
3. Wait 5 seconds
4. Should see `💾 Attempting to save document...`
5. Should see `✅ Save successful:` and toast notification

### Step 4: Test Field Position Changes
1. Press 'E' to enable Edit Mode
2. Drag a field to new position
3. Watch console - should see `hasUnsavedChanges: true`
4. Wait 5 seconds
5. Should see save success

### Step 5: Test Logout/Login Persistence
1. Make changes and wait for `✅ Save successful`
2. Click Logout
3. Log back in
4. Watch console for `📂 Loading document data for user:`
5. Should see `✅ Found existing document:` or `✅ Found cached document:`
6. Should see `📊 Loaded from database/cache:` with field counts

### Step 6: Verify Saved Data in Supabase
1. Go to Supabase dashboard
2. Navigate to Table Editor → legal_documents
3. Find your document by user_id
4. Check the `content` JSONB column - should have field values
5. Check the `metadata` JSONB column - should have `fieldPositions` object

## 🐛 Common Issues & Solutions

### Issue 1: documentId is null
**Symptom**: Console shows `⚠️ Cannot save: documentId is null`

**Root Cause**: Document creation failed or async timing issue

**Solution**:
```typescript
// Check if document creation is failing
// Look for console error: ❌ Error creating document:
```

### Issue 2: hasUnsavedChanges never set to true
**Symptom**: Console always shows `hasUnsavedChanges: false`

**Root Cause**: `updateField` or `updateFieldPosition` not being called

**Solution**: Verify field operations are triggering correctly

### Issue 3: Save succeeds but data doesn't persist
**Symptom**: See `✅ Save successful` but data missing on reload

**Root Cause**: Data being saved to wrong document or overwritten

**Solution**: Check `documentId` matches between save and load

### Issue 4: RLS policy blocking save
**Symptom**: Console shows `❌ Save failed: new row violates row-level security policy`

**Root Cause**: `auth.uid()` doesn't match `user_id`

**Solution**: Verify user is authenticated with correct session

## 📝 Manual Testing Checklist

- [ ] Open browser console and clear it
- [ ] Log in to SwiftFill
- [ ] Verify you see `📂 Loading document data for user:`
- [ ] Type text in a field (e.g., "John Doe" in petitioner field)
- [ ] Wait 5 seconds
- [ ] Verify you see `✅ Save successful:` toast
- [ ] Press 'E' to enable Edit Mode
- [ ] Drag a field to new position
- [ ] Wait 5 seconds
- [ ] Verify you see another `✅ Save successful:` toast
- [ ] Note current field values and positions
- [ ] Click Logout
- [ ] Log back in
- [ ] Verify field values match what you entered
- [ ] Verify field positions match where you dragged them

## 🔬 Advanced Debugging

### Check Supabase Auth State
```javascript
// In browser console:
const { data } = await supabase.auth.getSession()
console.log('Current session:', data.session)
console.log('User ID:', data.session?.user?.id)
```

### Manually Trigger Save
```javascript
// In browser console:
// This won't work because hasUnsavedChanges is internal
// Instead, make a field change and watch for auto-save
```

### Check Document in Database
```javascript
// In browser console:
const { data: session } = await supabase.auth.getSession()
const { data, error } = await supabase
  .from('legal_documents')
  .select('*')
  .eq('user_id', session.session.user.id)
  .eq('title', 'FL-320 Form')
  .maybeSingle()
console.log('Document:', data)
console.log('Field count:', Object.keys(data?.content || {}).length)
console.log('Position count:', Object.keys(data?.metadata?.fieldPositions || {}).length)
```

## 📊 Expected Behavior

### Successful Auto-Save Flow
```
1. User types "John Doe" in petitioner field
2. updateField() called → hasUnsavedChanges.current = true
3. [5 seconds pass]
4. Auto-save interval triggers
5. Console: 🔄 Auto-save check: {hasUnsavedChanges: true}
6. Console: 💾 Attempting to save document...
7. Supabase UPDATE query executes
8. Console: ✅ Save successful: [{...}]
9. Toast: "Saved - Your changes have been automatically saved"
10. hasUnsavedChanges.current = false
```

### Successful Load Flow (After Logout/Login)
```
1. User logs in
2. useEffect triggers loadData()
3. Console: 📂 Loading document data for user: <uuid>
4. Check cache (likely miss after logout)
5. Console: 🔍 No cache found, fetching from database...
6. Supabase SELECT query executes
7. Console: ✅ Found existing document: <doc-id>
8. setFormData() with saved content
9. setFieldPositions() with saved metadata.fieldPositions
10. Console: 📊 Loaded from database: {formDataKeys: X, fieldPositionsKeys: Y}
11. Form renders with restored data
```

## 🎯 Next Steps

If persistence is still failing after following this guide:

1. **Capture Full Console Log**
   - Clear console
   - Perform test sequence
   - Right-click console → "Save as..." → Send to developer

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Filter by "legal_documents"
   - Look for UPDATE request
   - Check request payload and response

3. **Verify Supabase Project**
   - Confirm project ID: `sbwgkocarqvonkdlitdx`
   - Check if RLS is enabled on table
   - Verify anon key is correct in env vars

4. **Test with Direct Supabase Query**
   - Use Supabase SQL Editor
   - Run manual INSERT/UPDATE/SELECT
   - Confirm data persists at database level

---

*Last Updated: 2025-11-18*
*Issue: User report "fields do not persist after logout/login"*
