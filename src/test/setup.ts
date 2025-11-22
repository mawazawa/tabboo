import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';
import "fake-indexeddb/auto";

// Cleanup after each test
afterEach(() => {
  cleanup();
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
import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock react-pdf globally
vi.mock('react-pdf', async () => {
  return {
    pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: '',
      },
    },
    Document: ({ children, onLoadSuccess }: any) => {
      React.useEffect(() => {
        // Simulate successful load
        onLoadSuccess?.({ numPages: 1 });
      }, [onLoadSuccess]);
      return React.createElement('div', { 'data-testid': 'pdf-document' }, children);
    },
    Page: ({ pageNumber }: any) => React.createElement('div', { 'data-testid': `pdf-page-${pageNumber}` }, `Page ${pageNumber}`),
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();
