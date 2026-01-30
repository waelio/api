import { test, expect } from '@playwright/test'

test.describe('/api/deepseek', () => {
    test('should require messages array', async ({ request }) => {
        const response = await request.post('http://localhost:4000/api/deepseek', {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://peace2074.com'
            },
            data: {}
        })

        expect(response.status()).toBe(400)
    })

    test('should return 500 if DEEPSEEK_API_KEY not configured', async ({ request }) => {
        // Only run this test if DEEPSEEK_API_KEY is NOT set
        if (process.env.DEEPSEEK_API_KEY) {
            test.skip()
        }

        const response = await request.post('http://localhost:4000/api/deepseek', {
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
        // Only run this test if DEEPSEEK_API_KEY is set
        if (!process.env.DEEPSEEK_API_KEY) {
            test.skip()
        }

        const response = await request.post('http://localhost:4000/api/deepseek', {
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
