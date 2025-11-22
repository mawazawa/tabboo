import React from 'react';
import { DragOverlay } from '@dnd-kit/core';
import { FieldPosition } from "@/types/FormData";

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
  fieldPositions
}) => {
  if (!isEditMode) return null;

  return (
    <>
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
                className="absolute cursor-move z-20"
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

