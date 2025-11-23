import React, { useRef, useState, useCallback, useEffect, ReactNode } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

interface CanvasProps {
  children: ReactNode;
}

/**
 * High-performance infinite canvas with smooth zoom/pan
 *
 * Features (November 2025):
 * - GPU-accelerated transforms via translate3d()
 * - Separated grid layer for independent compositing
 * - RAF-throttled background updates to prevent lag
 * - Smooth trackpad gesture support (pinch zoom, two-finger pan)
 * - Dynamic will-change hints for optimal performance
 * - react-zoom-pan-pinch for industry-standard gesture handling
 */
export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Track transform state for grid sync
  const [gridTransform, setGridTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isInteracting, setIsInteracting] = useState(false);

  // RAF-throttled grid update to prevent background lag
  const updateGrid = useCallback((x: number, y: number, scale: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setGridTransform({ x, y, scale });
      rafRef.current = null;
    });
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Handle transform changes from the library
  const handleTransform = useCallback((ref: ReactZoomPanPinchRef) => {
    const { positionX, positionY, scale } = ref.state;
    updateGrid(positionX, positionY, scale);
  }, [updateGrid]);

  // Interaction state for will-change optimization
  const handleInteractionStart = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setIsInteracting(false);
  }, []);

  // Grid background style with GPU acceleration
  // Separated from content layer for independent compositing
  const gridStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    // GPU-accelerated background positioning
    backgroundImage: `
      radial-gradient(#cbd5e1 1px, transparent 1px),
      linear-gradient(to bottom, hsl(220 15% 98% / 0.5), hsl(220 15% 96% / 0.3))
    `,
    backgroundSize: `${32 * gridTransform.scale}px ${32 * gridTransform.scale}px, 100% 100%`,
    backgroundPosition: `${gridTransform.x}px ${gridTransform.y}px, 0 0`,
    backgroundColor: 'hsl(220 15% 98%)',
    // GPU hints - only during interaction
    willChange: isInteracting ? 'background-position, background-size' : 'auto',
    // Promote to own layer
    transform: 'translateZ(0)',
    pointerEvents: 'none',
    zIndex: 0,
  };

  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Separated grid layer - independent GPU compositing */}
      <div
        ref={gridRef}
        style={gridStyle}
        aria-hidden="true"
      />

      {/* Content layer with react-zoom-pan-pinch */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.3}
        maxScale={3}
        centerOnInit={false}
        limitToBounds={false}
        // Smooth trackpad handling
        panning={{
          velocityDisabled: false,
          allowLeftClickPan: true,
          allowMiddleClickPan: true,
          allowRightClickPan: false,
        }}
        wheel={{
          step: 0.1,
          smoothStep: 0.004,
          // Enable smooth wheel zoom for trackpads
        }}
        pinch={{
          step: 5,
        }}
        doubleClick={{
          disabled: true,
        }}
        // Performance optimizations
        velocityAnimation={{
          sensitivity: 1,
          animationTime: 200,
          animationType: 'easeOut',
          equalToMove: true,
          disabled: false,
        }}
        alignmentAnimation={{
          disabled: true,
        }}
        onTransformed={handleTransform}
        onPanningStart={handleInteractionStart}
        onPanningStop={handleInteractionEnd}
        onPinchingStart={handleInteractionStart}
        onPinchingStop={handleInteractionEnd}
        onZoomStart={handleInteractionStart}
        onZoomStop={handleInteractionEnd}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
            cursor: 'grab',
          }}
          contentStyle={{
            // GPU-accelerated transforms
            willChange: isInteracting ? 'transform' : 'auto',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              // Ensure GPU layer promotion for children
              transform: 'translateZ(0)',
            }}
          >
            {children}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Navigation Controls Overlay */}
      <div className="absolute bottom-8 left-24 flex flex-col gap-2 pointer-events-none z-50">
        <div className="liquid-glass p-2 rounded-lg shadow-[var(--shadow-diffused)] pointer-events-auto flex gap-2 text-xs text-slate-600 font-mono font-medium">
          <span>X: {gridTransform.x.toFixed(0)}</span>
          <span>Y: {gridTransform.y.toFixed(0)}</span>
          <span>Z: {(gridTransform.scale * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
