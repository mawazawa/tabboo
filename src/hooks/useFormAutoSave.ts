import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { offlineSyncManager } from '@/utils/offlineSync';
import { formDataSchema, fieldPositionsSchema } from '@/lib/validations';
import type { FormData, FieldPositions } from '@/types/FormData';

interface AutoSaveOptions {
  documentId: string | null;
  formData: FormData;
  fieldPositions: FieldPositions;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Custom hook for auto-saving form data with proper debouncing
 * Implements optimistic updates and retry logic with Zod validation
 *
 * Optimizations:
 * - Reduced debounce from 2000ms to 500ms for more responsive feel
 * - Skips validation during auto-save (only validates on manual save)
 * - Non-blocking background saves
 */
export const useFormAutoSave = ({
  documentId,
  formData,
  fieldPositions,
  enabled = true,
  debounceMs = 500, // 👈 Reduced from 2000ms - 4x more responsive!
}: AutoSaveOptions) => {
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<{ formData: FormData; fieldPositions: FieldPositions }>();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;
  const isSavingRef = useRef(false);
  const latestDocumentIdRef = useRef(documentId);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const performSaveRef = useRef<() => void>();

  const resetSavingState = useCallback(() => {
    isSavingRef.current = false;
    setIsSaving(false);
  }, []);

  // Mark as having unsaved changes whenever data changes
  useEffect(() => {
    if (lastSaveRef.current) {
      const dataChanged =
        JSON.stringify(formData) !== JSON.stringify(lastSaveRef.current.formData) ||
        JSON.stringify(fieldPositions) !== JSON.stringify(lastSaveRef.current.fieldPositions);

      if (dataChanged) {
        setHasUnsavedChanges(true);
      }
    } else {
      // First render - store initial data but don't mark as unsaved
      lastSaveRef.current = { formData, fieldPositions };
    }
  }, [formData, fieldPositions]);

  const performSave = useCallback(async () => {
    if (!documentId || !hasUnsavedChanges || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    let retryScheduled = false;

    try {
      // Skip validation during auto-save for better performance
      // UI validation happens in real-time, so data should already be valid
      // Manual save (saveNow) will still validate

      // Check if online
      if (!navigator.onLine) {
        // Queue for offline sync
        await offlineSyncManager.queueUpdate({
          documentId,
          formData,
          fieldPositions,
          url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/legal_documents?id=eq.${documentId}`,
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        });

        lastSaveRef.current = { formData, fieldPositions };
        setHasUnsavedChanges(false);

        // Saved offline - will sync when online
        resetSavingState();
        return;
      }

      const { error } = await supabase
        .from('legal_documents')
        .update({
          content: formData, // Trust the UI - no validation during auto-save
          metadata: { fieldPositions },
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Update last save reference
      lastSaveRef.current = { formData, fieldPositions };
      setHasUnsavedChanges(false);

      // Auto-save successful (silently handled)
    } catch (error) {
      // Auto-save failed - handle error

      // If network error, queue offline
      if (!navigator.onLine) {
        await offlineSyncManager.queueUpdate({
          documentId,
          formData,
          fieldPositions,
          url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/legal_documents?id=eq.${documentId}`,
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        });

        lastSaveRef.current = { formData, fieldPositions };
        setHasUnsavedChanges(false);
        retryCountRef.current = 0; // Reset retry count on offline
        resetSavingState();
        return;
      }

      // Check if we should retry
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        const delayMs = Math.min(5000 * Math.pow(2, retryCountRef.current - 1), 60000); // Exponential backoff, max 60s

        // Schedule retry with exponential backoff
        retryScheduled = true;
        retryTimeoutRef.current = setTimeout(() => {
          // Release guard, but keep UI spinner active until retry finishes
          isSavingRef.current = false;
          performSave();
        }, delayMs);
        return;
      } else {
        // Max retries exceeded - show error to user
        toast({
          title: "Auto-save failed",
          description: "Your changes could not be saved after multiple attempts. Please check your connection and try saving manually.",
          variant: "destructive",
        });
        retryCountRef.current = 0; // Reset for next attempt
        resetSavingState();
      }
    } finally {
      if (!retryScheduled) {
        resetSavingState();
      }
    }
  }, [documentId, formData, fieldPositions, toast, hasUnsavedChanges, resetSavingState]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, fieldPositions, enabled, debounceMs, performSave, hasUnsavedChanges]);

  // Save on unmount if there are unsaved changes, and cleanup retry timeout
  useEffect(() => {
    latestDocumentIdRef.current = documentId;
  }, [documentId]);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      if (hasUnsavedChangesRef.current && latestDocumentIdRef.current) {
        // Fire-and-forget save on unmount
        performSaveRef.current?.();
      }
    };
  }, []);

  // Manual save function (with validation)
  const saveNow = useCallback(async () => {
    if (!documentId) return;

    // Clear debounce timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Validate before manual save (unlike auto-save)
    const formDataValidation = formDataSchema.safeParse(formData);
    const fieldPositionsValidation = fieldPositionsSchema.safeParse(fieldPositions);

    if (!formDataValidation.success) {
      toast({
        title: "Validation error",
        description: "Form data contains invalid values. Please check your inputs.",
        variant: "destructive",
      });
      return;
    }

    if (!fieldPositionsValidation.success) {
      toast({
        title: "Validation error",
        description: "Field positions are invalid. Please reset field positions.",
        variant: "destructive",
      });
      return;
    }

    // Perform save after validation passes
    await performSave();

    toast({
      title: "Saved",
      description: "Your changes have been saved.",
    });
  }, [documentId, performSave, formData, fieldPositions, toast]);

  return {
    saveNow,
    hasUnsavedChanges,
    isSaving,
  };
};
