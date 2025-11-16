import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineSyncManager } from '@/utils/offlineSync';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const isSyncingRef = useRef(false);
  const isOnlineRef = useRef(navigator.onLine);
  const pendingCountRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    pendingCountRef.current = pendingCount;
  }, [pendingCount]);

  const updatePendingCount = useCallback(async () => {
    const count = await offlineSyncManager.getPendingCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    // Check navigator.onLine directly to avoid race conditions with state updates
    if (!navigator.onLine || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const countBefore = await offlineSyncManager.getPendingCount();

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
          // Sync error occurred - return false to retry
          return false;
        }
      });

      await updatePendingCount();

      if (countBefore > 0) {
        toast({
          title: "Sync complete",
          description: `${countBefore} offline change${countBefore > 1 ? 's' : ''} synced.`,
        });
      }
    } catch (error) {
      // Sync failed - notify user
      toast({
        title: "Sync failed",
        description: "Could not sync offline changes. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [toast, updatePendingCount]);

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

    // Periodic sync check - use refs to avoid re-creating interval
    const syncInterval = setInterval(() => {
      if (isOnlineRef.current && pendingCountRef.current > 0) {
        syncNow();
      }
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
    // Only run once on mount - refs keep values updated
  }, [syncNow, toast, updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow,
    updatePendingCount,
  };
};
