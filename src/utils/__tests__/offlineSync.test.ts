import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { offlineSyncManager } from '../offlineSync';
import type { FormData, FieldPositions } from '@/types/FormData';

describe('offlineSync', () => {
  const mockFormData: FormData = {
    partyName: 'Test User',
    email: 'test@example.com',
  };

  const mockFieldPositions: FieldPositions = {
    field1: { top: 50, left: 75 },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Close any existing connections to the database
    // This prevents the deletion from being blocked
    if ((offlineSyncManager as any).db) {
      (offlineSyncManager as any).db.close();
      (offlineSyncManager as any).db = null;
    }

    // Give a moment for connections to fully close
    await new Promise(resolve => setTimeout(resolve, 10));

    // Clear IndexedDB between tests - delete the specific database
    // Database name must match the one in offlineSync.ts
    return new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase('FormDataSync');

      const timeout = setTimeout(() => {
        console.warn('Database deletion timed out, continuing anyway');
        resolve();
      }, 100); // Short timeout to prevent test hangs

      deleteRequest.onsuccess = () => {
        clearTimeout(timeout);
        resolve();
      };

      deleteRequest.onerror = () => {
        clearTimeout(timeout);
        console.warn('Database deletion failed:', deleteRequest.error);
        resolve(); // Resolve anyway to continue tests
      };

      deleteRequest.onblocked = () => {
        clearTimeout(timeout);
        console.warn('Database deletion blocked, continuing anyway');
        resolve();
      };
    });
  }, 2000); // Increase beforeEach timeout to 2000ms

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('OfflineSyncManager', () => {
    describe('init', () => {
      it('should initialize IndexedDB', async () => {
        await offlineSyncManager.init();

        // Verify database was created by checking if we can get pending count
        const count = await offlineSyncManager.getPendingCount();
        expect(count).toBe(0);
      });
    });

    describe('queueUpdate', () => {
      it('should queue an update', async () => {
        const update = {
          documentId: 'doc-123',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: 'https://api.example.com',
          headers: { 'Content-Type': 'application/json' },
        };

        await offlineSyncManager.queueUpdate(update);

        const count = await offlineSyncManager.getPendingCount();
        expect(count).toBe(1);
      });

      it('should add timestamp to update', async () => {
        const update = {
          documentId: 'doc-123',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: 'https://api.example.com',
          headers: {},
        };

        await offlineSyncManager.queueUpdate(update);

        const updates = await offlineSyncManager.getPendingUpdates();
        expect(updates).toHaveLength(1);
        expect(updates[0]).toHaveProperty('timestamp');
        expect(typeof updates[0].timestamp).toBe('number');
      });

      it('should queue multiple updates', async () => {
        const update1 = {
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: 'https://api.example.com',
          headers: {},
        };

        const update2 = {
          documentId: 'doc-2',
          formData: { ...mockFormData, partyName: 'User 2' },
          fieldPositions: mockFieldPositions,
          url: 'https://api.example.com',
          headers: {},
        };

        await offlineSyncManager.queueUpdate(update1);
        await offlineSyncManager.queueUpdate(update2);

        const count = await offlineSyncManager.getPendingCount();
        expect(count).toBe(2);
      });
    });

    describe('getPendingUpdates', () => {
      it('should retrieve pending updates', async () => {
        const update = {
          documentId: 'doc-123',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: 'https://api.example.com',
          headers: {},
        };

        await offlineSyncManager.queueUpdate(update);

        const updates = await offlineSyncManager.getPendingUpdates();
        expect(updates).toHaveLength(1);
        expect(updates[0].documentId).toBe('doc-123');
        expect(updates[0].formData).toEqual(mockFormData);
      });

      it('should return empty array when no updates', async () => {
        const updates = await offlineSyncManager.getPendingUpdates();
        expect(updates).toEqual([]);
      });
    });

    describe('removeUpdate', () => {
      it('should remove an update by id', async () => {
        const update = {
          documentId: 'doc-123',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: 'https://api.example.com',
          headers: {},
        };

        await offlineSyncManager.queueUpdate(update);

        const updates = await offlineSyncManager.getPendingUpdates();
        const updateId = updates[0].id;

        expect(updateId).toBeDefined();

        if (updateId) {
          await offlineSyncManager.removeUpdate(updateId);
        }

        const count = await offlineSyncManager.getPendingCount();
        expect(count).toBe(0);
      });
    });

    describe('getPendingCount', () => {
      it('should return count of pending updates', async () => {
        expect(await offlineSyncManager.getPendingCount()).toBe(0);

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        expect(await offlineSyncManager.getPendingCount()).toBe(1);

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-2',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        expect(await offlineSyncManager.getPendingCount()).toBe(2);
      });
    });

    describe('syncPendingUpdates', () => {
      it('should sync all pending updates', async () => {
        const syncFn = vi.fn().mockResolvedValue(true);

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-2',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        await offlineSyncManager.syncPendingUpdates(syncFn);

        expect(syncFn).toHaveBeenCalledTimes(2);
      });

      it('should remove successfully synced updates', async () => {
        const syncFn = vi.fn().mockResolvedValue(true);

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        await offlineSyncManager.syncPendingUpdates(syncFn);

        const count = await offlineSyncManager.getPendingCount();
        expect(count).toBe(0);
      });

      it('should not remove failed updates', async () => {
        const syncFn = vi.fn().mockResolvedValue(false);

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        await offlineSyncManager.syncPendingUpdates(syncFn);

        const count = await offlineSyncManager.getPendingCount();
        expect(count).toBe(1);
      });

      it('should prevent concurrent syncs', async () => {
        const syncFn = vi.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
        );

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        // Start first sync (don't await)
        const sync1 = offlineSyncManager.syncPendingUpdates(syncFn);

        // Try to start second sync immediately
        const sync2 = offlineSyncManager.syncPendingUpdates(syncFn);

        await Promise.all([sync1, sync2]);

        // Second sync should have returned immediately without calling syncFn again
        expect(syncFn).toHaveBeenCalledTimes(1);
      });

      it('should handle sync function errors', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const syncFn = vi.fn().mockRejectedValue(new Error('Sync failed'));

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        // Should not throw
        await expect(offlineSyncManager.syncPendingUpdates(syncFn)).resolves.not.toThrow();

        consoleErrorSpy.mockRestore();
      });

      it('should reset syncInProgress flag after completion', async () => {
        const syncFn = vi.fn().mockResolvedValue(true);

        await offlineSyncManager.queueUpdate({
          documentId: 'doc-1',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        await offlineSyncManager.syncPendingUpdates(syncFn);

        // Start another sync - should not be blocked
        await offlineSyncManager.queueUpdate({
          documentId: 'doc-2',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
          url: '',
          headers: {},
        });

        await expect(offlineSyncManager.syncPendingUpdates(syncFn)).resolves.not.toThrow();
      });
    });

    describe('onOnlineStatusChange', () => {
      it('should register callback for status changes', () => {
        const callback = vi.fn();

        const unsubscribe = offlineSyncManager.onOnlineStatusChange(callback);

        expect(typeof unsubscribe).toBe('function');
      });

      it('should unregister callback when unsubscribe is called', () => {
        const callback = vi.fn();

        const unsubscribe = offlineSyncManager.onOnlineStatusChange(callback);
        unsubscribe();

        // Callback should not be called after unsubscribe
        offlineSyncManager.notifyStatusChange(true);

        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('notifyStatusChange', () => {
      it('should notify all registered listeners', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        offlineSyncManager.onOnlineStatusChange(callback1);
        offlineSyncManager.onOnlineStatusChange(callback2);

        offlineSyncManager.notifyStatusChange(true);

        expect(callback1).toHaveBeenCalledWith(true);
        expect(callback2).toHaveBeenCalledWith(true);
      });

      it('should notify with correct online status', () => {
        const callback = vi.fn();

        offlineSyncManager.onOnlineStatusChange(callback);

        offlineSyncManager.notifyStatusChange(false);
        expect(callback).toHaveBeenCalledWith(false);

        offlineSyncManager.notifyStatusChange(true);
        expect(callback).toHaveBeenCalledWith(true);
      });

      it('should handle multiple notifications', () => {
        const callback = vi.fn();

        offlineSyncManager.onOnlineStatusChange(callback);

        offlineSyncManager.notifyStatusChange(true);
        offlineSyncManager.notifyStatusChange(false);
        offlineSyncManager.notifyStatusChange(true);

        expect(callback).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full queue-sync-remove cycle', async () => {
      const update = {
        documentId: 'doc-123',
        formData: mockFormData,
        fieldPositions: mockFieldPositions,
        url: 'https://api.example.com',
        headers: { 'Content-Type': 'application/json' },
      };

      // Queue an update
      await offlineSyncManager.queueUpdate(update);

      // Verify it's pending
      const countBefore = await offlineSyncManager.getPendingCount();
      expect(countBefore).toBe(1);

      // Sync with successful sync function
      const syncFn = vi.fn().mockResolvedValue(true);
      await offlineSyncManager.syncPendingUpdates(syncFn);

      // Verify it was removed
      const countAfter = await offlineSyncManager.getPendingCount();
      expect(countAfter).toBe(0);

      // Sync function should have been called
      expect(syncFn).toHaveBeenCalledTimes(1);
    });

    it('should handle offline-to-online transition', async () => {
      const callback = vi.fn();
      offlineSyncManager.onOnlineStatusChange(callback);

      // Simulate going offline
      offlineSyncManager.notifyStatusChange(false);
      expect(callback).toHaveBeenCalledWith(false);

      // Queue update while offline
      const update = {
        documentId: 'doc-123',
        formData: mockFormData,
        fieldPositions: mockFieldPositions,
        url: 'https://api.example.com',
        headers: {},
      };

      await offlineSyncManager.queueUpdate(update);

      // Simulate coming back online
      offlineSyncManager.notifyStatusChange(true);
      expect(callback).toHaveBeenCalledWith(true);

      // Verify update is still queued
      const count = await offlineSyncManager.getPendingCount();
      expect(count).toBe(1);
    });
  });
});
