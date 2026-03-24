const CACHE_NAME = 'kumtech-cache-v78';
const PRECACHE_URLS = [
  './',
  './index.html',
  './pricing.html',
  './portfolio.html',
  './gallery.html',
  './project-detail.html',
  './services.html',
  './blog.html',
  './blog-post.html',
  './components/navbar.html',
  './components/footer.html',
  './404.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/portfolio-generator.js',
  './assets/data/portfolio-data.js',
  './assets/data/gallery-data.js',
  './assets/data/pricing-data.js',
  './assets/data/blog.json',
  './assets/data/translations.json',
  './images/logo.png',
  './images/hero.png',
  './assets/audio/success.mp3'
];

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((asset) =>
          cache.add(asset).catch(() => undefined)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match('./index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return undefined;
        })
      )
    ).then(() => self.clients.claim())
  );
});
