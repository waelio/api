import { defineEventHandler, setResponseStatus } from "h3";

export default defineEventHandler((event) => {
    setResponseStatus(event, 404);
    return {
        message: `Route ${event.path} not found`
    };
});
