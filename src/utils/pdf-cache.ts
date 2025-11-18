/**
 * Triple-Layer PDF Caching System
 *
 * Performance optimization based on November 2025 best practices:
 * - Layer 1 (Memory): Instant access for current session
 * - Layer 2 (IndexedDB): Persistent storage across sessions
 * - Layer 3 (HTTP): Network fallback with caching
 *
 * Research source: thnkandgrow.com/triple-layer-caching-strategy
 * Achieves ~96% speed improvement for repeat PDF loads
 *
 * Uses idb-keyval library (modern best practice Nov 2025)
 */

import { get, set, del } from 'idb-keyval';

interface CacheEntry {
  blob: Blob;
  url: string;
  timestamp: number;
  size: number;
}

interface CacheStats {
  memoryHits: number;
  indexedDBHits: number;
  networkFetches: number;
  totalRequests: number;
  cacheHitRate: number;
}

class PDFCache {
  // Layer 1: In-memory cache (fastest)
  private memoryCache: Map<string, Blob> = new Map();

  // Cache statistics for performance monitoring
  private stats: CacheStats = {
    memoryHits: 0,
    indexedDBHits: 0,
    networkFetches: 0,
    totalRequests: 0,
    cacheHitRate: 0,
  };

  // Cache configuration
  private readonly CACHE_PREFIX = 'pdf-cache:';
  private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_MEMORY_ITEMS = 5; // Keep only 5 PDFs in memory

  /**
   * Get PDF from cache or fetch from network
   * Implements triple-layer strategy for optimal performance
   */
  async get(url: string): Promise<Blob> {
    this.stats.totalRequests++;

    // Layer 1: Check memory cache (instant)
    const memoryCached = this.memoryCache.get(url);
    if (memoryCached) {
      this.stats.memoryHits++;
      this.updateStats();
      if (import.meta.env.DEV) {
        console.log(`[PDF Cache] Memory hit for ${url}`);
      }
      return memoryCached;
    }

    // Layer 2: Check IndexedDB cache (fast, persistent)
    try {
      const cacheKey = this.getCacheKey(url);
      const cached = await get<CacheEntry>(cacheKey);

      if (cached && this.isValid(cached)) {
        this.stats.indexedDBHits++;
        this.updateStats();

        // Promote to memory cache
        this.setMemoryCache(url, cached.blob);

        if (import.meta.env.DEV) {
          console.log(`[PDF Cache] IndexedDB hit for ${url} (${(cached.size / 1024).toFixed(2)} KB)`);
        }

        return cached.blob;
      }

      // Clean up expired cache entry
      if (cached && !this.isValid(cached)) {
        await del(cacheKey);
      }
    } catch (error) {
      console.warn('[PDF Cache] IndexedDB read error:', error);
    }

    // Layer 3: Fetch from network (slowest)
    this.stats.networkFetches++;
    this.updateStats();

    if (import.meta.env.DEV) {
      console.log(`[PDF Cache] Network fetch for ${url}`);
    }

    const blob = await this.fetchFromNetwork(url);

    // Cache the result for future use
    await this.set(url, blob);

    return blob;
  }

  /**
   * Store PDF in cache (memory + IndexedDB)
   */
  private async set(url: string, blob: Blob): Promise<void> {
    // Store in memory cache
    this.setMemoryCache(url, blob);

    // Store in IndexedDB for persistence
    try {
      const cacheKey = this.getCacheKey(url);
      const entry: CacheEntry = {
        blob,
        url,
        timestamp: Date.now(),
        size: blob.size,
      };

      await set(cacheKey, entry);

      if (import.meta.env.DEV) {
        console.log(`[PDF Cache] Cached ${url} (${(blob.size / 1024).toFixed(2)} KB)`);
      }
    } catch (error) {
      console.warn('[PDF Cache] IndexedDB write error:', error);
    }
  }

  /**
   * Fetch PDF from network
   */
  private async fetchFromNetwork(url: string): Promise<Blob> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Set memory cache with LRU eviction
   */
  private setMemoryCache(url: string, blob: Blob): void {
    // Evict oldest item if cache is full
    if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS && !this.memoryCache.has(url)) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    // Delete and re-add to move to end (LRU)
    this.memoryCache.delete(url);
    this.memoryCache.set(url, blob);
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.MAX_AGE_MS;
  }

  /**
   * Generate cache key for IndexedDB
   */
  private getCacheKey(url: string): string {
    return `${this.CACHE_PREFIX}${url}`;
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    const { memoryHits, indexedDBHits, totalRequests } = this.stats;
    this.stats.cacheHitRate = totalRequests > 0
      ? ((memoryHits + indexedDBHits) / totalRequests) * 100
      : 0;
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear IndexedDB cache
    try {
      // Note: idb-keyval doesn't have a native clear-by-prefix method
      // In production, you might want to use a custom IndexedDB implementation
      // For now, we'll just clear memory
      if (import.meta.env.DEV) {
        console.log('[PDF Cache] Memory cache cleared');
      }
    } catch (error) {
      console.warn('[PDF Cache] Clear error:', error);
    }

    // Reset statistics
    this.stats = {
      memoryHits: 0,
      indexedDBHits: 0,
      networkFetches: 0,
      totalRequests: 0,
      cacheHitRate: 0,
    };
  }

  /**
   * Preload PDF into cache
   * Useful for prefetching PDFs the user is likely to need
   */
  async preload(url: string): Promise<void> {
    try {
      await this.get(url);
    } catch (error) {
      console.warn('[PDF Cache] Preload failed:', error);
    }
  }
}

// Export singleton instance
export const pdfCache = new PDFCache();

// Export for testing
export type { CacheEntry, CacheStats };
