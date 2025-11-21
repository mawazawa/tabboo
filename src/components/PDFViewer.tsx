/**
 * PDFViewer Component
 *
 * Premium PDF rendering component with Liquid Glass aesthetics.
 * Renders PDF pages with proper positioning for field overlays.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from '@/lib/pdfConfig';
import { useFormStore } from '@/stores/formStore';
import { Loader2, FileWarning, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  /** URL or path to the PDF file */
  fileUrl: string;

  /** Optional class name for the container */
  className?: string;

  /** Children to render as overlays (field rectangles, etc.) */
  children?: React.ReactNode;
}

export function PDFViewer({ fileUrl, className = '', children }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const { pdfState, setPdfState } = useFormStore();
  const { scale, currentPage, numPages } = pdfState;

  // Responsive container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setPdfState({ numPages: pages, currentPage: 1 });
      setIsLoading(false);
    },
    [setPdfState]
  );

  const onDocumentLoadProgress = useCallback(
    ({ loaded, total }: { loaded: number; total: number }) => {
      setLoadProgress(Math.round((loaded / total) * 100));
    },
    []
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setPdfState({ currentPage: currentPage - 1 });
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setPdfState({ currentPage: currentPage + 1 });
    }
  };

  const zoomIn = () => {
    setPdfState({ scale: Math.min(scale + 0.25, 3) });
  };

  const zoomOut = () => {
    setPdfState({ scale: Math.max(scale - 0.25, 0.5) });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Premium Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border-b border-white/10">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-white/80" />
          </button>

          <span className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-medium text-white/90 min-w-[100px] text-center tabular-nums">
            {currentPage} / {numPages || '—'}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-white/80" />
          </button>

          <span className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-medium text-white/90 min-w-[70px] text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        <div className="flex justify-center p-6">
          {/* CRITICAL: position: relative wrapper for overlay positioning */}
          <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden">
            {/* Premium shadow layers */}
            <div className="absolute inset-0 rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]" />

            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadProgress={onDocumentLoadProgress}
              loading={
                <LoadingState progress={loadProgress} />
              }
              error={
                <ErrorState />
              }
              className="relative"
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                width={containerWidth ? Math.min(containerWidth - 48, 800) * scale : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="rounded-lg"
                loading={
                  <div className="flex items-center justify-center min-h-[600px] bg-white">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                }
              />
            </Document>

            {/* Field overlay container - children render here */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium loading state with progress indicator
 */
function LoadingState({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] min-w-[400px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
      {/* Animated loader */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200" />
        <div
          className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"
          style={{ animationDuration: '0.6s' }}
        />
      </div>

      {/* Progress text */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-slate-700">Loading PDF</p>
        <p className="text-xs text-slate-500 mt-1 tabular-nums">
          {progress > 0 ? `${progress}%` : 'Initializing...'}
        </p>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="mt-3 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Premium error state
 */
function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] min-w-[400px] bg-gradient-to-br from-red-50 to-slate-50 rounded-lg p-8">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <FileWarning className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Unable to Load PDF
      </h3>

      <p className="text-sm text-slate-600 text-center max-w-[280px]">
        The document couldn't be loaded. Please check the file path and try again.
      </p>
    </div>
  );
}

export default PDFViewer;
