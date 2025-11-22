import { useCallback, useEffect, useMemo, useState } from "react";
import { Document } from 'react-pdf';
import { useFormFields, convertToFieldOverlays } from "@/hooks/use-form-fields";
import { useLiveRegion } from "@/hooks/use-live-region";
import { useToast } from "@/hooks/use-toast";
import { usePdfLoading, getPdfPath } from "@/hooks/use-pdf-loading";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { DrawnRect } from "@/hooks/use-field-drawing";
import { mergeFieldNameToIndex } from "@/lib/field-name-index-utils";
import { legacyFieldNameToIndex } from "@/lib/legacy-field-name-map";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "@/icons";
import { getVaultValueForField } from "@/utils/vaultFieldMatcher";
import { TutorialTooltips } from "@/components/TutorialTooltips";
import { PDFLoadingState } from "@/components/pdf/PDFLoadingState";
import { PDFErrorState } from "@/components/pdf/PDFErrorState";
import { EditModeBanner } from "@/components/pdf/EditModeBanner";
import { PDFPageRenderer } from "@/components/pdf/PDFPageRenderer";
import { MappingHUD } from "@/components/pdf/MappingHUD";
import { NewFieldDialog } from "@/components/pdf/NewFieldDialog";
import { useFieldMapping } from "@/hooks/use-field-mapping";
import { useSaveFormField } from "@/hooks/use-save-form-field";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface Props {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  fieldPositions: Record<string, FieldPosition>;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  formType?: FormType;
  zoom?: number;
  fieldFontSize?: number;
  highlightedField?: string | null;
  validationErrors?: ValidationErrors;
  vaultData?: PersonalVaultData | null;
  isEditMode?: boolean;
}

