const CACHE_NAME = 'direito-love-v1';
const OFFLINE_URLS = [
  '/',                // raiz
  '/index.html',      // página principal
  '/icons/favicon-32.png',
  '/icons/favicon-192.png',
  '/icons/apple-touch-icon.png'
];

// Instalação: pré-cache do essencial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia de fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) Network-first para HTML
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // 2) Cache-first para estáticos
  event.respondWith(
    caches.match(req).then((res) => {
      return (
        res ||
        fetch(req).then((resNet) => {
          const resClone = resNet.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return resNet;
        })
      );
    })
  );
});
