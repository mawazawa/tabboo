/**
 * React Hook for Haptic Feedback
 *
 * Provides easy-to-use haptic feedback in React components
 *
 * @example
 * function MyButton() {
 *   const haptic = useHaptic();
 *
 *   return (
 *     <button onClick={() => haptic.trigger('medium')}>
 *       Click me
 *     </button>
 *   );
 * }
 */

import { useCallback } from 'react';
import {
  triggerHaptic,
  cancelHaptic,
  isHapticsSupported,
  type HapticPattern,
} from '@/lib/haptics';

export function useHaptic() {
  const trigger = useCallback((pattern: HapticPattern) => {
    triggerHaptic(pattern);
  }, []);

  const cancel = useCallback(() => {
    cancelHaptic();
  }, []);

  const isSupported = useCallback(() => {
    return isHapticsSupported();
  }, []);

  return {
    trigger,
    cancel,
    isSupported,
  };
}
