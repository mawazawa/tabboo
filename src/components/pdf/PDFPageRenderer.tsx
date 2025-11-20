import { Page } from 'react-pdf';
import { AlignmentGuides } from "./AlignmentGuides";
import { FieldOverlay } from "./FieldOverlay";
import { canAutofill } from "@/utils/vaultFieldMatcher";
import type { FormData, FieldPosition, ValidationErrors, PersonalVaultData } from "@/types/FormData";

interface PDFPageRendererProps {
  pageNum: number;
  currentPDFPage: number;
  pageWidth: number;
  zoom: number;
  fieldFontSize: number;
  isEditMode: boolean;
  isDragging: string | false;
  alignmentGuides: Array<{ x: number; y: number; type: 'horizontal' | 'vertical' }>;
  pageOverlays: { page: number; fields: Array<{ field: string; type: string; placeholder?: string; top: string; left: string }> } | undefined;
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
  handlePointerDown: (e: React.PointerEvent, field: string, top: number, left: number) => void;
}

export const PDFPageRenderer = ({
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
  handlePointerDown
}: PDFPageRendererProps) => {
  const pageBuffer = 1;
  const shouldRenderPage = Math.abs(pageNum - currentPDFPage) <= pageBuffer;

  return (
    <div
      key={`page_${pageNum}`}
      className={`relative mb-4 w-full ${isEditMode ? 'touch-none' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handlePDFClick}
    >
      {shouldRenderPage ? (
        <>
          <Page
            pageNumber={pageNum}
            width={pageWidth * zoom}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="w-full"
            loading=""
          />

          {pageOverlays && (
            <div className="absolute inset-0 z-10">
              {isDragging && <AlignmentGuides guides={alignmentGuides} />}

              {pageOverlays.fields.map((overlay, idx) => {
                const position = fieldPositions[overlay.field] || {
                  top: parseFloat(overlay.top),
                  left: parseFloat(overlay.left)
                };

                const isCurrentField = fieldNameToIndex[overlay.field] === currentFieldIndex;
                const canAutofillField = canAutofill(overlay.field, vaultData);
                const hasValue = !!formData[overlay.field as keyof FormData];

                return (
                  <FieldOverlay
                    key={idx}
                    field={overlay.field}
                    type={overlay.type}
                    placeholder={overlay.placeholder}
                    position={position}
                    zoom={zoom}
                    fieldFontSize={fieldFontSize}
                    formData={formData}
                    isEditMode={isEditMode}
                    isCurrentField={isCurrentField}
                    isDragging={isDragging === overlay.field}
                    highlightedField={highlightedField}
                    validationErrors={validationErrors}
                    vaultData={vaultData}
                    canAutofillField={canAutofillField}
                    hasValue={hasValue}
                    updateField={updateField}
                    handleFieldClick={handleFieldClick}
                    handleAutofillField={handleAutofillField}
                    onPointerDown={isEditMode ? (e) => handlePointerDown(e, overlay.field, position.top, position.left) : undefined}
                  />
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="w-full bg-muted/10 flex items-center justify-center" style={{ height: `${pageWidth * zoom * 1.294}px` }}>
          <p className="text-muted-foreground text-sm">Page {pageNum}</p>
        </div>
      )}
    </div>
  );
};

