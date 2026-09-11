import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const featureDirectory = __dirname;
const projectRoot = path.resolve(featureDirectory, '../..');
const port = Number(process.env.COMPONENT_ADEQUATION_PORT ?? 3217);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  timeout: 120_000,
  expect: { timeout: 120_000 },
  testDir: path.resolve(projectRoot, 'tests/browser'),
  testMatch: 'component-adequation.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: 'list',
  outputDir: path.resolve(featureDirectory, 'evidence/browser/test-results'),
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 120_000,
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    cwd: projectRoot,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
