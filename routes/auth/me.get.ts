import { defineEventHandler, handleCors } from 'h3'
import { currentUserFromEvent } from '../../server/auth'

const origin = ['https://peace2074.com', 'https://www.peace2074.com']
const allowedHeaders = ['content-type', 'authorization', 'x-requested-with']

export default defineEventHandler((event) => {
    if (handleCors(event, { origin, methods: ['GET', 'OPTIONS'], credentials: true, allowHeaders: allowedHeaders })) return

    const user = currentUserFromEvent(event)
    if (!user) {
        event.node.res.statusCode = 401
        return { error: true, message: 'Unauthorized' }
    }

    return { ok: true, user }
})
