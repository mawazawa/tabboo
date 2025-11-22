/**
 * Liquid Justice Design Tokens
 *
 * Abstraction layer for design system customization.
 * All tokens are defined here and can be overridden for custom themes.
 *
 * Based on:
 * - Design Tokens Community Group v1.0 (October 2025)
 * - Radix Colors for semantic naming
 * - Material Design 3 for elevation system
 */

/* ============================================================================
   COLOR TOKENS
   ========================================================================= */

export const colors = {
  // Base Colors
  light: {
    background: '220 25% 97%',
    foreground: '220 13% 13%',
    card: '0 0% 100%',
    cardForeground: '220 13% 13%',
    popover: '0 0% 100%',
    popoverForeground: '220 13% 13%',
    primary: '215 85% 50%',
    primaryForeground: '0 0% 100%',
    primaryGlow: '215 85% 60%',
    secondary: '220 15% 90%',
    secondaryForeground: '220 13% 13%',
    muted: '220 15% 94%',
    mutedForeground: '220 10% 35%',
    accent: '215 80% 55%',
    accentForeground: '0 0% 100%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    border: '220 15% 88%',
    input: '220 15% 88%',
    ring: '215 85% 50%',
  },
  dark: {
    background: '220 18% 7%',
    foreground: '220 15% 95%',
    card: '220 18% 11%',
    cardForeground: '220 15% 95%',
    popover: '220 18% 13%',
    popoverForeground: '220 15% 95%',
    primary: '215 85% 55%',
    primaryForeground: '0 0% 100%',
    primaryGlow: '215 85% 65%',
    secondary: '220 18% 12%',
    secondaryForeground: '220 15% 95%',
    muted: '220 18% 10%',
    mutedForeground: '220 10% 70%',
    accent: '215 80% 60%',
    accentForeground: '0 0% 100%',
    destructive: '0 70% 55%',
    destructiveForeground: '0 0% 100%',
    border: '220 15% 18%',
    input: '220 15% 18%',
    ring: '215 85% 55%',
  },
} as const;

/* ============================================================================
   SPACING TOKENS (8px Base)
   ========================================================================= */

export const spacing = {
  0: '0px',
  1: '4px',    // 0.5x base
  2: '8px',    // 1x base
  3: '12px',   // 1.5x base
  4: '16px',   // 2x base
  5: '20px',   // 2.5x base
  6: '24px',   // 3x base
  8: '32px',   // 4x base
  10: '40px',  // 5x base
  12: '48px',  // 6x base
  16: '64px',  // 8x base
  20: '80px',  // 10x base
  24: '96px',  // 12x base
  32: '128px', // 16x base
  40: '160px', // 20x base
  48: '192px', // 24x base
  56: '224px', // 28x base
  64: '256px', // 32x base
} as const;

/* ============================================================================
   TYPOGRAPHY TOKENS
   ========================================================================= */

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600', // Recommended for sustained readability
    bold: '700',     // Use sparingly
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

/* ============================================================================
   SHADOW TOKENS
   ========================================================================= */

export const shadows = {
  // 3-Point System (Standard)
  '3point': '0 1px 2px hsl(220 13% 13% / 0.12), 0 4px 8px hsl(220 13% 13% / 0.08), 0 8px 16px hsl(220 13% 13% / 0.06)',
  '3pointHover': '0 2px 4px hsl(220 13% 13% / 0.14), 0 6px 12px hsl(220 13% 13% / 0.1), 0 12px 24px hsl(220 13% 13% / 0.08)',

  // Refined Soft Shadows (Glassmorphic)
  diffused: '0 2px 12px hsl(220 13% 13% / 0.06), 0 8px 24px hsl(220 13% 13% / 0.04), 0 16px 48px hsl(220 13% 13% / 0.02)',
  diffusedHover: '0 4px 16px hsl(220 13% 13% / 0.08), 0 12px 32px hsl(220 13% 13% / 0.06), 0 24px 64px hsl(220 13% 13% / 0.04)',

  // Ultra-Realistic (Premium Elements Only)
  ultra: '0 0.5px 1px hsl(220 13% 13% / 0.04), 0 1px 2px hsl(220 13% 13% / 0.08), 0 2px 4px hsl(220 13% 13% / 0.12), 0 4px 8px hsl(220 13% 13% / 0.16), 0 8px 16px hsl(220 13% 13% / 0.08)',
  ultraHover: '0 1px 2px hsl(220 13% 13% / 0.06), 0 2px 4px hsl(220 13% 13% / 0.10), 0 4px 8px hsl(220 13% 13% / 0.14), 0 8px 16px hsl(220 13% 13% / 0.18), 0 16px 32px hsl(220 13% 13% / 0.12)',

  // Inset Shadows (Embossed effect)
  insetLight: 'inset 0 1px 2px hsl(0 0% 100% / 0.6), inset 0 -1px 1px hsl(220 13% 13% / 0.1)',
  insetDark: 'inset 0 1px 2px hsl(0 0% 100% / 0.15), inset 0 -1px 1px hsl(0 0% 0% / 0.2)',
} as const;

