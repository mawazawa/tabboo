/**
 * Offline sync manager for form data
 * Handles queuing updates when offline and syncing when back online
 */

const DB_NAME = 'FormDataSync';
const STORE_NAME = 'pendingUpdates';
const DB_VERSION = 1;

interface PendingUpdate {
  id?: number;
  documentId: string;
  formData: any;
  fieldPositions: any;
  timestamp: number;
  url: string;
  headers: Record<string, string>;
}

class OfflineSyncManager {
  private db: IDBDatabase | null = null;
  private syncInProgress = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async queueUpdate(update: Omit<PendingUpdate, 'id' | 'timestamp'>) {
    if (!this.db) await this.init();

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const updateWithTimestamp: Omit<PendingUpdate, 'id'> = {
        ...update,
        timestamp: Date.now(),
      };

      const request = store.add(updateWithTimestamp);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUpdates(): Promise<PendingUpdate[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeUpdate(id: number) {
    if (!this.db) await this.init();

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async syncPendingUpdates(syncFn: (update: PendingUpdate) => Promise<boolean>) {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;

    try {
      const pendingUpdates = await this.getPendingUpdates();

      for (const update of pendingUpdates) {
        try {
          const success = await syncFn(update);
          if (success && update.id) {
            await this.removeUpdate(update.id);
          }
        } catch (error) {
          console.error('Failed to sync update:', error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async getPendingCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  onOnlineStatusChange(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyStatusChange(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }
}

export const offlineSyncManager = new OfflineSyncManager();
