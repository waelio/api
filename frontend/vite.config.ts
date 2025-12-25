import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite dev server for the UI runs on port 3000 and proxies API/static calls
// to the Nitro dev server (running on a different port, e.g. 4000).
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3000,
        proxy: {
            '/api': 'http://localhost:4000',
            '/openapi.html': 'http://localhost:4000',
            '/icons': 'http://localhost:4000',
            '/manifest.webmanifest': 'http://localhost:4000',
            '/sw.js': 'http://localhost:4000',
        },
    },
    preview: {
        port: 3000,
    },
})
