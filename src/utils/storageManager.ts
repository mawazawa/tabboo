/**
 * Generic localStorage management utility
 * Provides type-safe storage operations with error handling
 * Eliminates duplicate localStorage JSON operations across the codebase
 */

export interface StorageOptions {
  /** Suppress error logging for failed operations */
  silent?: boolean;
  /** Default value to return if get operation fails */
  defaultValue?: unknown;
}

/**
 * Type-safe localStorage manager
 */
export class StorageManager<T = unknown> {
  constructor(private key: string) {}

  /**
   * Save data to localStorage
   * @param value - Data to store
   * @param options - Storage options
   * @returns true if successful, false otherwise
   */
  set(value: T, options: StorageOptions = {}): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.key, serialized);
      return true;
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to save to localStorage (${this.key}):`, error);
      }
      return false;
    }
  }

  /**
   * Retrieve data from localStorage
   * @param options - Storage options
   * @returns Parsed data or null/defaultValue if not found
   */
  get(options: StorageOptions = {}): T | null {
    try {
      const item = localStorage.getItem(this.key);
      if (item === null) {
        return (options.defaultValue as T) ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to read from localStorage (${this.key}):`, error);
      }
      return (options.defaultValue as T) ?? null;
    }
  }

  /**
   * Remove item from localStorage
   * @param options - Storage options
   * @returns true if successful, false otherwise
   */
  remove(options: StorageOptions = {}): boolean {
    try {
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to remove from localStorage (${this.key}):`, error);
      }
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   * @returns true if key exists, false otherwise
   */
  exists(): boolean {
    return localStorage.getItem(this.key) !== null;
  }

  /**
   * Update stored data using a callback function
   * @param updater - Function that receives current value and returns new value
   * @param options - Storage options
   * @returns true if successful, false otherwise
   */
  update(updater: (current: T | null) => T, options: StorageOptions = {}): boolean {
    try {
      const current = this.get(options);
      const updated = updater(current);
      return this.set(updated, options);
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to update localStorage (${this.key}):`, error);
      }
      return false;
    }
  }
}

/**
 * Helper function to create a typed storage manager
 */
export function createStorage<T>(key: string): StorageManager<T> {
  return new StorageManager<T>(key);
}

/**
 * Simple storage operations (functional API)
 */
export const storage = {
  /**
   * Save data to localStorage
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to save to localStorage (${key}):`, error);
      }
      return false;
    }
  },

  /**
   * Retrieve data from localStorage
   */
  get<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return (options.defaultValue as T) ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to read from localStorage (${key}):`, error);
      }
      return (options.defaultValue as T) ?? null;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: string, options: StorageOptions = {}): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      if (!options.silent) {
        console.error(`Failed to remove from localStorage (${key}):`, error);
      }
      return false;
    }
  },

  /**
   * Check if key exists
   */
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Clear all localStorage
   */
  clear(options: StorageOptions = {}): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      if (!options.silent) {
        console.error('Failed to clear localStorage:', error);
      }
      return false;
    }
  },

  /**
   * Get available storage space (estimate in bytes)
   */
  getAvailableSpace(): number {
    try {
      const testKey = '__storage_test__';
      const testValue = '0'.repeat(1024); // 1KB
      let size = 0;

      // Try to fill storage to estimate available space
      while (size < 10 * 1024 * 1024) { // Max 10MB
        try {
          localStorage.setItem(testKey + size, testValue);
          size += 1024;
        } catch {
          // Clean up test data
          for (let i = 0; i < size; i += 1024) {
            localStorage.removeItem(testKey + i);
          }
          return size;
        }
      }

      return size;
    } catch {
      return 0;
    }
  },

  /**
   * Check if there's enough space for data
   */
  hasSpace(requiredBytes: number): boolean {
    const available = this.getAvailableSpace();
    return available >= requiredBytes;
  }
};

export default storage;