export const FormViewer = ({ formData, updateField, currentFieldIndex, setCurrentFieldIndex, fieldPositions, updateFieldPosition, formType = 'FL-320', zoom = 1, fieldFontSize = 12, highlightedField = null, validationErrors = {}, vaultData = null, isEditMode = false }: Props) => {
  // Live region for screen reader announcements
  const { announce, LiveRegionComponent } = useLiveRegion({
    clearAfter: 2000, // Clear announcements after 2 seconds
    debounce: 300, // Debounce rapid announcements (e.g., during dragging)
    });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: saveField, isPending: isSaving } = useSaveFormField();
  
  // Auto-Pilot Mapping Hook
  const { 
    isMappingMode, 
    setIsMappingMode, 
    currentField, 
    currentIndex, 
    totalFields, 
    nextField, 
    skipField, 
    prevField 
  } = useFieldMapping(formType);

  // State for new field dialog
  const [newFieldDialog, setNewFieldDialog] = useState<{ open: boolean; rect: DrawnRect & { page: number } | null }>({ open: false, rect: null });

  // Fetch form fields from database based on formType
  const { data: fieldMappings, isLoading: isLoadingFields, error: fieldsError } = useFormFields(formType);

  // PDF loading hook
  const {
    numPages,
    pageWidth,
    pdfLoading,
    loadProgress,
    currentPDFPage,
    setCurrentPDFPage,
    cachedPdfUrl,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    onLoadProgress
  } = usePdfLoading(formType);

  // Convert database field mappings to field overlays (memoized for performance)
  const fieldOverlays = useMemo(() => {
    if (!fieldMappings || fieldMappings.length === 0) {
      // Fallback to empty array while loading or if no data
      return [];
    }
    return convertToFieldOverlays(fieldMappings);
  }, [fieldMappings]);

  // Generate resilient field name to index mapping to keep keyboard navigation working
  const fieldNameToIndex: Record<string, number> = useMemo(() => {
    const dbFieldNames = fieldMappings?.map(mapping => mapping.form_field_name) ?? [];
    return mergeFieldNameToIndex(legacyFieldNameToIndex, dbFieldNames);
  }, [fieldMappings]);

  /**
   * Adjust field position by moving it in the specified direction
   */
  const adjustPosition = useCallback((direction: 'up' | 'down' | 'left' | 'right', field: string, customStep?: number) => {
    const position = fieldPositions[field] || {
      top: parseFloat(fieldOverlays[0]?.fields.find(f => f.field === field)?.top || '0'),
      left: parseFloat(fieldOverlays[0]?.fields.find(f => f.field === field)?.left || '0')
    };
    const step = customStep ?? 0.5;
    const newPosition = { ...position };

    switch (direction) {
      case 'up':
        newPosition.top = Math.max(0, newPosition.top - step);
        break;
      case 'down':
        newPosition.top = Math.min(100, newPosition.top + step);
        break;
      case 'left':
        newPosition.left = Math.max(0, newPosition.left - step);
        break;
      case 'right':
        newPosition.left = Math.min(100, newPosition.left + step);
        break;
    }

    updateFieldPosition(field, newPosition);
  }, [fieldPositions, fieldOverlays, updateFieldPosition]);

  // Drag and drop hook
  const {
    isDragging,
    alignmentGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useDragAndDrop({
    isEditMode,
    fieldPositions,
    updateFieldPosition,
    announce,
  });

  // Keyboard navigation hook
  useKeyboardNavigation({
    isEditMode,
    currentFieldIndex,
    fieldNameToIndex,
    adjustPosition,
  });

  // Announce edit mode changes to screen readers
  useEffect(() => {
    announce(isEditMode ? 'Edit mode activated. You can now drag fields to reposition them.' : 'Edit mode deactivated. Fields are now locked.');
  }, [isEditMode, announce]);

  // Auto-Save Handler
  const handleSaveField = useCallback(async (data: { name: string; type: string; rect: DrawnRect }) => {
    if (!newFieldDialog.rect && !isMappingMode) return;
    
    // In mapping mode, we might not have newFieldDialog.rect if we bypassed it?
    // No, onDrawComplete sets it.
    
    const rectToUse = newFieldDialog.rect || (isMappingMode ? data.rect : null); // Fallback if needed
    
    if (!rectToUse) {
        // Should be unreachable if flow is correct
        console.error("No rect available for save");
        return;
    }

    const { page } = rectToUse as any; // Type cast for now
    const { name, type, rect } = data;
    
    try {
        await saveField({
            formNumber: formType,
            name,
            type,
            rect: { ...rect, page }
        });

        toast({
          title: isMappingMode ? `Mapped: ${name}` : "Field Saved",
          description: isMappingMode 
            ? `Saved to database. Advancing...` 
            : `Successfully saved ${name} to database.`,
          duration: isMappingMode ? 1000 : 3000,
        });
        
        // If in mapping mode, advance
        if (isMappingMode) {
            nextField();
        }
    } catch (error) {
        // Error handled by hook's onError, but we should ensure we don't advance if error
        console.error("Save failed in FormViewer handler", error);
    }
    
  }, [newFieldDialog.rect, formType, toast, isMappingMode, nextField, saveField]);

  const handleDrawComplete = useCallback((page: number, rect: DrawnRect) => {
    if (isMappingMode && currentField) {
        // Auto-pilot: Immediately save with current target field
        handleSaveField({
            name: currentField.name,
            type: currentField.type,
            rect: { ...rect, page } as any // Pass page through
        });
        // Note: handleSaveField will call nextField()
    } else {
        // Manual mode: Open dialog
        setNewFieldDialog({ open: true, rect: { ...rect, page } });
    }
  }, [isMappingMode, currentField, handleSaveField]);

  const handleFieldClick = useCallback((field: string, e: React.MouseEvent) => {
    // Check if clicking on form element OR any parent up to the container
    const target = e.target as HTMLElement;
    let element: HTMLElement | null = target;
    let isFormElement = false;
    
    // Check target and all parents up to the container
    while (element && !element.classList.contains('field-container')) {
      if (
        element.tagName === 'INPUT' || 
        element.tagName === 'TEXTAREA' || 
        element.tagName === 'BUTTON' ||
        element.getAttribute('role') === 'checkbox' ||
        element.classList.contains('field-input')
      ) {
        isFormElement = true;
        break;
      }
      element = element.parentElement;
    }
    
    // Only stop propagation if clicking container background, NOT form elements
    if (!isFormElement) {
      e.stopPropagation();
    }
    
    // Set this field as active in the control panel
    const fieldIndex = fieldNameToIndex[field];
    if (fieldIndex !== undefined) {
      setCurrentFieldIndex(fieldIndex);
    }
  }, [fieldNameToIndex, setCurrentFieldIndex]);

  const handlePDFClick = (e: React.MouseEvent) => {
    // Clicking PDF background does nothing in edit mode
    if ((e.target as HTMLElement).closest('.field-container')) return;
  };

  const handleAutofillField = useCallback((field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const value = getVaultValueForField(field, vaultData);
    if (value) {
      updateField(field, value);
    }
  }, [vaultData, updateField]);

  // Show loading state while fetching field data from database
  if (isLoadingFields) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading {formType} form fields from database...</p>
        </div>
      </div>
    );
  }

  // Show error state if field fetching failed
  if (fieldsError) {
    return <PDFErrorState type="error" formType={formType} errorMessage={fieldsError.message} />;
  }

  // Show warning if no fields were loaded
  if (!fieldMappings || fieldMappings.length === 0) {
    return <PDFErrorState type="no-fields" formType={formType} />;
  }

  return (
    <div className="h-full w-full overflow-auto bg-muted/20">
        {/* Live region for screen reader announcements */}
        <LiveRegionComponent />

        <TutorialTooltips />

        <NewFieldDialog 
          open={newFieldDialog.open} 
          onOpenChange={(open) => setNewFieldDialog(prev => ({ ...prev, open }))}
          rect={newFieldDialog.rect}
          onSave={handleSaveField}
        />

        {isMappingMode && currentField && (
            <MappingHUD 
                field={currentField} 
                index={currentIndex} 
                total={totalFields} 
                onSkip={skipField}
                onPrev={prevField}
            />
        )}

        {isEditMode && (
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <Button 
                    variant={isMappingMode ? "destructive" : "default"}
                    className={isMappingMode ? "animate-pulse shadow-[0_0_15px_rgba(255,95,31,0.5)] border-neon-orange" : ""}
                    onClick={() => setIsMappingMode(!isMappingMode)}
                >
                    {isMappingMode ? (
                        <>Stop Auto-Pilot</>
                    ) : (
                        <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Start Auto-Pilot
                        </>
                    )}
                </Button>
            </div>
        )}

        {isEditMode && <EditModeBanner />}

        <div className="relative min-h-full w-full flex flex-col items-center justify-center p-4">
          {pdfLoading && <PDFLoadingState loadProgress={loadProgress} formType={formType} />}
          
          <div className="w-full" style={{ maxWidth: `${pageWidth * zoom}px` }}>
            <Document
              file={cachedPdfUrl || getPdfPath(formType)}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onLoadProgress={onLoadProgress}
              className="flex flex-col items-center w-full"
              loading=""
            >
              {Array.from(new Array(numPages), (el, index) => {
                const pageNum = index + 1;
                const pageOverlays = fieldOverlays.find(o => o.page === pageNum);

                return (
                  <PDFPageRenderer
                    key={`page_${pageNum}`}
                    pageNum={pageNum}
                    currentPDFPage={currentPDFPage}
                    pageWidth={pageWidth}
                    zoom={zoom}
                    fieldFontSize={fieldFontSize}
                    isEditMode={isEditMode}
                    isDragging={isDragging}
                    alignmentGuides={alignmentGuides}
                    pageOverlays={pageOverlays?.fields ?? []}
                    fieldPositions={fieldPositions}
                    formData={formData}
                    currentFieldIndex={currentFieldIndex}
                    fieldNameToIndex={fieldNameToIndex}
                    highlightedField={highlightedField}
                    validationErrors={validationErrors}
                    vaultData={vaultData}
                    updateField={updateField}
                    handleFieldClick={handleFieldClick}
                    handleAutofillField={handleAutofillField}
                    handlePointerMove={handlePointerMove}
                    handlePointerUp={handlePointerUp}
                    handlePDFClick={handlePDFClick}
                    handlePointerDown={handlePointerDown}
                    onDrawComplete={handleDrawComplete}
                  />
                );
              })}
            </Document>
          </div>
        </div>
    </div>
  );
};
