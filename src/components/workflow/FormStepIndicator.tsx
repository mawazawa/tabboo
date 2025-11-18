/**
 * Form Step Indicator Component
 *
 * Displays a single form step in the workflow with status icon,
 * title, description, estimated time, and completion badge.
 *
 * @version 1.0
 * @date November 17, 2025
 */

import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from '@/icons';
import { Badge } from '@/components/ui/badge';
import { FormStatus, type FormStep } from '@/types/WorkflowTypes';

interface FormStepIndicatorProps {
  step: FormStep;
  isCurrent: boolean;
}

/**
 * Get status icon for form step based on completion status
 */
const getStepIcon = (step: FormStep) => {
  switch (step.status) {
    case FormStatus.COMPLETE:
    case FormStatus.VALIDATED:
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case FormStatus.IN_PROGRESS:
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    case FormStatus.ERROR:
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    default:
      return <Circle className="w-5 h-5 text-muted-foreground" />;
  }
};

/**
 * FormStepIndicator - Renders a single form step with status
 *
 * Highlights current step, shows completion status icon,
 * displays time estimate, and indicates required vs optional.
 */
export const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  step,
  isCurrent
}) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        isCurrent ? 'border-primary bg-accent' : 'border-border'
      }`}
    >
      <div className="flex-shrink-0">
        {getStepIcon(step)}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{step.title}</h4>
          {step.required && (
            <Badge variant="secondary" className="text-xs">Required</Badge>
          )}
          {!step.required && (
            <Badge variant="outline" className="text-xs">Optional</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {step.description}
        </p>
        {step.estimatedMinutes > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ~{step.estimatedMinutes} minutes
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        {step.status === FormStatus.COMPLETE && (
          <Badge variant="default" className="bg-green-500">Complete</Badge>
        )}
        {step.status === FormStatus.IN_PROGRESS && (
          <Badge variant="default">In Progress</Badge>
        )}
        {step.status === FormStatus.NOT_STARTED && (
          <Badge variant="outline">Not Started</Badge>
        )}
      </div>
    </div>
  );
};

export default FormStepIndicator;
