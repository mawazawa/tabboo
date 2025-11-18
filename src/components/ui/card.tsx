/**
 * Card Component with Premium 2025 Styling Options
 *
 * Enhanced with multiple aesthetic levels:
 * - Default: Clean card with subtle shadow
 * - Refined: Glassmorphic background with soft diffused shadows (2025 premium)
 * - Liquid Glass: Apple-inspired advanced glassmorphism with 24px blur (ultimate premium)
 *
 * Features:
 * - Multi-layer depth through shadows and refraction
 * - Backdrop blur for frosted glass effect
 * - Inset highlights for embossed appearance
 * - Smooth transitions on hover
 * - Responsive to user interactions
 *
 * Usage:
 * <Card /> - Standard card
 * <Card refined /> - Premium glassmorphic card
 * <Card liquidGlass /> - Ultimate Apple Liquid Glass aesthetic
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use refined styling (glassmorphic, soft shadows, embossed effect) */
  refined?: boolean;
  /** Use Apple Liquid Glass styling (advanced glassmorphism with 24px blur - ultimate premium) */
  liquidGlass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, refined, liquidGlass, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground spring-smooth",
        liquidGlass
          ? "liquid-glass rounded-2xl" // Ultimate premium: Apple Liquid Glass aesthetic
          : refined
            ? "card-refined" // Premium: Refined glassmorphism
            : "shadow-sm", // Default: Standard shadow
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
