/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'waelio-pwa-v3';
const OFFLINE_ASSETS = [
    '/',
    '/index.html',
    '/openapi.html',
    '/manifest.webmanifest',
    '/icons/icon.svg',
];

self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;

    // Bypass non-GET and cross-origin
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    // Do not cache API responses; always go network-first.
    if (request.url.includes('/api/')) {
        event.respondWith(fetch(request).catch(() => caches.match(request)));
        return;
    }

    // App shell: cache-first with network fallback
    event.respondWith(
        caches.match(request).then((cached) =>
            cached || fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => { });
                return response;
            })
        )
    );
});
