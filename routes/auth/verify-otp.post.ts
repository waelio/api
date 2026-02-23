import { defineEventHandler, handleCors, readBody } from 'h3'
import { authConfigError, isValidEmail, setSessionCookie, verifyOtp } from '../../server/auth'
import { connectDB } from '../../server/db'
import User from '../../models/user'

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

    const body = await readBody<{ email?: string; code?: string; rememberMe?: boolean }>(event)
    const email = (body?.email || '').trim().toLowerCase()
    const code = (body?.code || '').trim()
    const rememberMe = body?.rememberMe ?? false

    if (!email || !isValidEmail(email)) {
        event.node.res.statusCode = 400
        return { error: true, message: 'Invalid email' }
    }

    if (!verifyOtp(email, code)) {
        event.node.res.statusCode = 400
        return { error: true, message: 'Invalid or expired code' }
    }

    // Create or update user in database
    try {
        await connectDB()

        let user = await User.findOne({ email })
        if (!user) {
            // Create new user with email as username initially
            const username = email.split('@')[0] + '_' + Date.now().toString(36)
            user = await User.create({
                email,
                username,
                password: 'OTP_AUTH', // Placeholder for OTP-based auth
                verified: true,
            })
        }

        setSessionCookie(event, { email }, rememberMe)

        return {
            ok: true,
            user: {
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
        }
    } catch (dbError) {
        console.error('Database error during login:', dbError)
        // Still allow login even if DB fails (fallback to session-only)
        setSessionCookie(event, { email }, rememberMe)
        return { ok: true, user: { email } }
    }
})