/* ============================================================================
   ANIMATION TOKENS
   ========================================================================= */

export const animations = {
  // Spring Physics (Apple HIG-inspired)
  easing: {
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',        // Gentle spring
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful bounce
    snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',         // Quick response
  },
  duration: {
    fast: '150ms',
    short: '200ms',
    medium: '350ms',
    long: '500ms',
  },
} as const;

/* ============================================================================
   GLASSMORPHISM TOKENS
   ========================================================================= */

export const glass = {
  // Standard Glassmorphism
  standard: {
    bg: 'hsl(0 0% 100% / 0.95)',
    border: 'hsl(220 15% 88% / 0.5)',
    blur: 'blur(12px)',
  },
  // Refined Glassmorphism (Premium 2025)
  refined: {
    bg: 'hsl(0 0% 100% / 0.88)',
    border: 'hsl(220 15% 88% / 0.3)',
    blur: 'blur(20px)',
    shadow: '0 4px 24px hsl(220 13% 13% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.5)',
  },
  // Liquid Glass (Apple-inspired 2025)
  liquid: {
    bg: 'hsl(0 0% 100% / 0.85)',
    border: 'hsl(220 15% 88% / 0.25)',
    blur: 'blur(24px)',
    saturate: 'saturate(180%)',
    shadow: '0 8px 32px hsl(220 13% 13% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.6)',
  },
} as const;

/* ============================================================================
   ACCESSIBILITY TOKENS (WCAG 2.2)
   ========================================================================= */

export const accessibility = {
  // Focus States
  focus: {
    ringWidth: '3px',
    ringOffset: '3px',
    ringColor: 'var(--ring)',
  },
  // Touch Targets (Apple HIG)
  touchTarget: {
    min: '44px',
  },
  // Contrast Ratios
  contrast: {
    aa: '4.5:1',  // Standard WCAG AA
    aaa: '7:1',   // Enhanced WCAG AAA
  },
} as const;

/* ============================================================================
   BORDER RADIUS TOKENS
   ========================================================================= */

export const radii = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded (pills)
} as const;

/* ============================================================================
   ELEVATION TOKENS (Material Design 3 - Dark Mode)
   ========================================================================= */

export const elevation = {
  0: '220 18% 7%',   // Base: #121212
  1: '220 18% 11%',  // +5% white overlay
  2: '220 18% 13%',  // +8% white overlay
  3: '220 18% 15%',  // +11% white overlay
  4: '220 18% 17%',  // +12% white overlay
  5: '220 18% 19%',  // +14% white overlay
} as const;

/* ============================================================================
   BUTTON SIZE TOKENS
   ========================================================================= */

export const buttonSizes = {
  // Height tokens (Tailwind classes)
  heightMd: 'h-11',
  heightSm: 'h-9',
  heightLg: 'h-12',
  heightIcon: 'h-11',
  
  // Min-height tokens (WCAG touch target compliance)
  minHeightMd: 'min-h-[48px]',
  minHeightSm: 'min-h-[48px]',
  minHeightLg: 'min-h-[56px]',
  minHeightIcon: 'min-h-[56px]',
  
  // Width tokens for icon buttons
  widthIcon: 'w-11',
  minWidthIcon: 'min-w-[56px]',
  
  // Complete size class strings for reuse
  default: 'h-11 min-h-[48px] px-6 py-2.5',
  sm: 'h-9 min-h-[48px] rounded-full px-4 py-2',
  lg: 'h-12 min-h-[56px] rounded-full px-10 py-3',
  icon: 'h-11 w-11 min-h-[56px] min-w-[56px]',
} as const;

export const chamferedButtonSizes = {
  // Complete size class strings for ChamferedButton (slightly larger for premium feel)
  default: 'h-12 min-h-[48px] px-8 py-3',
  sm: 'h-10 min-h-[48px] px-6 py-2.5 text-sm',
  lg: 'h-14 min-h-[56px] px-12 py-4 text-base',
  icon: 'h-12 w-12 min-h-[56px] min-w-[56px]',
} as const;

/* ============================================================================
   HAPTIC FEEDBACK TOKENS
   ========================================================================= */

export const haptic = {
  light: { duration: 10, pattern: [10] },
  medium: { duration: 15, pattern: [15] },
  heavy: { duration: 25, pattern: [25] },
  success: { duration: 70, pattern: [10, 50, 10] },  // Double tap
  error: { duration: 100, pattern: [25, 50, 25] },   // Alert pulse
  selection: { duration: 5, pattern: [5] },          // Minimal tick
} as const;

/* ============================================================================
   EXPORT ALL TOKENS
   ========================================================================= */

export const tokens = {
  colors,
  spacing,
  typography,
  shadows,
  animations,
  glass,
  accessibility,
  radii,
  elevation,
  buttonSizes,
  chamferedButtonSizes,
  haptic,
} as const;

export default tokens;

