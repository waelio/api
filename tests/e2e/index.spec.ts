import { test, expect } from '@playwright/test';

test('GET / serves homepage (HTML)', async ({ request }) => {
    const res = await request.get('/');
    expect(res.ok()).toBeTruthy();
    const ct = res.headers()['content-type'] || '';
    expect(ct).toContain('text/html');
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
});
