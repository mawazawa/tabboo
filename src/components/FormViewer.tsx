import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, memo, useCallback, useEffect } from "react";
import { Document, Page } from 'react-pdf';
import { Settings, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Loader2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Keyboard } from "@/icons";
import { canAutofill, getVaultValueForField, type PersonalVaultData } from "@/utils/vaultFieldMatcher";
import { TutorialTooltips } from "@/components/TutorialTooltips";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import type { FormData, FieldOverlay, FieldPosition, ValidationErrors, PersonalVaultData } from "@/types/FormData";

// Import centralized PDF.js configuration
import '@/lib/pdfConfig';

interface Props {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  fieldPositions: Record<string, FieldPosition>;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  zoom?: number;
  highlightedField?: string | null;
  validationErrors?: ValidationErrors;
  vaultData?: PersonalVaultData | null;
}

export const FormViewer = ({ formData, updateField, currentFieldIndex, setCurrentFieldIndex, fieldPositions, updateFieldPosition, zoom = 1, highlightedField = null, validationErrors = {}, vaultData = null }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(850);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [pdfLoading, setPdfLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Use refs for drag state to avoid re-render storms
  const dragStartPos = useRef<{ x: number; y: number; top: number; left: number }>({ x: 0, y: 0, top: 0, left: 0 });
  const dragElementRef = useRef<HTMLElement | null>(null);
  const draggedPositionRef = useRef<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  // Map field names to indices
  const fieldNameToIndex: Record<string, number> = {
    // Attorney/Party Info (0-9)
    partyName: 0, streetAddress: 1, city: 2, state: 3, zipCode: 4,
    telephoneNo: 5, faxNo: 6, email: 7, attorneyFor: 8, attorneyBarNumber: 9,
    // Case Info (10-13)
    county: 10, petitioner: 11, respondent: 12, caseNumber: 13,
    // Hearing Info (14-17)
    hearingDate: 14, hearingTime: 15, hearingDepartment: 16, hearingRoom: 17,
    // Child Info (18-23)
    child1Name: 18, child1BirthDate: 19, child2Name: 20, child2BirthDate: 21,
    child3Name: 22, child3BirthDate: 23,
    // Order Types (24-31)
    orderChildCustody: 24, orderVisitation: 25, orderChildSupport: 26, orderSpousalSupport: 27,
    orderAttorneyFees: 28, orderPropertyControl: 29, orderOther: 30, orderOtherText: 31,
    // Response Types (32-35)
    noOrders: 32, agreeOrders: 33, consentCustody: 34, consentVisitation: 35,
    // Facts & Declaration (36-37)
    facts: 36, declarationUnderPenalty: 37,
    // Signature (38-40)
    signatureDate: 38, signatureName: 39, printName: 40
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setLoadProgress(100);
  };

  const handlePointerDown = (e: React.PointerEvent, field: string, currentTop: number, currentLeft: number) => {
    // Only allow dragging in global edit mode
    if (!isGlobalEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const container = (e.currentTarget as HTMLElement).closest('.field-container') as HTMLElement;
    if (!container) return;
    
    container.setPointerCapture(e.pointerId);
    dragElementRef.current = container;
    setIsDragging(field);
    
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      top: currentTop,
      left: currentLeft
    };
    
    draggedPositionRef.current = { top: currentTop, left: currentLeft };
  };

  const toggleGlobalEditMode = () => {
    setIsGlobalEditMode(prev => !prev);
  };

  const handleFieldClick = (field: string, e: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering PDF click
    e.stopPropagation();
    
    // Set this field as active in the control panel
    const fieldIndex = fieldNameToIndex[field];
    if (fieldIndex !== undefined) {
      setCurrentFieldIndex(fieldIndex);
    }
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragElementRef.current) return;
    
    e.preventDefault();
    
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use requestAnimationFrame + CSS transform (no React state updates during drag!)
    rafRef.current = requestAnimationFrame(() => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      const parentRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      
      let newLeft = dragStartPos.current.left + (deltaX / parentRect.width) * 100;
      let newTop = dragStartPos.current.top + (deltaY / parentRect.height) * 100;
      
      // Constrain within bounds
      newLeft = Math.max(0, Math.min(95, newLeft));
      newTop = Math.max(0, Math.min(95, newTop));

      // Smart snapping to other fields
      const snapThreshold = 1.5;
      const guides: { x: number[]; y: number[] } = { x: [], y: [] };
      
      Object.entries(fieldPositions).forEach(([field, pos]) => {
        if (field === isDragging) return;
        
        if (Math.abs(newLeft - pos.left) < snapThreshold) {
          newLeft = pos.left;
          guides.x.push(pos.left);
        }
        
        if (Math.abs(newTop - pos.top) < snapThreshold) {
          newTop = pos.top;
          guides.y.push(pos.top);
        }
      });
      
      // Update alignment guides
      setAlignmentGuides(guides);
      
      // Store position in ref (not state!)
      draggedPositionRef.current = { top: newTop, left: newLeft };
      
      // Apply via CSS transform for smooth 60fps movement
      if (dragElementRef.current) {
        const deltaLeftPx = (newLeft - dragStartPos.current.left) * parentRect.width / 100;
        const deltaTopPx = (newTop - dragStartPos.current.top) * parentRect.height / 100;
        dragElementRef.current.style.transform = `translate(${deltaLeftPx}px, ${deltaTopPx}px)`;
      }
    });
  }, [isDragging, fieldPositions]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Release pointer capture
    if (dragElementRef.current) {
      dragElementRef.current.releasePointerCapture(e.pointerId);
      // Reset transform
      dragElementRef.current.style.transform = '';
    }
    
    // COMMIT: Now update React state with final position
    if (draggedPositionRef.current && isDragging) {
      updateFieldPosition(isDragging, draggedPositionRef.current);
    }
    
    // Clean up
    setIsDragging(null);
    dragElementRef.current = null;
    draggedPositionRef.current = null;
    setAlignmentGuides({ x: [], y: [] });
  }, [isDragging, updateFieldPosition]);

  const handlePDFClick = (e: React.MouseEvent) => {
    // Clicking PDF background does nothing in edit mode
    if ((e.target as HTMLElement).closest('.field-container')) return;
  };

  const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right', field: string, customStep?: number) => {
    const position = fieldPositions[field] || {
      top: parseFloat(fieldOverlays[0].fields.find(f => f.field === field)?.top || '0'),
      left: parseFloat(fieldOverlays[0].fields.find(f => f.field === field)?.left || '0')
    };
    const step = customStep ?? 0.5; // Fine-tuned for precise control, allow override
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
  };

  const handleAutofillField = (field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const value = getVaultValueForField(field, vaultData);
    if (value) {
      updateField(field, value);
    }
  };

  // Keyboard shortcuts for field positioning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Toggle edit mode with 'E' key
      if (e.key === 'e' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setIsGlobalEditMode(prev => !prev);
        return;
      }

      // Exit edit mode with Escape
      if (e.key === 'Escape' && isGlobalEditMode) {
        e.preventDefault();
        setIsGlobalEditMode(false);
        return;
      }

      // Move selected field with arrow keys (only in edit mode)
      if (isGlobalEditMode && currentFieldIndex >= 0) {
        const field = Object.keys(fieldNameToIndex).find(
          f => fieldNameToIndex[f] === currentFieldIndex
        );
        if (!field) return;

        const step = e.shiftKey ? 5 : 0.5; // Shift key for faster movement

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          adjustPosition('up', field, step);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          adjustPosition('down', field, step);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          adjustPosition('left', field, step);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          adjustPosition('right', field, step);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalEditMode, currentFieldIndex, fieldNameToIndex, adjustPosition]);

  // Field overlays with default positions
  const fieldOverlays: { page: number; fields: FieldOverlay[] }[] = [{
    page: 1,
    fields: [
      // Attorney/Party Information (Item 1)
      { type: 'input', field: 'partyName', top: '15.8', left: '5', width: '40%', placeholder: 'NAME' },
      { type: 'input', field: 'streetAddress', top: '19', left: '5', width: '40%', placeholder: 'STREET ADDRESS' },
      { type: 'input', field: 'city', top: '22.5', left: '5', width: '23%', placeholder: 'CITY' },
      { type: 'input', field: 'state', top: '22.5', left: '29.5', width: '7%', placeholder: 'STATE' },
      { type: 'input', field: 'zipCode', top: '22.5', left: '38', width: '7%', placeholder: 'ZIP' },
      { type: 'input', field: 'telephoneNo', top: '25.8', left: '5', width: '16%', placeholder: 'PHONE' },
      { type: 'input', field: 'faxNo', top: '25.8', left: '23', width: '22%', placeholder: 'FAX' },
      { type: 'input', field: 'email', top: '29.2', left: '5', width: '40%', placeholder: 'EMAIL' },
      { type: 'input', field: 'attorneyFor', top: '32.5', left: '5', width: '35%', placeholder: 'ATTORNEY FOR' },
      { type: 'input', field: 'attorneyBarNumber', top: '32.5', left: '42', width: '8%', placeholder: 'BAR #' },

      // Case Information (right column)
      { type: 'input', field: 'county', top: '15.8', left: '55', width: '40%', placeholder: 'COUNTY' },
      { type: 'input', field: 'petitioner', top: '22.5', left: '55', width: '40%', placeholder: 'PETITIONER' },
      { type: 'input', field: 'respondent', top: '26.5', left: '55', width: '40%', placeholder: 'RESPONDENT' },
      { type: 'input', field: 'caseNumber', top: '32.5', left: '55', width: '40%', placeholder: 'CASE #' },

      // Hearing Information (Item 2)
      { type: 'input', field: 'hearingDate', top: '38', left: '20', width: '15%', placeholder: 'HEARING DATE' },
      { type: 'input', field: 'hearingTime', top: '38', left: '37', width: '12%', placeholder: 'TIME' },
      { type: 'input', field: 'hearingDepartment', top: '38', left: '51', width: '10%', placeholder: 'DEPT' },
      { type: 'input', field: 'hearingRoom', top: '38', left: '63', width: '10%', placeholder: 'ROOM' },

      // Child Information (Item 3)
      { type: 'input', field: 'child1Name', top: '41.5', left: '20', width: '35%', placeholder: 'CHILD 1 NAME' },
      { type: 'input', field: 'child1BirthDate', top: '41.5', left: '57', width: '15%', placeholder: 'BIRTHDATE' },
      { type: 'input', field: 'child2Name', top: '44.5', left: '20', width: '35%', placeholder: 'CHILD 2 NAME' },
      { type: 'input', field: 'child2BirthDate', top: '44.5', left: '57', width: '15%', placeholder: 'BIRTHDATE' },
      { type: 'input', field: 'child3Name', top: '47.5', left: '20', width: '35%', placeholder: 'CHILD 3 NAME' },
      { type: 'input', field: 'child3BirthDate', top: '47.5', left: '57', width: '15%', placeholder: 'BIRTHDATE' },

      // Order Types (Items 4-7)
      { type: 'checkbox', field: 'orderChildCustody', top: '51', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'orderVisitation', top: '54', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'orderChildSupport', top: '57', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'orderSpousalSupport', top: '60', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'orderAttorneyFees', top: '63', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'orderPropertyControl', top: '66', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'orderOther', top: '69', left: '5', placeholder: '' },
      { type: 'input', field: 'orderOtherText', top: '69', left: '25', width: '70%', placeholder: 'SPECIFY OTHER' },

      // Response Type
      { type: 'checkbox', field: 'noOrders', top: '72.5', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'agreeOrders', top: '75.5', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'consentCustody', top: '78.5', left: '5', placeholder: '' },
      { type: 'checkbox', field: 'consentVisitation', top: '81.5', left: '5', placeholder: '' },

      // Facts and Declaration
      { type: 'textarea', field: 'facts', top: '85', left: '5', width: '90%', height: '8%', placeholder: 'FACTS' },
      { type: 'checkbox', field: 'declarationUnderPenalty', top: '93.5', left: '5', placeholder: '' },

      // Signature
      { type: 'input', field: 'signatureDate', top: '96', left: '5', width: '15%', placeholder: 'DATE' },
      { type: 'input', field: 'signatureName', top: '96', left: '30', width: '30%', placeholder: 'SIGNATURE' },
      { type: 'input', field: 'printName', top: '96', left: '65', width: '30%', placeholder: 'PRINT NAME' },
    ]
  }];

  return (
    <div className="h-full w-full overflow-auto bg-muted/20">
        <TutorialTooltips />
        
        {/* Global Edit Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                variant={isGlobalEditMode ? "default" : "secondary"}
                className={`shadow-lg hover:scale-105 transition-transform ${!isGlobalEditMode ? 'animate-pulse' : ''}`}
                onClick={toggleGlobalEditMode}
              >
                <Move className="h-5 w-5 mr-2" />
                {isGlobalEditMode ? 'Lock Fields' : 'Edit Positions'}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold">{isGlobalEditMode ? 'Exit edit mode to fill form' : 'Enter edit mode to move fields'}</p>
                <p className="text-xs text-muted-foreground">Keyboard: Press E to toggle</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Edit Mode Active Banner */}
        {isGlobalEditMode && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-500/95 text-white rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-top border-2 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Move className="h-5 w-5" />
                <div className="absolute inset-0 bg-white/30 blur-sm animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm">EDIT MODE ACTIVE</div>
                <div className="text-xs flex items-center gap-2 mt-0.5">
                  <span>Drag fields or use</span>
                  <Keyboard className="h-3 w-3 inline" />
                  <span>arrow keys</span>
                  <span className="opacity-70">• Press E or Esc to exit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative min-h-full w-full flex items-center justify-center p-4">
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
                    <p className="text-sm text-muted-foreground">Preparing your FL-320 form...</p>
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
              file="/fl320.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
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
                const pageOverlays = fieldOverlays.find(o => o.page === pageNum);

                return (
                  <div 
                    key={`page_${pageNum}`}
                    className="relative mb-4 touch-none w-full"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onClick={handlePDFClick}
                  >
                    <Page
                      pageNumber={pageNum}
                      width={pageWidth * zoom}
                      renderTextLayer={true}
                      renderAnnotationLayer={false}
                      className="w-full"
                      loading=""
                    />
                  
                  {pageOverlays && (
                    <div className="absolute inset-0">
                      {/* Alignment Guides */}
                      {isDragging && (
                        <>
                          {/* Vertical alignment guides */}
                          {alignmentGuides.x.map((x, i) => (
                            <div
                              key={`guide-x-${i}`}
                              className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-lg pointer-events-none z-40 animate-in fade-in duration-100"
                              style={{ left: `${x}%` }}
                            >
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-accent text-accent-foreground text-xs px-2 py-1 rounded-t">
                                {x.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                          
                          {/* Horizontal alignment guides */}
                          {alignmentGuides.y.map((y, i) => (
                            <div
                              key={`guide-y-${i}`}
                              className="absolute left-0 right-0 h-0.5 bg-accent shadow-lg pointer-events-none z-40 animate-in fade-in duration-100"
                              style={{ top: `${y}%` }}
                            >
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-accent text-accent-foreground text-xs px-2 py-1 rounded-l">
                                {y.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {pageOverlays.fields.map((overlay, idx) => {
                        const position = fieldPositions[overlay.field] || {
                          top: parseFloat(overlay.top),
                          left: parseFloat(overlay.left)
                        };
                        
                        const isCurrentField = fieldNameToIndex[overlay.field] === currentFieldIndex;
                        const canAutofillField = canAutofill(overlay.field, vaultData);
                        const hasValue = !!formData[overlay.field as keyof FormData];
                        
                        // Determine which directions are available for movement
                        const canMoveUp = position.top > 1;
                        const canMoveDown = position.top < 94;
                        const canMoveLeft = position.left > 1;
                        const canMoveRight = position.left < 94;
                        
                          return (
                            <div
                            key={idx}
                            className={`field-container group absolute select-none touch-none ${
                              isDragging === overlay.field ? 'cursor-grabbing z-50 ring-2 ring-primary shadow-lg scale-105' : 
                              isGlobalEditMode ? 'cursor-move ring-2 ring-primary/70' : 'cursor-pointer'
                            } ${
                              highlightedField === overlay.field
                                ? 'ring-2 ring-accent shadow-lg animate-pulse' :
                              isCurrentField 
                                ? 'ring-2 ring-primary shadow-md bg-primary/5' 
                                : 'ring-1 ring-border/50 hover:ring-primary/50'
                            } rounded-lg bg-background/80 backdrop-blur-sm p-2 transition-all duration-200`}
                            style={{
                              top: `${position.top}%`,
                              left: `${position.left}%`,
                              width: overlay.width || 'auto',
                              height: overlay.height || 'auto',
                              pointerEvents: 'auto',
                              // Expand clickable area with negative margin
                              margin: '-8px',
                              // Scale with zoom
                              transform: `scale(${zoom})`,
                              transformOrigin: 'top left',
                            }}
                            onClick={(e) => handleFieldClick(overlay.field, e)}
                            onPointerDown={(e) => handlePointerDown(e, overlay.field, position.top, position.left)}
                          >
                            {/* Visual Direction Indicators */}
                            {isGlobalEditMode && (
                              <>
                                {/* Up Arrow Indicator */}
                                {canMoveUp && (
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none">
                                    <ArrowUp className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
                                  </div>
                                )}
                                
                                {/* Down Arrow Indicator */}
                                {canMoveDown && (
                                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
                                    <ArrowDown className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
                                  </div>
                                )}
                                
                                {/* Left Arrow Indicator */}
                                {canMoveLeft && (
                                  <div className="absolute top-1/2 -translate-y-1/2 -left-10 pointer-events-none">
                                    <ArrowLeft className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
                                  </div>
                                )}
                                
                                {/* Right Arrow Indicator */}
                                {canMoveRight && (
                                  <div className="absolute top-1/2 -translate-y-1/2 -right-10 pointer-events-none">
                                    <ArrowRight className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
                                  </div>
                                )}
                              </>
                            )}
                            
                            {/* Simplified Field Controls */}
                            {isCurrentField && (
                              <div className="absolute -top-8 left-0 right-0 flex items-center justify-between gap-2">
                                <div className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
                                  {overlay.placeholder || overlay.field}
                                  {canAutofillField && !hasValue && (
                                    <Sparkles className="inline h-3 w-3 ml-1 animate-pulse" />
                                  )}
                                </div>
                                {isGlobalEditMode && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-6 w-6"
                                      disabled={!canMoveUp}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('up', overlay.field);
                                      }}
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-6 w-6"
                                      disabled={!canMoveDown}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('down', overlay.field);
                                      }}
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-6 w-6"
                                      disabled={!canMoveLeft}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('left', overlay.field);
                                      }}
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-6 w-6"
                                      disabled={!canMoveRight}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('right', overlay.field);
                                      }}
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                            {isCurrentField && (
                              <>
                                {canAutofillField && !hasValue && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute -top-2 -right-10 h-7 w-7 rounded-full"
                                        onClick={(e) => handleAutofillField(overlay.field, e)}
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <Sparkles className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Autofill from vault</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant={isGlobalEditMode ? "default" : "secondary"}
                                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleGlobalEditMode();
                                      }}
                                    >
                                      <Move className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{isGlobalEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}
                            
                            {overlay.type === 'input' && (
                              <Input
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                disabled={isGlobalEditMode}
                                className={`field-input h-6 text-[12pt] font-mono ${
                                  isGlobalEditMode
                                    ? 'bg-muted/50 border-muted cursor-move pointer-events-none' :
                                  validationErrors?.[overlay.field]?.length
                                    ? 'bg-destructive/10 border-destructive'
                                    : isCurrentField
                                    ? 'bg-primary/5 border-primary'
                                    : 'bg-background border-border'
                                }`}
                              />
                            )}
                            {overlay.type === 'textarea' && (
                              <Textarea
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                disabled={isGlobalEditMode}
                                className={`field-input text-[12pt] font-mono resize-none min-h-[48px] ${
                                  isGlobalEditMode
                                    ? 'bg-muted/50 border-muted cursor-move pointer-events-none' :
                                  validationErrors?.[overlay.field]?.length
                                    ? 'bg-destructive/10 border-destructive'
                                    : isCurrentField
                                    ? 'bg-primary/5 border-primary'
                                    : 'bg-background border-border'
                                }`}
                              />
                            )}
                            {overlay.type === 'checkbox' && (
                              <Checkbox
                                checked={!!formData[overlay.field as keyof FormData]}
                                onCheckedChange={(checked) => !isGlobalEditMode && updateField(overlay.field, checked as boolean)}
                                disabled={isGlobalEditMode}
                                className={`border-2 ${
                                  isGlobalEditMode
                                    ? 'bg-muted/50 border-muted cursor-move pointer-events-none' :
                                  isCurrentField 
                                    ? 'bg-primary/5 border-primary' 
                                    : 'bg-background border-border'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
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
