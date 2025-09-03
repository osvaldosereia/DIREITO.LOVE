// ===== service-worker.js FINAL =====

const CACHE_NAME = "direito-love-v2";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/theme.js",
  "/sobre.html",
  "/salvos.html",
  "/salvos.css",
  "/prompts.json",
  "/prompts-base.json",
  "/pwa-192.png",
  "/pwa-180.png",
  "/pwa-512.png",
  "/pwa-1024.png",
  "/offline.html"
];

// ==============================
// Instalação do Service Worker
// ==============================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ==============================
// Ativação (limpar caches antigos)
// ==============================
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
  self.clients.claim();
});

// ==============================
// Interceptar requisições
// ==============================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match("/offline.html"))
      );
    })
  );
});
