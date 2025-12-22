import { defineEventHandler, type H3Event } from "h3";

export default defineEventHandler((event: H3Event) => {
    return {
        status: 'OK',
    };
});