import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Settings, Move } from "lucide-react";
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
  fieldPositions: Record<string, { top: number; left: number }>;
  updateFieldPosition: (field: string, position: { top: number; left: number }) => void;
  deselectField?: () => void;
}

export const FormViewer = ({ formData, updateField, currentFieldIndex, fieldPositions, updateFieldPosition, deselectField }: Props) => {
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

  const handleMouseDown = (e: React.MouseEvent, field: string, currentTop: number, currentLeft: number) => {
    // Only allow drag if field is in edit mode
    if (editModeField !== field) return;
    
    // Prevent drag if clicking on input/textarea/button elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('button')) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(field);
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
    // Also set this as the current field when entering edit mode
    if (newEditMode && deselectField) {
      // Find the field index and set it as current
      const fieldIndex = fieldNameToIndex[field];
      if (fieldIndex !== undefined) {
        // You would need to pass setCurrentFieldIndex as a prop to do this
        // For now, just toggle edit mode
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
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

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handlePDFClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the PDF container, not on input fields
    if ((e.target as HTMLElement).closest('.field-container')) return;
    setEditModeField(null);
    if (deselectField) {
      deselectField();
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
    <Card className="h-full border-2 shadow-medium">
      <ScrollArea className="h-full">
        <div className="relative">
          <Document
            file="/fl320.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center"
          >
            {Array.from(new Array(numPages), (el, index) => {
              const pageNum = index + 1;
              const pageOverlays = fieldOverlays.find(o => o.page === pageNum);

              return (
                <div 
                  key={`page_${pageNum}`}
                  className="relative mb-4"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={handlePDFClick}
                >
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
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
                        
                          return (
                            <div
                            key={idx}
                            className={`field-container absolute select-none ${
                              isDragging === overlay.field ? 'cursor-grabbing z-50 ring-4 ring-green-600 opacity-90' : 
                              isEditMode ? 'cursor-grab ring-4 ring-green-600 shadow-xl' : 'cursor-pointer'
                            } ${
                              isEditMode 
                                ? 'ring-4 ring-green-600 shadow-xl bg-green-600/10' :
                              isCurrentField 
                                ? 'ring-4 ring-primary shadow-lg' 
                                : 'hover:ring-2 hover:ring-primary/50'
                            } rounded transition-all`}
                            style={{
                              top: `${position.top}%`,
                              left: `${position.left}%`,
                              width: overlay.width || 'auto',
                              height: overlay.height || 'auto',
                              pointerEvents: 'auto',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, overlay.field, position.top, position.left)}
                          >
                            {isCurrentField && !isEditMode && (
                              <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium shadow-lg whitespace-nowrap">
                                {overlay.placeholder || overlay.field}
                              </div>
                            )}
                            {isEditMode && (
                              <div className="absolute -top-8 left-0 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg whitespace-nowrap flex items-center gap-1">
                                <Move className="h-3 w-3" strokeWidth={0.5} />
                                Drag to Move: {overlay.placeholder || overlay.field}
                              </div>
                            )}
                            <Button
                              size="icon"
                              variant={isEditMode ? "default" : "default"}
                              className={`settings-button absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg z-10 ${
                                isEditMode ? 'bg-green-600 hover:bg-green-700' : ''
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleEditMode(overlay.field);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              {isEditMode ? (
                                <Move className="h-3 w-3" strokeWidth={0.5} />
                              ) : (
                                <Settings className="h-3 w-3" strokeWidth={0.5} />
                              )}
                            </Button>
                            
                            {overlay.type === 'input' && (
                              <Input
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                disabled={isEditMode}
                                className={`h-8 text-sm ${
                                  isEditMode
                                    ? 'bg-green-600/10 border-green-600 border-2 cursor-grab' :
                                  isCurrentField 
                                    ? 'bg-primary/10 border-primary border-2' 
                                    : 'bg-white/90 border-primary/50'
                                }`}
                              />
                            )}
                            {overlay.type === 'textarea' && (
                              <Textarea
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                disabled={isEditMode}
                                className={`text-sm resize-none ${
                                  isEditMode
                                    ? 'bg-green-600/10 border-green-600 border-2 cursor-grab' :
                                  isCurrentField 
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
                                    ? 'bg-green-600/10 border-green-600 cursor-grab' :
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
      </ScrollArea>
    </Card>
  );
};
