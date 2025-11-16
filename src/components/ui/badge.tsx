import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-br from-primary to-primary-glow text-primary-foreground hover:from-primary/90 hover:to-primary-glow/90 shadow-[0_1px_4px_rgba(0,0,0,0.1),0_2px_8px_-2px_hsl(var(--primary)/0.2)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12),0_4px_12px_-2px_hsl(var(--primary)/0.25)] hover:scale-105",
        secondary: "border-transparent bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:scale-105",
        destructive: "border-transparent bg-gradient-to-br from-destructive to-destructive text-destructive-foreground hover:from-destructive/90 hover:to-destructive/90 shadow-[0_1px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)]",
        outline: "text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };
