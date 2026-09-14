import { defineConfig, devices } from '@playwright/test';

const playwrightPort = Number(process.env.PLAYWRIGHT_PORT ?? '3100');
if (!Number.isInteger(playwrightPort) || playwrightPort < 1024 || playwrightPort > 65_535) {
  throw new Error('PLAYWRIGHT_PORT must be an integer between 1024 and 65535');
}

const playwrightBaseUrl = `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
  timeout: 120_000,
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: { baseURL: playwrightBaseUrl, trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${playwrightPort}`,
    url: playwrightBaseUrl,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
