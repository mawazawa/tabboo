/**
 * TRO Workflow Wizard Component
 *
 * Main orchestration component for guiding users through the complete TRO packet
 * workflow. Provides step-by-step navigation, progress tracking, validation feedback,
 * and form transitions.
 *
 * @version 1.1
 * @date November 21, 2025
 * @author Gemini 3 Pro & Agent 2
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, Building, MapPin, Hash } from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTROWorkflow } from '@/hooks/useTROWorkflow';
import { FormViewer } from '@/components/FormViewer'; // Integrated FormViewer
import { PacketProgressPanel } from '@/components/PacketProgressPanel';
import { FormData, FieldPosition } from '@/types/FormData';
import {
  PacketType,
  FormStatus,
  WorkflowState,
  FormType,
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
  
  // Local state for the form viewer
  const [currentFormData, setCurrentFormData] = useState<FormData>({});
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(0);
  // Placeholder for field positions - normally loaded from DB or config
  // For now, we'll let FormViewer handle the initial load from DB
  const [fieldPositions, setFieldPositions] = useState<Record<string, FieldPosition>>({});

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
    updateFormStatus,
    getFormData,
    saveFormData,
    jumpToForm
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

  // Load form data when the current form changes
  const currentForm = getCurrentForm();
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentForm) return;
      
      setIsLoadingFormData(true);
      try {
        const data = await getFormData(currentForm);
        if (data) {
          setCurrentFormData(data as unknown as FormData);
        } else {
          setCurrentFormData({});
        }
      } catch (err) {
        console.error("Failed to load form data:", err);
        toast({
          title: "Error loading form data",
          description: "Could not retrieve your saved progress.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFormData(false);
      }
    };

    loadData();
  }, [currentForm, getFormData, toast]);

  // Debounced save helper
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFieldUpdate = useCallback((field: string, value: string | boolean) => {
    setCurrentFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Debounced save to Supabase
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      if (currentForm) {
        saveTimeoutRef.current = setTimeout(() => {
          saveFormData(currentForm, newData as unknown as Record<string, unknown>)
            .catch(err => console.error("Auto-save failed:", err));
        }, 1000); // Auto-save after 1 second of inactivity
      }
      
      return newData;
    });
  }, [currentForm, saveFormData]);

  const handleFieldPositionUpdate = useCallback((field: string, position: FieldPosition) => {
    setFieldPositions(prev => ({ ...prev, [field]: position }));
    // Note: In a real implementation, we'd want to save these positions too if user is admin
  }, []);

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
  }, [validateCurrentForm, currentForm, updateFormStatus, transitionToNextForm, workflow, onComplete, toast]);

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
  const nextForm = getNextForm();
  const previousForm = getPreviousForm();
  const completionPercentage = getPacketCompletionPercentage();
  const estimatedTime = getEstimatedTimeRemaining();
  const formSteps = getFormSteps();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 h-screen flex flex-col">
      {/* Header with Progress */}
      <div className="flex-none">
        <WorkflowProgressBar
          packetType={workflow.packetType}
          completionPercentage={completionPercentage}
          estimatedTime={estimatedTime}
        />
      </div>

      {/* Main Content Area - Flex Grow to fill space */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Sidebar - Progress & Court Info */}
        <div className="w-full md:w-72 flex-none overflow-y-auto hidden md:block space-y-4 pr-1">
          {/* Court Information Card */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Court Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 pb-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">{(currentFormData['county'] as string) || 'Los Angeles'} Superior Court</div>
                  {(currentFormData['courtStreetAddress'] as string) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {currentFormData['courtStreetAddress'] as string}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider mr-2">Case #:</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">
                    {(currentFormData['caseNumber'] as string) || 'PENDING'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Panel */}
          <PacketProgressPanel 
            workflow={workflow}
            onFormSelect={(form) => jumpToForm(form)}
            compact={true}
          />
        </div>

        {/* Form Area */}
        <div className="flex-grow flex flex-col min-w-0 border rounded-lg bg-background shadow-sm overflow-hidden relative">
          {currentForm ? (
            isLoadingFormData ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <FormViewer 
                formData={currentFormData}
                updateField={handleFieldUpdate}
                currentFieldIndex={currentFieldIndex}
                setCurrentFieldIndex={setCurrentFieldIndex}
                fieldPositions={fieldPositions}
                updateFieldPosition={handleFieldPositionUpdate}
                formType={currentForm}
                // Optional: pass validation errors here
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a form to begin
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex-none pt-4 border-t bg-background sticky bottom-0">
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
    </div>
  );
};

export default TROWorkflowWizard;
