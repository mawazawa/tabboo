# SwiftFill Design System Reference
**Last Updated**: November 2025

## Overview

SwiftFill uses a **semantic token-based design system** built on Tailwind CSS with HSL color primitives. The system emphasizes:
- **Premium aesthetics** (chamfered components, 3-point shadows, gradients)
- **Accessibility** (WCAG 2.2 Level AA compliance)
- **Performance** (GPU-accelerated transforms, minimal bundle impact)
- **Consistency** (8px grid system, semantic tokens)

---

## Color System

### Semantic Tokens (HSL Format)

**Primary Palette:**
- `--primary`: `215 85% 50%` (Blue - main brand color)
- `--primary-foreground`: `0 0% 100%` (White text on primary)
- `--primary-glow`: `215 85% 60%` (Lighter blue for gradients/glows)

**Neutral Palette:**
- `--background`: `220 25% 97%` (Light gray background)
- `--foreground`: `220 13% 13%` (Dark text)
- `--muted`: `220 15% 94%` (Subtle backgrounds)
- `--muted-foreground`: `220 10% 35%` (Secondary text)

**Semantic Colors:**
- `--accent`: `215 80% 55%` (Interactive elements)
- `--destructive`: `0 84% 60%` (Errors, deletions)
- `--border`: `220 15% 88%` (Borders, dividers)
- `--ring`: `215 85% 50%` (Focus rings)

### Dark Mode
All tokens have `.dark` variants with adjusted lightness values for optimal contrast.

---

## Typography

**Current State:**
- System sans-serif (no custom font loading)
- Font weights: normal (400), bold (700)
- Base size: 16px (prevents iOS zoom)
- Line height: 1.5 (default)

**Typography Scale:**
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)

---

## Spacing System

**8px Grid System** (implicit):
- `gap-1`: 4px
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px
- `gap-6`: 24px
- `gap-8`: 32px

**Padding/Margin Scale:**
- `p-1` to `p-8`: 4px to 32px (multiples of 4px)

---

## Component Patterns

### 1. Chamfered Components
**Purpose**: 3D embossed effect for premium feel

**CSS Class**: `.chamfered`

**Implementation:**
```css
.chamfered {
  background: var(--gradient-chamfer);
  box-shadow: var(--shadow-chamfer);
  position: relative;
}
```

**Usage**: Cards, buttons, elevated surfaces

### 2. Premium Buttons
**Variants**: `default`, `destructive`, `outline`, `ghost`, `secondary`

**Features:**
- Gradient backgrounds (`bg-gradient-to-br`)
- Multi-layer shadows (inset + external)
- Hover lift effect (`translate-y-[-0.5px]`)
- Active press effect (`translate-y-[0.5px]`)

### 3. Glassmorphic Surfaces
**Pattern**: Semi-transparent with backdrop blur

**Characteristics:**
- `bg-background/95` (95% opacity)
- `backdrop-blur-sm` (blur effect)
- `border` with low opacity
- `shadow-lg` for depth

**Usage**: Floating panels, modals, sticky headers

### 4. 3-Point Shadow System
**Purpose**: Creates depth hierarchy

**Shadows:**
- `--shadow-soft`: Subtle elevation
- `--shadow-medium`: Medium elevation
- `--shadow-large`: High elevation
- `--shadow-3point`: Multi-layer premium shadow
- `--shadow-glow`: Colored glow effects

---

## Border System

### Hairline Borders
**Class**: `.border-hairline` (0.1px precision)

**Purpose**: Ultra-thin borders for modern aesthetic

**Usage**: Dividers, subtle separations

---

## Animation & Transitions

### Standard Transition
**Variable**: `--transition-smooth`
**Value**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### Keyframe Animations
- `float`: Subtle floating animation (120s infinite)
- `accordion-down/up`: Radix UI accordion animations

### Micro-interactions
- Hover: `hover:scale-105` (5% scale increase)
- Active: `active:scale-95` (5% scale decrease)
- Focus: `focus-visible:ring-2` (2px focus ring)

---

## Accessibility

### Touch Targets
**Minimum**: `44px × 44px` (WCAG 2.2 Level AA)

**Implementation:**
```css
--touch-target-min: 44px;
```

### Screen Reader Support
**Class**: `.sr-only` (visually hidden, accessible to screen readers)

### Focus Management
- Visible focus rings on all interactive elements
- Keyboard navigation support
- ARIA labels on icon-only buttons

---

## Component Library

### Base Components (shadcn/ui)
- Button, Card, Input, Textarea, Checkbox
- Dialog, Tooltip, Tabs, Sheet
- All built on Radix UI primitives

### Custom Components
- `FieldOverlay`: PDF form field overlays
- `DraggableAIAssistant`: Floating AI chat panel
- `FormViewer`: PDF rendering with field management
- `FieldNavigationPanel`: Sequential field navigation

---

## Design Principles

1. **Semantic Over Presentational**: Use semantic tokens, not direct colors
2. **Progressive Enhancement**: Base styles work, enhancements add polish
3. **Performance First**: GPU-accelerated transforms, minimal repaints
4. **Accessibility by Default**: WCAG 2.2 Level AA minimum
5. **Consistency**: Reuse design tokens, maintain visual rhythm

---

## New Design Tokens (November 2025)

### Transition Tokens
- `--transition-fast`: `0.15s` - Quick micro-interactions
- `--transition-spring`: `0.4s cubic-bezier(0.34, 1.56, 0.64, 1)` - Bouncy animations

### Glassmorphic Tokens
- `--glass-bg`: Semi-transparent background (95% opacity)
- `--glass-border`: Subtle border with 50% opacity
- `--glass-blur`: `blur(12px)` backdrop filter

**Utility Class**: `.glass-surface` - Applies all glassmorphic properties

### Micro-interaction Scales
- `--scale-hover`: `1.05` (5% scale on hover)
- `--scale-active`: `0.95` (5% scale on press)
- `--scale-focus`: `1.02` (2% scale on focus)

**Utility Class**: `.interactive` - Applies smooth hover/active/focus transitions

---

## Future Enhancements (Planned)

1. **Custom Typography**: Load custom font (e.g., Inter, Geist)
2. **Enhanced Animations**: Framer Motion integration
3. **Micro-interactions**: More hover/active states (✅ Partially implemented)
4. **Visual Hierarchy**: Improved depth system (✅ Enhanced with glassmorphic)
5. **Brand Personality**: More distinctive color palette

---

## Integration Points

### CodePen Inspiration
The following CodePen examples will be integrated:
- `bNpWXex`: [Pattern to be analyzed when accessible]
- `xbVdMqW`: [Pattern to be analyzed when accessible]
- `emZRONg`: [Pattern to be analyzed when accessible]

**Approach**: Extract reusable patterns, convert to design tokens, apply incrementally without breaking changes.

**Current Status**: Design tokens added for glassmorphic surfaces and micro-interactions. Ready for pattern integration.

