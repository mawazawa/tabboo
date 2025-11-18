import { useState, useRef, useCallback, useEffect } from 'react';
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
  const dragElementRef = useRef<HTMLElement | null>(null);
  const draggedPositionRef = useRef<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastGuidesRef = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const handlePointerDown = (e: React.PointerEvent, field: string, currentTop: number, currentLeft: number) => {
    // Only allow dragging in edit mode
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    const container = (e.currentTarget as HTMLElement).closest('.field-container') as HTMLElement;
    if (!container) return;

    container.setPointerCapture(e.pointerId);
    dragElementRef.current = container;
    setIsDragging(field);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      top: currentTop,
      left: currentLeft
    };

    draggedPositionRef.current = { top: currentTop, left: currentLeft };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragElementRef.current) return;

    e.preventDefault();

    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame + CSS transform (no React state updates during drag!)
    // Performance: This limits updates to 60fps max for buttery smooth dragging
    rafRef.current = requestAnimationFrame(() => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      const parentRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      let newLeft = dragStartPos.current.left + (deltaX / parentRect.width) * 100;
      let newTop = dragStartPos.current.top + (deltaY / parentRect.height) * 100;

      // Constrain within bounds
      newLeft = Math.max(0, Math.min(95, newLeft));
      newTop = Math.max(0, Math.min(95, newTop));

      // Smart snapping to other fields
      const snapThreshold = 1.5;
      const guides: { x: number[]; y: number[] } = { x: [], y: [] };

      Object.entries(fieldPositions).forEach(([field, pos]) => {
        if (field === isDragging) return;

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
      // This avoids unnecessary re-renders during drag
      const guidesChanged =
        guides.x.length !== lastGuidesRef.current.x.length ||
        guides.y.length !== lastGuidesRef.current.y.length ||
        !guides.x.every((val, idx) => val === lastGuidesRef.current.x[idx]) ||
        !guides.y.every((val, idx) => val === lastGuidesRef.current.y[idx]);

      if (guidesChanged) {
        lastGuidesRef.current = guides;
        setAlignmentGuides(guides);
      }

      // Store position in ref (not state!)
      draggedPositionRef.current = { top: newTop, left: newLeft };

      // Apply via CSS transform for smooth 60fps movement (bypasses React)
      if (dragElementRef.current) {
        const deltaLeftPx = (newLeft - dragStartPos.current.left) * parentRect.width / 100;
        const deltaTopPx = (newTop - dragStartPos.current.top) * parentRect.height / 100;
        dragElementRef.current.style.transform = `translate(${deltaLeftPx}px, ${deltaTopPx}px)`;
      }
    });
  }, [isDragging, fieldPositions]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Release pointer capture
    if (dragElementRef.current) {
      dragElementRef.current.releasePointerCapture(e.pointerId);
      // Reset transform
      dragElementRef.current.style.transform = '';
    }

    // COMMIT: Now update React state with final position
    if (draggedPositionRef.current && isDragging) {
      updateFieldPosition(isDragging, draggedPositionRef.current);
      // Announce field repositioning to screen readers
      announce(`Field ${isDragging} repositioned`);
    }

    // Clean up
    setIsDragging(null);
    dragElementRef.current = null;
    draggedPositionRef.current = null;
    setAlignmentGuides({ x: [], y: [] });
    lastGuidesRef.current = { x: [], y: [] };
  }, [isDragging, updateFieldPosition, announce]);

  // RAF cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return {
    isDragging,
    alignmentGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
