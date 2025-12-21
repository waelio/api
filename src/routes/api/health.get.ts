/**
 * GET /api/health
 * Health check endpoint
 */
export default defineEventHandler(() => {
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
    };
});
