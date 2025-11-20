import { useState, useEffect } from "react";
import { pdfCache } from "@/utils/pdf-cache";
import type { FormType } from "@/components/FormViewer";

const getPdfPath = (formType: FormType): string => {
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setLoadProgress(100);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('[PDF Load Error]:', error);
    console.error('[PDF Path]:', cachedPdfUrl || getPdfPath(formType));
    setPdfLoading(false);
  };

  useEffect(() => {
    const loadPdf = async () => {
      const pdfPath = getPdfPath(formType);
      const cached = await pdfCache.get(pdfPath);
      if (cached) {
        setCachedPdfUrl(cached);
      }
    };
    loadPdf();

    return () => {
      if (cachedPdfUrl && cachedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cachedPdfUrl);
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
    cachedPdfUrl,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    onLoadProgress: ({ loaded, total }: { loaded: number; total: number }) => {
      if (total > 0) {
        setLoadProgress(Math.round((loaded / total) * 100));
      }
    }
  };
};

