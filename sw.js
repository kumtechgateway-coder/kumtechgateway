const CACHE_NAME = 'kumtech-cache-v8'; // Cache version updated
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
  './portfolio-data.js', // New data source
  './portfolio-generator.js', // New generator script
  './blog.json',
  './translations.json',
  './images/logo.png',
  './images/hero.png'
  // Note: CDN assets like FontAwesome and Tailwind are intentionally excluded.
  // Caching them directly can cause CORS issues. The browser's HTTP cache is sufficient.
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