/* sw.js — cache básico com estratégia stale-while-revalidate */
const CACHE_NAME = 'direito-love-v4-google-rand3';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
  // se quiser, adicione aqui outros assets críticos (fonts, imagens, etc.)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          // salva uma cópia em cache (não bloqueia resposta)
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
          return networkRes;
        })
        .catch(() => cached); // offline → usa cache se existir
      return cached || fetchPromise;
    })
  );
});
