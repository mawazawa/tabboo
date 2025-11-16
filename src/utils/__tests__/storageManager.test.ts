import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager, createStorage, storage } from '../storageManager';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Class-based API', () => {
    describe('set', () => {
      it('should store data correctly', () => {
        const manager = new StorageManager<string>('test-key');
        const result = manager.set('test-value');

        expect(result).toBe(true);
        expect(localStorage.getItem('test-key')).toBe('"test-value"');
      });

      it('should store objects correctly', () => {
        const manager = new StorageManager<{ name: string; age: number }>('test-obj');
        const data = { name: 'John', age: 30 };
        const result = manager.set(data);

        expect(result).toBe(true);
        expect(JSON.parse(localStorage.getItem('test-obj')!)).toEqual(data);
      });

      it('should store arrays correctly', () => {
        const manager = new StorageManager<number[]>('test-array');
        const data = [1, 2, 3, 4, 5];
        const result = manager.set(data);

        expect(result).toBe(true);
        expect(JSON.parse(localStorage.getItem('test-array')!)).toEqual(data);
      });

      it('should handle JSON serialization errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<unknown>('test-key');

        // Create circular reference
        const circular: { self?: unknown } = {};
        circular.self = circular;

        const result = manager.set(circular);

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should respect silent option', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<unknown>('test-key');

        // Create circular reference
        const circular: { self?: unknown } = {};
        circular.self = circular;

        const result = manager.set(circular, { silent: true });

        expect(result).toBe(false);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });
    });

    describe('get', () => {
      it('should retrieve stored data correctly', () => {
        const manager = new StorageManager<string>('test-key');
        manager.set('test-value');

        const result = manager.get();
        expect(result).toBe('test-value');
      });

      it('should return null when key not found', () => {
        const manager = new StorageManager<string>('non-existent');
        const result = manager.get();

        expect(result).toBe(null);
      });

      it('should return default value when key not found', () => {
        const manager = new StorageManager<string>('non-existent');
        const result = manager.get({ defaultValue: 'default' });

        expect(result).toBe('default');
      });

      it('should parse objects correctly', () => {
        const manager = new StorageManager<{ name: string }>('test-obj');
        const data = { name: 'Alice' };
        manager.set(data);

        const result = manager.get();
        expect(result).toEqual(data);
      });

      it('should handle JSON parse errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<unknown>('test-key');

        // Store invalid JSON
        localStorage.setItem('test-key', '{invalid json}');

        const result = manager.get();

        expect(result).toBe(null);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should return default value on parse error', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<string>('test-key');

        // Store invalid JSON
        localStorage.setItem('test-key', '{invalid json}');

        const result = manager.get({ defaultValue: 'fallback' });

        expect(result).toBe('fallback');

        consoleErrorSpy.mockRestore();
      });

      it('should respect silent option on errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<unknown>('test-key');

        localStorage.setItem('test-key', '{invalid json}');

        const result = manager.get({ silent: true });

        expect(result).toBe(null);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });
    });

    describe('remove', () => {
      it('should remove item correctly', () => {
        const manager = new StorageManager<string>('test-key');
        manager.set('test-value');

        expect(localStorage.getItem('test-key')).not.toBe(null);

        const result = manager.remove();

        expect(result).toBe(true);
        expect(localStorage.getItem('test-key')).toBe(null);
      });

      it('should return true even if key does not exist', () => {
        const manager = new StorageManager<string>('non-existent');
        const result = manager.remove();

        expect(result).toBe(true);
      });
    });

    describe('exists', () => {
      it('should return true when key exists', () => {
        const manager = new StorageManager<string>('test-key');
        manager.set('test-value');

        expect(manager.exists()).toBe(true);
      });

      it('should return false when key does not exist', () => {
        const manager = new StorageManager<string>('non-existent');

        expect(manager.exists()).toBe(false);
      });

      it('should return false after removing key', () => {
        const manager = new StorageManager<string>('test-key');
        manager.set('test-value');
        manager.remove();

        expect(manager.exists()).toBe(false);
      });
    });

    describe('update', () => {
      it('should update existing value', () => {
        const manager = new StorageManager<number>('counter');
        manager.set(5);

        const result = manager.update((current) => (current ?? 0) + 1);

        expect(result).toBe(true);
        expect(manager.get()).toBe(6);
      });

      it('should handle null current value', () => {
        const manager = new StorageManager<number>('counter');

        const result = manager.update((current) => (current ?? 0) + 1);

        expect(result).toBe(true);
        expect(manager.get()).toBe(1);
      });

      it('should work with objects', () => {
        const manager = new StorageManager<{ count: number }>('state');
        manager.set({ count: 10 });

        const result = manager.update((current) => ({
          count: (current?.count ?? 0) + 5,
        }));

        expect(result).toBe(true);
        expect(manager.get()).toEqual({ count: 15 });
      });

      it('should handle updater errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<number>('test');

        const result = manager.update(() => {
          throw new Error('Update failed');
        });

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should respect silent option', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const manager = new StorageManager<number>('test');

        const result = manager.update(() => {
          throw new Error('Update failed');
        }, { silent: true });

        expect(result).toBe(false);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('createStorage helper', () => {
    it('should create a typed storage manager', () => {
      const manager = createStorage<string>('test-key');

      expect(manager).toBeInstanceOf(StorageManager);
      manager.set('test');
      expect(manager.get()).toBe('test');
    });
  });

  describe('Functional API (storage object)', () => {
    describe('set', () => {
      it('should store data correctly', () => {
        const result = storage.set('key', 'value');

        expect(result).toBe(true);
        expect(localStorage.getItem('key')).toBe('"value"');
      });

      it('should handle errors silently when silent option is true', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Create circular reference
        const circular: { self?: unknown } = {};
        circular.self = circular;

        const result = storage.set('key', circular, { silent: true });

        expect(result).toBe(false);
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });
    });

    describe('get', () => {
      it('should retrieve stored data', () => {
        storage.set('key', 'value');
        const result = storage.get<string>('key');

        expect(result).toBe('value');
      });

      it('should return default value when key not found', () => {
        const result = storage.get<string>('non-existent', { defaultValue: 'default' });

        expect(result).toBe('default');
      });

      it('should return null when key not found and no default', () => {
        const result = storage.get<string>('non-existent');

        expect(result).toBe(null);
      });
    });

    describe('remove', () => {
      it('should remove item correctly', () => {
        storage.set('key', 'value');
        const result = storage.remove('key');

        expect(result).toBe(true);
        expect(storage.exists('key')).toBe(false);
      });
    });

    describe('exists', () => {
      it('should detect existing keys', () => {
        storage.set('key', 'value');

        expect(storage.exists('key')).toBe(true);
        expect(storage.exists('non-existent')).toBe(false);
      });
    });

    describe('clear', () => {
      it('should clear all localStorage', () => {
        storage.set('key1', 'value1');
        storage.set('key2', 'value2');

        const result = storage.clear();

        expect(result).toBe(true);
        expect(storage.exists('key1')).toBe(false);
        expect(storage.exists('key2')).toBe(false);
      });
    });

    describe('getAvailableSpace', () => {
      it('should return a number', () => {
        const space = storage.getAvailableSpace();

        expect(typeof space).toBe('number');
        expect(space).toBeGreaterThanOrEqual(0);
      });

      it('should clean up test data after checking', () => {
        const keysBefore = Object.keys(localStorage).length;
        storage.getAvailableSpace();
        const keysAfter = Object.keys(localStorage).length;

        // Should not leave test keys behind
        expect(keysAfter).toBe(keysBefore);
      });
    });

    describe('hasSpace', () => {
      it('should return boolean', () => {
        const result = storage.hasSpace(1024);

        expect(typeof result).toBe('boolean');
      });

      it('should return true for small amounts', () => {
        // Most browsers have at least 5MB storage
        const result = storage.hasSpace(1024); // 1KB

        expect(result).toBe(true);
      });
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety with TypeScript', () => {
      interface User {
        name: string;
        age: number;
      }

      const userStorage = createStorage<User>('user');
      const user: User = { name: 'John', age: 30 };

      userStorage.set(user);
      const retrieved = userStorage.get();

      if (retrieved) {
        expect(retrieved.name).toBe('John');
        expect(retrieved.age).toBe(30);
      }
    });
  });
});
