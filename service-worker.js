const CACHE_NAME = 'cnnbrasil-pwa-cache-v8';
const urlsToCache = [
    '/cnnbrasil/',
    '/cnnbrasil/index.html',
    '/cnnbrasil/manifest.json',
    '/cnnbrasil/icons/icon-192x192.png',
    '/cnnbrasil/icons/icon-512x512.png',
    '/cnnbrasil/icons/loading.gif'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Força a ativação imediata
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim(); // Assume o controle da página na hora
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      // Prioriza o cache para o App Shell (index, gif, manifest)
      return response || fetch(event.request);
    })
  );
});
