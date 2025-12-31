import { defineEventHandler, handleCors } from 'h3'
import { clearSessionCookie } from '../../server/auth'

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

export default defineEventHandler((event) => {
    if (handleCors(event, { origin, methods: ['POST', 'OPTIONS'], credentials: true, allowHeaders: allowedHeaders })) return

    clearSessionCookie(event)
    return { ok: true }
})
