import { defineEventHandler, handleCors } from 'h3'

const origin = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://peace2074.com',
    'https://www.peace2074.com',
    'https://peace2074.netlify.app',
    'https://waelio.com',
    'https://www.waelio.com',
    'https://waelio.netlify.app',
]
const allowedHeaders = ['content-type']

/**
 * OPTIONS /api/deepseek - CORS preflight for auth-protected DeepSeek chat
 */
export default defineEventHandler((event) => {
    if (handleCors(event, { origin, methods: ['OPTIONS', 'POST'], credentials: true, allowHeaders: allowedHeaders })) return
    event.node.res.statusCode = 204
})
