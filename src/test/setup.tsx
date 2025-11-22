import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';
import "fake-indexeddb/auto";

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Polyfill Promise.withResolvers for PDF.js
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function <T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    DEV: true,
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  }
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock react-pdf global
vi.mock('react-pdf', async () => {
  const original = await vi.importActual('react-pdf');
  return {
    ...original,
    pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: '',
      },
      version: '4.0.1',
    },
    Document: ({ children, onLoadSuccess, onLoadError }: any) => {
        // Simulate async loading
        React.useEffect(() => {
            if (onLoadSuccess) {
                onLoadSuccess({ numPages: 3 });
            }
        }, [onLoadSuccess]);
        return <div>{children}</div>;
    },
    Page: () => <div data-testid="pdf-page">PDF Page</div>,
  };
});

// Mock fetch for PDF files
global.fetch = vi.fn().mockImplementation((url) => {
  if (typeof url === 'string' && url.endsWith('.pdf')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob(['%PDF-1.7 dummy content'], { type: 'application/pdf' })),
    });
  }
  return Promise.resolve({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    blob: () => Promise.resolve(new Blob([])),
  });
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost:3000/dummy-blob');
global.URL.revokeObjectURL = vi.fn();
