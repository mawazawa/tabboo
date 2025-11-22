import { useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DrawState {
  isDrawing: boolean;
  start: Point | null;
  current: Point | null;
  pageElement: HTMLElement | null;
}

export interface DrawnRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UseFieldDrawingProps {
  isEditMode: boolean;
  onDrawComplete: (rect: DrawnRect) => void;
}

export function useFieldDrawing({ isEditMode, onDrawComplete }: UseFieldDrawingProps) {
  const [drawing, setDrawing] = useState<DrawState>({
    isDrawing: false,
    start: null,
    current: null,
    pageElement: null
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isEditMode) return;
    
    // Don't start drawing if we clicked on an existing field (handled by drag)
    // or a drag handle
    const target = e.target as HTMLElement;
    if (target.closest('.field-input-container') || target.closest('.cursor-move')) return;

    // Get the page container
    const pageElement = e.currentTarget as HTMLElement;
    const rect = pageElement.getBoundingClientRect();
    
    // Calculate relative coordinates
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Capture pointer to ensure we get move/up events even if we leave the element
    try {
      pageElement.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn('Failed to capture pointer', err);
    }

    setDrawing({
      isDrawing: true,
      start: { x, y },
      current: { x, y },
      pageElement
    });
  }, [isEditMode]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawing.isDrawing || !drawing.start || !drawing.pageElement) return;

    const rect = drawing.pageElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawing(prev => ({
      ...prev,
      current: { x, y }
    }));
  }, [drawing.isDrawing, drawing.start, drawing.pageElement]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!drawing.isDrawing || !drawing.start || !drawing.current || !drawing.pageElement) return;

    const rect = drawing.pageElement.getBoundingClientRect();
    
    // Release pointer capture
    try {
      drawing.pageElement.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore errors
    }

    // Calculate final dimensions
    const x1 = Math.min(drawing.start.x, drawing.current.x);
    const y1 = Math.min(drawing.start.y, drawing.current.y);
    const w = Math.abs(drawing.current.x - drawing.start.x);
    const h = Math.abs(drawing.current.y - drawing.start.y);

    // Only trigger completion if rectangle is big enough (prevent accidental clicks)
    if (w > 10 && h > 10) {
      const finalRect: DrawnRect = {
        left: (x1 / rect.width) * 100,
        top: (y1 / rect.height) * 100,
        width: (w / rect.width) * 100,
        height: (h / rect.height) * 100
      };
      onDrawComplete(finalRect);
    }

    setDrawing({
      isDrawing: false,
      start: null,
      current: null,
      pageElement: null
    });
  }, [drawing, onDrawComplete]);

  const getDrawingRect = () => {
    if (!drawing.isDrawing || !drawing.start || !drawing.current || !drawing.pageElement) return null;
    
    const rect = drawing.pageElement.getBoundingClientRect();
    const x1 = Math.min(drawing.start.x, drawing.current.x);
    const y1 = Math.min(drawing.start.y, drawing.current.y);
    const w = Math.abs(drawing.current.x - drawing.start.x);
    const h = Math.abs(drawing.current.y - drawing.start.y);

    return {
      left: (x1 / rect.width) * 100,
      top: (y1 / rect.height) * 100,
      width: (w / rect.width) * 100,
      height: (h / rect.height) * 100
    };
  };

  return {
    isDrawing: drawing.isDrawing,
    drawingRect: getDrawingRect(),
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}

