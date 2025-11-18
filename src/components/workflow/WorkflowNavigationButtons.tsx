/**
 * Workflow Navigation Buttons Component
 *
 * Provides Previous and Next navigation buttons for workflow forms,
 * including form names, step counter, and disabled states.
 *
 * @version 1.0
 * @date November 17, 2025
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormType, type FormStep } from '@/types/WorkflowTypes';

interface WorkflowNavigationButtonsProps {
  currentForm: FormType | null;
  nextForm: FormType | null;
  previousForm: FormType | null;
  formSteps: FormStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * WorkflowNavigationButtons - Previous/Next form navigation
 *
 * Displays navigation buttons with form names, step counter,
 * and automatic disabling based on workflow state.
 */
export const WorkflowNavigationButtons: React.FC<WorkflowNavigationButtonsProps> = ({
  currentForm,
  nextForm,
  previousForm,
  formSteps,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious
}) => {
  const currentStepIndex = currentForm
    ? formSteps.findIndex(s => s.formType === currentForm)
    : -1;

  const stepCounter = currentForm
    ? `Step ${currentStepIndex + 1} of ${formSteps.length}`
    : null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || !previousForm}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous: {previousForm || 'None'}
          </Button>

          {stepCounter && (
            <div className="text-sm text-muted-foreground">
              {stepCounter}
            </div>
          )}

          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="gap-2"
          >
            {nextForm ? (
              <>
                Next: {nextForm}
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              'Complete Workflow'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowNavigationButtons;
