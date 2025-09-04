/*
service-worker.js
Service worker com cache estático (versão app-cache-v1)
*/

const CACHE_NAME = 'app-cache-v1';
const OFFLINE_URL = 'offline.html';

const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'styles.css',
  'app.js',
  'data-acessorios.js',
  'manifest.json',
  'offline.html',
  'icons/pwa-192.png',
  'icons/pwa-512.png',
  'icons/pwa-180.png'
];

// Instala e pré-cacheia
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
