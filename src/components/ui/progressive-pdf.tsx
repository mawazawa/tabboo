import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "@/icons";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ProgressivePDFProps {
  file: string;
  pageNumber: number;
  width: number;
  onLoadSuccess?: (pdf: { numPages: number }) => void;
  className?: string;
  scale?: number;
  renderAnnotationLayer?: boolean;
  renderTextLayer?: boolean;
}

export const ProgressivePDF = ({
  file,
  pageNumber,
  width,
  onLoadSuccess,
  className,
  scale = 1,
  renderAnnotationLayer = true,
  renderTextLayer = true,
}: ProgressivePDFProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setLoadingProgress(0);
  }, [file, pageNumber]);

  const handleLoadSuccess = (pdf: { numPages: number }) => {
    setIsLoading(false);
    setLoadingProgress(100);
    onLoadSuccess?.(pdf);
  };

  const handlePageLoadSuccess = () => {
    setIsLoading(false);
  };

  const LoadingPlaceholder = () => (
    <div className="relative w-full bg-muted/5 rounded-lg overflow-hidden">
      <Skeleton className="w-full aspect-[8.5/11]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Loading PDF...</p>
        {loadingProgress > 0 && loadingProgress < 100 && (
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      {isLoading && <LoadingPlaceholder />}
      <div 
        className={cn(
          "transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      >
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadProgress={({ loaded, total }) => {
            if (total > 0) {
              setLoadingProgress(Math.round((loaded / total) * 100));
            }
          }}
          loading=""
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            scale={scale}
            renderAnnotationLayer={renderAnnotationLayer}
            renderTextLayer={renderTextLayer}
            onLoadSuccess={handlePageLoadSuccess}
            loading=""
          />
        </Document>
      </div>
    </div>
  );
};
