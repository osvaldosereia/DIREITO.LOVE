/* =========================
   Service Worker v14
   Estratégias de cache:
   - network-first p/ HTML
   - cache-first p/ estáticos
   - fallback offline
   ========================= */

const CACHE = 'direito-love-v14';

/* =========================
   Lista de arquivos para cache
   ========================= */
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'politica.html',
  'arquivo.html',
  'offline.html',
  'manifest.webmanifest',
  // Ícones principais (somente PNGs do PWA + favicon)
  'icons/pwa-144.png',
  'icons/pwa-180.png',
  'icons/pwa-192.png',
  'icons/pwa-512.png',
  'icons/pwa-1024.png',
  'icons/favicon.ico'
];

/* =========================
   Instalação — pré-cache
   ========================= */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('❌ Erro no pré-cache:', err))
  );
});

/* =========================
   Ativação — limpa caches antigos
   ========================= */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* =========================
   Fetch — estratégias híbridas
   ========================= */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  const sameOrigin = url.origin === location.origin;

  // Estratégia network-first para páginas HTML
  if (isHTML && sameOrigin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(r => r || caches.match('offline.html'))
        )
    );
    return;
  }

  // Estratégia cache-first para estáticos
  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then(cached =>
        cached ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => cached)
      )
    );
  }
});
