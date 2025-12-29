import { defineEventHandler, handleCors, readBody } from 'h3'
import { authConfigError, generateOtp, isValidEmail } from '../../server/auth'

export default defineEventHandler(async (event) => {
    if (handleCors(event, { origin: '*' })) return

    const configErr = authConfigError()
    if (configErr) {
        event.node.res.statusCode = 503
        return { error: true, message: configErr }
    }

    const body = await readBody<{ email?: string }>(event)
    const email = (body?.email || '').trim().toLowerCase()

    if (!email || !isValidEmail(email)) {
        event.node.res.statusCode = 400
        return { error: true, message: 'Invalid email' }
    }

    const code = generateOtp(email)

    // TODO: integrate email provider. For now, we only expose the code in non-production
    // to allow local/manual delivery. In production, this will only log server-side.
    if (process.env.NODE_ENV !== 'production') {
        return { ok: true, devCode: code, ttlSeconds: 600 }
    }

    console.info(`[auth] OTP generated for ${email}`)
    return { ok: true, ttlSeconds: 600 }
})
