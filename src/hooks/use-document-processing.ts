/**
 * useDocumentProcessing Hook
 *
 * Handles document upload, OCR extraction, and job polling.
 * Manages timer cleanup and polling lifecycle.
 *
 * Single Responsibility: Document processing logic
 */

import { useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type DocumentType, type StructuredDocumentData } from '@/lib/mistral-ocr-client';

interface UploadedDocument {
  id: string;
  file: File;
  type: DocumentType;
  status: 'uploading' | 'extracting' | 'completed' | 'failed';
  progress: number;
  extractedData?: StructuredDocumentData;
  error?: string;
  preview?: string;
}

interface UseDocumentProcessingProps {
  onExtractionComplete?: (data: StructuredDocumentData) => void;
  updateDocument: (id: string, updates: Partial<UploadedDocument>) => void;
}

export const useDocumentProcessing = ({
  onExtractionComplete,
  updateDocument,
}: UseDocumentProcessingProps) => {
  // Track active polling timers for cleanup
  const activeTimersRef = useRef<Map<string, { interval: NodeJS.Timeout; timeout: NodeJS.Timeout }>>(new Map());

  // Cleanup all active timers on unmount
  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach(({ interval, timeout }) => {
        clearInterval(interval);
        clearTimeout(timeout);
      });
      activeTimersRef.current.clear();
    };
  }, []);

  // Cleanup helper function
  const cleanupTimers = (docId: string) => {
    const timers = activeTimersRef.current.get(docId);
    if (timers) {
      clearInterval(timers.interval);
      clearTimeout(timers.timeout);
      activeTimersRef.current.delete(docId);
    }
  };

  // Process individual document using secure upload edge function
  const processDocument = async (doc: UploadedDocument) => {
    try {
      // Update status to uploading
      updateDocument(doc.id, { status: 'uploading', progress: 10 });

      // ====================================================================
      // 1. Upload to secure edge function
      // ====================================================================

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required. Please sign in.');
      }

      const formData = new FormData();
      formData.append('file', doc.file);

      const uploadResponse = await fetch(
        `${supabase.supabaseUrl}/functions/v1/upload-document-secure`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const jobId = uploadData.jobId;

      // Check if cached result (instant completion)
      if (uploadData.fromCache && uploadData.extractedData) {
        updateDocument(doc.id, {
          status: 'completed',
          progress: 100,
          extractedData: uploadData.extractedData,
          type: (uploadData.extractedData.documentType || 'unknown') as DocumentType
        });

        toast.success(`Extracted from cache: ${doc.file.name}`, {
          description: 'Previously uploaded document found'
        });
        onExtractionComplete?.(uploadData.extractedData);
        return;
      }

      // ====================================================================
      // 2. Poll for job completion
      // ====================================================================

      updateDocument(doc.id, { status: 'extracting', progress: 25 });

      const pollInterval = setInterval(async () => {
        try {
          const { data: job, error: jobError } = await supabase
            .from('extraction_queue')
            .select('*')
            .eq('id', jobId)
            .single();

          if (jobError) {
            cleanupTimers(doc.id);
            throw jobError;
          }

          // Update progress based on status
          if (job.status === 'processing') {
            updateDocument(doc.id, { progress: 50 });
          }

          // Job completed successfully
          if (job.status === 'completed') {
            cleanupTimers(doc.id);

            updateDocument(doc.id, {
              status: 'completed',
              progress: 100,
              extractedData: job.extracted_data,
              type: (job.extracted_data?.documentType || 'unknown') as DocumentType
            });

            toast.success(`Extracted ${job.extracted_data?.fieldsCount || 0} fields from ${doc.file.name}`, {
              description: `Confidence: ${Math.round((job.confidence_score || 0) * 100)}%`
            });
            onExtractionComplete?.(job.extracted_data);
          }

          // Job failed
          if (job.status === 'failed') {
            cleanupTimers(doc.id);

            updateDocument(doc.id, {
              status: 'failed',
              progress: 0,
              error: job.error_message || 'Extraction failed'
            });

            toast.error(`Failed to extract from ${doc.file.name}`, {
              description: job.error_message
            });
          }
        } catch (pollError) {
          cleanupTimers(doc.id);
          console.error('Job polling error:', pollError);

          updateDocument(doc.id, {
            status: 'failed',
            progress: 0,
            error: pollError instanceof Error ? pollError.message : 'Polling failed'
          });

          toast.error(`Failed to check extraction status`);
        }
      }, 2000); // Poll every 2 seconds

      // Timeout after 2 minutes
      const pollTimeout = setTimeout(() => {
        cleanupTimers(doc.id);

        // Update document status to failed with timeout error
        updateDocument(doc.id, {
          status: 'failed',
          progress: 0,
          error: 'Extraction timed out after 2 minutes'
        });

        toast.error(`Extraction timed out for ${doc.file.name}`, {
          description: 'Please try uploading again or contact support'
        });
      }, 120000);

      // Store timer IDs for cleanup
      activeTimersRef.current.set(doc.id, { interval: pollInterval, timeout: pollTimeout });

    } catch (error) {
      console.error('Document processing error:', error);
      updateDocument(doc.id, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      toast.error(`Failed to upload ${doc.file.name}`, {
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  return {
    processDocument,
    cleanupTimers,
  };
};
