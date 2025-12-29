import { defineEventHandler, handleCors } from 'h3'

const origin = ['https://peace2074.com', 'https://www.peace2074.com']
const allowedHeaders = ['content-type']

export default defineEventHandler((event) => {
    if (handleCors(event, { origin, methods: ['OPTIONS', 'POST'], credentials: true, allowHeaders: allowedHeaders })) return
    event.node.res.statusCode = 204
})