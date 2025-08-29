const CACHE_NAME = 'dlove-v7';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json',
'/icons/icon-192.png','/icons/icon-512.png','/icons/logo-heart.png','/icons/instagram.png','/icons/info.png'];

self.addEventListener('install', e=>{
  e.waitUntil((async()=>{ const c=await caches.open(CACHE_NAME); await c.addAll(CORE_ASSETS); })());
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    await Promise.all(ks.map(k=>k!==CACHE_NAME && caches.delete(k)));
    const cls = await self.clients.matchAll({type:'window'});
    cls.forEach(c=>c.postMessage({type:'SW_ACTIVATED'}));
  })());
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const r=e.request; if(r.method!=='GET') return;
  const a=r.headers.get('accept')||''; const isHTML=a.includes('text/html');
  if(isHTML){
    e.respondWith((async()=>{
      try{ const f=await fetch(r); const c=await caches.open(CACHE_NAME); c.put(r,f.clone()); return f; }
      catch{ const c=await caches.open(CACHE_NAME); return (await c.match(r))||(await c.match('/index.html')); }
    })());
    return;
  }
  e.respondWith((async()=>{ const c=await caches.open(CACHE_NAME); const m=await c.match(r); if(m) return m; try{ const f=await fetch(r); c.put(r,f.clone()); return f; }catch{ return new Response('',{status:504}); } })());
});