import { useState, useRef, useCallback } from 'react';
import { useThrottledRAF, useRAFMonitoring } from './use-raf-batching';
import type { FieldPosition } from '@/types/FormData';

interface UseDragAndDropProps {
  isEditMode: boolean;
  fieldPositions: Record<string, FieldPosition>;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  announce: (message: string) => void;
}

interface DragState {
  isDragging: string | null;
  alignmentGuides: { x: number[]; y: number[] };
}

export function useDragAndDrop({
  isEditMode,
  fieldPositions,
  updateFieldPosition,
  announce,
}: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  // Use refs for drag state to avoid re-render storms
  const dragStartPos = useRef<{ x: number; y: number; top: number; left: number }>({ x: 0, y: 0, top: 0, left: 0 });
  const lastGuidesRef = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });

  // Performance monitoring for drag operations (optional - only logs in dev mode)
  const { startMonitoring, stopMonitoring } = useRAFMonitoring();

  const handlePointerDown = (e: React.PointerEvent, field: string, currentTop: number, currentLeft: number) => {
    // Only allow dragging in edit mode
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    const container = (e.currentTarget as HTMLElement).closest('.field-container') as HTMLElement;
    if (!container) return;

    // Try to capture pointer (may fail in test environments with synthetic events)
    try {
      container.setPointerCapture(e.pointerId);
    } catch (error) {
      // Pointer capture not available (e.g., in Playwright tests)
      // Drag will still work without capture, just less robust for edge cases
      console.warn('[Drag] setPointerCapture failed:', error);
    }
    setIsDragging(field);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      top: currentTop,
      left: currentLeft
    };

    // Start performance monitoring (dev mode only)
    startMonitoring();
  };

  // Throttled RAF-based position update (60fps max, even if pointer moves 100+ times/sec)
  const throttledPositionUpdate = useThrottledRAF((
    clientX: number,
    clientY: number,
    parentRect: DOMRect,
    field: string
  ) => {
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    let newLeft = dragStartPos.current.left + (deltaX / parentRect.width) * 100;
    let newTop = dragStartPos.current.top + (deltaY / parentRect.height) * 100;

    // Constrain within bounds
    newLeft = Math.max(0, Math.min(95, newLeft));
    newTop = Math.max(0, Math.min(95, newTop));

    // Smart snapping to other fields
    const snapThreshold = 1.5;
    const guides: { x: number[]; y: number[] } = { x: [], y: [] };

    Object.entries(fieldPositions).forEach(([otherField, pos]) => {
      if (otherField === field) return;

      if (Math.abs(newLeft - pos.left) < snapThreshold) {
        newLeft = pos.left;
        guides.x.push(pos.left);
      }

      if (Math.abs(newTop - pos.top) < snapThreshold) {
        newTop = pos.top;
        guides.y.push(pos.top);
      }
    });

    // Performance: Only update alignment guides state if they changed
    const guidesChanged =
      guides.x.length !== lastGuidesRef.current.x.length ||
      guides.y.length !== lastGuidesRef.current.y.length ||
      !guides.x.every((val, idx) => val === lastGuidesRef.current.x[idx]) ||
      !guides.y.every((val, idx) => val === lastGuidesRef.current.y[idx]);

    if (guidesChanged) {
      lastGuidesRef.current = guides;
      setAlignmentGuides(guides);
    }

    // Update position state directly - GPU positioning will handle rendering
    // This runs at 60fps max thanks to throttledRAF
    updateFieldPosition(field, { top: newTop, left: newLeft });
  });

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    e.preventDefault();

    const parentRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Throttled to 60fps via RAF
    throttledPositionUpdate(e.clientX, e.clientY, parentRect, isDragging);
  }, [isDragging, throttledPositionUpdate]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    // Stop performance monitoring and log results (dev mode only)
    const metrics = stopMonitoring();
    if (import.meta.env.DEV && metrics.totalFrames > 0) {
      console.log(`[Performance] Drag operation completed:`, {
        avgFPS: metrics.avgFPS,
        minFPS: metrics.minFPS,
        frameDrops: metrics.frameDrops,
        totalFrames: metrics.totalFrames,
        dropRate: `${((metrics.frameDrops / metrics.totalFrames) * 100).toFixed(1)}%`,
      });
    }

    // Announce field repositioning to screen readers
    announce(`Field ${isDragging} repositioned`);

    // Clean up drag state
    setIsDragging(null);
    setAlignmentGuides({ x: [], y: [] });
    lastGuidesRef.current = { x: [], y: [] };
  }, [isDragging, announce, stopMonitoring]);

  return {
    isDragging,
    alignmentGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
