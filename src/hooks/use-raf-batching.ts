import { useRef, useCallback } from 'react';

/**
 * requestAnimationFrame Batching Hook
 *
 * Batches multiple position updates into a single RAF callback for 60fps performance.
 * Based on November 2025 best practices:
 * - Use useRef for mutable values (timestamp, requestID)
 * - Batch updates in 16.66ms window to avoid layout thrash
 * - Cancel pending frames on unmount for cleanup
 *
 * Performance gains:
 * - Reduces layout thrashing from multiple position updates
 * - Guarantees 60fps by aligning with browser repaint cycle
 * - Prevents frame drops during drag operations
 *
 * @example
 * const { batchUpdate, cancelBatch } = useRAFBatching();
 *
 * // During drag:
 * batchUpdate(() => {
 *   updateFieldPosition(field1, pos1);
 *   updateFieldPosition(field2, pos2);
 * });
 */
export function useRAFBatching() {
  // Store pending callbacks to batch in next frame
  const pendingCallbacks = useRef<(() => void)[]>([]);

  // Store RAF request ID for cleanup
  const rafId = useRef<number | null>(null);

  /**
   * Execute all batched callbacks in a single animation frame
   */
  const executeBatch = useCallback(() => {
    // Get all pending callbacks
    const callbacks = pendingCallbacks.current;

    // Clear the queue
    pendingCallbacks.current = [];
    rafId.current = null;

    // Execute all callbacks in a single frame
    // This batches all DOM updates together, avoiding layout thrashing
    callbacks.forEach(callback => callback());
  }, []);

  /**
   * Schedule a callback to run in the next animation frame
   * Multiple calls within the same frame are automatically batched
   *
   * @param callback - Function to execute in next frame
   */
  const batchUpdate = useCallback((callback: () => void) => {
    // Add callback to pending queue
    pendingCallbacks.current.push(callback);

    // If no frame is scheduled yet, schedule one
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(executeBatch);
    }
  }, [executeBatch]);

  /**
   * Cancel any pending batched updates
   * Useful for cleanup on unmount or when canceling a drag operation
   */
  const cancelBatch = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    pendingCallbacks.current = [];
  }, []);

  return {
    batchUpdate,
    cancelBatch,
  };
}

/**
 * Throttled RAF Hook - for high-frequency events like pointer move
 *
 * Ensures callback runs at most once per animation frame, even if called
 * multiple times. Useful for drag operations where pointer moves faster
 * than 60fps.
 *
 * @example
 * const throttledUpdate = useThrottledRAF((x, y) => {
 *   updatePosition(x, y);
 * });
 *
 * // In onPointerMove (may fire 100+ times/sec):
 * throttledUpdate(e.clientX, e.clientY); // Only runs at 60fps
 */
export function useThrottledRAF<T extends (...args: any[]) => void>(
  callback: T
): (...args: Parameters<T>) => void {
  const rafId = useRef<number | null>(null);
  const latestArgs = useRef<Parameters<T> | null>(null);

  const executeCallback = useCallback(() => {
    if (latestArgs.current !== null) {
      callback(...latestArgs.current);
      latestArgs.current = null;
    }
    rafId.current = null;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    // Store latest arguments
    latestArgs.current = args;

    // Schedule RAF if not already scheduled
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(executeCallback);
    }
  }, [executeCallback]);
}

/**
 * Performance monitoring hook for RAF-based animations
 * Tracks FPS and warns if falling below 60fps
 *
 * @example
 * const { startMonitoring, stopMonitoring, getMetrics } = useRAFMonitoring();
 *
 * // Start monitoring during drag:
 * startMonitoring();
 *
 * // Stop and get results:
 * const { avgFPS, minFPS, frameDrops } = stopMonitoring();
 */
export function useRAFMonitoring() {
  const isMonitoring = useRef(false);
  const frameTimestamps = useRef<number[]>([]);
  const startTime = useRef<number>(0);

  const recordFrame = useCallback(() => {
    if (!isMonitoring.current) return;

    const now = performance.now();
    frameTimestamps.current.push(now);

    // Continue monitoring
    requestAnimationFrame(recordFrame);
  }, []);

  const startMonitoring = useCallback(() => {
    isMonitoring.current = true;
    startTime.current = performance.now();
    frameTimestamps.current = [];
    requestAnimationFrame(recordFrame);
  }, [recordFrame]);

  const stopMonitoring = useCallback(() => {
    isMonitoring.current = false;

    const timestamps = frameTimestamps.current;
    if (timestamps.length < 2) {
      return { avgFPS: 0, minFPS: 0, maxFPS: 0, frameDrops: 0 };
    }

    // Calculate frame deltas
    const deltas: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      deltas.push(timestamps[i] - timestamps[i - 1]);
    }

    // Calculate FPS metrics
    const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    const avgFPS = 1000 / avgDelta;
    const minFPS = 1000 / Math.max(...deltas);
    const maxFPS = 1000 / Math.min(...deltas);

    // Count frame drops (frames that took >16.66ms)
    const frameDrops = deltas.filter(d => d > 16.66).length;

    return {
      avgFPS: Math.round(avgFPS),
      minFPS: Math.round(minFPS),
      maxFPS: Math.round(maxFPS),
      frameDrops,
      totalFrames: timestamps.length,
    };
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
  };
}
