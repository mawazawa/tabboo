import { useEffect } from 'react';
import type { FieldPosition } from '@/types/FormData';

interface UseKeyboardNavigationProps {
  isEditMode: boolean;
  currentFieldIndex: number;
  fieldNameToIndex: Record<string, number>;
  adjustPosition: (direction: 'up' | 'down' | 'left' | 'right', field: string, customStep?: number) => void;
}

/**
 * Hook to handle keyboard navigation for field positioning in Edit Mode
 *
 * In Edit Mode with a selected field:
 * - Arrow keys move the field (even if input is focused)
 * - Shift + Arrow moves 5% instead of 0.5%
 * - Prevents default arrow key behavior in inputs
 *
 * In Fill Mode:
 * - Arrow keys work normally in inputs
 */
export function useKeyboardNavigation({
  isEditMode,
  currentFieldIndex,
  fieldNameToIndex,
  adjustPosition,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);

      // In Edit Mode with selected field: arrow keys move the field, even if input is focused
      if (isEditMode && currentFieldIndex >= 0 && isArrowKey) {
        const field = Object.keys(fieldNameToIndex).find(
          f => fieldNameToIndex[f] === currentFieldIndex
        );

        if (!field) return;

        e.preventDefault(); // Prevent default arrow key behavior in input
        const step = e.shiftKey ? 5 : 0.5; // Shift key for faster movement

        if (e.key === 'ArrowUp') {
          adjustPosition('up', field, step);
        } else if (e.key === 'ArrowDown') {
          adjustPosition('down', field, step);
        } else if (e.key === 'ArrowLeft') {
          adjustPosition('left', field, step);
        } else if (e.key === 'ArrowRight') {
          adjustPosition('right', field, step);
        }
        return; // Exit early - we handled the arrow key
      }

      // In Fill Mode: ignore arrow keys if user is typing in an input field
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, currentFieldIndex, fieldNameToIndex, adjustPosition]);
}
