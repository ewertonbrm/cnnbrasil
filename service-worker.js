const CACHE_NAME = 'cnnbrasil-pwa-v10';
const urlsToCache = [
    '/cnnbrasil/',
    '/cnnbrasil/index.html',
    '/cnnbrasil/manifest.json',
    '/cnnbrasil/icons/icon-192x192.png',
    '/cnnbrasil/icons/icon-512x512.png',
    '/cnnbrasil/icons/loading.gif'
];

// Instalação: Salva o App Shell no Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache aberto, salvando arquivos...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});

// Ativação: Limpa caches antigos e assume controle
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Responde do cache para garantir funcionamento offline (exigência PWA)
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o cache se houver, ou busca na rede
        return response || fetch(event.request);
      }).catch(() => {
        // Se estiver offline e for navegação, serve o index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/cnnbrasil/index.html');
        }
      })
  );
});
