import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'threads',
    // PGlite/IndexedDB fixtures share a process-local runtime on Windows;
    // serial workers keep the full suite deterministic and avoid silent
    // worker termination when independent integration suites overlap.
    maxWorkers: 1,
    watch: false,
    testTimeout: 60_000,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.agents',
      '.next',
      'dist',
      'tests/browser/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
