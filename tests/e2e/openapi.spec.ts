import { test, expect } from '@playwright/test';

test('GET /api/_openapi returns OpenAPI JSON (if present)', async ({ request }) => {
    const res = await request.get('/api/_openapi');
    if (!res.ok()) {
        console.warn('OpenAPI endpoint not OK:', res.status(), await res.text());
        test.skip(true, 'OpenAPI endpoint not present in current build');
    }
    const json = await res.json();
    expect(json).toHaveProperty('openapi');
    expect(typeof json.openapi).toBe('string');
});
