import { useEffect, useState, useCallback, useRef } from "react";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";

interface UseFieldNavigationKeyboardProps {
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  adjustPosition: (direction: 'up' | 'down' | 'left' | 'right') => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  showPositionControl: boolean;
  setShowPositionControl: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const useFieldNavigationKeyboard = ({
  currentFieldIndex,
  setCurrentFieldIndex,
  adjustPosition,
  showSearch,
  setShowSearch,
  showPositionControl,
  setShowPositionControl,
  searchInputRef
}: UseFieldNavigationKeyboardProps) => {
  const [pressedKey, setPressedKey] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  // Track timeout ID for cleanup to prevent memory leaks
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adjustPositionCallback = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    adjustPosition(direction);
  }, [adjustPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
        
        // Clear any existing timeout before creating a new one
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }
        
        // Store timeout ID for cleanup
        focusTimeoutRef.current = setTimeout(() => {
          searchInputRef.current?.focus();
          focusTimeoutRef.current = null;
        }, 100);
        return;
      }

      if (modKey && e.key === 'k') {
        e.preventDefault();
        setShowPositionControl(prev => !prev);
        return;
      }

      if (e.key === 'Tab' && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        if (e.shiftKey) {
          setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));
        } else {
          setCurrentFieldIndex(Math.min(FL_320_FIELD_CONFIG.length - 1, currentFieldIndex + 1));
        }
        return;
      }

      const activeElement = document.activeElement as HTMLElement;
      const isActivelyTyping = activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
        activeElement.classList.contains('field-input');

      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
      const shouldMoveField = isArrowKey && (e.altKey || !isActivelyTyping);

      if (shouldMoveField) {
        e.preventDefault();
        if (currentFieldIndex === -1 || !FL_320_FIELD_CONFIG[currentFieldIndex]) {
          setCurrentFieldIndex(0);
          return;
        }

        const direction = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        }[e.key] as 'up' | 'down' | 'left' | 'right';

        requestAnimationFrame(() => setPressedKey(direction));
        adjustPositionCallback(direction);
      }

      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false);
        } else if (showPositionControl) {
          setShowPositionControl(false);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        requestAnimationFrame(() => setPressedKey(null));
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Clean up any pending timeout to prevent memory leaks
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
  }, [currentFieldIndex, showPositionControl, showSearch, adjustPositionCallback, setCurrentFieldIndex, setShowSearch, setShowPositionControl, searchInputRef]);

  return { pressedKey };
};

