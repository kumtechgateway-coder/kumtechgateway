const CACHE_NAME = 'kumtech-cache-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './portfolio.html',
  './gallery.html',
  './style.css',
  './script.js',
  './data.json',
  './translations.json',
  './images/logo.png',
  './images/hero.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch Assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});