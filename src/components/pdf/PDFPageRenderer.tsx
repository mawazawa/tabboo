import React from 'react';
import { Page } from 'react-pdf';
import { FieldOverlayLayer } from './FieldOverlayLayer';
import { DragInteractionLayer } from './DragInteractionLayer';
import { FieldPosition, FormData, PersonalVaultData, ValidationErrors } from "@/types/FormData";
import { cn } from "@/lib/utils";
import { useFieldDrawing, DrawnRect } from "@/hooks/use-field-drawing";

interface PDFPageRendererProps {
  pageNum: number;
  currentPDFPage: number;
  pageWidth: number;
  zoom: number;
  fieldFontSize: number;
  isEditMode: boolean;
  isDragging: boolean;
  alignmentGuides: { x: number | null; y: number | null };
  pageOverlays: any[];
  fieldPositions: Record<string, FieldPosition>;
  formData: FormData;
  currentFieldIndex: number;
  fieldNameToIndex: Record<string, number>;
  highlightedField: string | null;
  validationErrors: ValidationErrors;
  vaultData: PersonalVaultData | null;
  updateField: (field: string, value: string | boolean) => void;
  handleFieldClick: (field: string, e: React.MouseEvent) => void;
  handleAutofillField: (field: string, e: React.MouseEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  handlePDFClick: (e: React.MouseEvent) => void;
  handlePointerDown: (e: React.PointerEvent, field: string) => void;
  onDrawComplete: (page: number, rect: DrawnRect) => void;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = ({
  pageNum,
  currentPDFPage,
  pageWidth,
  zoom,
  fieldFontSize,
  isEditMode,
  isDragging,
  alignmentGuides,
  pageOverlays,
  fieldPositions,
  formData,
  currentFieldIndex,
  fieldNameToIndex,
  highlightedField,
  validationErrors,
  vaultData,
  updateField,
  handleFieldClick,
  handleAutofillField,
  handlePointerMove,
  handlePointerUp,
  handlePDFClick,
  handlePointerDown,
  onDrawComplete
}) => {
  const { 
    isDrawing, 
    drawingRect, 
    handlePointerDown: handleDrawStart, 
    handlePointerMove: handleDrawMove, 
    handlePointerUp: handleDrawEnd 
  } = useFieldDrawing({
    isEditMode,
    onDrawComplete: (rect) => onDrawComplete(pageNum, rect)
  });
  
  return (
    <div 
      className={cn(
        "relative mb-8 shadow-lg transition-opacity duration-200",
      )}
      style={{ width: pageWidth * zoom }}
      onClick={handlePDFClick}
      onPointerDown={handleDrawStart}
      onPointerMove={(e) => {
        handleDrawMove(e);
        if (!isDrawing) {
          handlePointerMove(e);
        }
      }}
      onPointerUp={(e) => {
        handleDrawEnd(e);
        if (!isDrawing) {
          handlePointerUp(e);
        }
      }}
    >
      <Page
        pageNumber={pageNum}
        width={pageWidth * zoom}
        className="bg-white"
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />

      <FieldOverlayLayer
        pageOverlays={pageOverlays || []}
        fieldPositions={fieldPositions}
        formData={formData}
        currentFieldIndex={currentFieldIndex}
        fieldNameToIndex={fieldNameToIndex}
        highlightedField={highlightedField}
        validationErrors={validationErrors}
        fieldFontSize={fieldFontSize}
        vaultData={vaultData}
        isEditMode={isEditMode}
        updateField={updateField}
        handleFieldClick={handleFieldClick}
        handleAutofillField={handleAutofillField}
      />

      <DragInteractionLayer
        isEditMode={isEditMode}
        isDragging={isDragging}
        alignmentGuides={alignmentGuides}
        pageWidth={pageWidth}
        zoom={zoom}
        handlePointerDown={handlePointerDown}
        handlePointerMove={handlePointerMove}
        handlePointerUp={handlePointerUp}
        pageOverlays={pageOverlays || []}
        fieldPositions={fieldPositions}
        isDrawing={isDrawing}
        drawingRect={drawingRect}
      />
    </div>
  );
};