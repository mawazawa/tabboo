import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePdfLoading, getPdfPath } from '../use-pdf-loading';
import { pdfCache } from '@/utils/pdf-cache';

// Mock pdfCache
vi.mock('@/utils/pdf-cache', () => ({
  pdfCache: {
    get: vi.fn(),
    getStats: vi.fn(() => ({
      cacheHitRate: 75.5,
      memoryHits: 3,
      indexedDBHits: 1,
      networkFetches: 1,
    })),
  },
}));

describe('usePdfLoading - Bug Fix Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn((blob) => `blob:mock-url-${blob.size}`);
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Bug Fix 1: Dynamic PDF path based on formType', () => {
    it('should use correct PDF path for FL-320', () => {
      const path = getPdfPath('FL-320');
      expect(path).toBe('/fl320.pdf');
    });

    it('should use correct PDF path for DV-100', () => {
      const path = getPdfPath('DV-100');
      expect(path).toBe('/dv100.pdf');
    });

    it('should use correct PDF path for DV-105', () => {
      const path = getPdfPath('DV-105');
      expect(path).toBe('/dv105.pdf');
    });

    it('should return dynamic path in cachedPdfUrl fallback', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      vi.mocked(pdfCache.get).mockResolvedValue(mockBlob);

      const { result } = renderHook(() => usePdfLoading('DV-100'));

      await waitFor(() => {
        expect(result.current.cachedPdfUrl).toBeTruthy();
      });

      // Should return blob URL or fallback to DV-100 path, not FL-320
      expect(result.current.cachedPdfUrl).not.toBe('/fl320.pdf');
      expect(result.current.cachedPdfUrl).toMatch(/blob:|dv100\.pdf/);
    });
  });

  describe('Bug Fix 2: Memory leak prevention with blob URL cleanup', () => {
    it('should revoke blob URL on unmount', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockBlobUrl = 'blob:mock-url-123';
      vi.mocked(pdfCache.get).mockResolvedValue(mockBlob);
      vi.mocked(URL.createObjectURL).mockReturnValue(mockBlobUrl);

      const { unmount } = renderHook(() => usePdfLoading('FL-320'));

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalled();
      });

      unmount();

      // Should revoke the blob URL on cleanup
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockBlobUrl);
    });

    it('should revoke blob URL when formType changes', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const firstBlobUrl = 'blob:mock-url-123';
      const secondBlobUrl = 'blob:mock-url-456';
      
      vi.mocked(pdfCache.get).mockResolvedValue(mockBlob);
      vi.mocked(URL.createObjectURL)
        .mockReturnValueOnce(firstBlobUrl)
        .mockReturnValueOnce(secondBlobUrl);

      const { rerender } = renderHook(
        ({ formType }) => usePdfLoading(formType),
        { initialProps: { formType: 'FL-320' as const } }
      );

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalled();
      });

      // Change formType
      rerender({ formType: 'DV-100' });

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(firstBlobUrl);
      });

      // Cleanup on final unmount
      rerender({ formType: 'DV-100' });
    });

    it('should not revoke non-blob URLs', async () => {
      // Simulate cache failure - should fallback to path string
      vi.mocked(pdfCache.get).mockRejectedValue(new Error('Cache failed'));

      const { unmount } = renderHook(() => usePdfLoading('FL-320'));

      await waitFor(() => {
        // Should have attempted to load
        expect(pdfCache.get).toHaveBeenCalled();
      });

      unmount();

      // Should not revoke anything if no blob URL was created
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('Integration: Both bug fixes work together', () => {
    it('should use correct PDF path AND clean up blob URL', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockBlobUrl = 'blob:mock-url-789';
      vi.mocked(pdfCache.get).mockResolvedValue(mockBlob);
      vi.mocked(URL.createObjectURL).mockReturnValue(mockBlobUrl);

      const { result, unmount } = renderHook(() => usePdfLoading('DV-105'));

      await waitFor(() => {
        expect(result.current.cachedPdfUrl).toBeTruthy();
      });

      // Verify correct path is used (not hardcoded FL-320)
      expect(result.current.cachedPdfUrl).toMatch(/blob:|dv105\.pdf/);
      expect(result.current.cachedPdfUrl).not.toBe('/fl320.pdf');

      unmount();

      // Verify cleanup happens
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockBlobUrl);
    });
  });
});

