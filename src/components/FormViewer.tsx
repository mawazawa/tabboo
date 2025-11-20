import { Card, Button } from "@liquid-justice/design-system";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Document, Page } from 'react-pdf';
import { Move, Loader2, Keyboard, AlertCircle, AlertTriangle, ChevronLeft, ChevronRight } from "@/icons";
import { canAutofill, getVaultValueForField } from "@/utils/vaultFieldMatcher";
import { TutorialTooltips } from "@/components/TutorialTooltips";
import { useFormFields, convertToFieldOverlays } from "@/hooks/use-form-fields";
import { useLiveRegion } from "@/hooks/use-live-region";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import { useRAFMonitoring } from "@/hooks/use-raf-batching";
import { AlignmentGuides } from "@/components/pdf/AlignmentGuides";
import { FieldOverlay } from "@/components/pdf/FieldOverlay";
import { mergeFieldNameToIndex } from "@/lib/field-name-index-utils";
import { legacyFieldNameToIndex } from "@/lib/legacy-field-name-map";
import { pdfCache } from "@/utils/pdf-cache";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import type { FormData, FieldPosition, ValidationErrors, PersonalVaultData } from "@/types/FormData";

// Import centralized PDF.js configuration
import '@/lib/pdfConfig';

export type FormType = 'FL-320' | 'FL-300' | 'FL-303' | 'FL-305' | 'DV-100' | 'DV-105';

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

// Helper function to get PDF path based on form type
const getPdfPath = (formType: FormType): string => {
  const pdfPaths: Record<FormType, string> = {
    'FL-320': '/fl320.pdf',
    'FL-300': '/fl300.pdf',
    'FL-303': '/fl303.pdf',
    'FL-305': '/fl305.pdf',
    'DV-100': '/dv100.pdf',
    'DV-105': '/dv105.pdf',
  };
  return pdfPaths[formType];
};

