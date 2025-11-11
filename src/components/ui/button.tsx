import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "relative bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--primary-glow)/0.8),inset_0_-1px_0_hsl(var(--primary)/0.5),0_1px_2px_hsl(220_13%_13%/0.12),0_4px_8px_hsl(220_13%_13%/0.08),0_8px_16px_hsl(220_13%_13%/0.06)] hover:shadow-[inset_0_1px_0_hsl(var(--primary-glow)/0.9),inset_0_-1px_0_hsl(var(--primary)/0.6),0_2px_4px_hsl(220_13%_13%/0.14),0_6px_12px_hsl(220_13%_13%/0.1),0_12px_24px_hsl(220_13%_13%/0.08)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_hsl(var(--primary)/0.3),0_1px_2px_hsl(220_13%_13%/0.1)]",
        destructive: "relative bg-gradient-to-br from-destructive via-destructive to-destructive/90 text-destructive-foreground shadow-[inset_0_1px_0_hsl(var(--destructive)/0.8),inset_0_-1px_0_hsl(var(--destructive)/0.5),0_1px_2px_hsl(220_13%_13%/0.12),0_4px_8px_hsl(220_13%_13%/0.08),0_8px_16px_hsl(220_13%_13%/0.06)] hover:shadow-[inset_0_1px_0_hsl(var(--destructive)/0.9),inset_0_-1px_0_hsl(var(--destructive)/0.6),0_2px_4px_hsl(220_13%_13%/0.14),0_6px_12px_hsl(220_13%_13%/0.1),0_12px_24px_hsl(220_13%_13%/0.08)] hover:translate-y-[-1px] active:translate-y-[1px]",
        outline: "border-2 border-border bg-background text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.1),0_1px_2px_hsl(220_13%_13%/0.08)] hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.15),0_2px_4px_hsl(220_13%_13%/0.1)] hover:translate-y-[-1px] active:translate-y-[1px]",
        secondary: "relative bg-gradient-to-br from-secondary via-secondary to-secondary/80 text-secondary-foreground shadow-[inset_0_1px_0_hsl(var(--secondary)/1.2),inset_0_-1px_0_hsl(220_13%_13%/0.05),0_1px_2px_hsl(220_13%_13%/0.08)] hover:shadow-[inset_0_1px_0_hsl(var(--secondary)/1.3),0_2px_4px_hsl(220_13%_13%/0.1)] hover:translate-y-[-1px] active:translate-y-[1px]",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-[0_1px_3px_hsl(220_13%_13%/0.05)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
