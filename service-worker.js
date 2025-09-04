// /service-worker.js
const VERSION = 'v2.0.4';

// Shell do app (apenas arquivos que EXISTEM no repositório)
const ASSETS = [
  '/index.html',
  '/recentes.html',
  '/offline.html',
  '/como-funciona.html',
  '/objetivo.html',
  '/sobre.html',
  '/css/styles.css',
  '/js/utils.js',
  '/js/data-acessorios.js',
  '/js/busca-legislacao.js',
  '/js/recents.js',
  '/app.js',
  '/manifest.json',
  '/icons/pwa-180.png',
  '/icons/pwa-192.png',
  '/icons/pwa-512.png'
];

// Instalação: pré-carrega shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await Promise.all(
        ASSETS.map(async (asset) => {
          try {
            const res = await fetch(asset, { cache: 'no-store' });
            if (res.ok) await cache.put(asset, res);
          } catch {
            console.warn('[SW] Não foi possível armazenar:', asset);
          }
        })
      );
      // ativa a nova versão sem esperar navegação
      self.skipWaiting();
    })()
  );
});

// Ativação: remove versões antigas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Fetch: diferentes estratégias
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  const accept = req.headers.get('accept') || '';

  // Regras especiais para JSON / KB → sempre tentar rede antes (network-first)
  if (url.pathname.includes('/kb/') || url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Navegação → network-first, fallback /offline.html
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Demais → cache-first com atualização em segundo plano
  e.respondWith(
    caches.match(req).then((cacheRes) => {
      if (cacheRes) return cacheRes;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cacheRes); // se der erro e não houver cache, retorna undefined (ok para assets não críticos)
    })
  );
});
