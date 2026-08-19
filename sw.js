const CACHE_NAME = 'deep-truths-v9';
const ASSETS = [
  './index.html',
  './manifest.json',
  './logo-192.png',
  './logo-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Hanya intercept file statis lokal, jangan intercept API call Google Script
  if (event.request.url.includes('script.google.com') || event.request.url.includes('googleusercontent.com')) {
    return; // biarkan browser melakukan fetch langsung ke Google Sheets API tanpa caching
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});








