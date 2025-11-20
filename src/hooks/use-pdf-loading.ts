import { useState, useEffect, useRef } from "react";
import { pdfCache } from "@/utils/pdf-cache";
import type { FormType } from "@/components/FormViewer";

export const getPdfPath = (formType: FormType): string => {
  const pdfPaths: Record<FormType, string> = {
    'FL-320': '/fl320.pdf',
    'FL-300': '/fl300.pdf',
    'FL-303': '/fl303.pdf',
    'FL-305': '/fl305.pdf',
    'DV-100': '/dv100.pdf',
    'DV-105': '/dv105.pdf',
  };
  return pdfPaths[formType];
};

export const usePdfLoading = (formType: FormType) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(850);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentPDFPage, setCurrentPDFPage] = useState<number>(1);
  const [cachedPdfUrl, setCachedPdfUrl] = useState<string | null>(null);
  
  // Use ref to track current blob URL for cleanup to avoid stale closure
  const blobUrlRef = useRef<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setLoadProgress(100);
    console.log(`[PDF Loaded] Successfully loaded ${numPages} pages for ${formType}`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('[PDF Load Error]:', error);
    console.error('[PDF Path]:', cachedPdfUrl || getPdfPath(formType));
    setPdfLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        const pdfPath = getPdfPath(formType);
        const fullUrl = window.location.origin + pdfPath;
        const blob = await pdfCache.get(fullUrl);

        if (isMounted) {
          // Create blob URL from cached blob
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl; // Track current blob URL for cleanup
          setCachedPdfUrl(blobUrl);

          if (import.meta.env.DEV) {
            const stats = pdfCache.getStats();
            console.log('[PDF Cache Stats]', {
              cacheHitRate: `${stats.cacheHitRate.toFixed(1)}%`,
              memoryHits: stats.memoryHits,
              indexedDBHits: stats.indexedDBHits,
              networkFetches: stats.networkFetches,
            });
          }
        }
      } catch (error) {
        console.error('[PDF Cache] Failed to load PDF:', error);
        if (isMounted) {
          // Fallback to direct path if cache fails
          const fallbackPath = getPdfPath(formType);
          setCachedPdfUrl(fallbackPath);
          blobUrlRef.current = null;
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      // Clean up blob URL using ref to avoid stale closure
      // This ensures we always revoke the current blob URL, not a stale one
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [formType]);

  return {
    numPages,
    pageWidth,
    pdfLoading,
    loadProgress,
    currentPDFPage,
    setCurrentPDFPage,
    cachedPdfUrl: cachedPdfUrl || getPdfPath(formType), // Always return valid path
    onDocumentLoadSuccess,
    onDocumentLoadError,
    onLoadProgress: ({ loaded, total }: { loaded: number; total: number }) => {
      if (total > 0) {
        setLoadProgress(Math.round((loaded / total) * 100));
      }
    }
  };
};

