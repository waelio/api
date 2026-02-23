import { defineEventHandler, handleCors, readBody } from 'h3'
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

interface ProfileUpdate {
    username?: string
    first_name?: string
    last_name?: string
}

/**
 * PUT /auth/profile - Update user profile
 */
export default defineEventHandler(async (event) => {
    if (handleCors(event, {
        origin,
        methods: ['PUT', 'OPTIONS'],
        credentials: true,
        allowHeaders: ['content-type'],
    })) return

    const sessionUser = currentUserFromEvent(event)
    if (!sessionUser) {
        event.node.res.statusCode = 401
        return { error: true, message: 'Unauthorized' }
    }

    const body = await readBody<ProfileUpdate>(event)
    const { username, first_name, last_name } = body

    // Validate username if provided
    if (username !== undefined) {
        const trimmed = username.trim()
        if (trimmed.length < 3 || trimmed.length > 30) {
            event.node.res.statusCode = 400
            return { error: true, message: 'Username must be 3-30 characters' }
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            event.node.res.statusCode = 400
            return { error: true, message: 'Username can only contain letters, numbers, underscore, and dash' }
        }
    }

    try {
        await connectDB()

        // Check if username is already taken (if changing username)
        if (username) {
            const existing = await User.findOne({
                username: username.trim(),
                email: { $ne: sessionUser.email } // exclude current user
            })
            if (existing) {
                event.node.res.statusCode = 409
                return { error: true, message: 'Username already taken' }
            }
        }

        const updates: Partial<ProfileUpdate> = {}
        if (username !== undefined) updates.username = username.trim()
        if (first_name !== undefined) updates.first_name = first_name.trim()
        if (last_name !== undefined) updates.last_name = last_name.trim()

        const user = await User.findOneAndUpdate(
            { email: sessionUser.email },
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true }
        ).select('-password -verificationToken')

        if (!user) {
            event.node.res.statusCode = 404
            return { error: true, message: 'User not found' }
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
                updatedAt: user.updatedAt,
            },
        }
    } catch (error) {
        console.error('Profile update error:', error)
        event.node.res.statusCode = 500
        return { error: true, message: 'Failed to update profile' }
    }
})
