import { useCallback } from "react";
import type { FieldPosition } from "@/types/FormData";

const getDefaultPosition = (field: string): { top: number; left: number } => {
  const defaults: Record<string, { top: number; left: number }> = {
    partyName: { top: 15.8, left: 5 },
    streetAddress: { top: 19, left: 5 },
    city: { top: 22.5, left: 5 },
    state: { top: 22.5, left: 29.5 },
    zipCode: { top: 22.5, left: 38 },
    telephoneNo: { top: 25.8, left: 5 },
    faxNo: { top: 25.8, left: 23 },
    email: { top: 29.2, left: 5 },
    attorneyFor: { top: 32.5, left: 5 },
  };
  return defaults[field] || { top: 0, left: 0 };
};

export const useFieldPosition = (
  currentFieldName: string,
  fieldPositions: Record<string, FieldPosition>,
  updateFieldPosition: (field: string, position: FieldPosition) => void
) => {
  // Guard against empty field name to prevent runtime errors
  const safeFieldName = currentFieldName || '';
  const currentPosition = safeFieldName ? (fieldPositions[safeFieldName] || getDefaultPosition(safeFieldName)) : { top: 0, left: 0 };

  const adjustPosition = useCallback((direction: 'up' | 'down' | 'left' | 'right', fieldName?: string, customStep?: number) => {
    const targetField = fieldName || safeFieldName;
    
    // Prevent adjusting position for invalid/empty field names
    if (!targetField) {
      return;
    }
    
    const position = fieldPositions[targetField] || getDefaultPosition(targetField);
    const step = customStep || 1.0;
    const newPosition = { ...position };

    switch (direction) {
      case 'up':
        newPosition.top = Math.max(0, newPosition.top - step);
        break;
      case 'down':
        newPosition.top = Math.min(100, newPosition.top + step);
        break;
      case 'left':
        newPosition.left = Math.max(0, newPosition.left - step);
        break;
      case 'right':
        newPosition.left = Math.min(100, newPosition.left + step);
        break;
    }

    updateFieldPosition(targetField, newPosition);
  }, [safeFieldName, fieldPositions, updateFieldPosition]);

  return { currentPosition, adjustPosition };
};

