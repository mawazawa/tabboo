/**
 * Stateful Button - Modern Justice Design System
 *
 * Process window button with ultra-fast spinners, chronometers, and multi-step visualization.
 * Implements Constitutional Principle: "Every second of waiting is an opportunity to reassure, educate, or entertain."
 *
 * Features:
 * - Ultra-fast micro-process spinners (4x speed, motion blur visible)
 * - 0.1s chronometers for human-readable precision
 * - Multi-step process visualization ("Validating... 0.1s ✓")
 * - Liquid Glass button morphs into transparent process window
 * - Animated success checkmark with celebration
 * - Anxiety-reducing transparency for self-represented litigants
 *
 * Usage:
 * ```tsx
 * <StatefulButton
 *   processSteps={[
 *     { name: "Validating form", duration: 120 },
 *     { name: "Encrypting data", duration: 80 },
 *     { name: "Saving to vault", duration: 150 },
 *   ]}
 *   onComplete={() => console.log("Done!")}
 * >
 *   Save Document
 * </StatefulButton>
 * ```
 */

import * as React from "react";
import { Button, type ButtonProps } from "./button";
import { Loader2, Check, XCircle } from "@/icons";
import { cn } from "@/lib/utils";

export interface ProcessStep {
  /** Step name shown to user (e.g., "Validating form") */
  name: string;
  /** Actual backend duration in milliseconds */
  duration: number;
  /** Optional custom icon for this step */
  icon?: React.ReactNode;
}

export interface StatefulButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  /** Button label in idle state */
  children: React.ReactNode;
  /** Process steps to visualize */
  processSteps: ProcessStep[];
  /** Called when all steps complete */
  onComplete: () => Promise<void> | void;
  /** Optional success message (default: "Complete!") */
  successMessage?: string;
  /** Optional celebration duration in ms (default: 1500ms) */
  celebrationDuration?: number;
  /** Optional error message (default: "Try again") */
  errorMessage?: string;
  /** Optional error duration before reset (default: 2000ms) */
  errorDuration?: number;
  /** Disable expansion when processing */
  expandOnProcess?: boolean;
}

type ButtonState = "idle" | "processing" | "success" | "error";

export const StatefulButton = React.forwardRef<HTMLButtonElement, StatefulButtonProps>(
  (
    {
      children,
      processSteps,
      onComplete,
      successMessage = "Complete!",
      errorMessage = "Try again",
      celebrationDuration = 1500,
      errorDuration = 2000,
      expandOnProcess = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [state, setState] = React.useState<ButtonState>("idle");
    const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
    const [elapsedTime, setElapsedTime] = React.useState(0);
    const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

    const intervalRef = React.useRef<number>();
    const startTimeRef = React.useRef<number>();
    const isMountedRef = React.useRef(true);

    const currentStep = processSteps[currentStepIndex];
    const isLastStep = currentStepIndex === processSteps.length - 1;

    React.useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    // Chronometer update (every 100ms = 0.1s)
    React.useEffect(() => {
      if (state === "processing") {
        intervalRef.current = window.setInterval(() => {
          const now = Date.now();
          setElapsedTime(now - (startTimeRef.current || now));
        }, 100);

        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }

      if (state !== "processing" && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, [state]);

    // Process step execution
    React.useEffect(() => {
      if (state === "processing" && currentStep) {
        // Show step for minimum 300ms (visible but rushed)
        const displayDuration = Math.max(currentStep.duration, 300);

        const timer = window.setTimeout(async () => {
          if (isLastStep) {
            try {
              await onComplete();
              if (!isMountedRef.current) return;
              setState("success");
              setTimeout(() => {
                if (!isMountedRef.current) return;
                setState("idle");
                setCurrentStepIndex(0);
                setElapsedTime(0);
              }, celebrationDuration);
            } catch (error) {
              console.error(error);
              if (!isMountedRef.current) return;
              setErrorDetails(error instanceof Error ? error.message : null);
              setState("error");
              setTimeout(() => {
                if (!isMountedRef.current) return;
                setState("idle");
                setCurrentStepIndex(0);
                setElapsedTime(0);
                setErrorDetails(null);
              }, errorDuration);
            }
          } else {
            setCurrentStepIndex((prev) => prev + 1);
          }
        }, displayDuration);

        return () => window.clearTimeout(timer);
      }
    }, [
      state,
      currentStepIndex,
      currentStep,
      isLastStep,
      onComplete,
      celebrationDuration,
      errorDuration
    ]);

    const handleClick = React.useCallback(() => {
      if (state === "idle") {
        setState("processing");
        startTimeRef.current = Date.now();
        setElapsedTime(0);
        setCurrentStepIndex(0);
        setErrorDetails(null);
      }
    }, [state]);

    // Render different content based on state
    const renderContent = () => {
      switch (state) {
        case "idle":
          return <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;

        case "processing":
          return (
            <div className="flex items-center gap-2 relative z-10">
              {/* Ultra-fast spinner (4x speed) */}
              <Loader2 className="h-4 w-4 animate-spin-ultra-fast" />

              {/* Process step name */}
              <span className="text-sm font-medium">{currentStep?.name}...</span>

              {/* Chronometer (0.1s increments) */}
              <span className="font-mono text-xs font-bold opacity-75">
                {(elapsedTime / 1000).toFixed(1)}s
              </span>
            </div>
          );

        case "success":
          return (
            <div className="flex items-center gap-2 relative z-10">
              {/* Animated checkmark */}
              <Check className="h-4 w-4 animate-in zoom-in duration-300" />

              {/* Success message */}
              <span className="text-sm font-medium">{successMessage}</span>

              {/* Total time */}
              <span className="font-mono text-xs font-bold opacity-75">
                {(elapsedTime / 1000).toFixed(1)}s
              </span>
            </div>
          );

        case "error":
          return (
            <div className="flex items-center gap-2 relative z-10 text-red-600">
              <XCircle className="h-4 w-4 animate-in zoom-in duration-300" />
              <span className="text-sm font-medium">{errorMessage}</span>
              {errorDetails && (
                <span className="font-mono text-[10px] font-semibold opacity-75 truncate max-w-[120px]">
                  {errorDetails}
                </span>
              )}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <>
        {/* Ultra-fast spinner keyframes */}
        <style>{`
          @keyframes spin-ultra-fast {
            to { transform: rotate(360deg); }
          }
          .animate-spin-ultra-fast {
            animation: spin-ultra-fast 0.25s linear infinite; /* 4 rotations/second */
          }
        `}</style>

        <Button
          ref={ref}
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            state === "processing" && expandOnProcess && "min-w-[280px]",
            state === "success" && "bg-green-600 hover:bg-green-600",
            state === "error" && "bg-red-600/10 border border-red-500/40",
            className
          )}
          onClick={handleClick}
          disabled={disabled || state !== "idle"}
          {...props}
        >
          {renderContent()}

          {/* Celebration glow on success */}
          {state === "success" && (
            <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent animate-pulse pointer-events-none" />
          )}
          {state === "error" && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 pointer-events-none" />
          )}
        </Button>
      </>
    );
  }
);

StatefulButton.displayName = "StatefulButton";
