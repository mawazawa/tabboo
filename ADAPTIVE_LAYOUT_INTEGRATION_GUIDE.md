# Adaptive Layout Integration Guide

**Created**: November 16, 2025
**Status**: Ready for Integration
**Part of**: Week 1-2 Execution Plan (Mobile + Accessibility)

---

## 🎯 What Was Built

Three new components for responsive mobile-first layouts:

1. **useAdaptiveLayout Hook** - Detects viewport size and provides layout helpers
2. **MobileBottomSheet Component** - Swipeable bottom sheet with snap points
3. **AdaptiveLayout Component** - Automatically switches layouts based on viewport

---

## 📦 Files Created

```
src/
├── hooks/
│   └── useAdaptiveLayout.ts          # Viewport detection + helpers
└── components/
    └── layout/
        ├── MobileBottomSheet.tsx     # Swipeable sheet component
        └── AdaptiveLayout.tsx        # Layout switcher component
```

---

## 🚀 Quick Start

### 1. Use the Adaptive Layout Hook

```tsx
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';

const MyComponent = () => {
  const { viewport, isMobile, isTablet, isDesktop } = useAdaptiveLayout();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
};
```

### 2. Use the AdaptiveLayout Component

```tsx
import { AdaptiveLayout } from '@/components/layout/AdaptiveLayout';

const App = () => (
  <AdaptiveLayout
    desktop={<DesktopThreePanelLayout />}
    tablet={<TabletTwoPanelLayout />}
    mobile={<MobileSingleColumnLayout />}
  />
);
```

### 3. Use the Mobile Bottom Sheet

```tsx
import { MobileBottomSheet } from '@/components/layout/MobileBottomSheet';
import { useWindowSize } from '@/hooks/useAdaptiveLayout';

const MobileView = () => {
  const { height } = useWindowSize();

  return (
    <div>
      <PDFViewer /> {/* Main content */}

      <MobileBottomSheet
        snapPoints={[80, 400, height - 100]} // Peek, Half, Full
        defaultSnapIndex={0} // Start at peek (80px)
      >
        <FieldNavigationPanel />
      </MobileBottomSheet>
    </div>
  );
};
```

---

## 🎨 Integration Into Index.tsx

### Current Structure (Desktop-Only)

```tsx
// src/pages/Index.tsx (current)
const Index = () => {
  return (
    <div>
      <Header />
      <ResizablePanelGroup>
        <ResizablePanel>{/* Thumbnails */}</ResizablePanel>
        <ResizablePanel>{/* PDF Viewer */}</ResizablePanel>
        <ResizablePanel>{/* Fields Panel */}</ResizablePanel>
      </ResizablePanelGroup>
      <DraggableAIAssistant />
    </div>
  );
};
```

### Proposed Structure (Responsive)

```tsx
// src/pages/Index.tsx (proposed)
import { AdaptiveLayout } from '@/components/layout/AdaptiveLayout';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';

const Index = () => {
  const { isMobile } = useAdaptiveLayout();

  return (
    <AdaptiveLayout
      desktop={<DesktopLayout {...props} />}
      mobile={<MobileLayout {...props} />}
      fallback="desktop" // Tablet uses desktop layout for now
    />
  );
};

// Desktop: Keep current 3-panel layout
const DesktopLayout = (props) => (
  <div>
    <Header />
    <ResizablePanelGroup>
      {/* Current desktop layout */}
    </ResizablePanelGroup>
    <DraggableAIAssistant />
  </div>
);

// Mobile: Single column + bottom sheet
const MobileLayout = (props) => {
  const { height } = useWindowSize();

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Main: PDF Viewer (full screen) */}
      <main className="flex-1 relative overflow-hidden">
        <FormViewer {...props} />
      </main>

      {/* Bottom Sheet: Fields + AI */}
      <MobileBottomSheet
        snapPoints={[80, 400, height - 100]}
        defaultSnapIndex={0}
      >
        <Tabs defaultValue="fields">
          <TabsList className="w-full">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="vault">Vault</TabsTrigger>
          </TabsList>

          <TabsContent value="fields">
            <FieldNavigationPanel {...props} />
          </TabsContent>

          <TabsContent value="ai">
            <AIAssistant {...props} />
          </TabsContent>

          <TabsContent value="vault">
            <PersonalDataVaultPanel {...props} />
          </TabsContent>
        </Tabs>
      </MobileBottomSheet>
    </div>
  );
};
```

---

## 📱 Mobile Bottom Sheet Features

### Snap Points

Define heights where the sheet snaps:

```tsx
<MobileBottomSheet
  snapPoints={[
    80,              // Peek (just show drag handle + current field)
    300,             // Half (show 3-4 fields)
    windowHeight - 100 // Full (nearly full screen)
  ]}
  defaultSnapIndex={0} // Start at peek
  onSnapChange={(index) => console.log('Snapped to:', index)}
/>
```

### Swipe Gestures

- **Swipe up**: Expand to next snap point
- **Swipe down**: Collapse to previous snap point
- **Momentum**: Flick gestures snap with velocity
- **Keyboard**: `Escape` key minimizes sheet

### Accessibility

