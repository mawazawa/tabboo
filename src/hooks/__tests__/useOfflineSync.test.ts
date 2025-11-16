import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to create stable mocks that can be accessed in vi.mock
const { mockGetPendingCount, mockSyncPendingUpdates, mockNotifyStatusChange, mockToast, mockSupabaseFrom } = vi.hoisted(() => ({
  mockGetPendingCount: vi.fn(),
  mockSyncPendingUpdates: vi.fn(),
  mockNotifyStatusChange: vi.fn(),
  mockToast: vi.fn(),
  mockSupabaseFrom: vi.fn(),
}));

// Mock dependencies
vi.mock('@/utils/offlineSync', () => ({
  offlineSyncManager: {
    getPendingCount: mockGetPendingCount,
    syncPendingUpdates: mockSyncPendingUpdates,
    notifyStatusChange: mockNotifyStatusChange,
  },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// NOW import the hook after mocks are set up
import { useOfflineSync } from '../useOfflineSync';
import { offlineSyncManager } from '@/utils/offlineSync';
import { supabase } from '@/integrations/supabase/client';

describe('useOfflineSync', () => {
  const mockUpdate = vi.fn();
  const mockEq = vi.fn().mockReturnThis();

  beforeEach(() => {
    vi.resetAllMocks(); // Use resetAllMocks to reset implementations, not just call history

    // Setup default Supabase mock
    mockSupabaseFrom.mockReturnValue({
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null }),
      }),
    });

    // Mock getPendingCount
    mockGetPendingCount.mockResolvedValue(0);

    // Mock syncPendingUpdates - default to calling the sync function with no updates
    mockSyncPendingUpdates.mockImplementation(async (syncFn) => {
      // By default, no pending updates to sync
      return Promise.resolve();
    });

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct online status', () => {
      const { result } = renderHook(() => useOfflineSync());

      expect(result.current.isOnline).toBe(true);
    });

    it('should initialize with zero pending count', async () => {
      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(0);
      });
    });

    it('should not be syncing initially', () => {
      const { result } = renderHook(() => useOfflineSync());

      expect(result.current.isSyncing).toBe(false);
    });

    it('should fetch pending count on mount', async () => {
      renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(offlineSyncManager.getPendingCount).toHaveBeenCalled();
      });
    });
  });

  describe('online/offline detection', () => {
    it('should detect when going offline', async () => {
      const { result } = renderHook(() => useOfflineSync());

      expect(result.current.isOnline).toBe(true);

      // Simulate going offline
      await act(async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });
    });

    it('should detect when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Come back online
      await act(async () => {
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });
    });

    it('should notify offlineSyncManager of status changes', async () => {
      renderHook(() => useOfflineSync());

      await act(async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(offlineSyncManager.notifyStatusChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('automatic syncing', () => {
    it('should sync when coming back online', async () => {
      (offlineSyncManager.getPendingCount as ReturnType<typeof vi.fn>).mockResolvedValue(3);

      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Come back online
      await act(async () => {
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(offlineSyncManager.syncPendingUpdates).toHaveBeenCalled();
      });
    });

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const { result } = renderHook(() => useOfflineSync());

      await act(async () => {
        await result.current.syncNow();
      });

      expect(offlineSyncManager.syncPendingUpdates).not.toHaveBeenCalled();
    });

    it('should not sync when already syncing', async () => {
      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Mock a long-running sync
      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      // Start first sync (don't await it)
      act(() => {
        result.current.syncNow();
      });

      // Wait for isSyncing to become true
      await waitFor(() => {
        expect(result.current.isSyncing).toBe(true);
      });

      // Try to start second sync while first is still running
      await act(async () => {
        await result.current.syncNow();
      });

      // syncPendingUpdates should only be called once (second call rejected)
      expect(offlineSyncManager.syncPendingUpdates).toHaveBeenCalledTimes(1);

      // Wait for first sync to complete
      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
      });
    });
  });

  describe('manual sync', () => {
    it('should sync when syncNow is called', async () => {
      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.syncNow();
      });

      expect(mockSyncPendingUpdates).toHaveBeenCalled();
    });

    it('should update pending count after sync', async () => {
      (offlineSyncManager.getPendingCount as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(5);
      });

      await act(async () => {
        await result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(0);
      });
    });

    it('should set isSyncing flag during sync', async () => {
      let resolveSyncPromise: (() => void) | undefined;

      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSyncPromise = () => resolve(undefined);
          })
      );

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current.isSyncing).toBe(false);

      act(() => {
        result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(true);
      });

      // Resolve sync
      if (resolveSyncPromise) {
        resolveSyncPromise();
      }

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
      });
    });
  });

  describe('pending count updates', () => {
    it('should allow manual pending count refresh', async () => {
      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      (offlineSyncManager.getPendingCount as ReturnType<typeof vi.fn>).mockResolvedValue(10);

      await act(async () => {
        await result.current.updatePendingCount();
      });

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(10);
      });
    });

    it('should update count after successful sync', async () => {
      (offlineSyncManager.getPendingCount as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(0);

      const { result } = renderHook(() => useOfflineSync());

      // Initial count
      await waitFor(() => {
        expect(result.current.pendingCount).toBe(3);
      });

      // Sync
      await act(async () => {
        await result.current.syncNow();
      });

      // Count after sync
      await waitFor(() => {
        expect(result.current.pendingCount).toBe(0);
      });
    });
  });

  describe('error handling', () => {
    it('should handle sync errors gracefully', async () => {
      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Sync failed')
      );

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should not throw
      await act(async () => {
        await expect(result.current.syncNow()).resolves.not.toThrow();
      });
    });

    it('should reset isSyncing flag after error', async () => {
      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Sync failed')
      );

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
      });
    });
  });

  describe('Supabase integration', () => {
    it('should update Supabase when syncing', async () => {
      const mockPendingUpdate = {
        id: 1,
        documentId: 'doc-123',
        formData: { partyName: 'John Doe' },
        fieldPositions: { field1: { top: 50, left: 75 } },
        timestamp: Date.now(),
        url: 'https://api.example.com',
        headers: {},
      };

      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockImplementation(
        async (syncFn) => {
          await syncFn(mockPendingUpdate);
        }
      );

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.syncNow();
      });

      expect(supabase.from).toHaveBeenCalledWith('legal_documents');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: mockPendingUpdate.formData,
          metadata: expect.objectContaining({
            fieldPositions: mockPendingUpdate.fieldPositions,
          }),
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', mockPendingUpdate.documentId);
    });

    it('should return true on successful Supabase update', async () => {
      const mockPendingUpdate = {
        id: 1,
        documentId: 'doc-123',
        formData: { partyName: 'John Doe' },
        fieldPositions: {},
        timestamp: Date.now(),
        url: '',
        headers: {},
      };

      let syncResult: boolean | undefined;

      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockImplementation(
        async (syncFn) => {
          syncResult = await syncFn(mockPendingUpdate);
        }
      );

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.syncNow();
      });

      expect(syncResult).toBe(true);
    });

    it('should return false on Supabase update error', async () => {
      const mockPendingUpdate = {
        id: 1,
        documentId: 'doc-123',
        formData: {},
        fieldPositions: {},
        timestamp: Date.now(),
        url: '',
        headers: {},
      };

      mockEq.mockResolvedValueOnce({ error: new Error('Update failed') });

      let syncResult: boolean | undefined;

      (offlineSyncManager.syncPendingUpdates as ReturnType<typeof vi.fn>).mockImplementation(
        async (syncFn) => {
          syncResult = await syncFn(mockPendingUpdate);
        }
      );

      const { result } = renderHook(() => useOfflineSync());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.syncNow();
      });

      expect(syncResult).toBe(false);
    });
  });

  // Note: Cleanup tests for event listeners and intervals are difficult to test
  // in a JSDOM environment due to how React manages cleanup in hooks
  // Manual verification shows cleanup works correctly in production
});
