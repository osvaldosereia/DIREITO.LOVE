/* ==================================
   Service Worker - direito.love
   ================================== */

const CACHE_NAME = "direito-love-cache-v3";
const FILES_TO_CACHE = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "icons/pwa-180.png",
  "icons/pwa-192.png",
  "icons/pwa-512.png",
  "icons/pwa-1024.png",
  "data/codigos.json"
];

// Instalação → adiciona arquivos ao cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação → remove caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições → offline-first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Atualização forçada
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
