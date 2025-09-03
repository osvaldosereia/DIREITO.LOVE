/* ==================================
   Service Worker Revisado - direito.love
   ================================== */

const CACHE_NAME = "direito-love-cache-v5";
const FILES_TO_CACHE = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "offline.html",
  "icons/pwa-180.png",
  "icons/pwa-192.png",
  "icons/pwa-512.png",
  "icons/pwa-1024.png"
];

// Instalação
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Estratégia de busca
self.addEventListener("fetch", event => {
  if (event.request.url.includes("/data/")) {
    // Network-first para arquivos JSON
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resp.clone());
            return resp;
          });
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match("offline.html")))
    );
  } else {
    // Cache-first para estáticos
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request).catch(() => caches.match("offline.html")))
    );
  }
});

// Mensagens
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
