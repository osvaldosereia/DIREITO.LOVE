
// Offline-first SW: network-first for HTML, cache-first for static assets
const CACHE_STATIC = "dlove-static-v1";
const CACHE_HTML = "dlove-html-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo.svg"
];

self.addEventListener("install", (e)=>{
  e.waitUntil((async ()=>{
    const cache = await caches.open(CACHE_STATIC);
    await cache.addAll(STATIC_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k=>{
      if(![CACHE_STATIC, CACHE_HTML].includes(k)) return caches.delete(k);
    }));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e)=>{
  const req = e.request;
  const url = new URL(req.url);

  // Network-first for HTML (documents)
  if(req.mode === "navigate" || (req.headers.get("accept")||"").includes("text/html")){
    e.respondWith((async ()=>{
      try{
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_HTML);
        cache.put(req, fresh.clone());
        return fresh;
      }catch(err){
        const cache = await caches.open(CACHE_HTML);
        const cached = await cache.match(req) || await caches.match("./index.html");
        return cached;
      }
    })());
    return;
  }

  // Cache-first for static
  if(STATIC_ASSETS.some(p=>url.pathname.endsWith(p.replace("./","/")))){
    e.respondWith((async ()=>{
      const cached = await caches.match(req);
      if(cached) return cached;
      const res = await fetch(req);
      const cache = await caches.open(CACHE_STATIC);
      cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // default: try network, fallback cache
  e.respondWith((async ()=>{
    try{
      return await fetch(req);
    }catch(e){
      const cached = await caches.match(req);
      return cached || Response.error();
    }
  })());
});
