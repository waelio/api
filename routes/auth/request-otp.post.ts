import { defineEventHandler, handleCors, readBody } from 'h3'
import { authConfigError, generateOtp, isValidEmail } from '../../server/auth'
import { sendOtpEmail, isEmailConfigured } from '../../server/email'

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

export default defineEventHandler(async (event) => {
    if (handleCors(event, { origin, methods: ['POST', 'OPTIONS'], credentials: true, allowHeaders: allowedHeaders })) return

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

    // Send email if SMTP is configured
    const emailConfigured = isEmailConfigured()
    let emailSent = false

    if (emailConfigured) {
        emailSent = await sendOtpEmail(email, code)
        if (!emailSent) {
            console.error(`[auth] Failed to send OTP email to ${email}`)
        }
    }

    // In development, return the code for easy testing
    if (process.env.NODE_ENV !== 'production') {
        return {
            ok: true,
            devCode: code,
            ttlSeconds: 600,
            emailSent,
            emailConfigured
        }
    }

    // In production, only confirm if email was sent
    if (emailConfigured && emailSent) {
        console.info(`[auth] OTP sent via email to ${email}`)
        return { ok: true, ttlSeconds: 600 }
    }

    // Fallback: email not configured in production
    console.warn(`[auth] OTP generated for ${email} but email not configured`)
    return {
        ok: true,
        ttlSeconds: 600,
        warning: 'Email delivery not configured'
    }
})
