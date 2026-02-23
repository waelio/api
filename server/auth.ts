import { createHmac } from 'node:crypto'
import { getCookie, setCookie, deleteCookie, type H3Event } from 'h3'

export interface SessionUser {
    email: string
}

const SESSION_COOKIE = 'waelio_session'
const SESSION_SHORT_HOURS = 24 // 1 day when not remembered
const SESSION_LONG_DAYS = 30 // 30 days when remembered
const OTP_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const COOKIE_DOMAIN = (process.env.AUTH_COOKIE_DOMAIN || '').trim() || undefined

const now = () => Date.now()

const hasAuthConfig = () => {
    const secret = process.env.AUTH_SECRET
    return Boolean(secret)
}

const requireAuthSecret = () => {
    const secret = process.env.AUTH_SECRET
    if (!secret) {
        throw new Error('Auth not configured: missing AUTH_SECRET')
    }
    return secret
}

const sign = (value: string) => {
    const secret = requireAuthSecret()
    return createHmac('sha256', secret).update(value).digest('base64url')
}

export const generateOtp = (email: string, at = now()): string => {
    const secret = requireAuthSecret()
    const window = Math.floor(at / OTP_WINDOW_MS)
    // TOTP-style dynamic truncation for a 6-digit code
    const hmac = createHmac('sha1', secret).update(`${email}:${window}`).digest()
    const offset = hmac[hmac.length - 1] & 0xf
    const binCode =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
    const code = (binCode % 1_000_000).toString().padStart(6, '0')
    return code
}

export const verifyOtp = (email: string, code: string, at = now()): boolean => {
    const trimmed = (code || '').trim()
    if (!trimmed || trimmed.length !== 6) return false

    // allow current and previous window to tolerate slight skew
    const windows = [at, at - OTP_WINDOW_MS]
    return windows.some((ts) => generateOtp(email, ts) === trimmed)
}

export const encodeSession = (user: SessionUser, rememberMe = false): string => {
    const duration = rememberMe
        ? SESSION_LONG_DAYS * 24 * 60 * 60 * 1000
        : SESSION_SHORT_HOURS * 60 * 60 * 1000
    const exp = now() + duration
    const payload = `${user.email}:${exp}`
    const sig = sign(payload)
    return `${payload}:${sig}`
}

export const decodeSession = (token?: string | null): SessionUser | null => {
    if (!token) return null
    const parts = token.split(':')
    if (parts.length !== 3) return null
    const [email, expStr, sig] = parts
    if (!email || !expStr || !sig) return null
    const payload = `${email}:${expStr}`
    if (sign(payload) !== sig) return null
    const exp = Number(expStr)
    if (!Number.isFinite(exp) || now() > exp) return null
    return { email }
}

export const setSessionCookie = (event: H3Event, user: SessionUser, rememberMe = false) => {
    const token = encodeSession(user, rememberMe)
    const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: COOKIE_DOMAIN,
    }

    // If remember me, set long maxAge. Otherwise, session-only (no maxAge = expires on browser close)
    if (rememberMe) {
        cookieOptions.maxAge = SESSION_LONG_DAYS * 24 * 60 * 60
    } else {
        cookieOptions.maxAge = SESSION_SHORT_HOURS * 60 * 60
    }

    setCookie(event, SESSION_COOKIE, token, cookieOptions)
}

export const clearSessionCookie = (event: H3Event) => {
    deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export const currentUserFromEvent = (event: H3Event): SessionUser | null => {
    const token = getCookie(event, SESSION_COOKIE)
    return decodeSession(token)
}

export const isValidEmail = (email: string) => /.+@.+\..+/.test(email)

export const authConfigError = () => (!hasAuthConfig() ? 'Auth not configured' : null)
