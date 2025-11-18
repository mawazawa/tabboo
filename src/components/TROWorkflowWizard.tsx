/**
 * TRO Workflow Wizard Component
 *
 * Main orchestration component for guiding users through the complete TRO packet
 * workflow. Provides step-by-step navigation, progress tracking, validation feedback,
 * and form transitions.
 *
 * @version 1.0
 * @date November 17, 2025
 * @author Agent 2 - Workflow Engine
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTROWorkflow } from '@/hooks/useTROWorkflow';
import {
  PacketType,
  FormStatus,
  WorkflowState,
  type TROWorkflowWizardProps
} from '@/types/WorkflowTypes';

// Extracted components
import {
  PacketTypeSelector,
  WorkflowProgressBar,
  FormStepIndicator,
  WorkflowNavigationButtons
} from '@/components/workflow';

/**
 * Main TRO Workflow Wizard Component
 */
export const TROWorkflowWizard: React.FC<TROWorkflowWizardProps> = ({
  userId,
  onComplete,
  onError,
  initialPacketType,
  existingWorkflowId
}) => {
  const { toast } = useToast();
  const [showPacketSelector, setShowPacketSelector] = useState(!initialPacketType && !existingWorkflowId);
  const [isInitializing, setIsInitializing] = useState(false);

  // Use the workflow hook
  const {
    workflow,
    loading,
    error,
    startWorkflow,
    loadWorkflow,
    transitionToNextForm,
    transitionToPreviousForm,
    validateCurrentForm,
    canTransitionToNextForm,
    canTransitionToPreviousForm,
    getCurrentForm,
    getNextForm,
    getPreviousForm,
    getPacketCompletionPercentage,
    getEstimatedTimeRemaining,
    getFormSteps,
    updateFormStatus
  } = useTROWorkflow(userId, existingWorkflowId);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Load existing workflow if provided
  useEffect(() => {
    if (existingWorkflowId && !workflow && !loading) {
      loadWorkflow(existingWorkflowId);
    }
  }, [existingWorkflowId, workflow, loading, loadWorkflow]);

  /**
   * Handle packet type selection
   */
  const handlePacketTypeSelect = useCallback(
    async (packetType: PacketType) => {
      setIsInitializing(true);
      try {
        // Default packet configuration
        const config = {
          hasChildren: packetType === PacketType.INITIATING_WITH_CHILDREN,
          requestingChildSupport: false,
          requestingSpousalSupport: false,
          needMoreSpace: false,
          hasExistingCaseNumber: false
        };

        await startWorkflow(packetType, config);
        setShowPacketSelector(false);

        toast({
          title: 'Workflow Started',
          description: 'Your TRO packet workflow has been created. Let\'s get started!'
        });
      } catch (err) {
        toast({
          title: 'Error Starting Workflow',
          description: err instanceof Error ? err.message : 'Unknown error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsInitializing(false);
      }
    },
    [startWorkflow, toast]
  );

  /**
   * Handle next button click
   */
  const handleNext = useCallback(async () => {
    // Validate current form first
    const validation = await validateCurrentForm();

    if (!validation.valid) {
      // Show errors
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      toast({
        title: 'Validation Errors',
        description: errorMessages,
        variant: 'destructive'
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      const warningMessages = validation.warnings.map(w => w.message).join('\n');
      toast({
        title: 'Please Review',
        description: warningMessages,
        variant: 'default'
      });
    }

    // Mark current form as complete
    const currentForm = getCurrentForm();
    if (currentForm) {
      await updateFormStatus(currentForm, FormStatus.COMPLETE);
    }

    // Transition to next form
    await transitionToNextForm();

    // Check if workflow is complete
    if (workflow?.currentState === WorkflowState.READY_TO_FILE) {
      if (onComplete) {
        onComplete();
      }
    }
  }, [validateCurrentForm, getCurrentForm, updateFormStatus, transitionToNextForm, workflow, onComplete, toast]);

  /**
   * Handle previous button click
   */
  const handlePrevious = useCallback(async () => {
    await transitionToPreviousForm();
  }, [transitionToPreviousForm]);

  // Show packet selector if needed
  if (showPacketSelector) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PacketTypeSelector
          onSelect={handlePacketTypeSelect}
          onCancel={() => {
            // Handle cancel - maybe navigate away
          }}
        />
      </div>
    );
  }

  // Show loading state
  if (loading || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {isInitializing ? 'Initializing workflow...' : 'Loading workflow...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !workflow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Workflow</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // No workflow yet
  if (!workflow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Workflow</AlertTitle>
          <AlertDescription>
            Please select a packet type to begin your TRO workflow.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => setShowPacketSelector(true)}>
            Select Packet Type
          </Button>
        </div>
      </div>
    );
  }

  // Get workflow data
  const currentForm = getCurrentForm();
  const nextForm = getNextForm();
  const previousForm = getPreviousForm();
  const completionPercentage = getPacketCompletionPercentage();
  const estimatedTime = getEstimatedTimeRemaining();
  const formSteps = getFormSteps();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with Progress */}
      <WorkflowProgressBar
        packetType={workflow.packetType}
        completionPercentage={completionPercentage}
        estimatedTime={estimatedTime}
      />

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Forms to Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formSteps.map((step) => {
              const isCurrent = step.formType === currentForm;

              return (
                <FormStepIndicator
                  key={step.formType}
                  step={step}
                  isCurrent={isCurrent}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Form Placeholder */}
      {currentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Current Form: {currentForm}</CardTitle>
            <CardDescription>
              Complete this form to continue with your TRO packet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Form Component Integration Needed</AlertTitle>
              <AlertDescription>
                This is where the actual form component ({currentForm}) will be rendered.
                Integration with Agent 1's form components pending.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Navigation Controls */}
      <WorkflowNavigationButtons
        currentForm={currentForm}
        nextForm={nextForm}
        previousForm={previousForm}
        formSteps={formSteps}
        canGoNext={canTransitionToNextForm()}
        canGoPrevious={canTransitionToPreviousForm()}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default TROWorkflowWizard;