export const FormViewer = ({ formData, updateField, currentFieldIndex, setCurrentFieldIndex, fieldPositions, updateFieldPosition, formType = 'FL-320', zoom = 1, fieldFontSize = 12, highlightedField = null, validationErrors = {}, vaultData = null, isEditMode = false }: Props) => {
  // Live region for screen reader announcements
  const { announce, LiveRegionComponent } = useLiveRegion({
    clearAfter: 2000, // Clear announcements after 2 seconds
    debounce: 300, // Debounce rapid announcements (e.g., during dragging)
  });

  // Fetch form fields from database based on formType
  const { data: fieldMappings, isLoading: isLoadingFields, error: fieldsError } = useFormFields(formType);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(850);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentPDFPage, setCurrentPDFPage] = useState<number>(1);
  const [cachedPdfUrl, setCachedPdfUrl] = useState<string | null>(null);

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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setLoadProgress(100);
    console.log(`[PDF Loaded] Successfully loaded ${numPages} pages for ${formType}`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('[PDF Load Error]:', error);
    console.error('[PDF Path]:', cachedPdfUrl || getPdfPath(formType));
    setPdfLoading(false); // Stop loading spinner even on error
  };

  // Announce edit mode changes to screen readers
  useEffect(() => {
    announce(isEditMode ? 'Edit mode activated. You can now drag fields to reposition them.' : 'Edit mode deactivated. Fields are now locked.');
  }, [isEditMode, announce]);

  // Load PDF through cache (Phase 3: IndexedDB optimization)
  useEffect(() => {
    let isMounted = true;
    let blobUrl: string | null = null;

    const loadPdf = async () => {
      try {
        const pdfPath = getPdfPath(formType);
        const fullUrl = window.location.origin + pdfPath;

        // Load PDF through triple-layer cache
        const blob = await pdfCache.get(fullUrl);

        if (isMounted) {
          blobUrl = URL.createObjectURL(blob);
          setCachedPdfUrl(blobUrl);

          // Log cache statistics in dev mode
          if (import.meta.env.DEV) {
            const stats = pdfCache.getStats();
            console.log('[PDF Cache Stats]', {
              cacheHitRate: `${stats.cacheHitRate.toFixed(1)}%`,
              memoryHits: stats.memoryHits,
              indexedDBHits: stats.indexedDBHits,
              networkFetches: stats.networkFetches,
            });
          }
        }
      } catch (error) {
        console.error('[PDF Cache] Failed to load PDF:', error);
        if (isMounted) {
          // Fallback to direct path if cache fails
          setCachedPdfUrl(getPdfPath(formType));
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      // Clean up blob URL to prevent memory leaks
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [formType]);

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

  // Page navigation handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPDFPage(prev => Math.max(1, prev - 1));
    announce(`Navigated to page ${Math.max(1, currentPDFPage - 1)}`);
  }, [currentPDFPage, announce]);

  const handleNextPage = useCallback(() => {
    setCurrentPDFPage(prev => Math.min(numPages, prev + 1));
    announce(`Navigated to page ${Math.min(numPages, currentPDFPage + 1)}`);
  }, [currentPDFPage, numPages, announce]);

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
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <Card className="p-6 max-w-md">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="font-semibold text-lg">Error Loading Form Fields</h3>
            <p className="text-sm text-muted-foreground">
              Failed to load {formType} form field definitions from the database.
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              {fieldsError.message}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Show warning if no fields were loaded
  if (!fieldMappings || fieldMappings.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <Card className="p-6 max-w-md">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-warning" />
            <h3 className="font-semibold text-lg">No Form Fields Found</h3>
            <p className="text-sm text-muted-foreground">
              No field mappings found for {formType} in the database.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-muted/20">
        {/* Live region for screen reader announcements */}
        <LiveRegionComponent />

        <TutorialTooltips />

        {/* Edit Mode Active Banner */}
        {isEditMode && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-500/95 text-white rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-top border-2 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Move className="h-5 w-5" />
                <div className="absolute inset-0 bg-white/30 blur-sm animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm">✅ DRAG MODE ACTIVE</div>
                <div className="text-xs flex items-center gap-2 mt-0.5">
                  <span className="font-semibold">Click & drag any field to reposition</span>
                  <span className="opacity-70">• Or use</span>
                  <Keyboard className="h-3 w-3 inline" />
                  <span className="opacity-70">arrow keys</span>
                  <span className="opacity-70">• Press E or Esc to exit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative min-h-full w-full flex flex-col items-center justify-center p-4">
          {/* Page Navigation Controls - Dark Blue Pill Design */}
          {numPages > 1 && !pdfLoading && (
            <div className="sticky top-4 z-40 mb-4 flex items-center gap-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl px-4 py-2.5 shadow-3point transition-all duration-300 hover:shadow-3point-hover">
              <button
                onClick={handlePreviousPage}
                disabled={currentPDFPage === 1}
                aria-label="Previous page"
                className="btn-pill-dark h-9 w-9 min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold min-w-[90px] text-center text-foreground/90 tracking-tight">
                Page {currentPDFPage} of {numPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPDFPage === numPages}
                aria-label="Next page"
                className="btn-pill-dark h-9 w-9 min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {pdfLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-50">
              <div className="w-full max-w-md bg-card rounded-lg border-2 shadow-3point chamfered p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Loading PDF Form</h3>
                    <p className="text-sm text-muted-foreground">Preparing your {formType} form...</p>
                  </div>
                  {loadProgress > 0 && loadProgress < 100 && (
                    <div className="w-full">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${loadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">{loadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="w-full" style={{ maxWidth: `${pageWidth * zoom}px` }}>
            <Document
              file={cachedPdfUrl || getPdfPath(formType)}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onLoadProgress={({ loaded, total }) => {
                if (total > 0) {
                  setLoadProgress(Math.round((loaded / total) * 100));
                }
              }}
              className="flex flex-col items-center w-full"
              loading=""
            >
              {Array.from(new Array(numPages), (el, index) => {
                const pageNum = index + 1;

                // Performance: Only render current page ± 1 page buffer
                // This reduces DOM overhead for multi-page PDFs (30-40% improvement)
                const pageBuffer = 1;
                const shouldRenderPage = Math.abs(pageNum - currentPDFPage) <= pageBuffer;

                const pageOverlays = fieldOverlays.find(o => o.page === pageNum);

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
                            {/* Alignment Guides */}
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
                                  width={overlay.width}
                                  height={overlay.height}
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
                                  adjustPosition={adjustPosition}
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
                      // Placeholder for unrendered pages to maintain scroll height
                      <div className="w-full bg-muted/10 flex items-center justify-center" style={{ height: `${pageWidth * zoom * 1.294}px` }}>
                        <p className="text-muted-foreground text-sm">Page {pageNum}</p>
                      </div>
                    )}
                </div>
              );
            })}
          </Document>
        </div>
      </div>
    </div>
  );
};

