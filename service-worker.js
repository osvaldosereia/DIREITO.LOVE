const CACHE_NAME = 'questgpt-cache-v1';
const CORE_ASSETS = [
'/',
'/index.html',
'/styles.css',
'/app.js',
'/manifest.webmanifest',
'/pwa-144.png', '/pwa-180.png', '/pwa-192.png', '/pwa-512.png', '/pwa-1024.png',
'/data/dicas-index.json', '/data/codigos.json', '/data/sumulas.json', '/data/jurisprudencia.json'
];


self.addEventListener('install', (event) => {
event.waitUntil((async () => {
const cache = await caches.open(CACHE_NAME);
await cache.addAll(CORE_ASSETS);
self.skipWaiting();
})());
});


self.addEventListener('activate', (event) => {
event.waitUntil((async () => {
const keys = await caches.keys();
await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
self.clients.claim();
})());
});


self.addEventListener('fetch', (event) => {
const req = event.request;
event.respondWith((async () => {
const cache = await caches.open(CACHE_NAME);
const cached = await cache.match(req);
const network = fetch(req).then(resp => { cache.put(req, resp.clone()); return resp; }).catch(()=>null);
return cached || network || new Response('Offline', { status: 503, statusText: 'Offline' });
})());
});
