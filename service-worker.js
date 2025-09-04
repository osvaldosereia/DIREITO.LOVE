// service-worker.js
const VERSION = 'v2.0.1-' + (self && self.registration ? Date.now() : Math.random());

// Shell do app (apenas arquivos que EXISTEM no repositório)
const ASSETS = [
  '/index.html',
  '/recentes.html',
  '/offline.html',
  '/css/styles.css',
  '/js/utils.js',
  '/js/data-acessorios.js',
  '/js/busca-legislacao.js',
  '/js/recents.js',
  '/app.js',
  '/manifest.json',
  '/icons/pwa-180.png',
  '/icons/pwa-192.png'
];

// Instalação: pré-carrega shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(cache =>
      Promise.all(
        ASSETS.map(asset =>
          fetch(asset).then(res => {
            if (res.ok) return cache.put(asset, res);
          }).catch(() => {
            console.warn('[SW] Não foi possível armazenar:', asset);
          })
        )
      )
    )
  );
});

// Ativação: remove versões antigas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: diferentes estratégias
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  const accept = req.headers.get('accept') || '';

  // Regras especiais para JSON / KB → sempre tentar rede antes
  if (url.pathname.includes('/kb/') || url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Navegação → network-first, fallback offline.html
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match('offline.html'))
    );
    return;
  }

  // Demais → cache-first com atualização
  e.respondWith(
    caches.match(req).then(cacheRes =>
      cacheRes ||
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      })
    )
  );
});
