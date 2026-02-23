import { defineEventHandler, handleCors } from 'h3'
import { currentUserFromEvent } from '../../server/auth'
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
const allowedHeaders = ['content-type', 'authorization', 'x-requested-with']

export default defineEventHandler(async (event) => {
    if (handleCors(event, { origin, methods: ['GET', 'OPTIONS'], credentials: true, allowHeaders: allowedHeaders })) return

    const sessionUser = currentUserFromEvent(event)
    if (!sessionUser) {
        event.node.res.statusCode = 401
        return { error: true, message: 'Unauthorized' }
    }

    // Fetch full user profile from database
    try {
        await connectDB()
        const user = await User.findOne({ email: sessionUser.email }).select('-password -verificationToken')

        if (!user) {
            // Session exists but user not in DB (shouldn't happen normally)
            return { ok: true, user: sessionUser }
        }

        return {
            ok: true,
            user: {
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                verified: user.verified,
                createdAt: user.createdAt,
            },
        }
    } catch (dbError) {
        console.error('Database error fetching user:', dbError)
        // Fallback to session user if DB fails
        return { ok: true, user: sessionUser }
    }
})
