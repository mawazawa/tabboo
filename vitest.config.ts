import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.tsx',
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.e2e.test.ts',
      '**/*.e2e.test.tsx',
      '**/tests/**', // Exclude Playwright tests directory
      '**/smoke.test.ts', // Exclude Playwright smoke tests
      '**/workflows.test.ts', // Exclude Playwright workflow tests
      '**/src/__tests__/**', // Exclude Playwright E2E tests directory
      '**/tests/visual-regression/**', // Exclude Playwright visual regression tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types/**',
        'src/main.tsx',
        'src/App.tsx',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
