/**
 * Chamfered Button Component
 *
 * Premium 3D button with detailed beveled edges and realistic lighting.
 * Inspired by physical buttons with machined edges (CNC aesthetic).
 *
 * RESEARCH BACKING:
 * - Skeuomorphic details create tactile expectations (increases button confidence)
 * - 3D chamfer edges signal "pressable" affordance (Gibson's affordance theory)
 * - Light refraction on beveled edges mimics premium materials (glass, metal)
 * - Inset highlights + shadows create depth perception
 *
 * PSYCHOLOGY:
 * - Bevel = physical button = "I can press this"
 * - Light simulation = premium craftsmanship
 * - Subtle depth = tactile invitation
 * - Press animation satisfies expectation (completes mental model)
 *
 * USER IMPACT:
 * - Increases click confidence (clear affordance)
 * - Feels premium, crafted (not flat/digital)
 * - Satisfying press feedback
 * - Memorable interaction (users remember "that 3D button")
 *
 * TECHNICAL:
 * - Multiple box-shadow layers for light simulation
 * - Pseudo-elements for bevel edges
 * - Gradient backgrounds for light refraction
 * - Transform on active state (press depth)
 *
 * @see Apple's HIG (skeuomorphic affordances)
 * @see https://www.nngroup.com/articles/skeuomorphism/
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { triggerHaptic, type HapticPattern } from "@/lib/haptics";
import { chamferedButtonSizes } from "@/tokens";

const chamferedButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight ring-offset-background focus-wcag-enhanced disabled:pointer-events-none disabled:opacity-50 overflow-hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Deep electric blue with detailed 3D chamfer
        primary: cn(
          "bg-primary text-primary-foreground",
          // Multi-layer shadow system (5 layers + inset highlights)
          "shadow-[",
          "inset_0_1px_2px_hsl(0_0%_100%/0.3),", // Top highlight (light source)
          "inset_0_-2px_4px_hsl(215_85%_20%/0.4),", // Bottom dark (depth)
          "inset_-1px_0_2px_hsl(215_85%_30%/0.3),", // Left edge
          "inset_1px_0_2px_hsl(0_0%_100%/0.2),", // Right highlight
          "0_1px_1px_hsl(220_13%_13%/0.08),", // Contact shadow
          "0_2px_4px_hsl(220_13%_13%/0.12),", // Key light shadow
          "0_4px_8px_hsl(220_13%_13%/0.16),", // Ambient shadow
          "0_8px_16px_hsl(220_13%_13%/0.08)", // Atmospheric glow
          "]",
          // Hover: Lift + enhanced highlights
          "hover:shadow-[",
          "inset_0_1px_2px_hsl(0_0%_100%/0.4),",
          "inset_0_-2px_4px_hsl(215_85%_20%/0.5),",
          "inset_-1px_0_2px_hsl(215_85%_30%/0.4),",
          "inset_1px_0_2px_hsl(0_0%_100%/0.3),",
          "0_2px_4px_hsl(220_13%_13%/0.12),",
          "0_4px_8px_hsl(220_13%_13%/0.14),",
          "0_8px_16px_hsl(220_13%_13%/0.18),",
          "0_16px_32px_hsl(220_13%_13%/0.12)",
          "]",
          "hover:translate-y-[-3px]",
          // Active: Press down (inset shadow flips)
          "active:shadow-[",
          "inset_0_3px_6px_hsl(215_85%_20%/0.6),", // Top dark (pressed)
          "inset_0_-1px_2px_hsl(0_0%_100%/0.15),", // Bottom highlight
          "0_1px_2px_hsl(220_13%_13%/0.05)",
          "]",
          "active:translate-y-[1px]"
        ),

        // Chamfered glass (translucent with edge highlights)
        glass: cn(
          "bg-background/60 backdrop-blur-xl text-foreground border border-border/50",
          "shadow-[",
          "inset_0_1px_2px_hsl(0_0%_100%/0.8),",
          "inset_0_-1px_2px_hsl(220_13%_13%/0.1),",
          "0_2px_8px_hsl(220_13%_13%/0.06),",
          "0_8px_24px_hsl(220_13%_13%/0.04)",
          "]",
          "hover:shadow-[",
          "inset_0_1px_2px_hsl(0_0%_100%/0.9),",
          "inset_0_-1px_2px_hsl(220_13%_13%/0.15),",
          "0_4px_12px_hsl(220_13%_13%/0.08),",
          "0_12px_32px_hsl(220_13%_13%/0.06)",
          "]",
          "hover:translate-y-[-2px]",
          "active:shadow-[inset_0_2px_4px_hsl(220_13%_13%/0.15)]",
          "active:translate-y-[0]"
        ),

        // Metallic chamfer (silver/chrome effect)
        metallic: cn(
          "bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-foreground",
          "shadow-[",
          "inset_0_1px_2px_hsl(0_0%_100%/0.6),",
          "inset_0_-2px_4px_hsl(220_13%_13%/0.3),",
          "0_2px_4px_hsl(220_13%_13%/0.12),",
          "0_4px_8px_hsl(220_13%_13%/0.16)",
          "]",
          "hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:to-slate-700",
          "hover:translate-y-[-2px]",
          "active:shadow-[inset_0_3px_6px_hsl(220_13%_13%/0.4)]",
          "active:translate-y-[1px]"
        ),
      },
      size: {
        default: chamferedButtonSizes.default,
        sm: chamferedButtonSizes.sm,
        lg: chamferedButtonSizes.lg,
        icon: chamferedButtonSizes.icon,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ChamferedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chamferedButtonVariants> {
  asChild?: boolean;
  haptic?: HapticPattern;

  /** Chamfer depth (subtle, medium, deep) */
  chamferDepth?: "subtle" | "medium" | "deep";

  /** Enable glow effect on hover */
  glow?: boolean;
}

export const ChamferedButton = React.forwardRef<HTMLButtonElement, ChamferedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      haptic,
      chamferDepth = "medium",
      glow = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Wrap onClick to trigger haptic feedback
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (haptic) {
          triggerHaptic(haptic);
        }
        onClick?.(e);
      },
      [haptic, onClick]
    );

    return (
      <Comp
        className={cn(
          chamferedButtonVariants({ variant, size }),
          "transition-all duration-200",
          glow && variant === "primary" && "hover:shadow-[0_0_20px_hsl(215_85%_50%/0.4)]",
          className
        )}
        ref={ref}
        onClick={handleClick}
        data-chamfer={chamferDepth}
        {...props}
      >
        {/* Bevel edge highlights (pseudo-elements) */}
        <span className="relative inline-flex items-center justify-center gap-2 z-10">
          {children}
        </span>

        {/* Top bevel highlight */}
        <span
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Left bevel highlight */}
        <span
          className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Right bevel shadow */}
        <span
          className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Bottom bevel shadow */}
        <span
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Light refraction gradient overlay */}
        <span
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none"
          aria-hidden="true"
        />
      </Comp>
    );
  }
);

ChamferedButton.displayName = "ChamferedButton";

export { chamferedButtonVariants };

