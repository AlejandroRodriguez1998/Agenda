/* Service worker de Agenda Académica.
 * - /_next/static: cache-first (ficheros con hash, inmutables).
 * - Navegación: network-first con copia en caché para abrir la app sin conexión.
 * - Resto de recursos propios: stale-while-revalidate.
 * Firebase (otro origen) no pasa por aquí: Firestore gestiona su propia caché offline.
 * Sube VERSION para forzar la limpieza de cachés antiguas.
 */
const VERSION = 'v2'
const STATIC_CACHE = `agenda-static-${VERSION}`
const PAGES_CACHE = `agenda-pages-${VERSION}`
const ASSETS_CACHE = `agenda-assets-${VERSION}`
const PRECACHE = ['/', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  const keep = new Set([STATIC_CACHE, PAGES_CACHE, ASSETS_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

const putInCache = async (cacheName, request, response) => {
  if (!response || !response.ok || response.type === 'opaque') return
  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone())
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            putInCache(STATIC_CACHE, request, response)
            return response
          })
      )
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(PAGES_CACHE, request, response)
          return response
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/')) || Response.error())
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          putInCache(ASSETS_CACHE, request, response)
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
