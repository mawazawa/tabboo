import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  snapAllToGrid,
  alignHorizontal,
  alignVertical,
  distributeEvenly,
} from '@/utils/fieldPresets';
import { autofillAllFromVault, type PersonalVaultData } from '@/utils/vaultFieldMatcher';
import type {
  FormData,
  FieldPositions,
  ValidationRules,
  ValidationErrors,
  ValidationRule,
} from '@/types/FormData';
import type { FormTemplate } from '@/utils/templateManager';

interface UseFieldOperationsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  fieldPositions: FieldPositions;
  setFieldPositions: React.Dispatch<React.SetStateAction<FieldPositions>>;
  validationRules: ValidationRules;
  setValidationRules: React.Dispatch<React.SetStateAction<ValidationRules>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  selectedFields: string[];
  copiedFieldPositions: FieldPositions | null;
  setCopiedFieldPositions: React.Dispatch<React.SetStateAction<FieldPositions | null>>;
  vaultData: PersonalVaultData | null;
  hasUnsavedChanges: React.MutableRefObject<boolean>;
}

export function useFieldOperations({
  formData,
  setFormData,
  fieldPositions,
  setFieldPositions,
  validationRules,
  setValidationRules,
  setValidationErrors,
  selectedFields,
  copiedFieldPositions,
  setCopiedFieldPositions,
  vaultData,
  hasUnsavedChanges,
}: UseFieldOperationsProps) {
  const { toast } = useToast();

  const updateField = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      hasUnsavedChanges.current = true;

      // Validate field if it has rules
      if (validationRules[field]) {
        const { validateField } = require('@/utils/fieldValidator');
        const errors = validateField(field, value, validationRules[field]);
        setValidationErrors((prev) => ({
          ...prev,
          [field]: errors,
        }));
      }
    },
    [validationRules, setFormData, setValidationErrors, hasUnsavedChanges]
  );

  const handleAutofillAll = useCallback(() => {
    if (!vaultData) {
      toast({
        title: 'No vault data',
        description: 'Please fill out your Personal Data Vault first',
        variant: 'destructive',
      });
      return;
    }

    const autofilled = autofillAllFromVault(vaultData);
    const fieldsCount = Object.keys(autofilled).length;

    if (fieldsCount === 0) {
      toast({
        title: 'Nothing to autofill',
        description: 'No matching fields found for your vault data',
        variant: 'destructive',
      });
      return;
    }

    setFormData((prev) => ({ ...prev, ...autofilled }));
    hasUnsavedChanges.current = true;
    toast({
      title: 'Success!',
      description: `Autofilled ${fieldsCount} field(s)`,
    });
  }, [vaultData, toast, setFormData, hasUnsavedChanges]);

  const updateFieldPosition = useCallback(
    (field: string, position: { top: number; left: number }) => {
      setFieldPositions((prev) => ({ ...prev, [field]: position }));
      hasUnsavedChanges.current = true;
    },
    [setFieldPositions, hasUnsavedChanges]
  );

  const handleSnapToGrid = useCallback(
    (gridSize: number) => {
      const fieldNames = selectedFields.length > 0 ? selectedFields : Object.keys(fieldPositions);
      const updated = snapAllToGrid(fieldPositions, fieldNames, gridSize);
      setFieldPositions(updated);
      hasUnsavedChanges.current = true;
      toast({
        title: 'Snapped to grid',
        description: `${fieldNames.length} field(s) aligned to ${gridSize}% grid`,
      });
    },
    [fieldPositions, selectedFields, toast, setFieldPositions, hasUnsavedChanges]
  );

  const handleAlignHorizontal = useCallback(
    (alignment: 'left' | 'center' | 'right') => {
      const updated = alignHorizontal(fieldPositions, selectedFields, alignment);
      setFieldPositions(updated);
      hasUnsavedChanges.current = true;
      toast({
        title: 'Aligned horizontally',
        description: `${selectedFields.length} field(s) aligned ${alignment}`,
      });
    },
    [fieldPositions, selectedFields, toast, setFieldPositions, hasUnsavedChanges]
  );

  const handleAlignVertical = useCallback(
    (alignment: 'top' | 'middle' | 'bottom') => {
      const updated = alignVertical(fieldPositions, selectedFields, alignment);
      setFieldPositions(updated);
      hasUnsavedChanges.current = true;
      toast({
        title: 'Aligned vertically',
        description: `${selectedFields.length} field(s) aligned ${alignment}`,
      });
    },
    [fieldPositions, selectedFields, toast, setFieldPositions, hasUnsavedChanges]
  );

  const handleDistribute = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      const updated = distributeEvenly(fieldPositions, selectedFields, direction);
      setFieldPositions(updated);
      hasUnsavedChanges.current = true;
      toast({
        title: 'Distributed evenly',
        description: `${selectedFields.length} field(s) spaced ${direction}ly`,
      });
    },
    [fieldPositions, selectedFields, toast, setFieldPositions, hasUnsavedChanges]
  );

  const handleCopyPositions = useCallback(() => {
    if (selectedFields.length === 0) return;
    const copied: Record<string, { top: number; left: number }> = {};
    selectedFields.forEach((field) => {
      if (fieldPositions[field]) {
        copied[field] = { ...fieldPositions[field] };
      }
    });
    setCopiedFieldPositions(copied);
    toast({
      title: 'Copied',
      description: `${selectedFields.length} field position(s) copied to clipboard`,
    });
  }, [selectedFields, fieldPositions, toast, setCopiedFieldPositions]);

  const handlePastePositions = useCallback(() => {
    if (!copiedFieldPositions || selectedFields.length === 0) return;

    const copiedFields = Object.keys(copiedFieldPositions);
    if (copiedFields.length === 0) return;

    const updated = { ...fieldPositions };

    // If pasting to same number of fields, apply directly with slight offset
    if (selectedFields.length === copiedFields.length) {
      selectedFields.forEach((targetField, index) => {
        const sourceField = copiedFields[index];
        if (copiedFieldPositions[sourceField]) {
          updated[targetField] = {
            top: copiedFieldPositions[sourceField].top + 2,
            left: copiedFieldPositions[sourceField].left + 2,
          };
        }
      });
    } else {
      // If different number, apply first copied position to all selected
      const firstCopiedPosition = copiedFieldPositions[copiedFields[0]];
      selectedFields.forEach((field, index) => {
        updated[field] = {
          top: firstCopiedPosition.top + index * 2,
          left: firstCopiedPosition.left + index * 2,
        };
      });
    }

    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({
      title: 'Pasted',
      description: `Applied positions to ${selectedFields.length} field(s)`,
    });
  }, [copiedFieldPositions, selectedFields, fieldPositions, toast, setFieldPositions, hasUnsavedChanges]);

  const handleTransformPositions = useCallback(
    (transformation: { offsetX?: number; offsetY?: number; scale?: number }) => {
      if (selectedFields.length === 0) return;

      const updated = { ...fieldPositions };
      selectedFields.forEach((field) => {
        if (updated[field]) {
          const pos = updated[field];
          updated[field] = {
            top: transformation.scale ? pos.top * transformation.scale : pos.top + (transformation.offsetY || 0),
            left: transformation.scale ? pos.left * transformation.scale : pos.left + (transformation.offsetX || 0),
          };
        }
      });

      setFieldPositions(updated);
      hasUnsavedChanges.current = true;
      toast({
        title: 'Transformed',
        description: `Applied transformation to ${selectedFields.length} field(s)`,
      });
    },
    [selectedFields, fieldPositions, toast, setFieldPositions, hasUnsavedChanges]
  );

  const handleApplyGroup = useCallback(
    (groupPositions: Record<string, { top: number; left: number }>) => {
      const updated = { ...fieldPositions, ...groupPositions };
      setFieldPositions(updated);
      hasUnsavedChanges.current = true;
    },
    [fieldPositions, setFieldPositions, hasUnsavedChanges]
  );

  const handleApplyTemplate = useCallback(
    (template: FormTemplate) => {
      setFieldPositions(template.fields);
      hasUnsavedChanges.current = true;
      toast({
        title: 'Template applied',
        description: `Loaded ${Object.keys(template.fields).length} field positions`,
      });
    },
    [toast, setFieldPositions, hasUnsavedChanges]
  );

  const handleSaveValidationRules = useCallback(
    (fieldName: string, rules: ValidationRule[]) => {
      setValidationRules((prev) => ({
        ...prev,
        [fieldName]: rules,
      }));
      hasUnsavedChanges.current = true;

      // Re-validate the field immediately with new rules
      const { validateField } = require('@/utils/fieldValidator');
      const errors = validateField(fieldName, formData[fieldName], rules);
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: errors,
      }));
    },
    [formData, setValidationRules, setValidationErrors, hasUnsavedChanges]
  );

  return {
    updateField,
    handleAutofillAll,
    updateFieldPosition,
    handleSnapToGrid,
    handleAlignHorizontal,
    handleAlignVertical,
    handleDistribute,
    handleCopyPositions,
    handlePastePositions,
    handleTransformPositions,
    handleApplyGroup,
    handleApplyTemplate,
    handleSaveValidationRules,
  };
}
