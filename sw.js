const CACHE = 'chat-booy-v4';
const ASSETS = [
  './','index.html','styles.css','app.js?v=4','manifest.webmanifest',
  'icons/logo.svg','icons/refresh.svg','icons/send.svg',
  'icons/copy.svg','icons/pwa-192.png','icons/pwa-512.png','icons/pwa-1024.png'
];
self.addEventListener('install', e=>{ 
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS)).then(()=> self.skipWaiting())); 
});
self.addEventListener('activate', e=>{ 
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE).map(k=> caches.delete(k)))) .then(()=> self.clients.claim())); 
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).catch(()=>{
      if (req.mode === 'navigate') {
        return caches.match('index.html');
      }
    }))
  );
});
