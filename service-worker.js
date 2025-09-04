
/* service-worker.js — direito.love (premium) */
const VERSION = 'v1.0.0-' + (self && self.registration ? Date.now() : Math.random());
const ASSETS = [
  'index.html',
  'recentes.html',
  'offline.html',
  'css/styles.css',
  'js/utils.js',
  'js/data-acessorios.js',
  'js/busca-legislacao.js',
  'js/recents.js',
  'app.js',
  'manifest.json',
  'icons/pwa-192.png',
  'icons/pwa-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Strategy: network-first for HTML; cache-first for others
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')){
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(_ => caches.match('offline.html'))
    );
    return;
  }
  // Static: cache-first
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    }).catch(_ => cached))
  );
});
