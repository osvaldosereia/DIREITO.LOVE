const CACHE = 'chat-booy-v3';
const ASSETS = [
  './','index.html','styles.css','app.js?v=3','arquivo.html','arquivo.js?v=3','manifest.webmanifest',
  'icons/logo.svg','icons/file.svg','icons/refresh.svg','icons/send.svg','icons/filter.svg',
  'icons/home.svg','icons/trash.svg','icons/copy.svg','icons/chatgpt.svg','icons/gemini.svg','icons/perplexity.svg',
  'icons/pwa-192.png','icons/pwa-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return c.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(req, clone));
      return r;
    }).catch(() => caches.match('index.html')))
  );
});
