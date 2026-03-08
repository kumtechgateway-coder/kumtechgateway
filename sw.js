const CACHE_NAME = 'kumtech-cache-v64'; // Cache version updated
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './portfolio.html',
  './gallery.html',
  './project-detail.html',
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
  const requestUrl = new URL(event.request.url);

  // --- Strategy 1: Ignore cross-origin requests ---
  // If the request is for a resource on a different origin (e.g., Google Fonts, Firebase API),
  // don't handle it in the service worker. Let the browser fetch it directly.
  // This is the safest way to avoid interfering with third-party services.
  if (requestUrl.origin !== self.location.origin) {
    return; // Let the browser handle it.
  }

  // --- Strategy 2: Handle same-origin GET requests with a cache-first approach ---
  // For GET requests to our own domain, try the cache first.
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // If we find a match in the cache, return it. Otherwise, fetch from the network.
        return cachedResponse || fetch(event.request);
      })
    );
  }
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