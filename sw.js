const CACHE_NAME = 'dlove-v3';
const CORE_ASSETS = [
  '/', '/index.html', '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png',
  '/icons/logo-heart.png', '/icons/instagram.png', '/icons/info.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)));
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const accept = req.headers.get('accept') || '';
  const isHTML = accept.includes('text/html');

  if (isHTML) {
    // network-first para HTML
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(req)) || (await cache.match('/index.html'));
      }
    })());
    return;
  }

  // cache-first para estáticos
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return new Response('', { status: 504 });
    }
  })());
});
