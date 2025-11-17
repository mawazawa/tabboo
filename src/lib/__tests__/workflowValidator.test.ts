/**
 * Workflow Validator Tests
 *
 * Tests for form and packet validation logic in the TRO workflow engine.
 *
 * @version 1.0
 * @date November 17, 2025
 */

import { describe, it, expect } from 'vitest';
import {
  validatePacketData,
  validateFormData,
  isFormComplete,
  getFormCompletionPercentage
} from '../workflowValidator';
import {
  FormType,
  FormStatus,
  PacketType,
  type TROWorkflow
} from '@/types/WorkflowTypes';

describe('workflowValidator', () => {
  describe('validatePacketData - Conditional Form Requirements', () => {
    /**
     * BUG FIX TEST: FL-150 validation should fail when form is IN_PROGRESS
     *
     * This test verifies that when a user is requesting support, FL-150 must be
     * COMPLETE or VALIDATED before the packet can be filed. Previously, the
     * validation only checked for SKIPPED or NOT_STARTED, allowing IN_PROGRESS
     * forms to pass validation incorrectly.
     */
    it('should require FL-150 to be COMPLETE when requesting child support, not just started', () => {
      const workflow: TROWorkflow = {
        id: 'test-workflow-1',
        userId: 'test-user',
        packetType: PacketType.INITIATING_WITHOUT_CHILDREN,
        currentState: 'review_progress' as any,
        formStatuses: {
          [FormType.DV100]: FormStatus.COMPLETE,
          [FormType.CLETS001]: FormStatus.COMPLETE,
          [FormType.FL150]: FormStatus.IN_PROGRESS, // Bug: This should fail validation
        },
        packetConfig: {
          hasChildren: false,
          requestingChildSupport: true, // FL-150 is required
          requestingSpousalSupport: false,
          needMoreSpace: false,
          hasExistingCaseNumber: false
        },
        formDataRefs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const formData = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Doe',
          restrainedPersonName: 'John Doe',
          relationship: 'spouse',
          abuseDescription: 'Detailed description of abuse incidents',
          ordersRequested: true,
          signatureDate: '2025-11-17',
          signature: 'Jane Doe',
          physicalAbuse: true,  // Required: at least one abuse type must be indicated
          personalConductOrders: true  // Required: at least one order type must be requested
        },
        [FormType.CLETS001]: {
          protectedPersonName: 'Jane Doe',
          protectedPersonAddress: '123 Main St',
          protectedPersonCity: 'Los Angeles',
          protectedPersonState: 'CA',
          protectedPersonZip: '90001',
          protectedPersonDOB: '1990-01-01',
          protectedPersonGender: 'Female',
          protectedPersonRace: 'White',
          restrainedPersonName: 'John Doe',
          restrainedPersonDOB: '1985-01-01',
          restrainedPersonGender: 'Male',
          lawEnforcementAgency: 'LAPD'
        },
        [FormType.FL150]: { partyName: 'Test' } // Incomplete form - missing required fields
      };

      const result = validatePacketData(workflow, formData);

      // Should fail validation because FL-150 is only IN_PROGRESS (not COMPLETE/VALIDATED)
      expect(result.valid).toBe(false);
      // The bug fix ensures FL-150 must be COMPLETE when requesting support
      const fl150Errors = result.errors.filter(e =>
        e.formType === FormType.FL150 && e.code === 'MISSING_REQUIRED_FORM'
      );
      expect(fl150Errors.length).toBeGreaterThan(0);
      expect(fl150Errors[0].message).toContain('FL-150');
      expect(fl150Errors[0].message).toContain('support');
    });

    it('should require FL-150 to be COMPLETE when requesting spousal support', () => {
      const workflow: TROWorkflow = {
        id: 'test-workflow-2',
        userId: 'test-user',
        packetType: PacketType.INITIATING_WITHOUT_CHILDREN,
        currentState: 'review_progress' as any,
        formStatuses: {
          [FormType.DV100]: FormStatus.COMPLETE,
          [FormType.CLETS001]: FormStatus.COMPLETE,
          [FormType.FL150]: FormStatus.ERROR, // Should also fail validation
        },
        packetConfig: {
          hasChildren: false,
          requestingChildSupport: false,
          requestingSpousalSupport: true, // FL-150 is required
          needMoreSpace: false,
          hasExistingCaseNumber: false
        },
        formDataRefs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const formData = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Doe',
          restrainedPersonName: 'John Doe',
          relationship: 'spouse',
          abuseDescription: 'Detailed description of abuse incidents',
          ordersRequested: true,
          signatureDate: '2025-11-17',
          signature: 'Jane Doe',
          physicalAbuse: true,  // Required: at least one abuse type must be indicated
          personalConductOrders: true  // Required: at least one order type must be requested
        },
        [FormType.CLETS001]: {
          protectedPersonName: 'Jane Doe',
          protectedPersonAddress: '123 Main St',
          protectedPersonCity: 'Los Angeles',
          protectedPersonState: 'CA',
          protectedPersonZip: '90001',
          protectedPersonDOB: '1990-01-01',
          protectedPersonGender: 'Female',
          protectedPersonRace: 'White',
          restrainedPersonName: 'John Doe',
          restrainedPersonDOB: '1985-01-01',
          restrainedPersonGender: 'Male',
          lawEnforcementAgency: 'LAPD'
        },
        [FormType.FL150]: {} // Empty/error form
      };

      const result = validatePacketData(workflow, formData);

      expect(result.valid).toBe(false);
      // The form status is ERROR, so it won't pass the initial check at line 686
      expect(result.errors.some(e =>
        e.formType === FormType.FL150
      )).toBe(true);
    });

    it('should pass validation when FL-150 is COMPLETE and support is requested', () => {
      const workflow: TROWorkflow = {
        id: 'test-workflow-3',
        userId: 'test-user',
        packetType: PacketType.INITIATING_WITHOUT_CHILDREN,
        currentState: 'ready_to_file' as any,
        formStatuses: {
          [FormType.DV100]: FormStatus.COMPLETE,
          [FormType.CLETS001]: FormStatus.COMPLETE,
          [FormType.FL150]: FormStatus.COMPLETE, // Properly completed
        },
        packetConfig: {
          hasChildren: false,
          requestingChildSupport: true,
          requestingSpousalSupport: false,
          needMoreSpace: false,
          hasExistingCaseNumber: false
        },
        formDataRefs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const formData = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Doe',
          restrainedPersonName: 'John Doe',
          relationship: 'spouse',
          abuseDescription: 'Detailed description of abuse incidents',
          ordersRequested: true,
          signatureDate: '2025-11-17',
          signature: 'Jane Doe',
          physicalAbuse: true,  // Required: at least one abuse type must be indicated
          personalConductOrders: true  // Required: at least one order type must be requested
        },
        [FormType.CLETS001]: {
          protectedPersonName: 'Jane Doe',
          protectedPersonAddress: '123 Main St',
          protectedPersonCity: 'Los Angeles',
          protectedPersonState: 'CA',
          protectedPersonZip: '90001',
          protectedPersonDOB: '1990-01-01',
          protectedPersonGender: 'Female',
          protectedPersonRace: 'White',
          restrainedPersonName: 'John Doe',
          restrainedPersonDOB: '1985-01-01',
          restrainedPersonGender: 'Male',
          lawEnforcementAgency: 'LAPD'
        },
        [FormType.FL150]: {
          partyName: 'Jane Doe',
          caseNumber: 'DV2025001',
          averageMonthlyIncome: 5000,
          averageMonthlyExpenses: 4000,
          signatureDate: '2025-11-17',
          signature: 'Jane Doe'
        }
      };

      const result = validatePacketData(workflow, formData);

      // Should pass validation - all required forms are complete
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * BUG FIX TEST: DV-105 validation should fail when form is IN_PROGRESS
     */
    it('should require DV-105 to be COMPLETE when children are involved, not just started', () => {
      const workflow: TROWorkflow = {
        id: 'test-workflow-4',
        userId: 'test-user',
        packetType: PacketType.INITIATING_WITH_CHILDREN,
        currentState: 'review_progress' as any,
        formStatuses: {
          [FormType.DV100]: FormStatus.COMPLETE,
          [FormType.CLETS001]: FormStatus.COMPLETE,
          [FormType.DV105]: FormStatus.NOT_STARTED, // Bug: This should fail validation
        },
        packetConfig: {
          hasChildren: true, // DV-105 is required
          requestingChildSupport: false,
          requestingSpousalSupport: false,
          needMoreSpace: false,
          hasExistingCaseNumber: false
        },
        formDataRefs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const formData = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Doe',
          restrainedPersonName: 'John Doe',
          relationship: 'spouse',
          abuseDescription: 'Detailed description of abuse incidents',
          ordersRequested: true,
          signatureDate: '2025-11-17',
          signature: 'Jane Doe',
          physicalAbuse: true,  // Required: at least one abuse type must be indicated
          personalConductOrders: true  // Required: at least one order type must be requested
        },
        [FormType.CLETS001]: {
          protectedPersonName: 'Jane Doe',
          protectedPersonAddress: '123 Main St',
          protectedPersonCity: 'Los Angeles',
          protectedPersonState: 'CA',
          protectedPersonZip: '90001',
          protectedPersonDOB: '1990-01-01',
          protectedPersonGender: 'Female',
          protectedPersonRace: 'White',
          restrainedPersonName: 'John Doe',
          restrainedPersonDOB: '1985-01-01',
          restrainedPersonGender: 'Male',
          lawEnforcementAgency: 'LAPD'
        }
      };

      const result = validatePacketData(workflow, formData);

      // Should fail validation because DV-105 is NOT_STARTED
      expect(result.valid).toBe(false);
      const dv105Errors = result.errors.filter(e => e.formType === FormType.DV105);
      expect(dv105Errors.length).toBeGreaterThan(0);
      expect(dv105Errors.some(e =>
        e.code === 'MISSING_REQUIRED_FORM' || e.code === 'INCOMPLETE_FORM' || e.code === 'FORM_DATA_MISSING'
      )).toBe(true);
    });

    it('should allow FL-150 to be SKIPPED when support is not requested', () => {
      const workflow: TROWorkflow = {
        id: 'test-workflow-5',
        userId: 'test-user',
        packetType: PacketType.INITIATING_WITHOUT_CHILDREN,
        currentState: 'ready_to_file' as any,
        formStatuses: {
          [FormType.DV100]: FormStatus.COMPLETE,
          [FormType.CLETS001]: FormStatus.COMPLETE,
          [FormType.FL150]: FormStatus.SKIPPED, // Should be OK when not requesting support
        },
        packetConfig: {
          hasChildren: false,
          requestingChildSupport: false, // Not requesting support
          requestingSpousalSupport: false,
          needMoreSpace: false,
          hasExistingCaseNumber: false
        },
        formDataRefs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const formData = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Doe',
          restrainedPersonName: 'John Doe',
          relationship: 'spouse',
          abuseDescription: 'Detailed description of abuse incidents',
          ordersRequested: true,
          signatureDate: '2025-11-17',
          signature: 'Jane Doe',
          physicalAbuse: true,  // Required: at least one abuse type must be indicated
          personalConductOrders: true  // Required: at least one order type must be requested
        },
        [FormType.CLETS001]: {
          protectedPersonName: 'Jane Doe',
          protectedPersonAddress: '123 Main St',
          protectedPersonCity: 'Los Angeles',
          protectedPersonState: 'CA',
          protectedPersonZip: '90001',
          protectedPersonDOB: '1990-01-01',
          protectedPersonGender: 'Female',
          protectedPersonRace: 'White',
          restrainedPersonName: 'John Doe',
          restrainedPersonDOB: '1985-01-01',
          restrainedPersonGender: 'Male',
          lawEnforcementAgency: 'LAPD'
        }
      };

      const result = validatePacketData(workflow, formData);

      // Should pass - FL-150 can be skipped when not requesting support
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateFormData', () => {
    it('should validate DV-100 required fields', () => {
      const incompleteData = {
        protectedPersonName: 'Test',
        // Missing required fields
      };

      const result = validateFormData(FormType.DV100, incompleteData);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass validation for complete DV-100 form', () => {
      const completeData = {
        protectedPersonName: 'Jane Doe',
        restrainedPersonName: 'John Doe',
        relationship: 'spouse',
        abuseDescription: 'Detailed description of incidents',
        ordersRequested: true,
        signatureDate: '2025-11-17',
        signature: 'Jane Doe',
        physicalAbuse: true,  // Required: at least one abuse type must be indicated
        personalConductOrders: true  // Required: at least one order type must be requested
      };

      const result = validateFormData(FormType.DV100, completeData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('isFormComplete', () => {
    it('should return false for incomplete forms', () => {
      const data = { protectedPersonName: 'Test' };
      const result = isFormComplete(FormType.DV100, data);
      expect(result).toBe(false);
    });

    it('should return true for complete forms', () => {
      const data = {
        protectedPersonName: 'Jane Doe',
        restrainedPersonName: 'John Doe',
        relationship: 'spouse',
        abuseDescription: 'Detailed description',
        ordersRequested: true,
        signatureDate: '2025-11-17',
        signature: 'Jane Doe',
        physicalAbuse: true,
        personalConductOrders: true
      };
      const result = isFormComplete(FormType.DV100, data);
      expect(result).toBe(true);
    });
  });

  describe('getFormCompletionPercentage', () => {
    it('should return 0 for empty forms', () => {
      const data = {};
      const result = getFormCompletionPercentage(FormType.DV100, data);
      expect(result).toBe(0);
    });

    it('should return 100 for complete forms', () => {
      const data = {
        protectedPersonName: 'Jane Doe',
        restrainedPersonName: 'John Doe',
        relationship: 'spouse',
        abuseDescription: 'Detailed description',
        ordersRequested: true,
        signatureDate: '2025-11-17',
        signature: 'Jane Doe',
        physicalAbuse: true,
        personalConductOrders: true
      };
      const result = getFormCompletionPercentage(FormType.DV100, data);
      expect(result).toBe(100);
    });

    it('should return partial percentage for partially complete forms', () => {
      const data = {
        protectedPersonName: 'Jane Doe',
        restrainedPersonName: 'John Doe',
        // Missing other required fields
      };
      const result = getFormCompletionPercentage(FormType.DV100, data);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });
  });
});
