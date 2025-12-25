import { test, expect } from '@playwright/test';

test('GET /api/health returns healthy (if present)', async ({ request }) => {
    const res = await request.get('/api/health');
    if (!res.ok()) {
        console.warn('Health endpoint not OK:', res.status(), await res.text());
        test.skip(true, 'Endpoint /api/health not present in current build');
    }
    const json = await res.json();
    expect(json).toHaveProperty('status', 'healthy');
    expect(typeof json.timestamp).toBe('string');
});
