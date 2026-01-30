import { defineEventHandler, handleCors, readBody, createError } from 'h3'

interface Message {
    role: 'system' | 'user' | 'assistant'
    content: string
}

interface DeepSeekRequest {
    messages: Message[]
    temperature?: number
    max_tokens?: number
}

interface DeepSeekResponse {
    choices: Array<{
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }>
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

/**
 * POST /api/deepseek
 * Proxy to DeepSeek Chat API for PEACE2074 virtual guide
 */
export default defineEventHandler(async (event) => {
    if (handleCors(event, {
        origin: ['https://peace2074.com', 'https://www.peace2074.com'],
        credentials: true,
        methods: ['POST', 'OPTIONS']
    })) {
        return
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'DeepSeek API not configured'
        })
    }

    try {
        const body: DeepSeekRequest = await readBody(event)

        if (!body.messages || !Array.isArray(body.messages)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid request: messages array required'
            })
        }

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: body.messages,
                temperature: body.temperature ?? 0.7,
                max_tokens: body.max_tokens ?? 500
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('DeepSeek API error:', response.status, errorText)
            throw createError({
                statusCode: response.status,
                statusMessage: `DeepSeek API error: ${response.statusText}`
            })
        }

        const data: DeepSeekResponse = await response.json()
        return data

    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }
        console.error('DeepSeek proxy error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to process DeepSeek request'
        })
    }
})
