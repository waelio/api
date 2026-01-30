import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 30_000,
    retries: 0,
    use: {
        baseURL: 'http://localhost:3001',
    },
    webServer: {
        command: 'pnpm dev:api',
        url: 'http://localhost:3001',
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
