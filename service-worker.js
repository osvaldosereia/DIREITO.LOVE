// ================================
// service-worker.js - direito.love
// Cache offline básico para PWA
// ================================

const CACHE_NAME = "direito-love-v1";
const FILES_TO_CACHE = [
  "/", // raiz
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/pwa-144.png",
  "/pwa-180.png",
  "/pwa-192.png",
  "/pwa-512.png",
  "/pwa-1024.png"
];

// Instalação do service worker e cache inicial
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar requisições e servir cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
