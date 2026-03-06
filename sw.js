const CACHE_NAME = 'kumtech-cache-v28'; // Cache version updated
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './portfolio.html',
  './gallery.html',
  './services.html',
  './blog.html',
  './blog-post.html',
  './navbar.html',
  './footer.html',
  './404.html',
  './style.css',
  './script.js',
  './portfolio-data.js',
  './portfolio-generator.js',
  './gallery-data.js',
  './blog.json',
  './translations.json',
  './images/logo.png',
  './images/hero.png',
  './images/PSX_20251123_141018.jpg', // About section image
  './sounds/success.mp3' // Contact form success sound
  // Note: CDN assets like FontAwesome and Tailwind are intentionally excluded.
  // Caching them directly can cause CORS issues. The browser's HTTP cache is sufficient.
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      }),
  );
  self.skipWaiting();
});

// Fetch Assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Activate Service Worker & Clean Up Old Caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    }),
  );
});