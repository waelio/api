import { defineEventHandler } from 'h3'

/**
 * OpenAPI document for the exposed routes.
 */
export default defineEventHandler(() => {
    return {
        openapi: '3.1.0',
        info: {
            title: 'Waelio API',
            version: '1.0.0',
            description: 'OpenAPI schema for the Waelio Nitro API routes.',
        },
        servers: [{ url: '/' }],
        paths: {
            '/api/health': {
                get: {
                    summary: 'Health check',
                    responses: {
                        200: {
                            description: 'Service is healthy',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/HealthResponse' },
                                },
                            },
                        },
                    },
                },
            },
            '/api/holynames': {
                get: {
                    summary: 'List of holy names',
                    parameters: [
                        {
                            name: 'name',
                            in: 'query',
                            required: false,
                            schema: { type: 'string' },
                            description: 'Filter by name substring',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Array of holy names',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/HolyName' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/api/quran': {
                get: {
                    summary: 'Quran chapters or single chapter with ?s=',
                    parameters: [
                        {
                            name: 's',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer' },
                            description: 'Chapter id to fetch a single chapter',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Array of chapters or single chapter',
                            content: {
                                'application/json': {
                                    schema: {
                                        oneOf: [
                                            {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/QuranChapter' },
                                            },
                                            { $ref: '#/components/schemas/QuranChapter' },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/api/deepseek': {
                post: {
                    summary: 'DeepSeek AI chat completion for PEACE2074 virtual guide',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/DeepSeekRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Chat completion response',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/DeepSeekResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'Invalid request',
                        },
                        500: {
                            description: 'DeepSeek API error or not configured',
                        },
                    },
                },
            },
            '/auth/me': {
                get: {
                    summary: 'Get current user profile',
                    responses: {
                        200: {
                            description: 'User profile',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UserProfile' },
                                },
                            },
                        },
                        401: { description: 'Unauthorized' },
                    },
                },
            },
            '/auth/verify-otp': {
                post: {
                    summary: 'Verify OTP code and create session',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        code: { type: 'string', minLength: 6, maxLength: 6 },
                                        rememberMe: {
                                            type: 'boolean',
                                            description: 'Keep user logged in for 30 days (default: 24 hours)',
                                            default: false
                                        },
                                    },
                                    required: ['email', 'code'],
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UserProfile' },
                                },
                            },
                        },
                        400: { description: 'Invalid email or code' },
                        503: { description: 'Auth not configured' },
                    },
                },
            },
            '/auth/profile': {
                put: {
                    summary: 'Update user profile',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProfileUpdate' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Updated profile',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UserProfile' },
                                },
                            },
                        },
                        400: { description: 'Invalid input' },
                        401: { description: 'Unauthorized' },
                        409: { description: 'Username already taken' },
                    },
                },
            },
        },
        components: {
            schemas: {
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'healthy' },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                    required: ['status', 'timestamp'],
                },
                HolyName: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        text: { type: 'string' },
                    },
                    required: ['name', 'text'],
                },
                QuranVerse: {
                    type: 'object',
                    properties: {
                        chapter: { type: 'integer' },
                        verse: { type: 'integer' },
                        text: { type: 'string' },
                    },
                    required: ['chapter', 'verse', 'text'],
                },
                QuranChapter: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        e_name: { type: 'string' },
                        type: { type: 'string' },
                        total_verses: { type: 'integer' },
                        ayat: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/QuranVerse' },
                        },
                    },
                    required: ['id', 'name', 'type', 'total_verses', 'ayat'],
                },
                DeepSeekMessage: {
                    type: 'object',
                    properties: {
                        role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                        content: { type: 'string' },
                    },
                    required: ['role', 'content'],
                },
                DeepSeekRequest: {
                    type: 'object',
                    properties: {
                        messages: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/DeepSeekMessage' },
                        },
                        temperature: { type: 'number', minimum: 0, maximum: 2 },
                        max_tokens: { type: 'integer', minimum: 1 },
                    },
                    required: ['messages'],
                },
                DeepSeekResponse: {
                    type: 'object',
                    properties: {
                        choices: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    message: { $ref: '#/components/schemas/DeepSeekMessage' },
                                    finish_reason: { type: 'string' },
                                },
                            },
                        },
                        usage: {
                            type: 'object',
                            properties: {
                                prompt_tokens: { type: 'integer' },
                                completion_tokens: { type: 'integer' },
                                total_tokens: { type: 'integer' },
                            },
                        },
                    },
                },
                UserProfile: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        user: {
                            type: 'object',
                            properties: {
                                email: { type: 'string' },
                                username: { type: 'string' },
                                first_name: { type: 'string' },
                                last_name: { type: 'string' },
                                role: { type: 'string' },
                                verified: { type: 'boolean' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' },
                            },
                        },
                    },
                },
                ProfileUpdate: {
                    type: 'object',
                    properties: {
                        username: { type: 'string', minLength: 3, maxLength: 30 },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                    },
                },
            },
        },
    }
})
