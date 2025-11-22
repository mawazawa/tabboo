/**
 * PDF Export Hook for SwiftFill
 *
 * Provides functionality to generate and download PDF documents
 * from form data using @react-pdf/renderer.
 *
 * Features:
 * - Async PDF generation with progress tracking
 * - Blob URL creation for download
 * - Memory cleanup
 * - Error handling
 */

import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { FL320PDFDocument, type FL320FormData } from './FL320PDFDocument';

export type ExportStatus = 'idle' | 'generating' | 'ready' | 'error';

export interface PDFExportState {
  status: ExportStatus;
  progress: number;
  error: string | null;
  blobUrl: string | null;
}

export interface PDFExportActions {
  generateFL320PDF: (formData: FL320FormData) => Promise<Blob>;
  downloadPDF: (blob: Blob, filename: string) => void;
  exportAndDownloadFL320: (formData: FL320FormData, filename?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for PDF generation and export
 */
export function usePDFExport(): [PDFExportState, PDFExportActions] {
  const [state, setState] = useState<PDFExportState>({
    status: 'idle',
    progress: 0,
    error: null,
    blobUrl: null,
  });

  /**
   * Generate PDF blob from FL-320 form data
   */
  const generateFL320PDF = useCallback(async (formData: FL320FormData): Promise<Blob> => {
    setState(prev => ({ ...prev, status: 'generating', progress: 10, error: null }));

    try {
      // Create PDF document element
      const document = FL320PDFDocument({ formData });
      setState(prev => ({ ...prev, progress: 30 }));

      // Generate PDF blob
      const blob = await pdf(document).toBlob();
      setState(prev => ({ ...prev, progress: 90 }));

      // Create blob URL for preview/download
      const blobUrl = URL.createObjectURL(blob);
      setState(prev => ({
        ...prev,
        status: 'ready',
        progress: 100,
        blobUrl,
      }));

      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
        progress: 0,
      }));
      throw error;
    }
  }, []);

  /**
   * Download a PDF blob
   */
  const downloadPDF = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Generate and immediately download FL-320 PDF
   */
  const exportAndDownloadFL320 = useCallback(async (
    formData: FL320FormData,
    filename: string = 'FL-320-Response.pdf'
  ) => {
    const blob = await generateFL320PDF(formData);
    downloadPDF(blob, filename);
  }, [generateFL320PDF, downloadPDF]);

  /**
   * Reset state and cleanup blob URLs
   */
  const reset = useCallback(() => {
    if (state.blobUrl) {
      URL.revokeObjectURL(state.blobUrl);
    }
    setState({
      status: 'idle',
      progress: 0,
      error: null,
      blobUrl: null,
    });
  }, [state.blobUrl]);

  return [
    state,
    {
      generateFL320PDF,
      downloadPDF,
      exportAndDownloadFL320,
      reset,
    },
  ];
}

export default usePDFExport;
