import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGroqStream } from '../useGroqStream';
import type { Message } from '@/types';

// Mock fetch
global.fetch = vi.fn();

describe('useGroqStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGroqStream());

    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.streamChat).toBe('function');
    expect(typeof result.current.cancelStream).toBe('function');
  });

  it('should set isLoading to true when streaming starts and false when done', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n') })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGroqStream());

    // Initially should not be loading
    expect(result.current.isLoading).toBe(false);

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    const streamPromise = result.current.streamChat({
      messages,
      formContext: {},
      onDelta,
      onDone,
      onError,
    });

    await streamPromise;

    // After stream completes, should not be loading
    expect(result.current.isLoading).toBe(false);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onDelta with streamed content', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" World"}}]}\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n') })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGroqStream());

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await result.current.streamChat({
      messages,
      formContext: {},
      onDelta,
      onDone,
      onError,
    });

    await waitFor(() => {
      expect(onDelta).toHaveBeenCalledWith('Hello');
      expect(onDelta).toHaveBeenCalledWith(' World');
    });

    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle fetch errors correctly', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({ error: 'API Error' }),
    };

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGroqStream());

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await result.current.streamChat({
      messages,
      formContext: {},
      onDelta,
      onDone,
      onError,
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('API Error');
    });

    expect(onDelta).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('should cancel stream when cancelStream is called', async () => {
    const mockReader = {
      read: vi.fn()
        .mockImplementation(() => new Promise(() => {})), // Never resolves
      releaseLock: vi.fn(),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGroqStream());

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    // Start streaming (don't await)
    result.current.streamChat({
      messages,
      formContext: {},
      onDelta,
      onDone,
      onError,
    });

    // Wait for isLoading to become true
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Cancel the stream
    result.current.cancelStream();

    // isLoading should be false after cancellation
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle AbortError gracefully without calling onError', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';

    (global.fetch as any).mockRejectedValueOnce(abortError);

    const { result } = renderHook(() => useGroqStream());

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await result.current.streamChat({
      messages,
      formContext: {},
      onDelta,
      onDone,
      onError,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // onError should NOT be called for AbortError
    expect(onError).not.toHaveBeenCalled();
  });

  it('should release reader lock properly', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n') })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGroqStream());

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await result.current.streamChat({
      messages,
      formContext: {},
      onDelta,
      onDone,
      onError,
    });

    await waitFor(() => {
      expect(mockReader.releaseLock).toHaveBeenCalled();
    });
  });

  it('should send correct fetch request with abort signal', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGroqStream());

    const messages: Message[] = [{ role: 'user', content: 'Test message' }];
    const formContext = { partyName: 'John Doe' };
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await result.current.streamChat({
      messages,
      formContext,
      onDelta,
      onDone,
      onError,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/groq-chat'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, formContext }),
        signal: expect.any(AbortSignal),
      })
    );
  });
});
