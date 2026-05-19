const CACHE_NAME = 'sem-gluten-v2';
const ASSETS = [
  './app.html',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalação: pré-cache dos assets principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: estratégia separada por tipo de recurso
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = event.request.mode === 'navigate';

  // ── Recursos externos (Unsplash, Google Fonts, etc.) ──────────────────────
  // Deixa o browser lidar normalmente — não intercepta.
  // Isso evita que o SW bloqueie imagens cross-origin.
  if (!isSameOrigin) {
    return; // não chama event.respondWith → browser faz a requisição normalmente
  }

// ── Navegação (páginas HTML) ───────────────────────────────────────────────
if (isNavigation) {
  if (!isSameOrigin) return; // deixa navegações externas passarem
  event.respondWith(
    fetch(event.request).catch(() => caches.match('./app.html'))
  );
  return;
}
  // ── Assets locais: cache-first ─────────────────────────────────────────────
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Só cacheia respostas válidas do mesmo origem
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Sem fallback para assets — deixa o browser mostrar erro normalmente
        return new Response('', { status: 408 });
      });
    })
  );
});