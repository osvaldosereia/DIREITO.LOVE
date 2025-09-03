/* ==================================
   Service Worker - direito.love
   ================================== */

const CACHE_NAME = "direito-love-cache-v4";
const FILES_TO_CACHE = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "icons/pwa-180.png",
  "icons/pwa-192.png",
  "icons/pwa-512.png",
  "icons/pwa-1024.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
