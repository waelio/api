import { test, expect } from '@playwright/test'

test.describe('/api/deepseek', () => {
    test('should require messages array', async ({ request }) => {
        const response = await request.post('/api/deepseek', {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://peace2074.com'
            },
            data: {}
        })

        expect(response.status()).toBe(400)
    })

    // Skipped: only relevant when DEEPSEEK_API_KEY is not set (not typical for dev/CI)
    test.skip('should return 500 if DEEPSEEK_API_KEY not configured', async ({ request }) => {
        const response = await request.post('/api/deepseek', {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://peace2074.com'
            },
            data: {
                messages: [
                    { role: 'user', content: 'Hello' }
                ]
            }
        })

        expect(response.status()).toBe(500)
    })

    test('should accept valid messages and return chat completion', async ({ request }) => {
        if (!process.env.DEEPSEEK_API_KEY) {
            console.warn('Skipping: DEEPSEEK_API_KEY not configured')
            return
        }

        const response = await request.post('/api/deepseek', {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://peace2074.com'
            },
            data: {
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: 'Say "test successful" if you can read this.'
                    }
                ],
                max_tokens: 50
            }
        })

        expect(response.ok()).toBeTruthy()
        const data = await response.json()

        expect(data).toHaveProperty('choices')
        expect(Array.isArray(data.choices)).toBeTruthy()
        expect(data.choices.length).toBeGreaterThan(0)
        expect(data.choices[0]).toHaveProperty('message')
        expect(data.choices[0].message).toHaveProperty('content')
    })
})
