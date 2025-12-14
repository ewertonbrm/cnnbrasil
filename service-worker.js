
const CACHE_NAME = 'cnnbrasil-pwa-cache-v2'; // ATUALIZE O NOME PARA FORÇAR A INSTALAÇÃO DO NOVO SW
// CAMINHOS DO APP SHELL (ESQUELETO)
const appShellUrls = [
    '/cnnbrasil/',
    '/cnnbrasil/index.html',
    '/cnnbrasil/manifest.json',
    '/cnnbrasil/icons/icon-192x192.png',
    '/cnnbrasil/icons/icon-512x512.png'
    // Adicione outros ativos essenciais do layout aqui (CSS, JS)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: App Shell cacheado durante a instalação (v2)');
        return cache.addAll(appShellUrls);
      })
      .catch(error => {
          console.error('Falha ao adicionar todos os arquivos ao cache durante a instalação:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  // Ignora requisições de outros origens, focando apenas no seu app.
  if (!event.request.url.startsWith(self.location.origin)) {
      return;
  }
  
  const urlPath = new URL(event.request.url).pathname;

  // 1. ESTRATÉGIA: Cache-First (Para o App Shell)
  // Serve ativos essenciais (index, manifest, icons) instantaneamente do cache.
  if (appShellUrls.some(path => urlPath.endsWith(path) || path === urlPath)) {
      event.respondWith(
          caches.match(event.request).then(response => {
              // Se o shell estiver no cache, retorna ele IMEDIATAMENTE.
              return response || fetch(event.request); 
          })
      );
      return; // Finaliza o manipulador para o App Shell
  }
  
  // 2. ESTRATÉGIA: Network-First (Para Conteúdo Dinâmico/Dados)
  // Tenta a rede primeiro para garantir o conteúdo mais atualizado.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Opcional: Você pode adicionar recursos não essenciais ao cache aqui,
        // mas o foco é a velocidade inicial, então vamos priorizar a rede para conteúdo não-shell.
        return response;
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta o cache como fallback.
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
