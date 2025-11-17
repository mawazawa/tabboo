import { useState, useCallback, useRef, useEffect } from 'react';

interface UseLiveRegionOptions {
  /**
   * Default politeness level
   * @default 'polite'
   */
  defaultPoliteness?: 'polite' | 'assertive';

  /**
   * Auto-clear messages after this duration (ms)
   * Set to 0 to disable auto-clear
   * @default 3000
   */
  clearAfter?: number;

  /**
   * Debounce announcements (ms) to prevent spam
   * Useful for rapid updates like typing or dragging
   * @default 0
   */
  debounce?: number;
}

interface LiveRegionState {
  /**
   * Current message to announce
   */
  message: string;

  /**
   * Current politeness level
   */
  politeness: 'polite' | 'assertive' | 'off';
}

/**
 * Hook for managing live region announcements
 *
 * Provides an easy way to announce dynamic updates to screen reader users
 * without directly manipulating the DOM or managing multiple live region components.
 *
 * **Features:**
 * - Auto-clear messages after announcement
 * - Debounce rapid announcements
 * - Separate polite/assertive announcement methods
 * - Clear announcements on demand
 *
 * @example
 * // Basic usage
 * const { announce, LiveRegionComponent } = useLiveRegion();
 *
 * const handleSave = async () => {
 *   try {
 *     await saveForm();
 *     announce('Form saved successfully');
 *   } catch (error) {
 *     announceError('Failed to save form');
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleSave}>Save</button>
 *     <LiveRegionComponent />
 *   </>
 * );
 *
 * @example
 * // Field navigation announcements
 * const { announce } = useLiveRegion({ clearAfter: 1000 });
 *
 * const handleFieldChange = (fieldName: string, index: number, total: number) => {
 *   announce(`Field ${index + 1} of ${total}: ${fieldName}`);
 * };
 *
 * @example
 * // Debounced announcements for drag operations
 * const { announce } = useLiveRegion({ debounce: 500 });
 *
 * const handleDrag = (position: { x: number, y: number }) => {
 *   announce(`Position: ${position.x}, ${position.y}`);
 * };
 */
export const useLiveRegion = (options: UseLiveRegionOptions = {}) => {
  const {
    defaultPoliteness = 'polite',
    clearAfter = 3000,
    debounce = 0,
  } = options;

  const [state, setState] = useState<LiveRegionState>({
    message: '',
    politeness: defaultPoliteness,
  });

  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Announce a message to screen readers
   *
   * @param message - Message to announce
   * @param politeness - Override default politeness level
   */
  const announce = useCallback(
    (message: string, politeness?: 'polite' | 'assertive') => {
      // Clear existing timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      const doAnnounce = () => {
        setState({
          message,
          politeness: politeness || defaultPoliteness,
        });

        // Schedule auto-clear if enabled
        if (clearAfter > 0) {
          clearTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, message: '' }));
          }, clearAfter);
        }
      };

      // Apply debounce if enabled
      if (debounce > 0) {
        debounceTimeoutRef.current = setTimeout(doAnnounce, debounce);
      } else {
        doAnnounce();
      }
    },
    [defaultPoliteness, clearAfter, debounce]
  );

  /**
   * Announce a polite (non-urgent) message
   */
  const announcePolite = useCallback(
    (message: string) => announce(message, 'polite'),
    [announce]
  );

  /**
   * Announce an assertive (urgent) message
   * Use for errors, warnings, or critical updates
   */
  const announceAssertive = useCallback(
    (message: string) => announce(message, 'assertive'),
    [announce]
  );

  /**
   * Announce an error message (shorthand for announceAssertive)
   */
  const announceError = useCallback(
    (message: string) => announceAssertive(`Error: ${message}`),
    [announceAssertive]
  );

  /**
   * Clear the current announcement
   */
  const clear = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setState((prev) => ({ ...prev, message: '' }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Live region component to render
   * Place this once in your component tree
   */
  const LiveRegionComponent = () => (
    <div
      role="status"
      aria-live={state.politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {state.message}
    </div>
  );

  return {
    /**
     * Announce a message with optional politeness override
     */
    announce,

    /**
     * Announce a polite (non-urgent) message
     */
    announcePolite,

    /**
     * Announce an assertive (urgent) message
     */
    announceAssertive,

    /**
     * Announce an error message
     */
    announceError,

    /**
     * Clear the current announcement
     */
    clear,

    /**
     * Current announcement state (for debugging)
     */
    state,

    /**
     * Live region component to render
     */
    LiveRegionComponent,
  };
};

/**
 * Example usage patterns
 */
export const useLiveRegionExamples = () => {
  // Example 1: Form save announcements
  const saveExample = () => {
    const { announce, announceError, LiveRegionComponent } = useLiveRegion();

    const handleSave = async () => {
      try {
        await fetch('/api/save');
        announce('Form saved successfully');
      } catch (error) {
        announceError('Failed to save form. Please try again.');
      }
    };

    return { handleSave, LiveRegionComponent };
  };

  // Example 2: Field navigation
  const navigationExample = () => {
    const { announce, LiveRegionComponent } = useLiveRegion({
      clearAfter: 1000, // Quick clear for rapid navigation
    });

    const handleFieldChange = (index: number, total: number, name: string) => {
      announce(`Field ${index + 1} of ${total}: ${name}`);
    };

    return { handleFieldChange, LiveRegionComponent };
  };

  // Example 3: Drag and drop
  const dragExample = () => {
    const { announce, LiveRegionComponent } = useLiveRegion({
      debounce: 500, // Debounce rapid position updates
    });

    const handleDragEnd = (fieldName: string, x: number, y: number) => {
      announce(`${fieldName} moved to position ${x}, ${y}`);
    };

    return { handleDragEnd, LiveRegionComponent };
  };

  // Example 4: Validation errors
  const validationExample = () => {
    const { announceError, LiveRegionComponent } = useLiveRegion({
      clearAfter: 5000, // Keep errors visible longer
    });

    const handleValidationError = (errors: string[]) => {
      if (errors.length === 1) {
        announceError(errors[0]);
      } else {
        announceError(`${errors.length} validation errors found`);
      }
    };

    return { handleValidationError, LiveRegionComponent };
  };

  return {
    saveExample,
    navigationExample,
    dragExample,
    validationExample,
  };
};
