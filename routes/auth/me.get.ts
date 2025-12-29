import { defineEventHandler } from 'h3'
import { currentUserFromEvent } from '../../server/auth'

export default defineEventHandler((event) => {
    const user = currentUserFromEvent(event)
    if (!user) {
        event.node.res.statusCode = 401
        return { error: true, message: 'Unauthorized' }
    }

    return { ok: true, user }
})
