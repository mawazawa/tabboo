import React, { useEffect, useRef, useState } from 'react';
import { CanvasFormViewer } from './CanvasFormViewer';
import type { FormType } from '@/components/FormViewer';
import type { FormData, FieldPositions } from '@/types/FormData';

interface ExpandingFormViewerProps {
  formType: FormType;
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  fieldPositions: FieldPositions;
  updateFieldPosition: (field: string, position: { top: number; left: number }) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  originPosition: { x: number; y: number; width: number; height: number };
  onClose: () => void;
  onAnimationComplete?: () => void;
}

export const ExpandingFormViewer: React.FC<ExpandingFormViewerProps> = ({
  formType,
  formData,
  updateField,
  fieldPositions,
  updateFieldPosition,
  currentFieldIndex,
  setCurrentFieldIndex,
  originPosition,
  onClose,
  onAnimationComplete
}) => {
  const [isExpanding, setIsExpanding] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(originPosition);
  const [currentScale, setCurrentScale] = useState(0.1);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Target position (centered on screen)
  const targetPosition = {
    x: window.innerWidth / 2 - 425, // Half screen minus half form width
    y: 100,
    width: 850,
    height: 1100
  };
  const targetScale = 0.8;

  useEffect(() => {
    const startTime = performance.now();
    const duration = 500; // 500ms matches --spring-duration-medium

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Spring physics easing (matches design system --spring-bounce)
      // cubic-bezier(0.68, -0.55, 0.265, 1.55) - Playful bounce
      const springBounce = (t: number) => {
        // Approximate spring-bounce curve: cubic-bezier(0.68, -0.55, 0.265, 1.55)
        // This creates a playful bounce effect
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      const eased = springBounce(progress);

      // Interpolate position
      setCurrentPosition({
        x: originPosition.x + (targetPosition.x - originPosition.x) * eased,
        y: originPosition.y + (targetPosition.y - originPosition.y) * eased,
        width: originPosition.width + (targetPosition.width - originPosition.width) * eased,
        height: originPosition.height + (targetPosition.height - originPosition.height) * eased
      });

      // Interpolate scale
      setCurrentScale(0.1 + (targetScale - 0.1) * eased);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsExpanding(false);
        onAnimationComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Render animation or full form viewer
  if (isExpanding) {
    return (
      <div
        ref={containerRef}
        className="fixed z-[100] pointer-events-none"
        style={{
          left: currentPosition.x,
          top: currentPosition.y,
          width: currentPosition.width,
          height: currentPosition.height,
          transform: `scale(${currentScale})`,
          transformOrigin: 'top left',
          transition: 'none'
        }}
      >
        <div className="w-full h-full liquid-glass rounded-2xl flex items-center justify-center overflow-hidden shadow-[var(--shadow-ultra)]">
          <div className="text-center p-4 relative z-10">
            <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-[0_0_16px_hsl(215_85%_50%/0.3)]"></div>
            <p className="text-xs text-slate-700 font-semibold font-mono tracking-wide">{formType}</p>
            <div className="mt-2 h-1 w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // After animation completes, render the full form viewer
  return (
    <CanvasFormViewer
      formType={formType}
      formData={formData}
      updateField={updateField}
      fieldPositions={fieldPositions}
      updateFieldPosition={updateFieldPosition}
      currentFieldIndex={currentFieldIndex}
      setCurrentFieldIndex={setCurrentFieldIndex}
      onClose={onClose}
      initialPosition={{ x: targetPosition.x, y: targetPosition.y }}
      initialScale={targetScale}
    />
  );
};

