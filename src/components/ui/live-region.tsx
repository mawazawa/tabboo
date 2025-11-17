import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LiveRegionProps {
  /**
   * Message to announce to screen readers
   * Changes to this prop will trigger announcements
   */
  message: string;

  /**
   * Politeness level for announcements
   * - 'polite': Wait for user to finish (default, for most updates)
   * - 'assertive': Interrupt immediately (for urgent updates like errors)
   * - 'off': Don't announce (temporarily disable)
   */
  politeness?: 'polite' | 'assertive' | 'off';

  /**
   * Whether to announce atomic changes
   * If true, announces entire region when any part changes
   */
  atomic?: boolean;

  /**
   * Optional className for styling (usually sr-only)
   */
  className?: string;

  /**
   * Clear message after announcement (milliseconds)
   * Prevents stale messages from being re-announced
   */
  clearAfter?: number;
}

/**
 * Live Region component for screen reader announcements
 *
 * Uses ARIA live regions to announce dynamic content changes to screen reader users
 * without moving focus or interrupting their workflow.
 *
 * **When to use:**
 * - Form validation errors
 * - Save confirmations
 * - Loading state updates
 * - Navigation changes
 * - Dynamic content updates
 *
 * **Best practices:**
 * - Use 'polite' for most updates (default)
 * - Use 'assertive' only for urgent/critical updates (errors, warnings)
 * - Keep messages concise and clear
 * - Clear messages after announcement to prevent re-announcement
 *
 * @example
 * // Basic usage
 * <LiveRegion message="Form saved successfully" />
 *
 * @example
 * // Assertive for errors
 * <LiveRegion
 *   message="Error: Invalid email address"
 *   politeness="assertive"
 *   clearAfter={5000}
 * />
 *
 * @example
 * // With controlled state
 * const [announcement, setAnnouncement] = useState('');
 *
 * useEffect(() => {
 *   if (saveSuccess) {
 *     setAnnouncement('Form saved successfully');
 *   }
 * }, [saveSuccess]);
 *
 * <LiveRegion message={announcement} clearAfter={3000} />
 */
export const LiveRegion = ({
  message,
  politeness = 'polite',
  atomic = false,
  className,
  clearAfter,
}: LiveRegionProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If clearAfter is set and message exists, schedule clearing
    if (clearAfter && message && regionRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearAfter);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      role={politeness === 'off' ? 'status' : undefined}
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  );
};

/**
 * Status live region (polite announcements)
 *
 * Common pattern for non-urgent status updates like save confirmations,
 * loading states, and general notifications.
 *
 * @example
 * <LiveRegionStatus message="Saving form..." />
 */
export const LiveRegionStatus = ({
  message,
  clearAfter = 3000,
  ...props
}: Omit<LiveRegionProps, 'politeness'>) => (
  <LiveRegion
    message={message}
    politeness="polite"
    clearAfter={clearAfter}
    {...props}
  />
);

/**
 * Alert live region (assertive announcements)
 *
 * For urgent messages that should interrupt the user immediately,
 * such as errors, warnings, or critical updates.
 *
 * @example
 * <LiveRegionAlert message="Error: Failed to save form" />
 */
export const LiveRegionAlert = ({
  message,
  clearAfter = 5000,
  ...props
}: Omit<LiveRegionProps, 'politeness'>) => (
  <LiveRegion
    message={message}
    politeness="assertive"
    clearAfter={clearAfter}
    {...props}
  />
);
