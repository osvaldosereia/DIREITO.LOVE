const CACHE_NAME = 'direito-love-cache-v1';
const FILES_TO_CACHE = [
  './index.html',
  './styles.css',
  './app.js',
  './prompts.json',
  './prompts-base.json',
  './manifest.json',
  './icons/pwa-144.png',
  './icons/pwa-180.png',
  './icons/pwa-192.png',
  './icons/pwa-512.png',
  './icons/pwa-1024.png'
];

// Instalação: salva todos os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativação: remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições: usa cache ou busca online
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
