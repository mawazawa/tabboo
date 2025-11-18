import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileBottomSheetProps {
  /** Child content to display in the sheet */
  children: ReactNode;
  /** Snap points in pixels (e.g., [100, 300, 600] for peek/half/full) */
  snapPoints?: number[];
  /** Default snap point index (0 = first snap point) */
  defaultSnapIndex?: number;
  /** Whether to show the drag handle */
  showHandle?: boolean;
  /** Callback when snap point changes */
  onSnapChange?: (snapIndex: number) => void;
  /** Custom className for the sheet */
  className?: string;
}

/**
 * Mobile bottom sheet with swipe-to-snap functionality
 *
 * Features:
 * - Touch drag with momentum
 * - Snap to predefined heights
 * - Keyboard accessible (Tab to focus, Esc to minimize)
 * - Smooth animations
 *
 * @example
 * <MobileBottomSheet
 *   snapPoints={[80, 300, windowHeight - 100]}
 *   defaultSnapIndex={0}
 * >
 *   <FieldNavigationPanel />
 * </MobileBottomSheet>
 */
export const MobileBottomSheet = ({
  children,
  snapPoints = [100, 400, 600],
  defaultSnapIndex = 0,
  showHandle = true,
  onSnapChange,
  className,
}: MobileBottomSheetProps) => {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnapIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentHeight = useRef(snapPoints[defaultSnapIndex]);
  const velocityRef = useRef(0);
  const lastMoveTime = useRef(0);
  const lastMoveY = useRef(0);

  // Calculate sheet height
  const height = isDragging
    ? Math.max(snapPoints[0], Math.min(snapPoints[snapPoints.length - 1], currentHeight.current - dragOffset))
    : snapPoints[currentSnapIndex];

  // Handle pointer down (start drag)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only allow dragging from the handle area
    const target = e.target as HTMLElement;
    if (!target.closest('[data-sheet-handle]')) return;

    setIsDragging(true);
    dragStartY.current = e.clientY;
    currentHeight.current = height;
    lastMoveTime.current = Date.now();
    lastMoveY.current = e.clientY;
    velocityRef.current = 0;

    // Capture pointer for smooth drag
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle pointer move (dragging)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStartY.current;
    setDragOffset(deltaY);

    // Calculate velocity for momentum
    const now = Date.now();
    const timeDelta = now - lastMoveTime.current;
    if (timeDelta > 0) {
      const moveDelta = e.clientY - lastMoveY.current;
      velocityRef.current = moveDelta / timeDelta; // pixels per millisecond
    }
    lastMoveTime.current = now;
    lastMoveY.current = e.clientY;
  };

  // Handle pointer up (end drag, snap to nearest point)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragOffset(0);

    // Release pointer capture
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    // Calculate target snap point based on position + velocity
    const finalHeight = currentHeight.current - dragOffset;
    const velocity = velocityRef.current;

    // Add velocity-based prediction (up to 200px)
    const momentumOffset = Math.min(200, Math.max(-200, velocity * 200));
    const predictedHeight = finalHeight - momentumOffset;

    // Find nearest snap point
    let nearestIndex = 0;
    let nearestDistance = Math.abs(snapPoints[0] - predictedHeight);

    for (let i = 1; i < snapPoints.length; i++) {
      const distance = Math.abs(snapPoints[i] - predictedHeight);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Snap to nearest point
    setCurrentSnapIndex(nearestIndex);
    onSnapChange?.(nearestIndex);
  };

  // Keyboard support: Escape to minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentSnapIndex > 0) {
        setCurrentSnapIndex(0);
        onSnapChange?.(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSnapIndex, onSnapChange]);

  return (
    <div
      ref={sheetRef}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40',
        'bg-card border-t rounded-t-xl shadow-lg',
        'spring-smooth',
        isDragging && 'transition-none', // Disable transition while dragging
        className
      )}
      style={{
        height: `${height}px`,
        touchAction: 'none', // Prevent browser gestures
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Drag Handle */}
      {showHandle && (
        <div
          data-sheet-handle
          className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
          role="button"
          tabIndex={0}
          aria-label="Drag to adjust sheet height"
        >
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>
      )}

      {/* Content */}
      <div className="h-full overflow-y-auto overscroll-contain pb-safe">
        {children}
      </div>
    </div>
  );
};
