import { useCallback } from 'react';

/**
 * Hook for intelligent link prefetching on hover
 * Returns handlers for onMouseEnter and onMouseLeave
 */
export const usePrefetchOnHover = (
  prefetchFn: () => void,
  cancelFn?: () => void,
  delay: number = 100
) => {
  const handleMouseEnter = useCallback(() => {
    prefetchFn();
  }, [prefetchFn]);

  const handleMouseLeave = useCallback(() => {
    if (cancelFn) {
      cancelFn();
    }
  }, [cancelFn]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
};

/**
 * Higher-order function to create prefetch handlers for links
 * Usage: const handlers = createPrefetchHandlers(preloadDistributionCalculator, cancelDistributionCalculator);
 */
export const createPrefetchHandlers = (
  prefetchFn: () => void,
  cancelFn?: () => void
) => ({
  onMouseEnter: prefetchFn,
  onMouseLeave: cancelFn || (() => {}),
});
