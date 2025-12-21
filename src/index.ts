export default defineEventHandler(() => {
    return {
        message: 'Welcome to Waelio API',
        timestamp: new Date().toISOString(),
    };
});
