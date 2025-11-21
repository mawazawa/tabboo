import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Field {
  id: string;
  rect: Rect;
  key: string;
}

interface OverlayLayerProps {
  width: number;
  height: number;
  fields: Field[];
  onFieldAdd: (rect: Rect) => void;
  onFieldSelect: (id: string) => void;
  /** Optional: currently selected field ID for visual feedback */
  selectedFieldId?: string;
  /** Optional: minimum size in pixels for a valid field */
  minFieldSize?: number;
  /** Optional: snap to grid size (0 = disabled) */
  gridSnap?: number;
  /** Optional: show crosshair guides while drawing */
  showGuides?: boolean;
  /** Optional: disabled state */
  disabled?: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  /** Timestamp when drag started - for animation timing */
  startTime: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// CSS custom properties for spring physics
const springStyles = `
  @keyframes field-enter {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes selection-pulse {
    0%, 100% {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }
  }

  @keyframes valid-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.01);
    }
  }

  @keyframes corner-dot-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.3);
      opacity: 1;
    }
  }

  @keyframes guide-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.6;
    }
  }
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const OverlayLayer: React.FC<OverlayLayerProps> = ({
  width,
  height,
  fields,
  onFieldAdd,
  onFieldSelect,
  selectedFieldId,
  minFieldSize = 10,
  gridSnap = 0,
  showGuides = true,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
  });

  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [isDrawingValid, setIsDrawingValid] = useState(false);
  const [wasJustValid, setWasJustValid] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Inject keyframe animations
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    const styleId = 'overlay-layer-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = springStyles;
      document.head.appendChild(style);
    }
    return () => {
      // Cleanup on unmount if this is the last instance
      // (In production, you might want to reference count)
    };
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Utility Functions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const snapToGrid = useCallback((value: number): number => {
    if (gridSnap <= 0) return value;
    return Math.round(value / gridSnap) * gridSnap;
  }, [gridSnap]);

  const getRelativeCoordinates = useCallback((
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const x = snapToGrid(Math.max(0, Math.min(width, clientX - rect.left)));
    const y = snapToGrid(Math.max(0, Math.min(height, clientY - rect.top)));

    return { x, y };
  }, [width, height, snapToGrid]);

  const normalizeRect = useCallback((
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): Rect => {
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      w: Math.abs(x2 - x1),
      h: Math.abs(y2 - y1),
    };
  }, []);

  // Calculate the current selection rectangle
  const selectionRect = useMemo(() => {
    if (!dragState.isDragging) return null;
    return normalizeRect(
      dragState.startX,
      dragState.startY,
      dragState.currentX,
      dragState.currentY
    );
  }, [dragState, normalizeRect]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Event Handlers
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;

    // Only start drawing on primary button (left click / touch)
    if (e.button !== 0) return;

    // Don't start drawing if clicking on an existing field
    const target = e.target as HTMLElement;
    if (target.closest('[data-field-id]')) return;

    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);

    setDragState({
      isDragging: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      startTime: performance.now(),
    });

    // Capture pointer for smooth tracking
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [disabled, getRelativeCoordinates]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    setMousePosition({ x, y });

    if (!dragState.isDragging) return;

    const rect = normalizeRect(dragState.startX, dragState.startY, x, y);
    const nowValid = rect.w >= minFieldSize && rect.h >= minFieldSize;

    // Trigger pulse animation when becoming valid
    if (nowValid && !isDrawingValid) {
      setWasJustValid(true);
      setTimeout(() => setWasJustValid(false), 200);
    }

    setIsDrawingValid(nowValid);
    setDragState(prev => ({
      ...prev,
      currentX: x,
      currentY: y,
    }));
  }, [dragState.isDragging, dragState.startX, dragState.startY, getRelativeCoordinates, normalizeRect, minFieldSize, isDrawingValid]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging) return;

    const rect = normalizeRect(
      dragState.startX,
      dragState.startY,
      dragState.currentX,
      dragState.currentY
    );

    // Only add if meets minimum size
    if (rect.w >= minFieldSize && rect.h >= minFieldSize) {
      onFieldAdd(rect);
    }

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
    });
    setIsDrawingValid(false);

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [dragState, normalizeRect, minFieldSize, onFieldAdd]);

  const handleFieldClick = useCallback((e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    onFieldSelect(fieldId);
  }, [onFieldSelect]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Keyboard Support
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cancel drawing with Escape
      if (e.key === 'Escape' && dragState.isDragging) {
        setDragState({
          isDragging: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          startTime: 0,
        });
        setIsDrawingValid(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dragState.isDragging]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Render Functions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const renderCrosshairGuides = () => {
    if (!showGuides || !dragState.isDragging) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ animation: 'guide-fade-in 150ms ease-out' }}
        width={width}
        height={height}
      >
        {/* Horizontal guide at start Y */}
        <line
          x1={0}
          y1={dragState.startY}
          x2={width}
          y2={dragState.startY}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Vertical guide at start X */}
        <line
          x1={dragState.startX}
          y1={0}
          x2={dragState.startX}
          y2={height}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Horizontal guide at current Y */}
        <line
          x1={0}
          y1={dragState.currentY}
          x2={width}
          y2={dragState.currentY}
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Vertical guide at current X */}
        <line
          x1={dragState.currentX}
          y1={0}
          x2={dragState.currentX}
          y2={height}
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
    );
  };

  const renderSelectionBox = () => {
    if (!selectionRect) return null;

    const { x, y, w, h } = selectionRect;

    return (
      <div
        className={cn(
          'absolute pointer-events-none',
          'rounded-[3px]',
          'transition-colors duration-100',
          // Animated border effect
          isDrawingValid
            ? 'bg-gradient-to-br from-blue-500/15 to-blue-600/10'
            : 'bg-gradient-to-br from-red-500/10 to-red-600/5',
          // Pulse when just became valid
          wasJustValid && 'animate-[valid-pulse_200ms_ease-out]'
        )}
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          // Liquid glass border effect
          boxShadow: isDrawingValid
            ? `
              inset 0 0 0 2px rgba(59, 130, 246, 0.6),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
              0 4px 16px -2px rgba(59, 130, 246, 0.15)
            `
            : `
              inset 0 0 0 2px rgba(239, 68, 68, 0.5),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.05)
            `,
          backdropFilter: 'blur(1px)',
        }}
      >
        {/* Animated marching ants border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          style={{ margin: '-1px' }}
        >
          <rect
            x="1"
            y="1"
            width={w - 2}
            height={h - 2}
            fill="none"
            stroke={isDrawingValid ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.6)'}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            rx="2"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="20"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>

        {/* Corner dots with pulse */}
        {[
          { top: -3, left: -3 },
          { top: -3, right: -3 },
          { bottom: -3, left: -3 },
          { bottom: -3, right: -3 },
        ].map((pos, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-[6px] h-[6px] rounded-full',
              isDrawingValid ? 'bg-blue-500' : 'bg-red-400',
              'shadow-[0_0_4px_rgba(0,0,0,0.3)]',
              'animate-[corner-dot-pulse_1s_ease-in-out_infinite]'
            )}
            style={{
              ...pos,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}

        {/* Size indicator badge */}
        {w > 50 && h > 30 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                'px-2 py-1 rounded-md',
                'text-[11px] font-mono font-medium',
                'backdrop-blur-md',
                'shadow-lg',
                'border',
                'transition-all duration-150',
                isDrawingValid
                  ? 'bg-blue-600/90 text-white border-blue-400/30'
                  : 'bg-red-500/80 text-white border-red-400/30'
              )}
            >
              {Math.round(w)} × {Math.round(h)}
            </div>
          </div>
        )}

        {/* Inner glow for glass effect */}
        <div
          className="absolute inset-0 rounded-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
      </div>
    );
  };

  const renderField = (field: Field, index: number) => {
    const isSelected = field.id === selectedFieldId;
    const isHovered = field.id === hoveredFieldId;

    return (
      <div
        key={field.id}
        data-field-id={field.id}
        className={cn(
          'absolute',
          'rounded-[3px]',
          'transition-all duration-200',
          'cursor-pointer',
          // Liquid glass base
          'backdrop-blur-[2px]',
          // Animation on mount
          'animate-[field-enter_200ms_ease-out_forwards]'
        )}
        style={{
          left: field.rect.x,
          top: field.rect.y,
          width: field.rect.w,
          height: field.rect.h,
          animationDelay: `${index * 30}ms`,
          // Complex layered styling for premium feel
          background: isSelected
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.25) 100%)'
            : isHovered
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.08) 100%)',
          boxShadow: isSelected
            ? `
              0 0 0 2px rgba(59, 130, 246, 0.7),
              0 0 0 4px rgba(59, 130, 246, 0.15),
              0 4px 12px -2px rgba(59, 130, 246, 0.25),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.15)
            `
            : isHovered
            ? `
              0 0 0 1.5px rgba(59, 130, 246, 0.5),
              0 2px 8px -2px rgba(59, 130, 246, 0.15),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
            `
            : `
              0 0 0 1px rgba(59, 130, 246, 0.3),
              0 1px 3px -1px rgba(59, 130, 246, 0.08),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.08)
            `,
          transform: isSelected ? 'scale(1.005)' : 'scale(1)',
        }}
        onClick={(e) => handleFieldClick(e, field.id)}
        onMouseEnter={() => setHoveredFieldId(field.id)}
        onMouseLeave={() => setHoveredFieldId(null)}
        role="button"
        tabIndex={0}
        aria-label={`Field: ${field.key}`}
        aria-selected={isSelected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFieldSelect(field.id);
          }
        }}
      >
        {/* Field label tooltip */}
        {(isHovered || isSelected) && field.rect.w > 30 && (
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2',
              'px-2 py-1 rounded-md',
              'text-[10px] font-medium tracking-wide',
              'bg-slate-900/95 text-white',
              'shadow-lg backdrop-blur-sm',
              'whitespace-nowrap',
              'max-w-[150px] truncate',
              'border border-white/10',
              'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150'
            )}
            style={{
              bottom: 'calc(100% + 8px)',
            }}
          >
            {field.key}
            {/* Tooltip arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(15, 23, 42, 0.95)',
              }}
            />
          </div>
        )}

        {/* Selection handles */}
        {isSelected && (
          <>
            {[
              { top: -4, left: -4, cursor: 'nw-resize' },
              { top: -4, right: -4, cursor: 'ne-resize' },
              { bottom: -4, left: -4, cursor: 'sw-resize' },
              { bottom: -4, right: -4, cursor: 'se-resize' },
            ].map((pos, i) => (
              <div
                key={i}
                className={cn(
                  'absolute w-2 h-2 rounded-full',
                  'bg-white border-2 border-blue-500',
                  'shadow-md',
                  'transition-transform duration-150',
                  'hover:scale-125'
                )}
                style={pos}
              />
            ))}
          </>
        )}

        {/* Inner glass highlight */}
        <div
          className="absolute inset-0 rounded-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%)',
          }}
        />
      </div>
    );
  };

  const renderGridOverlay = () => {
    if (gridSnap <= 0 || !dragState.isDragging) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        style={{ opacity: 0.08 }}
      >
        <defs>
          <pattern
            id="overlay-grid-pattern"
            width={gridSnap}
            height={gridSnap}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="0" cy="0" r="0.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#overlay-grid-pattern)" />
      </svg>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Main Render
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute top-0 left-0',
        'select-none',
        disabled && 'pointer-events-none opacity-50',
        dragState.isDragging ? 'cursor-crosshair' : 'cursor-default'
      )}
      style={{
        width,
        height,
        // Prevent touch scrolling while drawing
        touchAction: dragState.isDragging ? 'none' : 'auto',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Field overlay layer"
      role="application"
    >
      {/* Grid overlay for snap-to-grid mode */}
      {renderGridOverlay()}

      {/* Crosshair guides */}
      {renderCrosshairGuides()}

      {/* Existing fields - render in order */}
      {fields.map((field, index) => renderField(field, index))}

      {/* Active selection box - always on top */}
      {renderSelectionBox()}

      {/* Coordinate tooltip when hovering (not dragging) */}
      {!dragState.isDragging && gridSnap > 0 && (
        <div
          className={cn(
            'absolute pointer-events-none',
            'px-1.5 py-0.5 rounded text-[9px] font-mono',
            'bg-black/70 text-white/80',
            'opacity-0 hover:opacity-100 transition-opacity'
          )}
          style={{
            left: mousePosition.x + 12,
            top: mousePosition.y + 12,
          }}
        >
          {mousePosition.x}, {mousePosition.y}
        </div>
      )}
    </div>
  );
};

export default OverlayLayer;
