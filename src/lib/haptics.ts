/**
 * Cross-Platform Haptic Feedback Utility
 *
 * Provides tactile feedback across:
 * - Android Chrome (Vibration API)
 * - iOS 18+ Safari (limited - switch elements only)
 * - iOS <18 (audio + visual fallbacks)
 * - Desktop (visual-only)
 *
 * Based on November 2025 best practices:
 * - Keep haptics subtle and purposeful
 * - Respect user preferences
 * - Combine with visual feedback
 * - Test across platforms
 *
 * @see https://blog.openreplay.com/haptic-feedback-for-web-apps-with-the-vibration-api/
 */

// Semantic haptic patterns (duration in ms)
export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,        // Quick tap (hover, checkbox)
  medium: 15,       // Standard feedback (button press)
  heavy: 25,        // Strong feedback (delete, submit)
  success: [10, 50, 10],  // Double tap (completion)
  error: [25, 50, 25],    // Alert pulse (errors)
  selection: 5,     // Minimal tick (slider, picker)
};

// Feature detection cache
let supportsVibration: boolean | null = null;

/**
 * Check if device supports Vibration API
 */
function checkVibrationSupport(): boolean {
  if (supportsVibration !== null) return supportsVibration;

  supportsVibration = 'vibrate' in navigator &&
                     typeof navigator.vibrate === 'function' &&
                     // Check if we're on mobile (vibration only works on mobile)
                     window.matchMedia('(hover: none)').matches;

  return supportsVibration;
}

/**
 * Trigger haptic feedback
 *
 * @param pattern - Semantic pattern name
 * @param options - Optional configuration
 *
 * @example
 * // Button press
 * triggerHaptic('medium');
 *
 * // Form submission success
 * triggerHaptic('success');
 *
 * // Disable for specific action
 * triggerHaptic('heavy', { enabled: false });
 */
export function triggerHaptic(
  pattern: HapticPattern,
  options: { enabled?: boolean } = {}
): void {
  // Respect enabled flag (for user preferences)
  if (options.enabled === false) return;

  // Check localStorage for user preference (default: enabled)
  const userPreference = localStorage.getItem('haptics-enabled');
  if (userPreference === 'false') return;

  // Try Vibration API (Android Chrome, Firefox Mobile)
  if (checkVibrationSupport()) {
    try {
      const vibrationPattern = PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('[Haptics] Vibration failed:', error);
    }
  }

  // Note: iOS fallback handled via visual feedback in CSS
  // See index.css for [data-haptic] animations
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic(): void {
  if (checkVibrationSupport()) {
    try {
      navigator.vibrate(0);
    } catch (error) {
      console.warn('[Haptics] Cancel failed:', error);
    }
  }
}

/**
 * Check if haptics are supported on current device
 */
export function isHapticsSupported(): boolean {
  return checkVibrationSupport();
}

/**
 * Get user's haptic preference
 */
export function getHapticPreference(): boolean {
  const preference = localStorage.getItem('haptics-enabled');
  return preference !== 'false'; // Default to enabled
}

/**
 * Set user's haptic preference
 */
export function setHapticPreference(enabled: boolean): void {
  localStorage.setItem('haptics-enabled', enabled.toString());
}
