import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
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

export const FormViewer = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(850);

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Form field overlay positions (adjust these based on actual PDF coordinates)
  const fieldOverlays = [
    {
      page: 1,
      fields: [
        { type: 'input', field: 'partyName', top: '11%', left: '5%', width: '40%', placeholder: 'NAME' },
        { type: 'input', field: 'streetAddress', top: '14.5%', left: '5%', width: '40%', placeholder: 'STREET ADDRESS' },
        { type: 'input', field: 'city', top: '18%', left: '5%', width: '25%', placeholder: 'CITY' },
        { type: 'input', field: 'state', top: '18%', left: '31%', width: '6%', placeholder: 'STATE' },
        { type: 'input', field: 'zipCode', top: '18%', left: '38%', width: '7%', placeholder: 'ZIP' },
        { type: 'input', field: 'telephoneNo', top: '21.5%', left: '5%', width: '19%', placeholder: 'TELEPHONE' },
        { type: 'input', field: 'faxNo', top: '21.5%', left: '26%', width: '19%', placeholder: 'FAX' },
        { type: 'input', field: 'email', top: '25%', left: '5%', width: '40%', placeholder: 'EMAIL' },
        { type: 'input', field: 'attorneyFor', top: '28.5%', left: '5%', width: '40%', placeholder: 'ATTORNEY FOR' },
        { type: 'input', field: 'county', top: '11%', left: '55%', width: '40%', placeholder: 'COUNTY' },
        { type: 'input', field: 'petitioner', top: '18%', left: '55%', width: '40%', placeholder: 'PETITIONER' },
        { type: 'input', field: 'respondent', top: '22%', left: '55%', width: '40%', placeholder: 'RESPONDENT' },
        { type: 'input', field: 'caseNumber', top: '30%', left: '55%', width: '40%', placeholder: 'CASE NUMBER' },
        { type: 'checkbox', field: 'noOrders', top: '39%', left: '8%' },
        { type: 'checkbox', field: 'agreeOrders', top: '42%', left: '8%' },
        { type: 'checkbox', field: 'consentCustody', top: '48%', left: '8%' },
        { type: 'checkbox', field: 'consentVisitation', top: '51%', left: '8%' },
        { type: 'textarea', field: 'facts', top: '60%', left: '5%', width: '90%', height: '20%' },
        { type: 'input', field: 'signatureDate', top: '88%', left: '5%', width: '20%', placeholder: 'DATE' },
        { type: 'input', field: 'signatureName', top: '88%', left: '50%', width: '40%', placeholder: 'SIGNATURE' },
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
                <div key={`page_${pageNum}`} className="relative mb-4">
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                  />
                  
                  {pageOverlays && (
                    <div className="absolute inset-0 pointer-events-none">
                      {pageOverlays.fields.map((overlay, idx) => (
                        <div
                          key={idx}
                          className="absolute pointer-events-auto"
                          style={{
                            top: overlay.top,
                            left: overlay.left,
                            width: overlay.width || 'auto',
                            height: overlay.height || 'auto',
                          }}
                        >
                          {overlay.type === 'input' && (
                            <Input
                              value={formData[overlay.field as keyof FormData] as string || ''}
                              onChange={(e) => updateField(overlay.field, e.target.value)}
                              placeholder={overlay.placeholder}
                              className="h-8 bg-white/90 border-primary/50 text-sm"
                            />
                          )}
                          {overlay.type === 'textarea' && (
                            <Textarea
                              value={formData[overlay.field as keyof FormData] as string || ''}
                              onChange={(e) => updateField(overlay.field, e.target.value)}
                              placeholder={overlay.placeholder}
                              className="bg-white/90 border-primary/50 text-sm resize-none"
                            />
                          )}
                          {overlay.type === 'checkbox' && (
                            <Checkbox
                              checked={!!formData[overlay.field as keyof FormData]}
                              onCheckedChange={(checked) => updateField(overlay.field, checked as boolean)}
                              className="bg-white/90 border-2 border-primary"
                            />
                          )}
                        </div>
                      ))}
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