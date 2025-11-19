import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { triggerHaptic, type HapticPattern } from "@/lib/haptics";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-tight ring-offset-background spring-snappy focus-wcag-enhanced disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "relative bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25),inset_0_-1px_0_hsl(var(--primary)/0.4),0_1px_1px_hsl(220_13%_13%/0.08),0_2px_4px_hsl(220_13%_13%/0.06),0_4px_8px_hsl(220_13%_13%/0.04),0_8px_16px_hsl(220_13%_13%/0.02)] hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.35),inset_0_-1px_0_hsl(var(--primary)/0.5),0_2px_4px_hsl(220_13%_13%/0.12),0_4px_8px_hsl(220_13%_13%/0.09),0_8px_16px_hsl(220_13%_13%/0.06),0_16px_32px_hsl(220_13%_13%/0.04)] hover:translate-y-[-1px] hover:scale-[1.02] active:translate-y-[0] active:scale-[0.98] active:shadow-[inset_0_2px_4px_hsl(var(--primary)/0.4),inset_0_1px_2px_hsl(220_13%_13%/0.15),0_1px_2px_hsl(220_13%_13%/0.05)]",
        destructive: "relative bg-gradient-to-br from-destructive via-destructive to-destructive/90 text-destructive-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25),inset_0_-1px_0_hsl(var(--destructive)/0.4),0_1px_1px_hsl(220_13%_13%/0.08),0_2px_4px_hsl(220_13%_13%/0.06),0_4px_8px_hsl(220_13%_13%/0.04),0_8px_16px_hsl(220_13%_13%/0.02)] hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.35),inset_0_-1px_0_hsl(var(--destructive)/0.5),0_2px_4px_hsl(220_13%_13%/0.12),0_4px_8px_hsl(220_13%_13%/0.09),0_8px_16px_hsl(220_13%_13%/0.06),0_16px_32px_hsl(220_13%_13%/0.04)] hover:translate-y-[-1px] hover:scale-[1.02] active:translate-y-[0] active:scale-[0.98] active:shadow-[inset_0_2px_4px_hsl(var(--destructive)/0.4),inset_0_1px_2px_hsl(220_13%_13%/0.15),0_1px_2px_hsl(220_13%_13%/0.05)]",
        outline: "border-2 border-border bg-background text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.15),0_1px_1px_hsl(220_13%_13%/0.05),0_2px_4px_hsl(220_13%_13%/0.03)] hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25),0_2px_4px_hsl(220_13%_13%/0.09),0_4px_8px_hsl(220_13%_13%/0.06)] hover:translate-y-[-0.5px] active:translate-y-[0] active:shadow-[inset_0_1px_2px_hsl(220_13%_13%/0.12),0_1px_1px_hsl(220_13%_13%/0.03)]",
        secondary: "relative bg-gradient-to-br from-secondary via-secondary to-secondary/80 text-secondary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),inset_0_-1px_0_hsl(220_13%_13%/0.05),0_1px_1px_hsl(220_13%_13%/0.05),0_2px_4px_hsl(220_13%_13%/0.03)] hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.3),0_2px_4px_hsl(220_13%_13%/0.09),0_4px_8px_hsl(220_13%_13%/0.06)] hover:translate-y-[-0.5px] active:translate-y-[0] active:shadow-[inset_0_1px_2px_hsl(220_13%_13%/0.12),0_1px_1px_hsl(220_13%_13%/0.03)]",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-[0_1px_2px_hsl(220_13%_13%/0.05)] rounded-full transition-all duration-150",
        link: "text-primary underline-offset-4 hover:underline rounded-full transition-all duration-150",
      },
      size: {
        default: "h-11 min-h-[44px] px-6 py-2.5",
        sm: "h-9 min-h-[44px] rounded-full px-4 py-2",
        lg: "h-12 min-h-[44px] rounded-full px-10 py-3",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Optional haptic feedback pattern to trigger on click.
   * Provides tactile feedback on supported devices (Android, iOS 18+).
   * @example
   * <Button haptic="medium">Save</Button>
   * <Button haptic="success">Submit</Button>
   * <Button haptic="heavy" variant="destructive">Delete</Button>
   */
  haptic?: HapticPattern;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Wrap onClick to trigger haptic feedback before user's onClick
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback if specified
        if (haptic) {
          triggerHaptic(haptic);
        }

        // Call user's onClick handler
        onClick?.(e);
      },
      [haptic, onClick]
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
