import { defineEventHandler, handleCors } from 'h3'
import { currentUserFromEvent } from '../../server/auth'

export default defineEventHandler((event) => {
    if (handleCors(event, { origin: '*' })) return

    const user = currentUserFromEvent(event)
    if (!user) {
        event.node.res.statusCode = 401
        return { error: true, message: 'Unauthorized' }
    }

    return { ok: true, user }
})
