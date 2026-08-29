import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'threads',
    maxWorkers: 4,
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
      'tests/design-system/component-catalog.test.mjs',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
