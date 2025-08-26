// sw.js – cache básico para PWA (inclui frases.txt)
const CACHE = "ad-cache-v3"; // bump de versão
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./frases.txt",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo-menu.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  // Network-first para frases.txt (atualiza quando online), cache-first pro resto
  if (new URL(e.request.url).pathname.endsWith('/frases.txt')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
