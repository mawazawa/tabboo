/**
 * GPU-Accelerated Positioning Utilities
 *
 * Uses CSS transform: translate3d() instead of top/left for 3-5x faster field movements
 * by leveraging the GPU Compositor and avoiding Layout + Paint phases.
 *
 * Based on November 2025 best practices:
 * - transform and opacity are the only S-Tier properties (compositor-only)
 * - will-change should be used sparingly and removed after use
 * - Avoid applying will-change to too many elements simultaneously
 *
 * Performance gains:
 * - CPU Layout: Avoided entirely
 * - CPU Paint: Avoided entirely
 * - GPU Compositing: Only operation (16ms budget for 60fps)
 */

export interface GPUPositionStyle {
  position: 'absolute';
  top: 0;
  left: 0;
  transform: string;
  transformOrigin: string;
  willChange?: 'transform';
}

/**
 * Convert percentage-based position to GPU-accelerated transform
 *
 * @param topPercent - Top position as percentage (0-100)
 * @param leftPercent - Left position as percentage (0-100)
 * @param zoom - Zoom scale factor (default: 1)
 * @param isDragging - Whether field is currently being dragged (default: false)
 * @returns CSS style object optimized for GPU compositing
 */
export function getGPUPositionStyle(
  topPercent: number,
  leftPercent: number,
  zoom: number = 1,
  isDragging: boolean = false
): GPUPositionStyle {
  // Combine translate3d (position) and scale (zoom) in single transform
  // This minimizes composite layer changes
  const transform = `translate3d(${leftPercent}%, ${topPercent}%, 0) scale(${zoom})`;

  const baseStyle: GPUPositionStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    transform,
    transformOrigin: 'top left',
  };

  // Add will-change only during active drag operations
  // Remove immediately after to free GPU memory (November 2025 best practice)
  if (isDragging) {
    baseStyle.willChange = 'transform';
  }

  return baseStyle;
}

/**
 * Get CSS class names for GPU-accelerated elements
 *
 * Note: These classes should be used alongside getGPUPositionStyle()
 * They provide additional optimizations for transform-based positioning.
 */
export function getGPUAcceleratedClasses(isDragging: boolean): string {
  const baseClasses = [
    // Disable text selection during drag for better performance
    isDragging ? 'select-none' : '',
    // Disable touch actions during drag to prevent scroll conflicts
    isDragging ? 'touch-none' : '',
  ].filter(Boolean);

  return baseClasses.join(' ');
}

/**
 * Performance monitoring: Calculate FPS during drag operations
 *
 * Usage:
 * const fpsTracker = createFPSTracker();
 * // In animation loop:
 * fpsTracker.tick();
 * console.log('Current FPS:', fpsTracker.getFPS());
 */
export function createFPSTracker() {
  let lastTime = performance.now();
  let frames = 0;
  let fps = 60;

  return {
    tick() {
      frames++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      // Calculate FPS every second
      if (delta >= 1000) {
        fps = Math.round((frames * 1000) / delta);
        frames = 0;
        lastTime = currentTime;
      }
    },
    getFPS() {
      return fps;
    },
    reset() {
      lastTime = performance.now();
      frames = 0;
      fps = 60;
    },
  };
}
