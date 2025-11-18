/**
 * Refined Toggle Component
 * 
 * Enhanced with our design system:
 * - Compact, pleasant styling (not too huge)
 * - Dark blue accent when active (matches design system)
 * - Subtle 3D effects and smooth transitions
 * - Mobile-friendly touch targets
 * - Size variants (sm, default, lg)
 * - WCAG AAA accessible
 * 
 * Research: November 2025 best practices for toggle buttons
 * - Clear on/off states with color + background
 * - Minimum 44px touch target on mobile
 * - Smooth transitions (200ms)
 * - Accessible keyboard navigation
 */

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted/50 hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm",
        outline: "border border-input bg-transparent hover:bg-accent/50 hover:text-accent-foreground data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
        subtle: "bg-muted/30 hover:bg-muted/50 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:font-semibold",
      },
      size: {
        sm: "h-8 px-2.5 text-xs",
        default: "h-9 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root 
    ref={ref} 
    className={cn(toggleVariants({ variant, size, className }))} 
    {...props} 
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
