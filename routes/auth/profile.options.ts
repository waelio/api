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

/**
 * OPTIONS /auth/profile - CORS preflight for profile updates
 */
export default defineEventHandler((event) => {
    handleCors(event, {
        origin,
        methods: ['PUT', 'OPTIONS'],
        credentials: true,
        allowHeaders: ['content-type'],
    })
})
