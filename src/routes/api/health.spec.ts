import { test, expect } from '@playwright/test';

test('GET /api/health', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual({ status: 'OK' });
});