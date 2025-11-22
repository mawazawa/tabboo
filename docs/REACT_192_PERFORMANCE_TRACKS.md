# React 19.2 Performance Tracks Guide

## Overview

React 19.2 introduces **Performance Tracks** - custom tracks in Chrome DevTools that provide detailed insights into React's internal scheduling and rendering behavior. This guide explains how to use these features in SwiftFill.

## Features Enabled

### 1. React Performance Tracks (Automatic)

When you run SwiftFill in development mode, React automatically reports performance data to Chrome DevTools. No configuration needed!

**To view:**
1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click **Record** and interact with the app
4. Stop recording
5. Look for these custom tracks:
   - **Scheduler** - Shows React's priority scheduling
   - **Components** - Shows component tree rendering

### 2. Scheduler Track Insights

The Scheduler track shows what React is prioritizing:

- **Blocking** (red) - User interactions that need immediate response
- **Transition** (blue) - Updates inside `startTransition()`
- **Idle** (gray) - Low-priority background updates

**Use this to identify:**
- Which updates are blocking the main thread
- Where to add `startTransition()` for better UX
- Expensive computations that should be deferred

### 3. Components Track Insights

Shows the component tree during rendering:

- **Mounting** - Initial render of components
- **Blocking** - Synchronous re-renders
- **Effects** - useEffect/useLayoutEffect execution

**Use this to identify:**
- Components re-rendering unnecessarily
- Expensive component subtrees
- Effect chains causing cascading updates

## React Compiler Benefits

The React Compiler (enabled in this project) automatically optimizes:

### Automatic Memoization

Components are automatically memoized - no need for:
- `useMemo()`
- `useCallback()`
- `React.memo()`

The compiler analyzes your code and adds these optimizations at build time.

### Verification

To verify compiler optimization:
1. Install React DevTools browser extension
2. Look for **"Memo ✨"** badge on optimized components
3. Components without the badge may have violations

### ESLint Integration

Compiler rules are now in `eslint-plugin-react-hooks@latest`:

\`\`\`javascript
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Compiler will show warnings for code it can't optimize
    },
  },
];
\`\`\`

## New React 19.2 APIs

### Activity Component

Perfect for SwiftFill's multi-form workflow:

\`\`\`tsx
import { Activity } from 'react';

function TROWorkflow() {
  const [currentForm, setCurrentForm] = useState('DV-100');

  return (
    <div>
      {/* Keep form state when switching */}
      <Activity mode={currentForm === 'DV-100' ? 'visible' : 'hidden'}>
        <DV100Form />
      </Activity>

      <Activity mode={currentForm === 'DV-105' ? 'visible' : 'hidden'}>
        <DV105Form />
      </Activity>

      <Activity mode={currentForm === 'FL-150' ? 'visible' : 'hidden'}>
        <FL150Form />
      </Activity>
    </div>
  );
}
\`\`\`

**Benefits:**
- Preserves form state between switches
- Defers hidden component updates
- Unmounts effects for hidden components (saves memory)

### useEffectEvent

Stable event handlers for effects:

\`\`\`tsx
import { useEffectEvent } from 'react';

function AutoSave({ data }) {
  const onSave = useEffectEvent(() => {
    // This always has latest 'data' without causing effect to re-run
    saveToDatabase(data);
  });

  useEffect(() => {
    const interval = setInterval(onSave, 5000);
    return () => clearInterval(interval);
  }, []); // Empty deps - effect never re-runs!
}
\`\`\`

## Performance Optimization Workflow

### Step 1: Record Baseline

1. Open DevTools → Performance
2. Record a typical user flow (fill form, switch pages, export PDF)
3. Note the baseline metrics

### Step 2: Identify Bottlenecks

Look for:
- Long red "Blocking" sections in Scheduler track
- Large component subtrees in Components track
- Repeated renders of the same components

### Step 3: Apply Optimizations

**For blocking updates:**
\`\`\`tsx
import { startTransition } from 'react';

// Before (blocking)
setFieldPositions(newPositions);

// After (non-blocking)
startTransition(() => {
  setFieldPositions(newPositions);
});
\`\`\`

**For preserved state:**
\`\`\`tsx
// Use Activity instead of conditional rendering
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <ExpensiveComponent />
</Activity>
\`\`\`

### Step 4: Verify Improvements

Re-record and compare:
- Fewer red blocking sections
- Smaller component trees
- Better frame rate

## SwiftFill-Specific Optimizations

### FormViewer (800+ field overlays)

The React Compiler automatically memoizes:
- `fieldOverlays` array
- Position calculations
- Event handlers

No manual optimization needed!

### PDF Export

Use `startTransition` for non-blocking export:

\`\`\`tsx
const handleExport = () => {
  startTransition(async () => {
    await exportAndDownloadFL320(formData);
  });
};
\`\`\`

### Multi-Form Workflow

Use Activity for form state preservation:

\`\`\`tsx
// In TROWorkflowWizard.tsx
forms.map((form) => (
  <Activity
    key={form.id}
    mode={currentForm === form.id ? 'visible' : 'hidden'}
  >
    <FormViewer formType={form.type} />
  </Activity>
))
\`\`\`

## Troubleshooting

### Compiler Not Optimizing

Check ESLint output for violations:
- Mutating props or state
- Conditional hooks
- Unsafe external dependencies

### Performance Tracks Not Showing

1. Ensure using Chrome (not Firefox/Safari)
2. Check React version is 19.2+
3. Clear browser cache
4. Disable browser extensions that modify DevTools

### Large Bundle Size

The compiler adds runtime code. This is normal:
- react-core chunk increased from ~205KB to ~734KB
- This includes automatic memoization runtime
- Gzipped size is still reasonable (~222KB)

## Resources

- [React 19.2 Release Blog](https://react.dev/blog/2025/10/01/react-19-2)
- [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Performance Tracks Guide](https://react.dev/learn/react-devtools-performance)
- [Activity Component RFC](https://github.com/reactjs/rfcs/pull/227)

---

*Last updated: November 2025*
*React version: 19.2.0*
*Compiler version: 1.0.0*
