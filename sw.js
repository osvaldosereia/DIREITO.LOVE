const CACHE='dl-v3';
const STATIC=['/','/index.html','/manifest.json','/icons/logo-heart.png','/icons/instagram.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))) });
self.addEventListener('fetch',e=>{
  const req=e.request; const isHTML=req.headers.get('accept')?.includes('text/html');
  if(isHTML){
    e.respondWith(fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;})
      .catch(()=>caches.match(req).then(r=>r||caches.match('/index.html'))));
  }else{
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;})));
  }
});