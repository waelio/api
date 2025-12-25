import { defineEventHandler } from 'h3'

/**
 * GET /api/health
 * Simple health check endpoint
 */
export default defineEventHandler(() => {
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
    }
})
