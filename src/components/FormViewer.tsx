import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Settings, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { canAutofill, getVaultValueForField, type PersonalVaultData } from "@/utils/vaultFieldMatcher";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FormData {
  partyName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  county?: string;
  petitioner?: string;
  respondent?: string;
  caseNumber?: string;
  facts?: string;
  signatureDate?: string;
  signatureName?: string;
  noOrders?: boolean;
  agreeOrders?: boolean;
  consentCustody?: boolean;
  consentVisitation?: boolean;
}

interface FieldOverlays {
  type: 'input' | 'textarea' | 'checkbox';
  field: string;
  top: string;
  left: string;
  width?: string;
  height?: string;
  placeholder?: string;
}

interface Props {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  fieldPositions: Record<string, { top: number; left: number }>;
  updateFieldPosition: (field: string, position: { top: number; left: number }) => void;
  zoom?: number;
  highlightedField?: string | null;
  validationErrors?: Record<string, any[]>;
  vaultData?: PersonalVaultData | null;
}

export const FormViewer = ({ formData, updateField, currentFieldIndex, setCurrentFieldIndex, fieldPositions, updateFieldPosition, zoom = 1, highlightedField = null, validationErrors = {}, vaultData = null }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(850);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [editModeField, setEditModeField] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; top: number; left: number }>({ x: 0, y: 0, top: 0, left: 0 });

  // Map field names to indices
  const fieldNameToIndex: Record<string, number> = {
    partyName: 0, streetAddress: 1, city: 2, state: 3, zipCode: 4,
    telephoneNo: 5, faxNo: 6, email: 7, attorneyFor: 8, county: 9,
    petitioner: 10, respondent: 11, caseNumber: 12, noOrders: 13, agreeOrders: 14,
    consentCustody: 15, consentVisitation: 16, facts: 17, signatureDate: 18, signatureName: 19
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePointerDown = (e: React.PointerEvent, field: string, currentTop: number, currentLeft: number) => {
    // Prevent drag if clicking on input/textarea/button elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('button')) return;
    
    // Allow direct drag on the field container itself
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(field);
    
    // Capture pointer for smooth mobile dragging
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      top: currentTop,
      left: currentLeft
    };
  };

  const toggleEditMode = (field: string) => {
    const newEditMode = editModeField === field ? null : field;
    setEditModeField(newEditMode);
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

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    const parentRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    const newLeft = dragStartPos.current.left + (deltaX / parentRect.width) * 100;
    const newTop = dragStartPos.current.top + (deltaY / parentRect.height) * 100;
    
    // Constrain within bounds
    const constrainedLeft = Math.max(0, Math.min(95, newLeft));
    const constrainedTop = Math.max(0, Math.min(95, newTop));
    
    updateFieldPosition(isDragging, { top: constrainedTop, left: constrainedLeft });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setIsDragging(null);
  };

  const handlePDFClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the PDF container, not on input fields
    if ((e.target as HTMLElement).closest('.field-container')) return;
    setEditModeField(null);
  };

  const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right', field: string) => {
    const position = fieldPositions[field] || {
      top: parseFloat(fieldOverlays[0].fields.find(f => f.field === field)?.top || '0'),
      left: parseFloat(fieldOverlays[0].fields.find(f => f.field === field)?.left || '0')
    };
    const step = 1.0; // Increased from 0.1 for faster movement
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

  // Field overlays with default positions
  const fieldOverlays: { page: number; fields: FieldOverlays[] }[] = [{
    page: 1,
    fields: [
      { type: 'input', field: 'partyName', top: '15.8', left: '5', width: '40%', placeholder: 'NAME' },
      { type: 'input', field: 'streetAddress', top: '19', left: '5', width: '40%', placeholder: 'STREET ADDRESS' },
      { type: 'input', field: 'city', top: '22.5', left: '5', width: '23%', placeholder: 'CITY' },
      { type: 'input', field: 'state', top: '22.5', left: '29.5', width: '7%', placeholder: 'STATE' },
      { type: 'input', field: 'zipCode', top: '22.5', left: '38', width: '7%', placeholder: 'ZIP' },
      { type: 'input', field: 'telephoneNo', top: '25.8', left: '5', width: '16%', placeholder: 'PHONE' },
      { type: 'input', field: 'faxNo', top: '25.8', left: '23', width: '22%', placeholder: 'FAX' },
      { type: 'input', field: 'email', top: '29.2', left: '5', width: '40%', placeholder: 'EMAIL' },
      { type: 'input', field: 'attorneyFor', top: '32.5', left: '5', width: '40%', placeholder: 'ATTORNEY FOR' },
      { type: 'input', field: 'county', top: '15.8', left: '55', width: '40%', placeholder: 'COUNTY' },
      { type: 'input', field: 'petitioner', top: '22.5', left: '55', width: '40%', placeholder: 'PETITIONER' },
      { type: 'input', field: 'respondent', top: '26.5', left: '55', width: '40%', placeholder: 'RESPONDENT' },
      { type: 'input', field: 'caseNumber', top: '32.5', left: '55', width: '40%', placeholder: 'CASE #' },
      { type: 'checkbox', field: 'noOrders', top: '43.5', left: '25.5', placeholder: '' },
      { type: 'checkbox', field: 'agreeOrders', top: '46.5', left: '25.5', placeholder: '' },
      { type: 'checkbox', field: 'consentCustody', top: '53', left: '25.5', placeholder: '' },
      { type: 'checkbox', field: 'consentVisitation', top: '56', left: '25.5', placeholder: '' },
      { type: 'textarea', field: 'facts', top: '68', left: '5', width: '90%', height: '15%', placeholder: 'FACTS' },
      { type: 'input', field: 'signatureDate', top: '90', left: '5', width: '20%', placeholder: 'DATE' },
      { type: 'input', field: 'signatureName', top: '90', left: '50', width: '40%', placeholder: 'SIGNATURE' },
    ]
  }];

  return (
    <div className="h-full w-full overflow-auto bg-muted/20">
      <div className="relative min-h-full w-full flex items-center justify-center p-4">
        <div className="w-full" style={{ maxWidth: `${pageWidth * zoom}px` }}>
            <Document
              file="/fl320.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center w-full"
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
                    />
                  
                  {pageOverlays && (
                    <div className="absolute inset-0">
                      {pageOverlays.fields.map((overlay, idx) => {
                        const position = fieldPositions[overlay.field] || {
                          top: parseFloat(overlay.top),
                          left: parseFloat(overlay.left)
                        };
                        
                        const isCurrentField = fieldNameToIndex[overlay.field] === currentFieldIndex;
                        const isEditMode = editModeField === overlay.field;
                        const canAutofillField = canAutofill(overlay.field, vaultData);
                        const hasValue = !!formData[overlay.field as keyof FormData];
                        
                          return (
                            <div
                            key={idx}
                            className={`field-container absolute select-none touch-none spring-hover ${
                              isDragging === overlay.field ? 'cursor-grabbing z-50 ring-4 ring-primary opacity-90 shadow-3point p-4' : 
                              'cursor-grab p-3'
                            } ${
                              highlightedField === overlay.field
                                ? 'ring-4 ring-accent shadow-3point-hover animate-pulse bg-accent/20 chamfered' :
                              isEditMode 
                                ? 'ring-4 ring-green-600 shadow-3point bg-green-600/10 chamfered' :
                              isCurrentField 
                                ? 'ring-4 ring-primary shadow-3point chamfered' 
                                : 'hover:ring-2 hover:ring-primary/50 hover:bg-primary/5'
                            } rounded-lg transition-all`}
                            style={{
                              top: `${position.top}%`,
                              left: `${position.left}%`,
                              width: overlay.width || 'auto',
                              height: overlay.height || 'auto',
                              pointerEvents: 'auto',
                              // Expand clickable area with negative margin
                              margin: '-8px',
                            }}
                            onClick={(e) => handleFieldClick(overlay.field, e)}
                            onPointerDown={(e) => handlePointerDown(e, overlay.field, position.top, position.left)}
                          >
                            {isCurrentField && !isEditMode && (
                              <>
                                <div className="absolute -top-10 left-0 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-3point whitespace-nowrap chamfered flex items-center gap-2">
                                  {overlay.placeholder || overlay.field}
                                  {canAutofillField && !hasValue && (
                                    <Sparkles className="h-3 w-3 animate-pulse" strokeWidth={2} />
                                  )}
                                </div>
                                {/* Premium Touch-Friendly Control Arrows */}
                                <div className="absolute -top-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                                  <Button
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      adjustPosition('up', overlay.field);
                                    }}
                                    className="h-12 w-12 rounded-xl backdrop-blur-xl bg-white/10 border-hairline border-white/20 hover:bg-white/20 shadow-3point chamfered spring-hover group touch-none"
                                  >
                                    <ChevronUp className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" strokeWidth={2} />
                                  </Button>
                                  <div className="flex gap-2">
                                    <Button
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('left', overlay.field);
                                      }}
                                      className="h-12 w-12 rounded-xl backdrop-blur-xl bg-white/10 border-hairline border-white/20 hover:bg-white/20 shadow-3point chamfered spring-hover group touch-none"
                                    >
                                      <ChevronLeft className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" strokeWidth={2} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('down', overlay.field);
                                      }}
                                      className="h-12 w-12 rounded-xl backdrop-blur-xl bg-white/10 border-hairline border-white/20 hover:bg-white/20 shadow-3point chamfered spring-hover group touch-none"
                                    >
                                      <ChevronDown className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" strokeWidth={2} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustPosition('right', overlay.field);
                                      }}
                                      className="h-12 w-12 rounded-xl backdrop-blur-xl bg-white/10 border-hairline border-white/20 hover:bg-white/20 shadow-3point chamfered spring-hover group touch-none"
                                    >
                                      <ChevronRight className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" strokeWidth={2} />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                            {isEditMode && (
                              <div className="absolute -top-10 left-0 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-3point whitespace-nowrap flex items-center gap-2 chamfered">
                                <Move className="h-4 w-4" strokeWidth={0.5} />
                                Swipe to Move: {overlay.placeholder || overlay.field}
                              </div>
                            )}
                            {canAutofillField && !hasValue && (
                              <Button
                                size="icon"
                                variant="default"
                                className="absolute -top-3 -right-16 h-10 w-10 rounded-full shadow-3point z-10 spring-hover chamfered touch-none bg-gradient-to-r from-accent to-primary hover:shadow-3point-hover"
                                onClick={(e) => handleAutofillField(overlay.field, e)}
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                title="Autofill from Personal Data Vault"
                              >
                                <Sparkles className="h-5 w-5 animate-pulse" strokeWidth={2} />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant={isEditMode ? "default" : "default"}
                              className={`settings-button absolute -top-3 -right-3 h-10 w-10 rounded-full shadow-3point z-10 spring-hover chamfered touch-none ${
                                isEditMode ? 'bg-green-600 hover:bg-green-700' : ''
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleEditMode(overlay.field);
                              }}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              {isEditMode ? (
                                <Move className="h-5 w-5" strokeWidth={0.5} />
                              ) : (
                                <Settings className="h-5 w-5" strokeWidth={0.5} />
                              )}
                            </Button>
                            
                            {overlay.type === 'input' && (
                              <Input
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                disabled={isEditMode}
                                className={`h-12 text-base border-hairline shadow-3point chamfered ${
                                  isEditMode
                                    ? 'bg-green-600/10 border-green-600 cursor-grab pointer-events-none' :
                                  validationErrors?.[overlay.field]?.length
                                    ? 'bg-destructive/10 border-destructive ring-2 ring-destructive/20'
                                    : isCurrentField 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-white/90 border-primary/50'
                                }`}
                              />
                            )}
                            {overlay.type === 'textarea' && (
                              <Textarea
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                disabled={isEditMode}
                                className={`text-sm resize-none ${
                                  isEditMode
                                    ? 'bg-green-600/10 border-green-600 border-2 cursor-grab pointer-events-none' :
                                  validationErrors?.[overlay.field]?.length
                                    ? 'bg-destructive/10 border-destructive border-2 ring-2 ring-destructive/20'
                                    : isCurrentField 
                                    ? 'bg-primary/10 border-primary border-2' 
                                    : 'bg-white/90 border-primary/50'
                                }`}
                              />
                            )}
                            {overlay.type === 'checkbox' && (
                              <Checkbox
                                checked={!!formData[overlay.field as keyof FormData]}
                                onCheckedChange={(checked) => !isEditMode && updateField(overlay.field, checked as boolean)}
                                disabled={isEditMode}
                                className={`border-2 ${
                                  isEditMode
                                    ? 'bg-green-600/10 border-green-600 cursor-grab pointer-events-none' :
                                  isCurrentField 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-white/90 border-primary'
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
