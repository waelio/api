import { defineEventHandler, handleCors } from 'h3'
import { clearSessionCookie } from '../../server/auth'

const origin = ['https://peace2074.com', 'https://www.peace2074.com']

export default defineEventHandler((event) => {
    if (handleCors(event, { origin, methods: ['POST', 'OPTIONS'], credentials: true })) return

    clearSessionCookie(event)
    return { ok: true }
})
