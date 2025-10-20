import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Settings } from "lucide-react";
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

interface FieldOverlay {
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
}

export const FormViewer = ({ formData, updateField, currentFieldIndex }: Props) => {
  // Map field names to their array index in fieldOverlays
  const fieldNameToIndex: Record<string, number> = {
    partyName: 0, streetAddress: 1, city: 2, state: 3, zipCode: 4,
    telephoneNo: 5, faxNo: 6, email: 7, attorneyFor: 8, county: 9,
    petitioner: 10, respondent: 11, caseNumber: 12, noOrders: 13,
    agreeOrders: 14, consentCustody: 15, consentVisitation: 16,
    facts: 17, signatureDate: 18, signatureName: 19
  };
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(850);
  const [fieldPositions, setFieldPositions] = useState<Record<string, { top: string; left: string; width?: string; height?: string }>>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; top: number; left: number }>({ x: 0, y: 0, top: 0, left: 0 });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const updateFieldPosition = (field: string, position: { top?: string; left?: string; width?: string; height?: string }) => {
    setFieldPositions(prev => ({
      ...prev,
      [field]: { ...prev[field], ...position }
    }));
  };

  const handleMouseDown = (e: React.MouseEvent, field: string, currentTop: string, currentLeft: string) => {
    if ((e.target as HTMLElement).closest('.settings-button')) return;
    setIsDragging(field);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      top: parseFloat(currentTop),
      left: parseFloat(currentLeft)
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    const parentRect = e.currentTarget.getBoundingClientRect();
    
    const newLeft = dragStartPos.current.left + (deltaX / parentRect.width) * 100;
    const newTop = dragStartPos.current.top + (deltaY / parentRect.height) * 100;
    
    updateFieldPosition(isDragging, {
      top: `${newTop}%`,
      left: `${newLeft}%`
    });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Form field overlay positions (adjust these based on actual PDF coordinates)
  const fieldOverlays: { page: number; fields: FieldOverlay[] }[] = [
    {
      page: 1,
      fields: [
        { type: 'input', field: 'partyName', top: '15.8%', left: '5%', width: '40%', placeholder: 'NAME' },
        { type: 'input', field: 'streetAddress', top: '19.2%', left: '5%', width: '40%', placeholder: 'STREET ADDRESS' },
        { type: 'input', field: 'city', top: '22.5%', left: '5%', width: '23%', placeholder: 'CITY' },
        { type: 'input', field: 'state', top: '22.5%', left: '29.5%', width: '7%', placeholder: 'STATE' },
        { type: 'input', field: 'zipCode', top: '22.5%', left: '38%', width: '7%', placeholder: 'ZIP' },
        { type: 'input', field: 'telephoneNo', top: '25.8%', left: '5%', width: '16%', placeholder: 'TELEPHONE' },
        { type: 'input', field: 'faxNo', top: '25.8%', left: '23%', width: '22%', placeholder: 'FAX' },
        { type: 'input', field: 'email', top: '29.2%', left: '5%', width: '40%', placeholder: 'EMAIL' },
        { type: 'input', field: 'attorneyFor', top: '32.5%', left: '5%', width: '40%', placeholder: 'ATTORNEY FOR' },
        { type: 'input', field: 'county', top: '15.8%', left: '55%', width: '40%', placeholder: 'COUNTY' },
        { type: 'input', field: 'petitioner', top: '22.5%', left: '55%', width: '40%', placeholder: 'PETITIONER' },
        { type: 'input', field: 'respondent', top: '26.5%', left: '55%', width: '40%', placeholder: 'RESPONDENT' },
        { type: 'input', field: 'caseNumber', top: '32.5%', left: '55%', width: '40%', placeholder: 'CASE NUMBER' },
        { type: 'checkbox', field: 'noOrders', top: '43.5%', left: '25.5%' },
        { type: 'checkbox', field: 'agreeOrders', top: '46.5%', left: '25.5%' },
        { type: 'checkbox', field: 'consentCustody', top: '53%', left: '25.5%' },
        { type: 'checkbox', field: 'consentVisitation', top: '56%', left: '25.5%' },
        { type: 'textarea', field: 'facts', top: '68%', left: '5%', width: '90%', height: '15%' },
        { type: 'input', field: 'signatureDate', top: '90%', left: '5%', width: '20%', placeholder: 'DATE' },
        { type: 'input', field: 'signatureName', top: '90%', left: '50%', width: '40%', placeholder: 'SIGNATURE' },
      ]
    }
  ];

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
                >
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                  />
                  
                  {pageOverlays && (
                    <div className="absolute inset-0 pointer-events-none">
                      {pageOverlays.fields.map((overlay, idx) => {
                        const position = fieldPositions[overlay.field] || {
                          top: overlay.top,
                          left: overlay.left,
                          width: overlay.width,
                          height: overlay.height
                        };
                        
                        const isCurrentField = fieldNameToIndex[overlay.field] === currentFieldIndex;
                        
                        return (
                          <div
                            key={idx}
                            className={`absolute pointer-events-auto ${
                              isDragging === overlay.field 
                                ? 'cursor-grabbing z-50 ring-2 ring-primary' 
                                : 'cursor-grab'
                            } ${
                              isCurrentField 
                                ? 'ring-4 ring-primary shadow-lg animate-pulse' 
                                : 'hover:ring-2 hover:ring-primary/50'
                            } rounded transition-all`}
                            style={{
                              top: position.top,
                              left: position.left,
                              width: position.width || 'auto',
                              height: position.height || 'auto',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, overlay.field, position.top, position.left)}
                          >
                            {isCurrentField && (
                              <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium shadow-lg whitespace-nowrap z-10">
                                {overlay.placeholder || overlay.field}
                              </div>
                            )}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="default"
                                  className="settings-button absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-10"
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 bg-background z-50">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-sm">Adjust Position</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs text-muted-foreground">Top (%)</label>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        value={parseFloat(position.top) || 0}
                                        onChange={(e) => updateFieldPosition(overlay.field, { top: `${e.target.value}%` })}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Left (%)</label>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        value={parseFloat(position.left) || 0}
                                        onChange={(e) => updateFieldPosition(overlay.field, { left: `${e.target.value}%` })}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    {position.width && (
                                      <div>
                                        <label className="text-xs text-muted-foreground">Width (%)</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={parseFloat(position.width) || 0}
                                          onChange={(e) => updateFieldPosition(overlay.field, { width: `${e.target.value}%` })}
                                          className="h-8 text-xs"
                                        />
                                      </div>
                                    )}
                                    {position.height && (
                                      <div>
                                        <label className="text-xs text-muted-foreground">Height (%)</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={parseFloat(position.height) || 0}
                                          onChange={(e) => updateFieldPosition(overlay.field, { height: `${e.target.value}%` })}
                                          className="h-8 text-xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            
                            {overlay.type === 'input' && (
                              <Input
                                value={formData[overlay.field as keyof FormData] as string || ''}
                                onChange={(e) => updateField(overlay.field, e.target.value)}
                                placeholder={overlay.placeholder}
                                className={`h-8 text-sm pointer-events-auto ${
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
                                className={`text-sm resize-none pointer-events-auto ${
                                  isCurrentField 
                                    ? 'bg-primary/10 border-primary border-2' 
                                    : 'bg-white/90 border-primary/50'
                                }`}
                              />
                            )}
                            {overlay.type === 'checkbox' && (
                              <Checkbox
                                checked={!!formData[overlay.field as keyof FormData]}
                                onCheckedChange={(checked) => updateField(overlay.field, checked as boolean)}
                                className={`border-2 pointer-events-auto ${
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