/* sw.js — direito.love
   Estratégia híbrida:
   - network-first para HTML
   - cache-first para estáticos
   - fallback offline amigável
*/
const CACHE_VERSION = "v9"; // incrementa sempre que publicar
const CACHE_NAME = `direitolove-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "icons/logo.svg",
  "icons/refresh.svg",
  "icons/send.svg",
  "icons/copy.svg",
  "icons/filter.svg",
  "icons/home.svg",
  "icons/trash.svg",
  "icons/pwa-180.png",
  "icons/pwa-192.png",
  "icons/pwa-512.png",
  "icons/pwa-1024.png",
  "icons/favicon.ico",
  "offline.html"
];

/* Instalação — pre-cache */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Ativação — limpa caches antigos */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch — lógica híbrida */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // network-first para HTML
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("offline.html"))
        )
    );
    return;
  }

  // cache-first para estáticos
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});
