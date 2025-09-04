
const VERSION='v2.0.0-'+(self&&self.registration?Date.now():Math.random());
const ASSETS=[
  'index.html','recentes.html','offline.html',
  'css/styles.css','js/utils.js','js/data-acessorios.js','js/busca-legislacao.js','js/recents.js',
  'app.js','manifest.json','icons/pwa-192.png','icons/pwa-512.png'
];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS))); });
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const req=e.request; const accept=req.headers.get('accept')||'';
  if(req.mode==='navigate' || accept.includes('text/html')){
    e.respondWith(fetch(req).then(res=>{ const copy=res.clone(); caches.open(VERSION).then(c=>c.put(req,copy)); return res; }).catch(_=>caches.match('offline.html')));
    return;
  }
  e.respondWith(caches.match(req).then(c=>c||fetch(req).then(res=>{ const copy=res.clone(); caches.open(VERSION).then(cc=>cc.put(req,copy)); return res; }).catch(_=>c)));
});
