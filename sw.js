/* SW v5 — network-first p/ HTML; cache-first p/ estáticos; fallback offline */
const CACHE = 'chat-booy-v5';
const ASSETS = [
  './','index.html','styles.css','app.js?v=5','manifest.webmanifest',
  'arquivo.html','arquivo.js',
  'politica.html',
  'icons/logo.svg','icons/refresh.svg','icons/send.svg','icons/copy.svg',
  'icons/filter.svg','icons/home.svg','icons/trash.svg',
  'icons/pwa-180.png','icons/pwa-192.png','icons/pwa-512.png','icons/pwa-1024.png','icons/favicon.ico'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=> c.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE).map(k=> caches.delete(k)))).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;

  const url = new URL(req.url);
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  const sameOrigin = url.origin === location.origin;

  if(isHTML && sameOrigin){
    // network-first para páginas HTML
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match('index.html'))
    );
    return;
  }

  if(sameOrigin){
    // cache-first para arquivos estáticos
    e.respondWith(
      caches.match(req).then(cached=> cached || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=> cached))
    );
  }
});
