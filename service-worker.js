const CACHE_NAME = "direito-love-v3";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/pesquisa.html",
  "/manifest.json",
  "/icons/pwa-192.png",
  "/icons/pwa-512.png",
  "/favicon.png"
];

// Instala e guarda no cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Intercepta requests
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
