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
    const duration = 600; // 600ms animation

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const eased = easeOutCubic(progress);

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
        <div className="w-full h-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 flex items-center justify-center overflow-hidden">
          <div className="text-center p-4">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-600 font-medium font-mono">{formType}</p>
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

