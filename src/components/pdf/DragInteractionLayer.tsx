import React from 'react';
import { DragOverlay } from '@dnd-kit/core';
import { FieldPosition } from "@/types/FormData";
import { DrawnRect } from "@/hooks/use-field-drawing";

interface DragInteractionLayerProps {
  isEditMode: boolean;
  isDragging: boolean;
  alignmentGuides: { x: number | null; y: number | null };
  pageWidth: number;
  zoom: number;
  handlePointerDown: (e: React.PointerEvent, field: string) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  pageOverlays: any[]; // Using any[] for now as the overlay type needs to be exported from use-form-fields
  fieldPositions: Record<string, FieldPosition>;
  isDrawing?: boolean;
  drawingRect?: DrawnRect | null;
}

export const DragInteractionLayer: React.FC<DragInteractionLayerProps> = ({
  isEditMode,
  isDragging,
  alignmentGuides,
  pageWidth,
  zoom,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  pageOverlays,
  fieldPositions,
  isDrawing,
  drawingRect
}) => {
  if (!isEditMode) return null;

  return (
    <>
      {/* Drawing Rectangle with "Glass Layer" Effects */}
      {isDrawing && drawingRect && (
        <div
          className="absolute z-50 pointer-events-none overflow-hidden"
          style={{
            top: `${drawingRect.top}%`,
            left: `${drawingRect.left}%`,
            width: `${drawingRect.width}%`,
            height: `${drawingRect.height}%`,
          }}
        >
          {/* Neon Border */}
          <div className="absolute inset-0 border-2 border-neon-orange shadow-[0_0_15px_rgba(255,95,31,0.5)] rounded-sm animate-pulse" />
          
          {/* Glass Fill */}
          <div className="absolute inset-0 bg-neon-orange/10 backdrop-blur-[1px]" />
          
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-neon-orange/20 to-transparent -translate-y-full animate-[scan_1.5s_ease-in-out_infinite]" />
          
          {/* Corner Markers for "Tech" Feel */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neon-orange" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neon-orange" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neon-orange" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neon-orange" />
          
          {/* Dimensions Label */}
          <div className="absolute -top-6 left-0 bg-neon-orange text-black text-[10px] font-bold px-1 py-0.5 rounded-t-sm font-mono">
            {drawingRect.width.toFixed(1)}% x {drawingRect.height.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Alignment Guides */}
      {isDragging && alignmentGuides.x !== null && (
        <div 
          className="absolute top-0 bottom-0 w-px bg-cyan-500 z-50 pointer-events-none"
          style={{ left: `${alignmentGuides.x}%` }}
        />
      )}
      {isDragging && alignmentGuides.y !== null && (
        <div 
          className="absolute left-0 right-0 h-px bg-cyan-500 z-50 pointer-events-none"
          style={{ top: `${alignmentGuides.y}%` }}
        />
      )}
      
      {/* Interactive Transparent Layer for Dragging */}
      {pageOverlays?.map((field) => {
        const position = fieldPositions[field.field] || { top: parseFloat(field.top), left: parseFloat(field.left) };
        return (
            <div
                key={`drag-handle-${field.field}`}
                className="absolute cursor-move z-40"
                style={{
                top: `${position.top}%`,
                left: `${position.left}%`,
                width: field.width ? `${field.width}%` : '30px',
                height: field.height ? `${field.height}%` : '20px',
                }}
                onPointerDown={(e) => handlePointerDown(e, field.field)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            />
        );
      })}
    </>
  );
};

