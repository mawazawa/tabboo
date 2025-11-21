/**
 * PDFViewer Component
 *
 * Premium PDF rendering with Liquid Glass aesthetics.
 * Every interaction designed to make users wonder "how did they do this?"
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from '@/lib/pdfConfig';
import { useFormStore } from '@/stores/formStore';
import { Loader2, FileWarning, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  fileUrl: string;
  className?: string;
  children?: React.ReactNode;
}

export function PDFViewer({ fileUrl, className = '', children }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStartTime] = useState(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  const { pdfState, setPdfState } = useFormStore();
  const { scale, currentPage, numPages } = pdfState;

  // Chronometer for loading - shows precision
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - loadStartTime);
    }, 10);
    return () => clearInterval(interval);
  }, [isLoading, loadStartTime]);

  // Responsive container
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

  const goToPreviousPage = () => currentPage > 1 && setPdfState({ currentPage: currentPage - 1 });
  const goToNextPage = () => currentPage < numPages && setPdfState({ currentPage: currentPage + 1 });
  const zoomIn = () => setPdfState({ scale: Math.min(scale + 0.25, 3) });
  const zoomOut = () => setPdfState({ scale: Math.max(scale - 0.25, 0.5) });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Liquid Glass Control Bar */}
      <div
        className="relative flex items-center justify-between px-5 py-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.1) inset,
            0 -1px 0 0 rgba(0,0,0,0.1) inset,
            0 4px 16px -2px rgba(0,0,0,0.15)
          `,
        }}
      >
        {/* Animated gradient shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />

        {/* Page Navigation */}
        <div className="relative flex items-center gap-3">
          <GlassButton
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </GlassButton>

          <div
            className="px-4 py-2 rounded-xl text-sm font-medium min-w-[110px] text-center tabular-nums"
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px -2px rgba(0,0,0,0.3) inset',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '0.02em',
            }}
          >
            <span className="opacity-60">Page </span>
            {currentPage}
            <span className="opacity-40"> / </span>
            {numPages || '—'}
          </div>

          <GlassButton
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </GlassButton>
        </div>

        {/* Zoom Controls */}
        <div className="relative flex items-center gap-3">
          <GlassButton
            onClick={zoomOut}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </GlassButton>

          <div
            className="px-4 py-2 rounded-xl text-sm font-semibold min-w-[80px] text-center tabular-nums"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.2) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 0 20px -5px rgba(59,130,246,0.4)',
              color: 'rgba(255,255,255,0.98)',
            }}
          >
            {Math.round(scale * 100)}%
          </div>

          <GlassButton
            onClick={zoomIn}
            disabled={scale >= 3}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        <div className="flex justify-center p-8">
          {/* Position relative wrapper - CRITICAL for overlays */}
          <div
            className="relative inline-block rounded-2xl overflow-hidden"
            style={{
              // 5-layer premium shadow system
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.05),
                0 2px 4px -1px rgba(0,0,0,0.2),
                0 8px 16px -4px rgba(0,0,0,0.3),
                0 24px 48px -8px rgba(0,0,0,0.4),
                0 48px 96px -16px rgba(0,0,0,0.5)
              `,
            }}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadProgress={onDocumentLoadProgress}
              loading={<LoadingState progress={loadProgress} elapsedMs={elapsedMs} />}
              error={<ErrorState />}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                width={containerWidth ? Math.min(containerWidth - 64, 800) * scale : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="rounded-2xl"
                loading={
                  <div
                    className="flex items-center justify-center min-h-[600px] bg-white rounded-2xl"
                    style={{ minWidth: '400px' }}
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full border-[3px] border-slate-200"
                      />
                      <div
                        className="absolute inset-0 w-10 h-10 rounded-full border-[3px] border-transparent border-t-blue-500"
                        style={{ animation: 'spin 0.4s linear infinite' }}
                      />
                    </div>
                  </div>
                }
              />
            </Document>

            {/* Field overlay container */}
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * Premium Glass Button with spring physics
 */
function GlassButton({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="group relative p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: `
          0 1px 0 0 rgba(255,255,255,0.1) inset,
          0 -1px 0 0 rgba(0,0,0,0.1) inset,
          0 2px 8px -2px rgba(0,0,0,0.2)
        `,
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        color: 'rgba(255,255,255,0.85)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.boxShadow = `
            0 1px 0 0 rgba(255,255,255,0.15) inset,
            0 -1px 0 0 rgba(0,0,0,0.1) inset,
            0 4px 16px -4px rgba(0,0,0,0.3),
            0 0 20px -5px rgba(255,255,255,0.15)
          `;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = `
          0 1px 0 0 rgba(255,255,255,0.1) inset,
          0 -1px 0 0 rgba(0,0,0,0.1) inset,
          0 2px 8px -2px rgba(0,0,0,0.2)
        `;
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.08)';
        }
      }}
    >
      {children}
    </button>
  );
}

/**
 * Premium loading state with chronometer precision
 */
function LoadingState({ progress, elapsedMs }: { progress: number; elapsedMs: number }) {
  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[600px] min-w-[400px] rounded-2xl p-8"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        animation: 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Ultra-fast spinner (3x speed) */}
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.1) 100%)',
            border: '3px solid rgba(59,130,246,0.1)',
          }}
        />
        <div
          className="absolute inset-0 w-16 h-16 rounded-full border-[3px] border-transparent"
          style={{
            borderTopColor: '#3b82f6',
            borderRightColor: 'rgba(59,130,246,0.5)',
            animation: 'spin 0.35s linear infinite',
          }}
        />
        {/* Center glow */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            animation: 'pulse-glow 1s ease-in-out infinite',
          }}
        />
      </div>

      {/* Status text */}
      <div className="text-center mb-4">
        <p
          className="text-base font-semibold mb-1"
          style={{ color: '#1e293b', letterSpacing: '-0.01em' }}
        >
          Loading Document
        </p>
        <p
          className="text-sm tabular-nums"
          style={{ color: '#64748b' }}
        >
          {progress > 0 ? `${progress}% complete` : 'Initializing...'}
        </p>
      </div>

      {/* Progress bar with glow */}
      {progress > 0 && (
        <div className="w-56 mb-4">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.08)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1) inset',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite',
                boxShadow: '0 0 12px rgba(59,130,246,0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Precision chronometer */}
      <div
        className="px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums"
        style={{
          background: 'rgba(0,0,0,0.05)',
          color: '#94a3b8',
        }}
      >
        {seconds}s elapsed
      </div>
    </div>
  );
}

/**
 * Premium error state
 */
function ErrorState() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[600px] min-w-[400px] rounded-2xl p-8"
      style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fef2f2 50%, #fee2e2 100%)',
        animation: 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
          boxShadow: `
            0 4px 12px -2px rgba(239,68,68,0.3),
            0 0 0 1px rgba(239,68,68,0.1) inset
          `,
        }}
      >
        <FileWarning className="w-8 h-8 text-red-600" />
      </div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: '#7f1d1d', letterSpacing: '-0.01em' }}
      >
        Unable to Load PDF
      </h3>

      <p
        className="text-sm text-center max-w-[280px] leading-relaxed"
        style={{ color: '#991b1b' }}
      >
        The document couldn't be loaded. Please verify the file path and ensure the PDF is accessible.
      </p>
    </div>
  );
}

export default PDFViewer;
