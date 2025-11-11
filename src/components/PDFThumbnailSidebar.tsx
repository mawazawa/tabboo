import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import { FieldMinimapIndicator } from "./FieldMinimapIndicator";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  currentPage?: number;
  onPageClick?: (pageNumber: number) => void;
  currentFieldPosition?: { top: number; left: number } | null;
  showFieldIndicator?: boolean;
}

export const PDFThumbnailSidebar = ({ 
  currentPage = 1, 
  onPageClick, 
  currentFieldPosition = null,
  showFieldIndicator = false 
}: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const { open } = useSidebar();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-hairline">
      <SidebarHeader className="border-b-hairline p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" strokeWidth={0.5} />
          {open && <span className="font-semibold text-sm">Pages</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Document Pages</SidebarGroupLabel>}
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="px-2 pb-2 space-y-3">
                <Document
                  file="/fl320.pdf"
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex flex-col items-center"
                >
                  {Array.from(new Array(numPages), (el, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === currentPage;

                    return (
                      <button
                        key={`thumb_${pageNum}`}
                        onClick={() => onPageClick?.(pageNum)}
                        className={`relative mb-3 rounded-lg overflow-hidden transition-all spring-hover ${
                          isActive
                            ? "ring-4 ring-primary shadow-3point scale-105"
                            : "ring-2 ring-border hover:ring-primary/50 shadow-3point"
                        } ${open ? "w-full" : "w-12"}`}
                      >
                        <div className="relative">
                          <Page
                            pageNumber={pageNum}
                            width={open ? 180 : 48}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="chamfered"
                          />
                          {/* Minimap Field Indicator - only shows on current page */}
                          {isActive && showFieldIndicator && currentFieldPosition && (
                            <FieldMinimapIndicator
                              fieldPosition={currentFieldPosition}
                              isActive={true}
                            />
                          )}
                        </div>
                        {open && (
                          <div
                            className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-semibold ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-background/90 text-muted-foreground"
                            }`}
                          >
                            Page {pageNum}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </Document>
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
