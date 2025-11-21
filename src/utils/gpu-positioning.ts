/**
 * GPU-Accelerated Positioning Utilities
 *
 * Uses CSS top/left for positioning and transform: scale() for zoom.
 * Note: We use top/left (not translate3d) because translate percentages are relative
 * to the element's own size, not the parent container. Since form fields need to be
 * positioned relative to the PDF page, top/left with percentages is correct.
 *
 * Based on November 2025 best practices:
 * - transform and opacity are the only S-Tier properties (compositor-only)
 * - will-change should be used sparingly and removed after use
 * - Avoid applying will-change to too many elements simultaneously
 *
 * Performance considerations:
 * - Modern browsers GPU-accelerate position: absolute with will-change: transform
 * - Scale transform is GPU-composited for zoom
 * - Will-change is applied only during dragging for optimal GPU memory usage
 */

export interface GPUPositionStyle {
  position: 'absolute';
  top: string;
  left: string;
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
  // Use top/left for positioning (percentages relative to parent container)
  // Use scale transform only for zoom
  // FIX: Previously used translate3d with percentages, which were relative to element's
  // own size, causing all fields to appear at the same location!
  const transform = zoom !== 1 ? `scale(${zoom})` : 'none';

  const baseStyle: GPUPositionStyle = {
    position: 'absolute',
    top: `${topPercent}%`,
    left: `${leftPercent}%`,
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
  let fps: number | null = null; // Don't assume 60 FPS until measured

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
    getFPS(): number | null {
      return fps;
    },
    reset() {
      lastTime = performance.now();
      frames = 0;
      fps = null;
    },
  };
}
