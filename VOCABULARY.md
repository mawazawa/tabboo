# UX/UI Design Vocabulary & Principles

A comprehensive reference for user experience design patterns, cognitive principles, and interface terminology. This document serves as both a learning resource and a machine-readable specification for recreating design systems.

---

## Table of Contents
- [Cognitive Ergonomics](#cognitive-ergonomics)
- [Spatial Design Patterns](#spatial-design-patterns)
- [Visual Hierarchy](#visual-hierarchy)
- [Interaction Patterns](#interaction-patterns)
- [Information Architecture](#information-architecture)
- [Design Systems](#design-systems)

---

## Cognitive Ergonomics

### Definition
**Technical**: The science of designing interfaces to minimize cognitive load by aligning with human mental models, working memory limitations, and perceptual capabilities.

**Layman**: Making things easier to understand and use by working with how your brain naturally thinks, not against it.

### Key Principles

#### 1. Cognitive Load Reduction
- **What it is**: Minimizing the mental effort required to complete a task
- **Why it matters**: Users have limited working memory (7±2 items). Exceeding this causes errors and fatigue.
- **Implementation**:
  ```typescript
  // ❌ High cognitive load - user must remember multiple states
  <form>
    <input name="field1" /> {/* somewhere on screen */}
    <input name="field2" /> {/* scrolled out of view */}
    <input name="field3" /> {/* user must hunt for it */}
  </form>

  // ✅ Low cognitive load - predictable, anchored position
  <div className="fixed top-24">
    <input /> {/* Always appears in same position */}
  </div>
  <div className="scroll-container">
    {/* Content scrolls to meet the anchored position */}
  </div>
  ```

#### 2. Spatial Constancy
- **Technical**: Maintaining consistent screen coordinates for interactive elements to build muscle memory
- **Layman**: Things appear in the same spot every time, so you know where to look without thinking
- **Example**: 
  - macOS menu bar is always at the top
  - Save button always in same toolbar position
  - Form field appears at same Y-coordinate regardless of which field is active

```css
/* Anchored Field Pattern */
.field-anchor-zone {
  position: sticky;
  top: 120px; /* Fixed Y-coordinate */
  z-index: 10;
}

.scrolling-content {
  /* Content translates to position active field in anchor zone */
  scroll-behavior: smooth;
  transform: translateY(calc(-1 * var(--scroll-offset)));
}
```

#### 3. Progressive Disclosure
- **Technical**: Revealing interface complexity gradually, presenting only relevant information at each decision point
- **Layman**: Show people what they need, when they need it—don't overwhelm them with everything at once
- **Implementation**: Accordion menus, step-by-step wizards, "Advanced options" toggles

---

## Spatial Design Patterns

### Anchored Interaction Zone
**Pattern**: A fixed viewport area where user interaction consistently occurs, with content intelligently translating to meet this zone.

**Problem Solved**: Viewport jumping, unpredictable focus locations, visual search overhead

**Technical Specification**:
```typescript
interface AnchoredZoneConfig {
  anchorY: number;        // Fixed Y-coordinate in viewport
  scrollContainer: HTMLElement;
  activeElement: HTMLElement;
}

function scrollToAnchor(config: AnchoredZoneConfig) {
  const { anchorY, scrollContainer, activeElement } = config;
  
  // Calculate offset to position element at anchor point
  const elementRect = activeElement.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  
  const scrollOffset = elementRect.top - containerRect.top - anchorY;
  
  scrollContainer.scrollBy({
    top: scrollOffset,
    behavior: 'smooth'
  });
}
```

**Real-world Examples**:
- Form field always appears at 1/3 down the screen
- Search results fixed at top, page content scrolls beneath
- Video player controls anchored to bottom, timeline scrubs to position

### Sticky Header with Scrollable Body
**Pattern**: Fixed header creates a stable reference frame while content scrolls beneath it independently.

**CSS Implementation**:
```css
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: hsl(var(--background) / 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid hsl(var(--border));
}

.scrollable-body {
  overflow-y: auto;
  height: calc(100vh - var(--header-height));
  scroll-behavior: smooth;
}
```

### Three-Tier Visual Hierarchy
**Pattern**: Fixed header → Anchored interaction zone → Scrollable content track

**Purpose**: Creates independent scroll contexts with predictable spatial relationships

```html
<div class="container">
  <!-- Tier 1: Fixed Reference Frame -->
  <header class="sticky top-0 z-30">
    Controls that never move
  </header>
  
  <!-- Tier 2: Anchored Interaction Zone -->
  <div class="sticky top-[80px] z-20">
    Active field always appears here
  </div>
  
  <!-- Tier 3: Scrollable Content -->
  <div class="scroll-content">
    Content that translates to position items in Tier 2
  </div>
</div>
```

---

## Visual Hierarchy

### Glassmorphism
**Technical**: Semi-transparent surfaces with backdrop blur creating depth through layered translucency

**Implementation**:
```css
.glass-surface {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid hsl(var(--border) / 0.3);
  box-shadow: 
    0 8px 32px hsl(var(--shadow) / 0.12),
    inset 0 1px 0 hsl(var(--foreground) / 0.1);
}
```

**Apple-level Refinement**:
- Blur radius: 20-40px for soft, premium feel
- Transparency: 70-90% to maintain readability
- Edge treatment: Subtle inner highlight (1px) + minimal border
- Shadow: Soft, multi-layer shadows for depth

### Z-Index Stack Architecture
**Purpose**: Systematic layering prevents stacking context conflicts

```typescript
// Design system z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
```

---

## Interaction Patterns

### Smooth Scrolling vs. Instant Jump
**When to use smooth**:
- User-initiated navigation (clicks, keyboard shortcuts)
- Small distances (< viewport height)
- Drawing attention to position change

**When to use instant**:
- Programmatic scrolls from external triggers
- Large distances (multiple pages)
- Restoring saved positions

```typescript
// Smooth: User can perceive the motion
element.scrollIntoView({ 
  behavior: 'smooth', 
  block: 'center' 
});

// Instant: Position restoration
element.scrollIntoView({ 
  behavior: 'auto', 
  block: 'start' 
});
```

### Focus Management
**Principle**: Focus should follow user intent, not interrupt workflow

```typescript
// ✅ Good: Focus moves with user action
onFieldChange={() => {
  setActiveField(nextField);
  nextField.focus(); // Expected behavior
}

// ❌ Bad: Programmatic focus interrupts user
useEffect(() => {
  // Don't auto-focus on every state change
  inputRef.current?.focus();
}, [someState]);
```

### Keyboard Navigation Patterns
**Standards**:
- `Tab`: Next field
- `Shift+Tab`: Previous field
- `Cmd/Ctrl+K`: Command palette
- `Cmd/Ctrl+F`: Search
- `Esc`: Close modal/dismiss
- `Enter`: Submit/confirm
- `Space`: Toggle selection

```typescript
// Keyboard shortcut handler
const handleKeyDown = (e: KeyboardEvent) => {
  const isMac = navigator.platform.includes('Mac');
  const modifier = isMac ? e.metaKey : e.ctrlKey;
  
  if (modifier && e.key === 'f') {
    e.preventDefault();
    openSearch();
  }
};
```

---

## Information Architecture

### Information Scent
**Technical**: The degree to which interface elements suggest the content or functionality they provide access to

**Layman**: How well labels, icons, and visual cues tell you what you'll get before you click

**Strong Scent Example**:
```tsx
<Button>
  <Download className="mr-2" />
  Download PDF Invoice
</Button>
// Clear: Icon + specific action + format
```

**Weak Scent Example**:
```tsx
<Button>Click Here</Button>
// Unclear: No context about outcome
```

### Content Density
**Principle**: Balance information richness with whitespace for optimal comprehension

**Formula**:
```
Optimal Density = (Useful Information) / (Total Visual Space)

Too Dense: > 0.7 (cramped, overwhelming)
Optimal: 0.4-0.6 (balanced, scannable)
Too Sparse: < 0.3 (inefficient, requires excessive scrolling)
```

**Implementation**:
```css
/* Content density control */
.content-container {
  max-width: 65ch; /* Optimal reading line length */
  line-height: 1.6; /* Comfortable text density */
  padding: clamp(1rem, 3vw, 2rem); /* Responsive spacing */
}
```

---

## Design Systems

### Semantic Tokens
**Purpose**: Decouple visual properties from implementation, enabling consistent theming

**Architecture**:
```css
/* ❌ Direct color usage - not themeable */
.button {
  background: #3b82f6;
  color: #ffffff;
}

/* ✅ Semantic tokens - theme-aware */
.button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Design tokens in index.css */
:root {
  /* Primitives */
  --blue-500: 217 91% 60%;
  --gray-900: 222 47% 11%;
  
  /* Semantic tokens reference primitives */
  --primary: var(--blue-500);
  --foreground: var(--gray-900);
}

[data-theme="dark"] {
  --primary: var(--blue-400);
  --foreground: var(--gray-50);
}
```

### Component Variants via CVA
**Pattern**: Systematic variant management using class-variance-authority

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-lg font-medium transition-all",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-11 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
```

### Animation Timing Functions
**Principle**: Match animation curves to physical metaphors

```css
/* Spring physics (Apple-style) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth deceleration */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);

/* Acceleration into screen */
--ease-in-quint: cubic-bezier(0.64, 0, 0.78, 0);

/* Standard ease */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Duration Guidelines**:
- Micro-interactions: 100-200ms (hover, focus)
- Transitions: 200-300ms (expand, collapse)
- Page transitions: 300-500ms (route changes)
- Attention-grabbing: 500-800ms (modals, toasts)

---

## Advanced Patterns

### Scroll-Linked Animations
**Use case**: Create visual connections between scroll position and UI state

```typescript
const useScrollProgress = (containerRef: RefObject<HTMLElement>) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScroll = scrollHeight - clientHeight;
      const currentProgress = totalScroll > 0 ? scrollTop / totalScroll : 0;
      setProgress(currentProgress);
    };
    
    container.addEventListener('scroll', updateProgress);
    return () => container.removeEventListener('scroll', updateProgress);
  }, [containerRef]);
  
  return progress;
};
```

### Optimistic UI Updates
**Pattern**: Update UI immediately, reconcile with server asynchronously

```typescript
const optimisticUpdate = async (field: string, value: string) => {
  // 1. Update local state immediately
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // 2. Show optimistic feedback
  setIsSaving(true);
  
  try {
    // 3. Sync with server
    await saveToServer(field, value);
    setIsSaving(false);
  } catch (error) {
    // 4. Rollback on failure
    setFormData(prev => ({ ...prev, [field]: previousValue }));
    showError("Failed to save");
  }
};
```

### Micro-interactions
**Definition**: Small, functional animations that provide feedback and guidance

**Examples**:
```css
/* Button press feedback */
.button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Input focus ring */
.input:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  transition: outline-offset 0.2s ease;
}

/* Loading state shimmer */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## Accessibility Considerations

### Focus Indicators
**Requirement**: 3:1 contrast ratio with adjacent colors (WCAG 2.2)

```css
.interactive-element:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  /* Never use outline: none without a visible alternative */
}
```

### Screen Reader Patterns
```tsx
// ✅ Semantic HTML + ARIA labels
<nav aria-label="Primary navigation">
  <button aria-expanded={isOpen} aria-controls="menu">
    Menu
  </button>
</nav>

// ✅ Hidden but accessible content
<span className="sr-only">Loading...</span>

// ✅ Dynamic announcements
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### Keyboard-Only Navigation
**Test**: Can every interactive element be reached and activated with keyboard alone?

**Requirements**:
- Logical tab order
- Skip links for long navigation
- Focus trap in modals
- Escape key to dismiss overlays

---

## Performance Considerations

### Layout Thrashing Prevention
```typescript
// ❌ Causes reflow on every iteration
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = `${height + 10}px`; // Write
});

// ✅ Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = `${heights[i] + 10}px`; // All writes
});
```

### Virtual Scrolling
**Use case**: Rendering thousands of items efficiently

```typescript
// Only render visible items + buffer
const visibleItems = allItems.slice(
  Math.max(0, startIndex - bufferSize),
  Math.min(allItems.length, endIndex + bufferSize)
);
```

---

## Glossary

- **Affordance**: Visual property suggesting how an object should be used (buttons look pressable)
- **Fitts's Law**: Time to acquire target = function of distance and size (bigger, closer = faster)
- **Gestalt Principles**: How humans perceive visual groupings (proximity, similarity, closure)
- **Hick's Law**: Decision time increases logarithmically with number of choices
- **Miller's Law**: Average person holds 7±2 items in working memory
- **Progressive Enhancement**: Build core functionality first, enhance for capable browsers
- **Responsive Design**: Adapting layout to viewport size, not just scaling
- **Visual Weight**: Perceived importance of elements based on size, color, position

---

## References

### Books
- "Don't Make Me Think" by Steve Krug
- "The Design of Everyday Things" by Don Norman
- "About Face: The Essentials of Interaction Design" by Alan Cooper

### Standards
- WCAG 2.2 (Web Content Accessibility Guidelines)
- Material Design 3
- Apple Human Interface Guidelines
- Inclusive Design Principles

### Tools
- Contrast checkers (APCA, WCAG)
- Animation timing visualizers
- Layout debugging tools

---

*This vocabulary serves as a living document. Add new patterns and principles as they emerge in your design practice.*
