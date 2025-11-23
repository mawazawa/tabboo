/**
 * useTROWorkflow Hook
 *
 * React hook for managing TRO packet workflow state and transitions.
 * Handles workflow creation, state management, form transitions, validation,
 * and data persistence to Supabase.
 *
 * @version 1.0
 * @date November 17, 2025
 * @author Agent 2 - Workflow Engine
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  WorkflowState,
  FormStatus,
  FormType,
  PacketType,
  WorkflowError,
  WorkflowErrorCode,
  STATE_TRANSITIONS,
  FORM_REQUIREMENTS,
  FORM_ORDER,
  FORM_ESTIMATED_TIME,
  FORM_DEPENDENCIES,
  type TROWorkflow,
  type PacketConfig,
  type FormStatuses,
  type FormDataRefs,
  type ValidationResult,
  type AutofillResult,
  type FormStep,
  type UseTROWorkflowReturn,
  type FormDependency
} from '@/types/WorkflowTypes';

/**
 * Default packet configuration
 */
const DEFAULT_PACKET_CONFIG: PacketConfig = {
  hasChildren: false,
  requestingChildSupport: false,
  requestingSpousalSupport: false,
  needMoreSpace: false,
  hasExistingCaseNumber: false
};

/**
 * useTROWorkflow Hook
 *
 * @param userId - User ID (required)
 * @param workflowId - Optional workflow ID to load existing workflow
 * @returns UseTROWorkflowReturn object with workflow state and actions
 */
