import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
    return {
        name: "Waelio API",
        status: "online",
    };
});