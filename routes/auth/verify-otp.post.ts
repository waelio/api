import { defineEventHandler, readBody } from 'h3'
import { authConfigError, isValidEmail, setSessionCookie, verifyOtp } from '../../server/auth'

export default defineEventHandler(async (event) => {
    const configErr = authConfigError()
    if (configErr) {
        event.node.res.statusCode = 503
        return { error: true, message: configErr }
    }

    const body = await readBody<{ email?: string; code?: string }>(event)
    const email = (body?.email || '').trim().toLowerCase()
    const code = (body?.code || '').trim()

    if (!email || !isValidEmail(email)) {
        event.node.res.statusCode = 400
        return { error: true, message: 'Invalid email' }
    }

    if (!verifyOtp(email, code)) {
        event.node.res.statusCode = 400
        return { error: true, message: 'Invalid or expired code' }
    }

    setSessionCookie(event, { email })

    return { ok: true, user: { email } }
})
