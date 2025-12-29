import { defineEventHandler, handleCors } from 'h3'
import { clearSessionCookie } from '../../server/auth'

export default defineEventHandler((event) => {
    if (handleCors(event, { origin: '*' })) return

    clearSessionCookie(event)
    return { ok: true }
})
