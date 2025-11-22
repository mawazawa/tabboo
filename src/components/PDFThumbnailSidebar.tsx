import { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Loader2 } from "@/icons";
import { FieldMinimapIndicator } from "./FieldMinimapIndicator";

// Import centralized PDF.js configuration
import '@/lib/pdfConfig';

export interface ThumbnailSidebarProps {
  currentPage?: number;
  onPageClick?: (pageNumber: number) => void;
  currentFieldPositions?: { top: number; left: number }[];
  showFieldIndicator?: boolean;
  panelWidth?: number;
  pdfUrl?: string;
}

export const PDFThumbnailSidebar = ({ 
  currentPage = 1, 
  onPageClick, 
  currentFieldPositions = [],
  showFieldIndicator = false,
  panelWidth = 200,
  pdfUrl = '/fl320.pdf'
}: ThumbnailSidebarProps) => {
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
    <div ref={containerRef} className="w-full border-r bg-muted/30 backdrop-blur-sm flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-2 bg-muted/50 backdrop-blur-md">
        <FileText className="h-5 w-5 text-primary" strokeWidth={2} />
        <span className="font-semibold text-sm">Pages</span>
        {numPages > 0 && (
          <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {numPages}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 bg-muted/10 hover:bg-muted/15 transition-colors">
        <div className="p-4 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">Loading pages...</p>
            </div>
          )}
          <Document
            file={pdfUrl}
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
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative mb-4 rounded-lg overflow-hidden transition-all duration-200 w-full hover:scale-105 active:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? "ring-4 ring-primary shadow-xl scale-[1.03] bg-primary/5"
                      : "ring-2 ring-border/50 hover:ring-primary/70 hover:ring-4 shadow-lg hover:shadow-2xl bg-background hover:bg-primary/5"
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
                    className={`absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/95 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
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
