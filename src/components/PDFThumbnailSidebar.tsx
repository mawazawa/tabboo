import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Loader2 } from "@/icons";
import { FieldMinimapIndicator } from "./FieldMinimapIndicator";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  currentPage?: number;
  onPageClick?: (pageNumber: number) => void;
  currentFieldPositions?: { top: number; left: number }[];
  showFieldIndicator?: boolean;
  panelWidth?: number;
}

export const PDFThumbnailSidebar = ({ 
  currentPage = 1, 
  onPageClick, 
  currentFieldPositions = [],
  showFieldIndicator = false,
  panelWidth = 200
}: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbnailWidth, setThumbnailWidth] = useState(200);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  // Auto-scale thumbnails based on panel width
  useEffect(() => {
    if (containerRef.current) {
      const availableWidth = containerRef.current.offsetWidth - 32; // Account for padding
      setThumbnailWidth(Math.min(availableWidth, 280)); // Max 280px
    }
  }, [panelWidth]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onPageLoadSuccess = (pageNum: number) => {
    setLoadedPages(prev => new Set(prev).add(pageNum));
  };

  return (
    <div ref={containerRef} className="w-full border-r bg-card/50 backdrop-blur-sm flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-2 bg-card/80">
        <FileText className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <span className="font-semibold text-sm">Pages</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">Loading pages...</p>
            </div>
          )}
          <Document
            file="/fl320.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col"
            loading=""
          >
            {Array.from(new Array(numPages), (el, index) => {
              const pageNum = index + 1;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`thumb_${pageNum}`}
                  onClick={() => onPageClick?.(pageNum)}
                  className={`relative mb-3 rounded-lg overflow-hidden transition-all spring-hover w-full ${
                    isActive
                      ? "ring-4 ring-primary shadow-3point scale-105"
                      : "ring-2 ring-border hover:ring-primary/50 shadow-3point"
                  }`}
                >
                  <div className="relative w-full">
                    {!loadedPages.has(pageNum) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                        <Skeleton className="w-full aspect-[8.5/11]" />
                      </div>
                    )}
                    <div className={`transition-opacity duration-300 ${loadedPages.has(pageNum) ? 'opacity-100' : 'opacity-0'}`}>
                      <Page
                        pageNumber={pageNum}
                        width={thumbnailWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="chamfered w-full"
                        onLoadSuccess={() => onPageLoadSuccess(pageNum)}
                        loading=""
                      />
                    </div>
                    {/* Minimap Field Indicator - only shows on current page */}
                    {isActive && showFieldIndicator && currentFieldPositions.length > 0 && (
                      <FieldMinimapIndicator
                        fieldPositions={currentFieldPositions}
                        isActive={true}
                      />
                    )}
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-semibold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/90 text-muted-foreground"
                    }`}
                  >
                    Page {pageNum}
                  </div>
                </button>
              );
            })}
          </Document>
        </div>
      </ScrollArea>
    </div>
  );
};
