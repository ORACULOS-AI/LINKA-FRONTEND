/* SeLinka — service worker mínimo (offline shell + cache de assets). */
const CACHE_NAME = 'selinka-shell-v1'
const SHELL_ASSETS = ['/', '/feed', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => null),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // network-first para chamadas de API / próprio host dinâmico
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // stale-while-revalidate para assets estáticos
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
            return res
          })
          .catch(() => cached)
        return cached || fetched
      }),
    )
  }
})