export function useTROWorkflow(
  userId: string,
  workflowId?: string
): UseTROWorkflowReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<WorkflowError | null>(null);

  // ============================================================================
  // Query: Load workflow from Supabase
  // ============================================================================

  const {
    data: workflow,
    isLoading: loading,
    refetch: refetchWorkflow
  } = useQuery({
    queryKey: ['tro-workflow', userId, workflowId],
    queryFn: async () => {
      if (!workflowId) return null;

      const { data, error } = await supabase
        .from('tro_workflows')
        .select('*')
        .eq('id', workflowId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new WorkflowError(
          `Failed to load workflow: ${error.message}`,
          WorkflowErrorCode.LOAD_FAILED,
          true,
          { supabaseError: error }
        );
      }

      return data as TROWorkflow;
    },
    enabled: !!userId && !!workflowId,
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: false
  });

  // ============================================================================
  // Mutation: Create workflow
  // ============================================================================

  const createWorkflowMutation = useMutation({
    mutationFn: async ({
      packetType,
      config
    }: {
      packetType: PacketType;
      config: PacketConfig;
    }) => {
      // Initialize form statuses based on packet type
      const initialFormStatuses: FormStatuses = {};
      const requiredForms = FORM_REQUIREMENTS[packetType].required;
      const optionalForms = FORM_REQUIREMENTS[packetType].optional;

      requiredForms.forEach((formType) => {
        initialFormStatuses[formType] = FormStatus.NOT_STARTED;
      });

      optionalForms.forEach((formType) => {
        initialFormStatuses[formType] = FormStatus.SKIPPED;
      });

      // Determine initial state based on packet type
      const initialState =
        packetType === PacketType.RESPONSE
          ? WorkflowState.DV120_IN_PROGRESS
          : WorkflowState.DV100_IN_PROGRESS;

      const newWorkflow: Omit<TROWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        packetType,
        currentState: initialState,
        formStatuses: initialFormStatuses,
        packetConfig: config,
        formDataRefs: {},
        metadata: {
          completionPercentage: 0,
          estimatedTimeRemaining: calculateEstimatedTime(packetType, config),
          validationErrors: []
        }
      };

      const { data, error } = await supabase
        .from('tro_workflows')
        .insert(newWorkflow)
        .select()
        .single();

      if (error) {
        throw new WorkflowError(
          `Failed to create workflow: ${error.message}`,
          WorkflowErrorCode.SAVE_FAILED,
          true,
          { supabaseError: error }
        );
      }

      return data as TROWorkflow;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tro-workflow', userId, data.id], data);
      toast({
        title: 'Workflow Started',
        description: 'Your TRO packet workflow has been created.'
      });
    },
    onError: (err: WorkflowError) => {
      setError(err);
      toast({
        title: 'Error Creating Workflow',
        description: err.message,
        variant: 'destructive'
      });
    }
  });

  // ============================================================================
  // Mutation: Update workflow
  // ============================================================================

  const updateWorkflowMutation = useMutation({
    mutationFn: async (updates: Partial<TROWorkflow>) => {
      if (!workflow?.id) {
        throw new WorkflowError(
          'No workflow to update',
          WorkflowErrorCode.INVALID_TRANSITION,
          false
        );
      }

      const { data, error } = await supabase
        .from('tro_workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id)
        .select()
        .single();

      if (error) {
        throw new WorkflowError(
          `Failed to update workflow: ${error.message}`,
          WorkflowErrorCode.SAVE_FAILED,
          true,
          { supabaseError: error }
        );
      }

      return data as TROWorkflow;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tro-workflow', userId, data.id], data);
    },
    onError: (err: WorkflowError) => {
      setError(err);
      toast({
        title: 'Error Updating Workflow',
        description: err.message,
        variant: 'destructive'
      });
    }
  });

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Calculate estimated time to complete packet
   */
  function calculateEstimatedTime(
    packetType: PacketType,
    config: PacketConfig
  ): number {
    const requiredForms = FORM_REQUIREMENTS[packetType].required;
    let totalMinutes = 0;

    requiredForms.forEach((formType) => {
      totalMinutes += FORM_ESTIMATED_TIME[formType] || 0;
    });

    // Add optional forms if configured
    if (config.requestingChildSupport || config.requestingSpousalSupport) {
      totalMinutes += FORM_ESTIMATED_TIME[FormType.FL150] || 0;
    }

    if (config.needMoreSpace) {
      totalMinutes += FORM_ESTIMATED_TIME[FormType.DV101] || 0;
    }

    return totalMinutes;
  }

  /**
   * Check if state transition is valid
   */
  function isValidTransition(
    fromState: WorkflowState,
    toState: WorkflowState
  ): boolean {
    const allowedTransitions = STATE_TRANSITIONS[fromState];
    return allowedTransitions?.includes(toState) || false;
  }

  /**
   * Get form type from workflow state
   */
  function getFormTypeFromState(state: WorkflowState): FormType | null {
    const stateToFormMap: Partial<Record<WorkflowState, FormType>> = {
      [WorkflowState.DV100_IN_PROGRESS]: FormType.DV100,
      [WorkflowState.DV100_COMPLETE]: FormType.DV100,
      [WorkflowState.CLETS_IN_PROGRESS]: FormType.CLETS001,
      [WorkflowState.CLETS_COMPLETE]: FormType.CLETS001,
      [WorkflowState.DV105_IN_PROGRESS]: FormType.DV105,
      [WorkflowState.DV105_COMPLETE]: FormType.DV105,
      [WorkflowState.FL150_IN_PROGRESS]: FormType.FL150,
      [WorkflowState.FL150_COMPLETE]: FormType.FL150,
      [WorkflowState.DV101_IN_PROGRESS]: FormType.DV101,
      [WorkflowState.DV101_COMPLETE]: FormType.DV101,
      [WorkflowState.DV120_IN_PROGRESS]: FormType.DV120,
      [WorkflowState.DV120_COMPLETE]: FormType.DV120,
      [WorkflowState.FL320_IN_PROGRESS]: FormType.FL320,
      [WorkflowState.FL320_COMPLETE]: FormType.FL320
    };

    return stateToFormMap[state] || null;
  }

  /**
   * Get workflow state for form
   */
  function getStateForForm(
    formType: FormType,
    inProgress: boolean
  ): WorkflowState {
    const formToStateMap: Record<FormType, {
      inProgress: WorkflowState;
      complete: WorkflowState;
    }> = {
      [FormType.DV100]: {
        inProgress: WorkflowState.DV100_IN_PROGRESS,
        complete: WorkflowState.DV100_COMPLETE
      },
      [FormType.CLETS001]: {
        inProgress: WorkflowState.CLETS_IN_PROGRESS,
        complete: WorkflowState.CLETS_COMPLETE
      },
      [FormType.DV105]: {
        inProgress: WorkflowState.DV105_IN_PROGRESS,
        complete: WorkflowState.DV105_COMPLETE
      },
      [FormType.FL150]: {
        inProgress: WorkflowState.FL150_IN_PROGRESS,
        complete: WorkflowState.FL150_COMPLETE
      },
      [FormType.DV101]: {
        inProgress: WorkflowState.DV101_IN_PROGRESS,
        complete: WorkflowState.DV101_COMPLETE
      },
      [FormType.DV120]: {
        inProgress: WorkflowState.DV120_IN_PROGRESS,
        complete: WorkflowState.DV120_COMPLETE
      },
      [FormType.FL320]: {
        inProgress: WorkflowState.FL320_IN_PROGRESS,
        complete: WorkflowState.FL320_COMPLETE
      },
      // These forms are generated by court, not filled by user
      [FormType.DV109]: {
        inProgress: WorkflowState.REVIEW_IN_PROGRESS,
        complete: WorkflowState.REVIEW_IN_PROGRESS
      },
      [FormType.DV110]: {
        inProgress: WorkflowState.REVIEW_IN_PROGRESS,
        complete: WorkflowState.REVIEW_IN_PROGRESS
      }
    };

    const states = formToStateMap[formType];
    return inProgress ? states.inProgress : states.complete;
  }

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Start a new workflow
   */
  const startWorkflow = useCallback(
    async (packetType: PacketType, config: PacketConfig = DEFAULT_PACKET_CONFIG) => {
      await createWorkflowMutation.mutateAsync({ packetType, config });
    },
    [createWorkflowMutation]
  );

  /**
   * Load an existing workflow
   */
  const loadWorkflow = useCallback(
    async (id: string) => {
      await queryClient.invalidateQueries({
        queryKey: ['tro-workflow', userId, id]
      });
      await refetchWorkflow();
    },
    [queryClient, userId, refetchWorkflow]
  );

  /**
   * Update form status
   */
  const updateFormStatus = useCallback(
    async (formType: FormType, status: FormStatus) => {
      if (!workflow) return;

      const updatedStatuses = {
        ...workflow.formStatuses,
        [formType]: status
      };

      await updateWorkflowMutation.mutateAsync({
        formStatuses: updatedStatuses
      });
    },
    [workflow, updateWorkflowMutation]
  );

  /**
   * Update packet configuration
   */
  const updatePacketConfig = useCallback(
    async (config: Partial<PacketConfig>) => {
      if (!workflow) return;

      const updatedConfig = {
        ...workflow.packetConfig,
        ...config
      };

      // Update form statuses based on new config
      const updatedStatuses = { ...workflow.formStatuses };

      // Handle DV-105 requirement
      if (config.hasChildren !== undefined) {
        updatedStatuses[FormType.DV105] = config.hasChildren
          ? FormStatus.NOT_STARTED
          : FormStatus.SKIPPED;
      }

      // Handle FL-150 requirement
      if (
        config.requestingChildSupport !== undefined ||
        config.requestingSpousalSupport !== undefined
      ) {
        const needsFL150 =
          updatedConfig.requestingChildSupport ||
          updatedConfig.requestingSpousalSupport;
        updatedStatuses[FormType.FL150] = needsFL150
          ? FormStatus.NOT_STARTED
          : FormStatus.SKIPPED;
      }

      // Handle DV-101 requirement
      if (config.needMoreSpace !== undefined) {
        updatedStatuses[FormType.DV101] = config.needMoreSpace
          ? FormStatus.NOT_STARTED
          : FormStatus.SKIPPED;
      }

      await updateWorkflowMutation.mutateAsync({
        packetConfig: updatedConfig,
        formStatuses: updatedStatuses,
        metadata: {
          ...workflow.metadata,
          estimatedTimeRemaining: calculateEstimatedTime(
            workflow.packetType,
            updatedConfig
          )
        }
      });
    },
    [workflow, updateWorkflowMutation]
  );

  /**
   * Transition to next form in workflow
   */
  const transitionToNextForm = useCallback(async () => {
    if (!workflow) return;

    const nextForm = getNextForm();
    if (!nextForm) {
      // No more forms, move to review
      await updateWorkflowMutation.mutateAsync({
        currentState: WorkflowState.REVIEW_IN_PROGRESS
      });
      return;
    }

    const nextState = getStateForForm(nextForm, true);
    if (!isValidTransition(workflow.currentState, nextState)) {
      throw new WorkflowError(
        `Invalid transition from ${workflow.currentState} to ${nextState}`,
        WorkflowErrorCode.INVALID_TRANSITION,
        false
      );
    }

    await updateWorkflowMutation.mutateAsync({
      currentState: nextState
    });
  }, [workflow, updateWorkflowMutation, getNextForm]);

  /**
   * Transition to previous form in workflow
   */
  const transitionToPreviousForm = useCallback(async () => {
    if (!workflow) return;

    const previousForm = getPreviousForm();
    if (!previousForm) return;

    const previousState = getStateForForm(previousForm, true);
    await updateWorkflowMutation.mutateAsync({
      currentState: previousState
    });
  }, [workflow, updateWorkflowMutation, getPreviousForm]);

  /**
   * Jump to a specific form
   */
  const jumpToForm = useCallback(
    async (formType: FormType) => {
      if (!workflow) return;

      // Check if form is part of this packet
      const allForms = [
        ...FORM_REQUIREMENTS[workflow.packetType].required,
        ...FORM_REQUIREMENTS[workflow.packetType].optional
      ];

      if (!allForms.includes(formType)) {
        throw new WorkflowError(
          `Form ${formType} is not part of this packet type`,
          WorkflowErrorCode.INVALID_TRANSITION,
          true
        );
      }

      // Check dependencies
      if (!areDependenciesMet(formType)) {
        const unmet = getUnmetDependencies(formType);
        throw new WorkflowError(
          `Cannot jump to ${formType}. Please complete: ${unmet.join(', ')}`,
          WorkflowErrorCode.MISSING_DEPENDENCY,
          true
        );
      }

      const targetState = getStateForForm(formType, true);
      await updateWorkflowMutation.mutateAsync({
        currentState: targetState
      });
    },
    [workflow, updateWorkflowMutation, areDependenciesMet, getUnmetDependencies]
  );

  /**
   * Complete workflow and mark as ready to file
   */
  const completeWorkflow = useCallback(async () => {
    if (!workflow) return;

    // Validate all required forms are complete
    const validation = await validatePacket();
    if (!validation.valid) {
      throw new WorkflowError(
        'Cannot complete workflow. Please fix validation errors.',
        WorkflowErrorCode.VALIDATION_FAILED,
        true,
        { validationErrors: validation.errors }
      );
    }

    await updateWorkflowMutation.mutateAsync({
      currentState: WorkflowState.READY_TO_FILE,
      metadata: {
        ...workflow.metadata,
        completionPercentage: 100
      }
    });

    toast({
      title: 'Workflow Complete',
      description: 'Your TRO packet is ready to file!'
    });
  }, [workflow, updateWorkflowMutation, toast, validatePacket]);

  /**
   * Reset workflow to start
   */
  const resetWorkflow = useCallback(async () => {
    if (!workflow) return;

    await updateWorkflowMutation.mutateAsync({
      currentState: WorkflowState.PACKET_TYPE_SELECTION,
      formStatuses: {},
      metadata: {
        completionPercentage: 0,
        validationErrors: []
      }
    });
  }, [workflow, updateWorkflowMutation]);

  /**
   * Validate current form
   */
  const validateCurrentForm = useCallback(async (): Promise<ValidationResult> => {
    const currentForm = getCurrentForm();
    if (!currentForm) {
      return { valid: true, errors: [], warnings: [] };
    }

    return validateForm(currentForm);
  }, [workflow]);

  /**
   * Validate a specific form
   */
  const validateForm = useCallback(
    async (formType: FormType): Promise<ValidationResult> => {
      // Import validation logic dynamically
      const { validateFormData } = await import('@/lib/workflowValidator');

      const formData = await getFormData(formType);
      if (!formData) {
        return {
          valid: false,
          errors: [
            {
              formType,
              message: 'Form data not found',
              code: 'FORM_NOT_FOUND',
              severity: 'error'
            }
          ],
          warnings: []
        };
      }

      return validateFormData(formType, formData);
    },
    []
  );

  /**
   * Validate entire packet
   */
  const validatePacket = useCallback(async (): Promise<ValidationResult> => {
    if (!workflow) {
      return { valid: false, errors: [], warnings: [] };
    }

    // Import validation logic
    const { validatePacketData } = await import('@/lib/workflowValidator');

    const requiredForms = getRequiredForms();
    const formDataCollection: Record<string, Record<string, unknown>> = {};

    // Load all form data
    for (const formType of requiredForms) {
      const data = await getFormData(formType);
      if (data) {
        formDataCollection[formType] = data;
      }
    }

    return validatePacketData(workflow, formDataCollection);
  }, [workflow]);

  /**
   * Check if can transition to next form
   */
  const canTransitionToNextForm = useCallback((): boolean => {
    if (!workflow) return false;

    const currentForm = getCurrentForm();
    if (!currentForm) return false;

    // Check if current form is complete
    const status = workflow.formStatuses[currentForm];
    if (status !== FormStatus.COMPLETE && status !== FormStatus.VALIDATED) {
      return false;
    }

    return true;
  }, [workflow]);

  /**
   * Check if can transition to previous form
   */
  const canTransitionToPreviousForm = useCallback((): boolean => {
    return getPreviousForm() !== null;
  }, [workflow]);

  /**
   * Autofill form from previous forms
   */
  const autofillFormFromPrevious = useCallback(
    async (targetForm: FormType): Promise<AutofillResult> => {
      // Import autofill logic
      const { autofillFromPreviousForms } = await import('@/lib/formDataMapper');

      if (!workflow) {
        return { fieldsAutofilled: 0, fields: {}, source: 'previous_form' };
      }

      // Get all completed forms
      const completedForms: Record<string, Record<string, unknown>> = {};
      for (const [formType, status] of Object.entries(workflow.formStatuses)) {
        if (status === FormStatus.COMPLETE || status === FormStatus.VALIDATED) {
          const data = await getFormData(formType as FormType);
          if (data) {
            completedForms[formType] = data;
          }
        }
      }

      const result = autofillFromPreviousForms(targetForm, completedForms);

      toast({
        title: 'Autofilled Fields',
        description: `Filled ${result.fieldsAutofilled} field(s) from previous forms`
      });

      return result;
    },
    [workflow, toast]
  );

  /**
   * Autofill form from Personal Data Vault
   */
  const autofillFormFromVault = useCallback(
    async (targetForm: FormType): Promise<AutofillResult> => {
      // Import autofill logic
      const { autofillFromVault } = await import('@/lib/formDataMapper');

      // Get vault data
      const { data: vaultData } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!vaultData) {
        return { fieldsAutofilled: 0, fields: {}, source: 'vault' };
      }

      const result = autofillFromVault(targetForm, vaultData);

      toast({
        title: 'Autofilled from Vault',
        description: `Filled ${result.fieldsAutofilled} field(s) from your Personal Data Vault`
      });

      return result;
    },
    [userId, toast]
  );

  /**
   * Get form data from legal_documents table
   */
  const getFormData = useCallback(
    async (formType: FormType): Promise<Record<string, unknown> | null> => {
      if (!workflow?.formDataRefs[formType]) return null;

      const { data, error } = await supabase
        .from('legal_documents')
        .select('content')
        .eq('id', workflow.formDataRefs[formType])
        .single();

      if (error) return null;

      return data.content as Record<string, unknown>;
    },
    [workflow]
  );

  /**
   * Save form data to legal_documents table
   */
  const saveFormData = useCallback(
    async (formType: FormType, data: Record<string, unknown>) => {
      if (!workflow) return;

      const existingDocId = workflow.formDataRefs[formType];

      if (existingDocId) {
        // Update existing document
        await supabase
          .from('legal_documents')
          .update({
            content: data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDocId);
      } else {
        // Create new document
        const { data: newDoc } = await supabase
          .from('legal_documents')
          .insert({
            title: `${formType} Form`,
            form_type: formType,
            workflow_id: workflow.id,
            content: data,
            metadata: {},
            user_id: userId
          })
          .select()
          .single();

        if (newDoc) {
          // Update workflow with document reference
          await updateWorkflowMutation.mutateAsync({
            formDataRefs: {
              ...workflow.formDataRefs,
              [formType]: newDoc.id
            }
          });
        }
      }
    },
    [workflow, userId, updateWorkflowMutation]
  );

  /**
   * Get current form being worked on
   */
  const getCurrentForm = useCallback((): FormType | null => {
    if (!workflow) return null;
    return getFormTypeFromState(workflow.currentState);
  }, [workflow]);

  /**
   * Get next form in sequence
   */
  const getNextForm = useCallback((): FormType | null => {
    if (!workflow) return null;

    const formOrder = FORM_ORDER[workflow.packetType];
    const currentForm = getCurrentForm();

    if (!currentForm) return formOrder[0] || null;

    const currentIndex = formOrder.indexOf(currentForm);
    if (currentIndex === -1 || currentIndex === formOrder.length - 1) {
      return null;
    }

    // Find next form that is not skipped
    for (let i = currentIndex + 1; i < formOrder.length; i++) {
      const nextForm = formOrder[i];
      if (workflow.formStatuses[nextForm] !== FormStatus.SKIPPED) {
        return nextForm;
      }
    }

    return null;
  }, [workflow]);

  /**
   * Get previous form in sequence
   */
  const getPreviousForm = useCallback((): FormType | null => {
    if (!workflow) return null;

    const formOrder = FORM_ORDER[workflow.packetType];
    const currentForm = getCurrentForm();

    if (!currentForm) return null;

    const currentIndex = formOrder.indexOf(currentForm);
    if (currentIndex <= 0) return null;

    // Find previous form that is not skipped
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevForm = formOrder[i];
      if (workflow.formStatuses[prevForm] !== FormStatus.SKIPPED) {
        return prevForm;
      }
    }

    return null;
  }, [workflow]);

  /**
   * Get list of required forms for current packet
   */
  const getRequiredForms = useCallback((): FormType[] => {
    if (!workflow) return [];
    return FORM_REQUIREMENTS[workflow.packetType].required;
  }, [workflow]);

  /**
   * Get list of optional forms for current packet
   */
  const getOptionalForms = useCallback((): FormType[] => {
    if (!workflow) return [];
    return FORM_REQUIREMENTS[workflow.packetType].optional;
  }, [workflow]);

  /**
   * Get form completion percentage
   */
  const getFormCompletionPercentage = useCallback(
    (formType: FormType): number => {
      // This would need to be calculated based on required fields
      // For now, return 0 or 100 based on status
      if (!workflow) return 0;

      const status = workflow.formStatuses[formType];
      if (status === FormStatus.COMPLETE || status === FormStatus.VALIDATED) {
        return 100;
      }
      if (status === FormStatus.IN_PROGRESS) {
        return 50; // Placeholder
      }
      return 0;
    },
    [workflow]
  );

  /**
   * Get overall packet completion percentage
   */
  const getPacketCompletionPercentage = useCallback((): number => {
    if (!workflow) return 0;

    const requiredForms = getRequiredForms();
    if (requiredForms.length === 0) return 0;

    let completedCount = 0;
    requiredForms.forEach((formType) => {
      const status = workflow.formStatuses[formType];
      if (status === FormStatus.COMPLETE || status === FormStatus.VALIDATED) {
        completedCount++;
      }
    });

    return Math.round((completedCount / requiredForms.length) * 100);
  }, [workflow]);

  /**
   * Get estimated time remaining (in minutes)
   */
  const getEstimatedTimeRemaining = useCallback((): number => {
    if (!workflow) return 0;

    const formOrder = FORM_ORDER[workflow.packetType];
    const currentForm = getCurrentForm();

    if (!currentForm) return workflow.metadata?.estimatedTimeRemaining || 0;

    const currentIndex = formOrder.indexOf(currentForm);
    let timeRemaining = 0;

    // Sum up time for remaining forms
    for (let i = currentIndex; i < formOrder.length; i++) {
      const formType = formOrder[i];
      const status = workflow.formStatuses[formType];

      if (status !== FormStatus.SKIPPED &&
          status !== FormStatus.COMPLETE &&
          status !== FormStatus.VALIDATED) {
        timeRemaining += FORM_ESTIMATED_TIME[formType] || 0;
      }
    }

    return timeRemaining;
  }, [workflow]);

  /**
   * Get form steps for wizard
   */
  const getFormSteps = useCallback((): FormStep[] => {
    if (!workflow) return [];

    const formOrder = FORM_ORDER[workflow.packetType];
    const requiredForms = getRequiredForms();

    return formOrder
      .filter((formType) => workflow.formStatuses[formType] !== FormStatus.SKIPPED)
      .map((formType) => ({
        formType,
        title: formType,
        description: `Complete ${formType} form`,
        required: requiredForms.includes(formType),
        status: workflow.formStatuses[formType] || FormStatus.NOT_STARTED,
        estimatedMinutes: FORM_ESTIMATED_TIME[formType] || 0,
        dependencies: getDependencies(formType)
      }));
  }, [workflow]);

  /**
   * Get dependencies for a form
   */
  const getDependencies = useCallback((formType: FormType): FormType[] => {
    return FORM_DEPENDENCIES
      .filter((dep) => dep.dependentForm === formType)
      .map((dep) => dep.requiredForm);
  }, []);

  /**
   * Check if form dependencies are met
   */
  const areDependenciesMet = useCallback(
    (formType: FormType): boolean => {
      if (!workflow) return false;

      const deps = getDependencies(formType);

      return deps.every((depForm) => {
        const status = workflow.formStatuses[depForm];
        return status === FormStatus.COMPLETE || status === FormStatus.VALIDATED;
      });
    },
    [workflow]
  );

  /**
   * Get unmet dependencies for a form
   */
  const getUnmetDependencies = useCallback(
    (formType: FormType): FormType[] => {
      if (!workflow) return [];

      const deps = getDependencies(formType);

      return deps.filter((depForm) => {
        const status = workflow.formStatuses[depForm];
        return status !== FormStatus.COMPLETE && status !== FormStatus.VALIDATED;
      });
    },
    [workflow]
  );

  // ============================================================================
  // Return Hook API
  // ============================================================================

  return {
    // State
    workflow,
    loading,
    error,

    // Workflow actions
    startWorkflow,
    loadWorkflow,
    updateFormStatus,
    updatePacketConfig,

    // State transitions
    transitionToNextForm,
    transitionToPreviousForm,
    jumpToForm,
    completeWorkflow,
    resetWorkflow,

    // Validation
    validateCurrentForm,
    validateForm,
    validatePacket,
    canTransitionToNextForm,
    canTransitionToPreviousForm,

    // Data operations
    autofillFormFromPrevious,
    autofillFormFromVault,
    getFormData,
    saveFormData,

    // Utility
    getCurrentForm,
    getNextForm,
    getPreviousForm,
    getRequiredForms,
    getOptionalForms,
    getFormCompletionPercentage,
    getPacketCompletionPercentage,
    getEstimatedTimeRemaining,
    getFormSteps,

    // Dependency checking
    getDependencies,
    areDependenciesMet,
    getUnmetDependencies
  };
}
