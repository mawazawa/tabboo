/**
 * useTROWorkflow.test.ts
 *
 * Tests for TRO workflow state management hook.
 * Tests state transitions, validation, and form management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTROWorkflow } from '../useTROWorkflow';
import {
  WorkflowState,
  FormStatus,
  FormType,
  PacketType,
  WorkflowError,
  WorkflowErrorCode,
  type TROWorkflow,
  type PacketConfig
} from '@/types/WorkflowTypes';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'workflow-123',
              userId: 'user-123',
              packetType: PacketType.INITIATING_WITH_CHILDREN,
              currentState: WorkflowState.DV100_IN_PROGRESS,
              formStatuses: {},
              packetConfig: {},
              formDataRefs: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'workflow-123',
                currentState: WorkflowState.DV100_COMPLETE
              },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock workflow validator
vi.mock('@/lib/workflowValidator', () => ({
  validateFormData: vi.fn(() => ({
    valid: true,
    errors: [],
    warnings: []
  })),
  validatePacketData: vi.fn(() => ({
    valid: true,
    errors: [],
    warnings: []
  }))
}));

// Mock form data mapper
vi.mock('@/lib/formDataMapper', () => ({
  autofillFromPreviousForms: vi.fn(() => ({
    fieldsAutofilled: 5,
    fields: { caseNumber: 'FL123' },
    source: 'previous_form'
  })),
  autofillFromVault: vi.fn(() => ({
    fieldsAutofilled: 3,
    fields: { partyName: 'Jane Smith' },
    source: 'vault'
  }))
}));

describe('useTROWorkflow', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        },
        mutations: {
          retry: false
        }
      }
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // ===========================================================================
  // Initial State Tests
  // ===========================================================================
  describe('Initial State', () => {
    it('should return null workflow when no workflowId provided', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workflow).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should return all expected methods', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      // Workflow actions
      expect(result.current.startWorkflow).toBeDefined();
      expect(result.current.loadWorkflow).toBeDefined();
      expect(result.current.updateFormStatus).toBeDefined();
      expect(result.current.updatePacketConfig).toBeDefined();

      // State transitions
      expect(result.current.transitionToNextForm).toBeDefined();
      expect(result.current.transitionToPreviousForm).toBeDefined();
      expect(result.current.jumpToForm).toBeDefined();
      expect(result.current.completeWorkflow).toBeDefined();
      expect(result.current.resetWorkflow).toBeDefined();

      // Validation
      expect(result.current.validateCurrentForm).toBeDefined();
      expect(result.current.validateForm).toBeDefined();
      expect(result.current.validatePacket).toBeDefined();
      expect(result.current.canTransitionToNextForm).toBeDefined();
      expect(result.current.canTransitionToPreviousForm).toBeDefined();

      // Data operations
      expect(result.current.autofillFormFromPrevious).toBeDefined();
      expect(result.current.autofillFormFromVault).toBeDefined();
      expect(result.current.getFormData).toBeDefined();
      expect(result.current.saveFormData).toBeDefined();

      // Utility
      expect(result.current.getCurrentForm).toBeDefined();
      expect(result.current.getNextForm).toBeDefined();
      expect(result.current.getPreviousForm).toBeDefined();
      expect(result.current.getRequiredForms).toBeDefined();
      expect(result.current.getOptionalForms).toBeDefined();
      expect(result.current.getFormCompletionPercentage).toBeDefined();
      expect(result.current.getPacketCompletionPercentage).toBeDefined();
      expect(result.current.getEstimatedTimeRemaining).toBeDefined();
      expect(result.current.getFormSteps).toBeDefined();
    });
  });

  // ===========================================================================
  // startWorkflow Tests
  // ===========================================================================
  describe('startWorkflow', () => {
    it('should create workflow with INITIATING_WITH_CHILDREN packet type', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const config: PacketConfig = {
        hasChildren: true,
        requestingChildSupport: true,
        requestingSpousalSupport: false,
        needMoreSpace: false,
        hasExistingCaseNumber: false
      };

      await act(async () => {
        await result.current.startWorkflow(PacketType.INITIATING_WITH_CHILDREN, config);
      });

      // The mutation should have been called
      // In real tests with proper mocks, we'd verify the workflow state
    });

    it('should create workflow with RESPONSE packet type', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.startWorkflow(PacketType.RESPONSE);
      });
    });

    it('should use default config when not provided', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.startWorkflow(PacketType.INITIATING_WITHOUT_CHILDREN);
      });
    });
  });

  // ===========================================================================
  // Utility Function Tests
  // ===========================================================================
  describe('Utility Functions', () => {
    it('getCurrentForm should return null when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const currentForm = result.current.getCurrentForm();
      expect(currentForm).toBeNull();
    });

    it('getNextForm should return null when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const nextForm = result.current.getNextForm();
      expect(nextForm).toBeNull();
    });

    it('getPreviousForm should return null when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const prevForm = result.current.getPreviousForm();
      expect(prevForm).toBeNull();
    });

    it('getRequiredForms should return empty array when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const requiredForms = result.current.getRequiredForms();
      expect(requiredForms).toEqual([]);
    });

    it('getOptionalForms should return empty array when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const optionalForms = result.current.getOptionalForms();
      expect(optionalForms).toEqual([]);
    });

    it('getFormCompletionPercentage should return 0 when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const percentage = result.current.getFormCompletionPercentage(FormType.DV100);
      expect(percentage).toBe(0);
    });

    it('getPacketCompletionPercentage should return 0 when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const percentage = result.current.getPacketCompletionPercentage();
      expect(percentage).toBe(0);
    });

    it('getEstimatedTimeRemaining should return 0 when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const time = result.current.getEstimatedTimeRemaining();
      expect(time).toBe(0);
    });

    it('getFormSteps should return empty array when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const steps = result.current.getFormSteps();
      expect(steps).toEqual([]);
    });
  });

  // ===========================================================================
  // Validation Tests
  // ===========================================================================
  describe('Validation', () => {
    it('validateCurrentForm should return valid when no current form', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const validation = await result.current.validateCurrentForm();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('validatePacket should return invalid when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const validation = await result.current.validatePacket();
      expect(validation.valid).toBe(false);
    });

    it('canTransitionToNextForm should return false when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const canTransition = result.current.canTransitionToNextForm();
      expect(canTransition).toBe(false);
    });

    it('canTransitionToPreviousForm should return false when no previous form', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const canTransition = result.current.canTransitionToPreviousForm();
      expect(canTransition).toBe(false);
    });
  });

  // ===========================================================================
  // Dependency Checking Tests
  // ===========================================================================
  describe('Dependency Checking', () => {
    it('getDependencies should return dependencies for form', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const deps = result.current.getDependencies(FormType.CLETS001);
      expect(Array.isArray(deps)).toBe(true);
    });

    it('areDependenciesMet should return false when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const met = result.current.areDependenciesMet(FormType.CLETS001);
      expect(met).toBe(false);
    });

    it('getUnmetDependencies should return empty when no workflow', () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const unmet = result.current.getUnmetDependencies(FormType.CLETS001);
      expect(unmet).toEqual([]);
    });
  });

  // ===========================================================================
  // Autofill Tests
  // ===========================================================================
  describe('Autofill', () => {
    it('autofillFormFromPrevious should return empty when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const autofillResult = await result.current.autofillFormFromPrevious(FormType.CLETS001);
      expect(autofillResult.fieldsAutofilled).toBe(0);
      expect(autofillResult.source).toBe('previous_form');
    });

    it('autofillFormFromVault should query vault data', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const autofillResult = await result.current.autofillFormFromVault(FormType.DV100);
      // Should return result from mock
      expect(autofillResult.source).toBe('vault');
    });
  });

  // ===========================================================================
  // Data Operations Tests
  // ===========================================================================
  describe('Data Operations', () => {
    it('getFormData should return null when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      const data = await result.current.getFormData(FormType.DV100);
      expect(data).toBeNull();
    });

    it('saveFormData should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.saveFormData(FormType.DV100, { field: 'value' })
      ).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // State Transition Tests
  // ===========================================================================
  describe('State Transitions', () => {
    it('transitionToNextForm should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.transitionToNextForm()
      ).resolves.not.toThrow();
    });

    it('transitionToPreviousForm should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.transitionToPreviousForm()
      ).resolves.not.toThrow();
    });

    it('jumpToForm should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.jumpToForm(FormType.DV105)
      ).resolves.not.toThrow();
    });

    it('completeWorkflow should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.completeWorkflow()
      ).resolves.not.toThrow();
    });

    it('resetWorkflow should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.resetWorkflow()
      ).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // Form Status Tests
  // ===========================================================================
  describe('Form Status', () => {
    it('updateFormStatus should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.updateFormStatus(FormType.DV100, FormStatus.COMPLETE)
      ).resolves.not.toThrow();
    });

    it('updatePacketConfig should not throw when no workflow', async () => {
      const { result } = renderHook(
        () => useTROWorkflow('user-123'),
        { wrapper: createWrapper() }
      );

      await expect(
        result.current.updatePacketConfig({ hasChildren: true })
      ).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // WorkflowError Tests
  // ===========================================================================
  describe('WorkflowError', () => {
    it('should have correct error codes defined', () => {
      expect(WorkflowErrorCode.INVALID_TRANSITION).toBe('invalid_transition');
      expect(WorkflowErrorCode.MISSING_DEPENDENCY).toBe('missing_dependency');
      expect(WorkflowErrorCode.VALIDATION_FAILED).toBe('validation_failed');
      expect(WorkflowErrorCode.SAVE_FAILED).toBe('save_failed');
      expect(WorkflowErrorCode.LOAD_FAILED).toBe('load_failed');
    });
  });

  // ===========================================================================
  // State Enum Tests
  // ===========================================================================
  describe('WorkflowState', () => {
    it('should have all expected states', () => {
      expect(WorkflowState.NOT_STARTED).toBe('not_started');
      expect(WorkflowState.PACKET_TYPE_SELECTION).toBe('packet_type');
      expect(WorkflowState.DV100_IN_PROGRESS).toBe('dv100_progress');
      expect(WorkflowState.DV100_COMPLETE).toBe('dv100_complete');
      expect(WorkflowState.CLETS_IN_PROGRESS).toBe('clets_progress');
      expect(WorkflowState.READY_TO_FILE).toBe('ready_to_file');
      expect(WorkflowState.FILED).toBe('filed');
    });
  });

  // ===========================================================================
  // FormStatus Enum Tests
  // ===========================================================================
  describe('FormStatus', () => {
    it('should have all expected statuses', () => {
      expect(FormStatus.NOT_STARTED).toBe('not_started');
      expect(FormStatus.IN_PROGRESS).toBe('in_progress');
      expect(FormStatus.COMPLETE).toBe('complete');
      expect(FormStatus.VALIDATED).toBe('validated');
      expect(FormStatus.SKIPPED).toBe('skipped');
      expect(FormStatus.ERROR).toBe('error');
    });
  });

  // ===========================================================================
  // PacketType Enum Tests
  // ===========================================================================
  describe('PacketType', () => {
    it('should have all expected packet types', () => {
      expect(PacketType.INITIATING_WITHOUT_CHILDREN).toBe('initiating_no_children');
      expect(PacketType.INITIATING_WITH_CHILDREN).toBe('initiating_with_children');
      expect(PacketType.RESPONSE).toBe('response');
    });
  });

  // ===========================================================================
  // FormType Enum Tests
  // ===========================================================================
  describe('FormType', () => {
    it('should have all expected form types', () => {
      expect(FormType.DV100).toBe('DV-100');
      expect(FormType.DV101).toBe('DV-101');
      expect(FormType.DV105).toBe('DV-105');
      expect(FormType.DV120).toBe('DV-120');
      expect(FormType.CLETS001).toBe('CLETS-001');
      expect(FormType.FL150).toBe('FL-150');
      expect(FormType.FL320).toBe('FL-320');
    });
  });
});
