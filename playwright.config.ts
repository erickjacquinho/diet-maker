import { defineConfig, devices } from '@playwright/test';

const playwrightPort = Number(process.env.PLAYWRIGHT_PORT ?? '3100');
const playwrightHost = process.env.PLAYWRIGHT_HOST ?? '127.0.0.1';
const browserChannel = process.env.PLAYWRIGHT_BROWSER === 'edge' ? 'msedge' : undefined;
if (!Number.isInteger(playwrightPort) || playwrightPort < 1024 || playwrightPort > 65_535) {
  throw new Error('PLAYWRIGHT_PORT must be an integer between 1024 and 65535');
}

const playwrightBaseUrl = `http://${playwrightHost}:${playwrightPort}`;

export default defineConfig({
  timeout: 120_000,
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  // Auth and authorization responses contain transient key material; never persist traces.
  use: { baseURL: playwrightBaseUrl, trace: 'off', ...devices['Desktop Chrome'], ...(browserChannel ? { channel: browserChannel } : {}) },
  webServer: {
    command: `npm run dev -- --hostname ${playwrightHost} --port ${playwrightPort}`,
    url: playwrightBaseUrl,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
    timeout: 60_000,
  },
});
