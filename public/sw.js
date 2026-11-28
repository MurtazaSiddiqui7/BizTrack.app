const CACHE_NAME = 'biztrack-v3';
const urlsToCache = [
  '/logo-icon.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isHtml =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  // Network-first for HTML/navigation so new deployments appear immediately
  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return networkRes;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for hashed static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
