/* ==============================
   Service Worker — direito.love
   v9 — otimizado para iOS/Android
   ============================== */

const CACHE = 'direito-love-v9';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'politica.html',
  'arquivo.html',
  'arquivo.js',
  // Ícones principais
  'icons/logo.svg',
  'icons/send.svg',
  'icons/refresh.svg',
  'icons/filter.svg',
  'icons/home.svg',
  'icons/trash.svg',
  'icons/check.svg',
  'icons/pwa-144.png',
  'icons/pwa-180.png',
  'icons/pwa-192.png',
  'icons/pwa-512.png',
  'icons/pwa-1024.png',
  'icons/favicon.ico'
];

/* ====== Install: cache inicial ====== */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ====== Activate: limpa cache antigo ====== */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ====== Fetch: estratégias ======
   - HTML: network-first (sempre tenta online antes de usar cache)
   - Assets locais: cache-first (rápido e offline)
   - Outros: network fallback to cache
================================== */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  const sameOrigin = url.origin === location.origin;

  if (isHTML && sameOrigin) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => cached)
      )
    );
  }
});

/* ====== Mensagens ======
   Permite forçar atualização pelo app.
================================== */
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
