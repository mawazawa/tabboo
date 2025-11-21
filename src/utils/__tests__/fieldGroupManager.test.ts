import { describe, it, expect } from 'vitest';
import {
  createRelativePositions,
  applyGroupToFields,
  validateGroup,
  FieldGroup,
  FieldGroupItem,
} from '../fieldGroupManager';

describe('fieldGroupManager', () => {
  describe('createRelativePositions', () => {
    it('should calculate relative positions correctly', () => {
      const fieldPositions = {
        field1: { top: 100, left: 50 },
        field2: { top: 150, left: 100 },
        field3: { top: 120, left: 75 },
      };
      const selectedFields = ['field1', 'field2', 'field3'];

      const result = createRelativePositions(selectedFields, fieldPositions);

      expect(result).toHaveLength(3);
      // field1 should be anchor (0, 0) since it has min top and min left
      expect(result[0]).toEqual({
        fieldName: 'field1',
        relativeTop: 0,
        relativeLeft: 0,
      });
      // field2 is 50px down and 50px right from field1
      expect(result[1]).toEqual({
        fieldName: 'field2',
        relativeTop: 50,
        relativeLeft: 50,
      });
      // field3 is 20px down and 25px right from field1
      expect(result[2]).toEqual({
        fieldName: 'field3',
        relativeTop: 20,
        relativeLeft: 25,
      });
    });

    it('should return empty array for empty selection', () => {
      const fieldPositions = {
        field1: { top: 100, left: 50 },
      };
      const selectedFields: string[] = [];

      const result = createRelativePositions(selectedFields, fieldPositions);

      expect(result).toEqual([]);
    });

    /**
     * BUG FIX TEST: This test verifies the fix for the missing null check.
     *
     * Before the fix, this test would throw:
     * TypeError: Cannot read properties of undefined (reading 'top')
     *
     * After the fix, fields with missing positions are filtered out gracefully.
     */
    it('should handle fields with missing positions gracefully', () => {
      const fieldPositions = {
        field1: { top: 100, left: 50 },
        // field2 is intentionally missing
        field3: { top: 120, left: 75 },
      };
      const selectedFields = ['field1', 'nonexistent', 'field3'];

      // This should NOT throw an error
      const result = createRelativePositions(selectedFields, fieldPositions);

      // Should only include fields that exist in fieldPositions
      expect(result).toHaveLength(2);
      expect(result.map(r => r.fieldName)).toEqual(['field1', 'field3']);

      // Verify relative positions are calculated correctly
      expect(result[0]).toEqual({
        fieldName: 'field1',
        relativeTop: 0,
        relativeLeft: 0,
      });
      expect(result[1]).toEqual({
        fieldName: 'field3',
        relativeTop: 20,
        relativeLeft: 25,
      });
    });

    it('should handle all fields missing from positions', () => {
      const fieldPositions = {
        field1: { top: 100, left: 50 },
      };
      const selectedFields = ['nonexistent1', 'nonexistent2'];

      const result = createRelativePositions(selectedFields, fieldPositions);

      // Should return empty array when no fields have positions
      expect(result).toEqual([]);
    });

    it('should handle single field', () => {
      const fieldPositions = {
        field1: { top: 100, left: 50 },
      };
      const selectedFields = ['field1'];

      const result = createRelativePositions(selectedFields, fieldPositions);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        fieldName: 'field1',
        relativeTop: 0,
        relativeLeft: 0,
      });
    });
  });

  describe('applyGroupToFields', () => {
    it('should apply group positions to target fields', () => {
      const group: FieldGroup = {
        id: 'test-group',
        name: 'Test Group',
        createdAt: new Date().toISOString(),
        fields: [
          { fieldName: 'source1', relativeTop: 0, relativeLeft: 0 },
          { fieldName: 'source2', relativeTop: 50, relativeLeft: 100 },
        ],
      };
      const targetFields = ['target1', 'target2'];
      const anchorTop = 200;
      const anchorLeft = 150;

      const result = applyGroupToFields(group, targetFields, anchorTop, anchorLeft);

      expect(result).toEqual({
        target1: { top: 200, left: 150 },
        target2: { top: 250, left: 250 },
      });
    });

    it('should handle more target fields than group fields', () => {
      const group: FieldGroup = {
        id: 'test-group',
        name: 'Test Group',
        createdAt: new Date().toISOString(),
        fields: [
          { fieldName: 'source1', relativeTop: 0, relativeLeft: 0 },
        ],
      };
      const targetFields = ['target1', 'target2', 'target3'];
      const anchorTop = 100;
      const anchorLeft = 50;

      const result = applyGroupToFields(group, targetFields, anchorTop, anchorLeft);

      // Only first target field should be positioned
      expect(Object.keys(result)).toHaveLength(1);
      expect(result.target1).toEqual({ top: 100, left: 50 });
    });
  });

  describe('validateGroup', () => {
    it('should validate a correct group', () => {
      const validGroup = {
        id: 'test-id',
        name: 'Test Group',
        createdAt: '2025-11-21T00:00:00Z',
        fields: [
          { fieldName: 'field1', relativeTop: 0, relativeLeft: 0 },
        ],
      };

      expect(validateGroup(validGroup)).toBe(true);
    });

    it('should reject group with missing required fields', () => {
      const invalidGroup = {
        id: 'test-id',
        name: 'Test Group',
        // missing createdAt and fields
      };

      expect(validateGroup(invalidGroup)).toBe(false);
    });

    it('should reject group with invalid field structure', () => {
      const invalidGroup = {
        id: 'test-id',
        name: 'Test Group',
        createdAt: '2025-11-21T00:00:00Z',
        fields: [
          { fieldName: 'field1' }, // missing relativeTop and relativeLeft
        ],
      };

      expect(validateGroup(invalidGroup)).toBe(false);
    });

    it('should reject null or non-object values', () => {
      expect(validateGroup(null)).toBe(false);
      expect(validateGroup(undefined)).toBe(false);
      expect(validateGroup('string')).toBe(false);
      expect(validateGroup(123)).toBe(false);
    });
  });
});
