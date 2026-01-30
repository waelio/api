import { defineEventHandler, handleCors } from 'h3'

/**
 * OPTIONS /api/deepseek - CORS preflight for auth-protected DeepSeek chat
 */
export default defineEventHandler((event) => {
    handleCors(event, {
        origin: ['https://peace2074.com', 'https://www.peace2074.com'],
        credentials: true,
        methods: ['POST', 'OPTIONS']
    })
})
