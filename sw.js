const CACHE = 'dl-chat-v1';
const STATIC = [
  '/', '/index.html', '/manifest.json',
  '/icons/logo-heart.png', '/icons/instagram.png',
  '/icons/logo-heart-192.png', '/icons/logo-heart-512.png',
  '/icons/instagram-192.png', '/icons/instagram-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    // Network-first for HTML
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
  } else {
    // Cache-first for static assets
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
  }
});
