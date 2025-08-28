// sw.js — PWA mínimo com atualização simples
const CACHE = "dlove-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// instala e faz cache básico
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// ativa e limpa caches antigos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// network-first com fallback ao cache para html; cache-first p/ estáticos
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const isHTML = request.destination === "document" || request.headers.get("accept")?.includes("text/html");
  if (isHTML) {
    e.respondWith(
      fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }).catch(() => caches.match(request).then((res) => res || caches.match("./")))
    );
  } else {
    e.respondWith(
      caches.match(request).then((res) => res || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }))
    );
  }
});
