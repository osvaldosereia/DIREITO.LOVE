const CACHE_NAME = 'dlove-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  // Ícones e dados você ajusta conforme tiver no projeto:
  // './icons/robo-head-192.png',
  // './icons/robo-head-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k!==CACHE_NAME?caches.delete(k):null))))
      .then(()=> self.clients.claim())
  );
});

// Network-first para HTML; cache-first para estáticos
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Cache-first para /data/ e /icons/
  if (url.pathname.startsWith('/data/') || url.pathname.includes('/icons/')) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp=>{
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, clone));
        return resp;
      }))
    );
    return;
  }

  // Network-first para o resto
  e.respondWith(
    fetch(req).then(resp=>{
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(c=>c.put(req, clone));
      return resp;
    }).catch(()=>caches.match(req))
  );
});
