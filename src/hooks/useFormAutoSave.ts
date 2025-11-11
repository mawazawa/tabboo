import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { offlineSyncManager } from '@/utils/offlineSync';

interface AutoSaveOptions {
  documentId: string | null;
  formData: any;
  fieldPositions: Record<string, { top: number; left: number }>;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Custom hook for auto-saving form data with proper debouncing
 * Implements optimistic updates and retry logic
 */
export const useFormAutoSave = ({
  documentId,
  formData,
  fieldPositions,
  enabled = true,
  debounceMs = 2000,
}: AutoSaveOptions) => {
  const { toast } = useToast();
  const hasUnsavedChanges = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<{ formData: any; fieldPositions: any }>();
  const isSavingRef = useRef(false);

  // Mark as having unsaved changes whenever data changes
  useEffect(() => {
    if (lastSaveRef.current) {
      const dataChanged = 
        JSON.stringify(formData) !== JSON.stringify(lastSaveRef.current.formData) ||
        JSON.stringify(fieldPositions) !== JSON.stringify(lastSaveRef.current.fieldPositions);
      
      if (dataChanged) {
        hasUnsavedChanges.current = true;
      }
    }
  }, [formData, fieldPositions]);

  const performSave = useCallback(async () => {
    if (!documentId || !hasUnsavedChanges.current || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;

    try {
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
        hasUnsavedChanges.current = false;
        
        console.log('Saved offline - will sync when online');
        return;
      }

      const { error } = await supabase
        .from('legal_documents' as any)
        .update({
          content: formData,
          metadata: { fieldPositions },
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', documentId);

      if (error) throw error;

      // Update last save reference
      lastSaveRef.current = { formData, fieldPositions };
      hasUnsavedChanges.current = false;
      
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
        hasUnsavedChanges.current = false;
        return;
      }
      
      toast({
        title: "Auto-save failed",
        description: "Your changes could not be saved. Please try again.",
        variant: "destructive",
      });
      
      // Retry after 5 seconds
      setTimeout(() => {
        isSavingRef.current = false;
        performSave();
      }, 5000);
      return;
    } finally {
      isSavingRef.current = false;
    }
  }, [documentId, formData, fieldPositions, toast]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges.current) return;

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
  }, [formData, fieldPositions, enabled, debounceMs, performSave]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges.current && documentId) {
        // Fire-and-forget save on unmount
        performSave();
      }
    };
  }, [documentId, performSave]);

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
    hasUnsavedChanges: hasUnsavedChanges.current,
    isSaving: isSavingRef.current,
  };
};
