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
 */
export const useFormAutoSave = ({
  documentId,
  formData,
  fieldPositions,
  enabled = true,
  debounceMs = 2000,
}: AutoSaveOptions) => {
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<{ formData: FormData; fieldPositions: FieldPositions }>();

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
    if (!documentId || !hasUnsavedChanges || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      // Validate data before saving
      const formDataValidation = formDataSchema.safeParse(formData);
      const fieldPositionsValidation = fieldPositionsSchema.safeParse(fieldPositions);

      if (!formDataValidation.success) {
        console.error('Form data validation failed:', formDataValidation.error);
        toast({
          title: "Validation error",
          description: "Form data contains invalid values. Please check your inputs.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      if (!fieldPositionsValidation.success) {
        console.error('Field positions validation failed:', fieldPositionsValidation.error);
        toast({
          title: "Validation error",
          description: "Field positions are invalid. Please reset field positions.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Check if online
      if (!navigator.onLine) {
        // Queue for offline sync
        await offlineSyncManager.queueUpdate({
          documentId,
          formData: formDataValidation.data,
          fieldPositions: fieldPositionsValidation.data,
          url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/legal_documents?id=eq.${documentId}`,
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        });

        lastSaveRef.current = { formData: formDataValidation.data, fieldPositions: fieldPositionsValidation.data };
        setHasUnsavedChanges(false);

        console.log('Saved offline - will sync when online');
        return;
      }

      const { error } = await supabase
        .from('legal_documents')
        .update({
          content: formDataValidation.data,
          metadata: { fieldPositions: fieldPositionsValidation.data },
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Update last save reference
      lastSaveRef.current = { formData: formDataValidation.data, fieldPositions: fieldPositionsValidation.data };
      setHasUnsavedChanges(false);

      console.log('Auto-save successful');
    } catch (error) {
      console.error('Auto-save failed:', error);

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
        return;
      }

      toast({
        title: "Auto-save failed",
        description: "Your changes could not be saved. Please try again.",
        variant: "destructive",
      });

      // Retry after 5 seconds
      setTimeout(() => {
        setIsSaving(false);
        performSave();
      }, 5000);
      return;
    } finally {
      setIsSaving(false);
    }
  }, [documentId, formData, fieldPositions, toast, hasUnsavedChanges, isSaving]);

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

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges && documentId) {
        // Fire-and-forget save on unmount
        performSave();
      }
    };
  }, [documentId, performSave, hasUnsavedChanges]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!documentId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await performSave();

    toast({
      title: "Saved",
      description: "Your changes have been saved.",
    });
  }, [documentId, performSave, toast]);

  return {
    saveNow,
    hasUnsavedChanges,
    isSaving,
  };
};
