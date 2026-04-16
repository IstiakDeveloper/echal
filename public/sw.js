/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'echal-v5';
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_ASSETS = [
    '/offline.html',
    '/manifest.webmanifest',
    '/pwa/apple-touch-icon.png',
    '/pwa/icons/icon-192x192.png',
    '/pwa/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.addAll(CORE_ASSETS);
            await self.skipWaiting();
        })(),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys.map((key) => (key.startsWith('echal-') && key !== RUNTIME_CACHE ? caches.delete(key) : undefined)),
            );
            await self.clients.claim();
        })(),
    );
});

function isCacheableRequest(request) {
    if (request.method !== 'GET') return false;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return false;

    // Never cache Inertia visits (they are HTML responses used to update SPA state).
    // Caching them causes stale UI (e.g. deleted popups still showing).
    if (request.headers.get('X-Inertia')) return false;

    // Avoid caching admin POST/CSRF flows (and other non-idempotent endpoints)
    if (url.pathname.startsWith('/admin')) return false;

    // Never cache JSON/API-like requests (causes stale UI, e.g. cart live updates).
    const accept = request.headers.get('Accept') ?? '';
    if (accept.includes('application/json')) return false;

    // Never cache cart endpoints.
    if (url.pathname === '/cart' || url.pathname.startsWith('/cart/')) return false;

    // Cache static assets and GET pages.
    return true;
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (!isCacheableRequest(request)) return;

    const url = new URL(request.url);
    const isNavigation = request.mode === 'navigate';
    const isBuildAsset =
        url.pathname.startsWith('/build/assets/') ||
        url.pathname === '/build/manifest.json';

    event.respondWith(
        (async () => {
            const cache = await caches.open(RUNTIME_CACHE);

            // For navigation requests, prefer network (fresh data), fall back to cache
            if (isNavigation) {
                try {
                    const response = await fetch(request);
                    return response;
                } catch {
                    const offline = await cache.match('/offline.html');
                    return offline ?? new Response('Offline', { status: 503, statusText: 'Offline' });
                }
            }

            // For Vite build assets: stale-while-revalidate (prevents "stuck old JS" after deploy)
            if (isBuildAsset) {
                const cached = await cache.match(request);
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response && response.status === 200) {
                            event.waitUntil(cache.put(request, response.clone()));
                        }
                        return response;
                    })
                    .catch(() => null);

                return cached ?? (await fetchPromise) ?? new Response('Offline', { status: 503, statusText: 'Offline' });
            }

            // For other static assets: cache-first, then network
            const cached = await cache.match(request);
            if (cached) return cached;

            try {
                const response = await fetch(request);
                // Cache only successful basic/cors responses
                if (response && response.status === 200) {
                    const copy = response.clone();
                    event.waitUntil(cache.put(request, copy));
                }
                return response;
            } catch {
                // Special case for manifest
                if (url.pathname === '/manifest.webmanifest') {
                    const fallback = await cache.match('/manifest.webmanifest');
                    if (fallback) return fallback;
                }
                return new Response('Offline', { status: 503, statusText: 'Offline' });
            }
        })(),
    );
});

