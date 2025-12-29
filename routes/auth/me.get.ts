import { defineEventHandler, handleCors } from 'h3'
import { currentUserFromEvent } from '../../server/auth'

const origin = 'https://peace2074.com'

export default defineEventHandler((event) => {
    if (handleCors(event, { origin, credentials: true })) return

    const user = currentUserFromEvent(event)
    if (!user) {
        event.node.res.statusCode = 401
        return { error: true, message: 'Unauthorized' }
    }

    return { ok: true, user }
})
