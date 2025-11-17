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
import { Loader2, CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight } from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTROWorkflow } from '@/hooks/useTROWorkflow';
import {
  PacketType,
  FormType,
  FormStatus,
  WorkflowState,
  type TROWorkflowWizardProps,
  type FormStep
} from '@/types/WorkflowTypes';

/**
 * Packet type selection modal
 */
const PacketTypeSelector: React.FC<{
  onSelect: (packetType: PacketType) => void;
  onCancel: () => void;
}> = ({ onSelect, onCancel }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Choose Your TRO Packet Type</CardTitle>
        <CardDescription>
          Select the type of restraining order packet you need to file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {/* Initiating TRO with Children */}
          <button
            onClick={() => onSelect(PacketType.INITIATING_WITH_CHILDREN)}
            className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Filing for Domestic Violence Restraining Order (With Children)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You are seeking protection from domestic violence and have children involved.
                  This packet includes child custody and visitation orders.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">DV-100</Badge>
                  <Badge variant="secondary">CLETS-001</Badge>
                  <Badge variant="secondary">DV-105</Badge>
                  <Badge variant="outline">FL-150 (optional)</Badge>
                </div>
              </div>
            </div>
          </button>

          {/* Initiating TRO without Children */}
          <button
            onClick={() => onSelect(PacketType.INITIATING_WITHOUT_CHILDREN)}
            className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Filing for Domestic Violence Restraining Order (No Children)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You are seeking protection from domestic violence without child custody issues.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">DV-100</Badge>
                  <Badge variant="secondary">CLETS-001</Badge>
                  <Badge variant="outline">FL-150 (optional)</Badge>
                </div>
              </div>
            </div>
          </button>

          {/* Response to TRO */}
          <button
            onClick={() => onSelect(PacketType.RESPONSE)}
            className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Responding to a Restraining Order Request
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You have been served with a restraining order request and need to file a response.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">DV-120</Badge>
                  <Badge variant="outline">FL-150 (optional)</Badge>
                  <Badge variant="outline">FL-320 (optional)</Badge>
                </div>
              </div>
            </div>
          </button>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

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

  /**
   * Get status icon for form step
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>TRO Packet Workflow</CardTitle>
              <CardDescription>
                {workflow.packetType === PacketType.INITIATING_WITH_CHILDREN && 'Filing for Restraining Order (With Children)'}
                {workflow.packetType === PacketType.INITIATING_WITHOUT_CHILDREN && 'Filing for Restraining Order (No Children)'}
                {workflow.packetType === PacketType.RESPONSE && 'Responding to Restraining Order Request'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={completionPercentage} className="h-2" />

          {estimatedTime > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Estimated time remaining: {estimatedTime} minutes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Forms to Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formSteps.map((step, index) => {
              const isCurrent = step.formType === currentForm;

              return (
                <div
                  key={step.formType}
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!canTransitionToPreviousForm() || !previousForm}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous: {previousForm || 'None'}
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentForm && (
                <>
                  Step {formSteps.findIndex(s => s.formType === currentForm) + 1} of {formSteps.length}
                </>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canTransitionToNextForm()}
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
    </div>
  );
};

export default TROWorkflowWizard;
