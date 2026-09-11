import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, '../..'),
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
      'tests/design-system/component-catalog.test.mjs',
      'tests/design-system/component-adequation.contract.test.ts',
    ],
    exclude: ['node_modules', '.agents', '.next', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
    },
  },
});
