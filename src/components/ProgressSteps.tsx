/**
 * Progress Steps Component
 *
 * Shows a visual step indicator for multi-step workflows.
 * Helps SRL users understand their progress through the TRO filing process.
 *
 * Research: "Step indicators reduce form abandonment by 40%" - Nielsen Norman Group
 */

import { Check } from '@/icons';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export function ProgressSteps({
  steps,
  currentStep,
  className,
  variant = 'default',
}: ProgressStepsProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="navigation"
        aria-label="Form progress"
      >
        <span className="text-sm font-medium">
          Step {currentStep + 1} of {steps.length}
        </span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <nav aria-label="Form progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center',
                index < steps.length - 1 && 'flex-1'
              )}
            >
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary bg-primary/10',
                    isUpcoming && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px]',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-foreground',
                    isUpcoming && 'text-muted-foreground/50'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-20px]',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Simple progress text for mobile or minimal UI
 */
export function ProgressText({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <span
      className={cn('text-sm text-muted-foreground', className)}
      aria-label={`Step ${current} of ${total}`}
    >
      Step {current} of {total}
    </span>
  );
}
