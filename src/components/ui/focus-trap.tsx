import { useEffect, useRef, ReactNode, RefObject } from 'react';

interface FocusTrapProps {
  /**
   * Content to trap focus within
   */
  children: ReactNode;

  /**
   * Whether the focus trap is active
   * When false, focus behaves normally
   */
  active?: boolean;

  /**
   * Element to focus when trap activates
   * If not provided, focuses first focusable element
   */
  initialFocusRef?: RefObject<HTMLElement>;

  /**
   * Element to return focus to when trap deactivates
   * If not provided, returns to previously focused element
   */
  returnFocusRef?: RefObject<HTMLElement>;

  /**
   * Allow clicking outside to escape trap
   * @default false
   */
  clickOutsideToDeactivate?: boolean;

  /**
   * Allow Escape key to deactivate trap
   * @default true
   */
  escapeToDeactivate?: boolean;

  /**
   * Callback when trap deactivates
   */
  onDeactivate?: () => void;

  /**
   * Optional className for the trap container
   */
  className?: string;
}

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
    (element) => {
      // Check if element is visible
      return (
        element.offsetWidth > 0 ||
        element.offsetHeight > 0 ||
        element.getClientRects().length > 0
      );
    }
  );
};

/**
 * Focus Trap component for modal dialogs and popups
 *
 * Traps keyboard focus within a container, ensuring users can't accidentally
 * tab out of modal dialogs. Essential for WCAG 2.1 AA compliance.
 *
 * **Features:**
 * - Traps Tab/Shift+Tab within container
 * - Auto-focuses first element on activation
 * - Returns focus on deactivation
 * - Escape key to deactivate (optional)
 * - Click outside to deactivate (optional)
 *
 * **When to use:**
 * - Modal dialogs
 * - Dropdown menus
 * - Popover menus
 * - Any overlay that requires user attention
 *
 * **Best practices:**
 * - Always provide a way to close (Escape key or close button)
 * - Return focus to trigger element when closing
 * - Ensure first focusable element is meaningful (e.g., close button or first input)
 *
 * @example
 * // Basic modal with focus trap
 * <FocusTrap active={isOpen} onDeactivate={() => setIsOpen(false)}>
 *   <div className="modal">
 *     <h2>Modal Title</h2>
 *     <input placeholder="First name" />
 *     <button onClick={() => setIsOpen(false)}>Close</button>
 *   </div>
 * </FocusTrap>
 *
 * @example
 * // With custom initial focus
 * const closeButtonRef = useRef<HTMLButtonElement>(null);
 *
 * <FocusTrap
 *   active={isOpen}
 *   initialFocusRef={closeButtonRef}
 *   onDeactivate={() => setIsOpen(false)}
 * >
 *   <div className="modal">
 *     <button ref={closeButtonRef}>Close</button>
 *     <form>...</form>
 *   </div>
 * </FocusTrap>
 */
export const FocusTrap = ({
  children,
  active = true,
  initialFocusRef,
  returnFocusRef,
  clickOutsideToDeactivate = false,
  escapeToDeactivate = true,
  onDeactivate,
  className,
}: FocusTrapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store previously focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Focus initial element
    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(focusInitial, 50);

    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      // Escape key to deactivate
      if (escapeToDeactivate && event.key === 'Escape') {
        event.preventDefault();
        onDeactivate?.();
        return;
      }

      // Tab key to cycle focus
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current);

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        // Shift + Tab (backwards)
        if (event.shiftKey) {
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        }
        // Tab (forwards)
        else {
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clickOutsideToDeactivate &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onDeactivate?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    if (clickOutsideToDeactivate) {
      // Use capture phase to catch clicks before they bubble
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside, true);

      // Return focus to previous element
      if (previouslyFocusedRef.current && document.body.contains(previouslyFocusedRef.current)) {
        previouslyFocusedRef.current.focus();
      } else if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
    };
  }, [active, initialFocusRef, returnFocusRef, clickOutsideToDeactivate, escapeToDeactivate, onDeactivate]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Hook for managing focus trap state
 *
 * Provides a convenient way to manage focus trap activation/deactivation
 * along with refs for initial and return focus.
 *
 * @example
 * const {
 *   active,
 *   activate,
 *   deactivate,
 *   initialFocusRef,
 *   returnFocusRef,
 *   FocusTrapComponent
 * } = useFocusTrap();
 *
 * return (
 *   <>
 *     <button ref={returnFocusRef} onClick={activate}>
 *       Open Modal
 *     </button>
 *
 *     {active && (
 *       <FocusTrapComponent>
 *         <div className="modal">
 *           <button ref={initialFocusRef} onClick={deactivate}>
 *             Close
 *           </button>
 *         </div>
 *       </FocusTrapComponent>
 *     )}
 *   </>
 * );
 */
export const useFocusTrap = (options?: {
  escapeToDeactivate?: boolean;
  clickOutsideToDeactivate?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}) => {
  const [active, setActive] = useState(false);
  const initialFocusRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement>(null);

  const activate = useCallback(() => {
    setActive(true);
    options?.onActivate?.();
  }, [options]);

  const deactivate = useCallback(() => {
    setActive(false);
    options?.onDeactivate?.();
  }, [options]);

  const FocusTrapComponent = useCallback(
    ({ children, className }: { children: ReactNode; className?: string }) => (
      <FocusTrap
        active={active}
        initialFocusRef={initialFocusRef}
        returnFocusRef={returnFocusRef}
        escapeToDeactivate={options?.escapeToDeactivate}
        clickOutsideToDeactivate={options?.clickOutsideToDeactivate}
        onDeactivate={deactivate}
        className={className}
      >
        {children}
      </FocusTrap>
    ),
    [active, deactivate, options]
  );

  return {
    active,
    activate,
    deactivate,
    toggle: () => setActive((prev) => !prev),
    initialFocusRef,
    returnFocusRef,
    FocusTrapComponent,
  };
};

// Type imports for documentation
import { useState, useCallback } from 'react';