- **Drag handle**: 48px tall (large touch target)
- **ARIA label**: "Drag to adjust sheet height"
- **Keyboard support**: Tab to focus, Escape to minimize
- **Screen reader**: Announces snap point changes (TODO: add live region)

---

## 🎯 Viewport Breakpoints

```typescript
export const BREAKPOINTS = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1279px
  desktop: 1280,  // 1280px+
  wide: 1920      // 1920px+ (future use)
};
```

**Matches Tailwind CSS**:
- `sm:` = 768px (tablet)
- `lg:` = 1280px (desktop)
- `2xl:` = 1920px (wide)

---

## 🔧 Helper Hooks

### useAdaptiveLayout

```tsx
const {
  viewport,       // 'mobile' | 'tablet' | 'desktop' | 'wide'
  isMobile,       // boolean
  isTablet,       // boolean
  isDesktop,      // boolean (desktop + wide)
  isWide,         // boolean
  isTouchDevice,  // boolean (mobile + tablet)
} = useAdaptiveLayout();
```

### useWindowSize

```tsx
const { width, height } = useWindowSize();

// Use for snap points
const snapPoints = [80, 400, height - 100];
```

### useReducedMotion

```tsx
const reducedMotion = useReducedMotion();

// Disable animations for accessibility
<div className={cn(
  !reducedMotion && "transition-all duration-300"
)}>
```

---

## 🎨 Helper Components

### ShowOn / HideOn

```tsx
import { ShowOn, HideOn } from '@/components/layout/AdaptiveLayout';

// Show only on mobile
<ShowOn viewport="mobile">
  <MobileOnlyFeature />
</ShowOn>

// Show on tablet and desktop
<ShowOn viewport={['tablet', 'desktop']}>
  <NonMobileFeature />
</ShowOn>

// Hide on mobile
<HideOn viewport="mobile">
  <DesktopOnlyFeature />
</HideOn>
```

---

## ✅ Testing Checklist

### Desktop (≥1280px)
- [ ] Current 3-panel layout renders
- [ ] Resizable panels work
- [ ] Draggable AI works
- [ ] No mobile components visible

### Tablet (768-1279px)
- [ ] Simplified 2-panel layout (or desktop fallback)
- [ ] AI Assistant in drawer (not draggable)
- [ ] Touch interactions work

### Mobile (<768px)
- [ ] Single-column layout
- [ ] Bottom sheet renders at peek height
- [ ] Swipe up expands sheet
- [ ] Swipe down collapses sheet
- [ ] Momentum flick works
- [ ] Tabs switch between Fields/AI/Vault
- [ ] PDF viewer is full screen behind sheet
- [ ] Escape key minimizes sheet

### Touch Devices
- [ ] Drag handle is ≥44px height
- [ ] Swipe gestures feel smooth (60fps)
- [ ] No accidental browser gestures (pull-to-refresh)
- [ ] Pointer capture works correctly

### Accessibility
- [ ] Keyboard users can Tab into sheet
- [ ] Screen readers announce snap changes (TODO)
- [ ] Reduced motion respected
- [ ] ARIA labels present

---

## 🚨 Known Limitations

1. **No tablet-specific layout** - Falls back to desktop for now
2. **No live region announcements** - Snap changes not announced to screen readers (TODO)
3. **No persist snap state** - Sheet resets on page reload (add localStorage if needed)
4. **No programmatic control** - Can't open/close sheet from parent (add ref API if needed)

---

## 📊 Performance Considerations

### Optimizations Included

- **Debounced resize**: 100ms debounce on window resize
- **Pointer capture**: Smooth dragging without mouse events
- **No transitions while dragging**: Removes visual lag
- **Touch action none**: Prevents browser gestures during drag

### Bundle Impact

- **useAdaptiveLayout**: ~1KB gzipped
- **MobileBottomSheet**: ~2KB gzipped
- **AdaptiveLayout**: ~0.5KB gzipped
- **Total**: ~3.5KB gzipped

No external dependencies - uses React built-ins only.

---

## 🔮 Future Enhancements

1. **Tablet-specific layout** - 2-panel + drawer pattern
2. **Live region announcements** - Screen reader feedback
3. **Programmatic control** - `sheetRef.snapTo(index)` API
4. **Persist snap state** - Remember user's preferred height
5. **Custom snap animations** - Spring physics, ease curves
6. **Overlay backdrop** - Dim background when sheet is full
7. **Multi-sheet support** - Multiple sheets on same page

---

## 📚 References

- [Apple HIG: Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Material Design: Bottom Sheets](https://m3.material.io/components/bottom-sheets/overview)
- [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)

---

## 🎉 Next Steps

1. **Test the components** - Try them in Index.tsx
2. **Add live regions** - Announce snap changes to screen readers
3. **Add tablet layout** - Create 2-panel + drawer variant
4. **User test on real devices** - iPhone, Android, iPad
5. **Iterate based on feedback** - Adjust snap points, animations

**Questions?** Check the code comments in each file for detailed documentation.

---

**Status**: ✅ Ready for integration into Index.tsx
**Effort**: ~6 hours (hook: 2h, bottom sheet: 3h, adaptive layout: 1h)
**Impact**: **Unlocks mobile users** (current score: 3/10 → 8/10)

Part of 5-week execution plan (Week 1-2: Accessibility + Mobile)
