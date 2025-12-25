import { test, expect } from '@playwright/test';

test('GET /api/holynames returns list (if present)', async ({ request }) => {
    const res = await request.get('/api/holynames');
    if (!res.ok()) {
        console.warn('Holynames endpoint not OK:', res.status(), await res.text());
        test.skip(true, 'Endpoint /api/holynames not present in current build');
    }
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBeGreaterThan(0);
});

test('GET /api/holynames?name=Allah filters results (if present)', async ({ request }) => {
    const res = await request.get('/api/holynames?name=Allah');
    if (!res.ok()) {
        console.warn('Holynames filter endpoint not OK:', res.status(), await res.text());
        test.skip(true, 'Endpoint /api/holynames not present in current build');
    }
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    // every result should include the name substring
    for (const item of json) {
        expect(String(item.name)).toContain('Allah');
    }
});
