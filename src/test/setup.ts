import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

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
