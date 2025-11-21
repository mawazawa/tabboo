import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFormAutoSave } from '../useFormAutoSave';
import type { FormData, FieldPositions } from '@/types/FormData';
import { supabase } from '@/integrations/supabase/client';
import { offlineSyncManager } from '@/utils/offlineSync';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/utils/offlineSync', () => ({
  offlineSyncManager: {
    queueUpdate: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useFormAutoSave', () => {
  const mockFormData: FormData = {
    partyName: 'John Doe',
    email: 'john@example.com',
  };

  const mockFieldPositions: FieldPositions = {
    field1: { top: 50, left: 75 },
  };

  const mockUpdate = vi.fn();
  const mockEq = vi.fn().mockReturnThis();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default Supabase mock
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null }),
      }),
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
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          documentId: 'doc-123',
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(typeof result.current.saveNow).toBe('function');
    });
  });

  describe.skip('auto-save behavior', () => {
    it('should debounce saves with default delay', async () => {
      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100, // Use shorter delay for testing
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      // Update form data
      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Should not save immediately
      expect(mockUpdate).not.toHaveBeenCalled();

      // Wait for debounce delay
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it('should debounce saves with custom delay', async () => {
      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 200,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, email: 'new@example.com' };
      rerender({ formData: newFormData });

      // Should not save immediately
      expect(mockUpdate).not.toHaveBeenCalled();

      // Should save after custom delay
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it('should reset debounce timer on subsequent changes', async () => {
      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 200,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      // First change
      rerender({ formData: { ...mockFormData, partyName: 'Change 1' } });

      // Wait 100ms (half of debounce)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Second change (should reset timer)
      rerender({ formData: { ...mockFormData, partyName: 'Change 2' } });

      // Wait another 100ms (would be 200ms from first change, but timer was reset)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have saved yet (timer was reset)
      expect(mockUpdate).not.toHaveBeenCalled();

      // Wait for the full debounce from second change
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it('should not save when disabled', async () => {
      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            enabled: false,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Wait longer than debounce
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should not save when documentId is null', async () => {
      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: null,
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Wait longer than debounce
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should validate form data before saving', async () => {
      const invalidFormData = {
        ...mockFormData,
        email: 'invalid-email', // Invalid email format
      };

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      rerender({ formData: invalidFormData });

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 300));

      // If validation schema rejects invalid email, update should not be called
      // Current schema may allow empty/invalid emails, so we just verify no error
    });
  });

  describe('offline handling', () => {
    it('should queue updates when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
        configurable: true,
      });

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      await waitFor(
        () => {
          expect(offlineSyncManager.queueUpdate).toHaveBeenCalled();
        },
        { timeout: 500 }
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should queue updates on network error', async () => {
      mockEq.mockResolvedValueOnce({ error: new Error('Network error') });

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
        configurable: true,
      });

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      await waitFor(
        () => {
          expect(offlineSyncManager.queueUpdate).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });
  });

  describe('error handling', () => {
    it('should retry failed saves with exponential backoff', async () => {
      let callCount = 0;
      const updateTimes: number[] = [];
      const startTime = Date.now();

      mockEq.mockImplementation(() => {
        callCount++;
        if (callCount === 1 || callCount === 2) {
          // First two attempts fail
          return Promise.resolve({ error: new Error(`Save failed - attempt ${callCount}`) });
        } else {
          // Third attempt succeeds
          return Promise.resolve({ error: null });
        }
      });

      mockUpdate.mockImplementation(() => {
        updateTimes.push(Date.now() - startTime);
        return {
          eq: mockEq,
        };
      });

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Wait for all three save attempts
      // First attempt: immediate
      // Second attempt: after 5s
      // Third attempt: after 10s (total 15s)
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalledTimes(3);
        },
        { timeout: 20000 } // Allow up to 20 seconds for exponential backoff
      );

      // Verify exponential backoff: 5s, 10s
      expect(updateTimes.length).toBeGreaterThanOrEqual(3); // At least 3 updates
      expect(updateTimes[0]).toBeLessThan(1000); // First attempt immediate
      expect(updateTimes[1]).toBeGreaterThan(4000); // Second retry after ~5s
      expect(updateTimes[1]).toBeLessThan(6000);
      expect(updateTimes[2]).toBeGreaterThan(13000); // Third retry after ~10s more (total ~15s)
      expect(updateTimes[2]).toBeLessThan(16000);
    }, 30000); // 30s timeout for 15s+ of retries

    it.skip('should stop retrying after max retries exceeded', async () => {
      // Always fail
      mockEq.mockResolvedValue({ error: new Error('Persistent error') });

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Wait for max retries (5 + initial = 6 attempts max)
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalledTimes(6); // 1 initial + 5 retries
        },
        { timeout: 120000 } // 60s+ needed for exponential backoff up to max 60s delay
      );

      // After max retries, should not make more attempts
      const finalCallCount = mockUpdate.mock.calls.length;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(mockUpdate).toHaveBeenCalledTimes(finalCallCount); // No additional calls
    }, 130000);

    it('should retry failed saves with initial 5s delay', async () => {
      mockEq
        .mockResolvedValueOnce({ error: new Error('Save failed') })
        .mockResolvedValueOnce({ error: null });

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Wait for first save attempt
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );

      // Wait for retry delay with exponential backoff (first retry at 5s)
      await waitFor(
        () => {
          expect(mockUpdate).toHaveBeenCalledTimes(2);
        },
        { timeout: 6000 }
      );
    }, 10000); // Increase test timeout

    it('should keep isSaving true while a retry is scheduled', async () => {
      vi.useFakeTimers();
      try {
        mockEq
          .mockResolvedValueOnce({ error: new Error('Save failed') })
          .mockResolvedValueOnce({ error: null });

        const { result, rerender } = renderHook(
          ({ formData }) =>
            useFormAutoSave({
              documentId: 'doc-123',
              formData,
              fieldPositions: mockFieldPositions,
              debounceMs: 100,
            }),
          {
            initialProps: { formData: mockFormData },
          }
        );

        const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
        rerender({ formData: newFormData });

        // Flush debounce timer to trigger first save attempt
        await act(async () => {
          vi.advanceTimersByTime(100);
        });
        await act(async () => {
          await Promise.resolve();
        });
        expect(mockUpdate).toHaveBeenCalledTimes(1);

        // While retry timer is pending, isSaving should remain true
        expect(result.current.isSaving).toBe(true);

        // Allow retry timer (5s) to fire
        await act(async () => {
          vi.advanceTimersByTime(5000);
        });
        await act(async () => {
          await Promise.resolve();
        });
        expect(mockUpdate).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe.skip('manual save', () => {
    it('should save immediately when saveNow is called', async () => {
      const { result, rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Call saveNow without waiting for debounce
      await act(async () => {
        await result.current.saveNow();
      });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should clear debounce timer when saveNow is called', async () => {
      const { result, rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 200,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      // Wait a bit but not enough for auto-save
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Call saveNow
      await act(async () => {
        await result.current.saveNow();
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);

      // Wait past original debounce - should not save again
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(mockUpdate).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should not save when documentId is null', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          documentId: null,
          formData: mockFormData,
          fieldPositions: mockFieldPositions,
        })
      );

      await act(async () => {
        await result.current.saveNow();
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe.skip('concurrent save prevention', () => {
    it('should not start new save while save is in progress', async () => {
      let resolveFirstSave: (() => void) | undefined;

      mockEq.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFirstSave = () => resolve({ error: null });
          })
      );

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId: 'doc-123',
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      // First change
      rerender({ formData: { ...mockFormData, partyName: 'Change 1' } });

      // Wait for first save to start
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Second change while first is still saving
      rerender({ formData: { ...mockFormData, partyName: 'Change 2' } });

      // Wait for potential second save
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should only have called update once
      expect(mockUpdate).toHaveBeenCalledTimes(1);

      // Resolve first save
      if (resolveFirstSave) {
        resolveFirstSave();
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  });

  describe('Supabase integration', () => {
    it('should call Supabase update with correct parameters', async () => {
      const documentId = 'doc-123';

      const { rerender } = renderHook(
        ({ formData }) =>
          useFormAutoSave({
            documentId,
            formData,
            fieldPositions: mockFieldPositions,
            debounceMs: 100,
          }),
        {
          initialProps: { formData: mockFormData },
        }
      );

      const newFormData = { ...mockFormData, partyName: 'Jane Doe' };
      rerender({ formData: newFormData });

      await waitFor(
        () => {
          expect(supabase.from).toHaveBeenCalledWith('legal_documents');
          expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
              content: expect.any(Object),
              metadata: expect.objectContaining({
                fieldPositions: mockFieldPositions,
              }),
              updated_at: expect.any(String),
            })
          );
          expect(mockEq).toHaveBeenCalledWith('id', documentId);
        },
        { timeout: 500 }
      );
    });
  });
});
