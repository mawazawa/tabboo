import { useState, useEffect, useCallback } from 'react';
import { offlineSyncManager } from '@/utils/offlineSync';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const updatePendingCount = useCallback(async () => {
    const count = await offlineSyncManager.getPendingCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      await offlineSyncManager.syncPendingUpdates(async (update) => {
        try {
          const { error } = await supabase
            .from('legal_documents')
            .update({
              content: update.formData,
              metadata: { fieldPositions: update.fieldPositions },
              updated_at: new Date().toISOString()
            })
            .eq('id', update.documentId);

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Sync error:', error);
          return false;
        }
      });

      await updatePendingCount();

      if (pendingCount > 0) {
        toast({
          title: "Sync complete",
          description: `${pendingCount} offline change${pendingCount > 1 ? 's' : ''} synced.`,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync failed",
        description: "Could not sync offline changes. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingCount, toast, updatePendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineSyncManager.notifyStatusChange(true);
      toast({
        title: "Back online",
        description: "Syncing your offline changes...",
      });
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      offlineSyncManager.notifyStatusChange(false);
      toast({
        title: "You're offline",
        description: "Changes will be saved locally and synced when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending count
    updatePendingCount();

    // Periodic sync check
    const syncInterval = setInterval(() => {
      if (isOnline && pendingCount > 0) {
        syncNow();
      }
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [isOnline, pendingCount, syncNow, toast, updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow,
    updatePendingCount,
  };
};
