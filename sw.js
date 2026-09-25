const CACHE = 'pricewise-v2';
const CORE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  /* the app shell (navigations + index.html) should always try the network
     first -- a stale cached copy of the *logic* is far worse than a stale
     product photo, and this is what makes "install app -> reopen after an
     update" show the update immediately instead of one reload later */
  const isDocument = e.request.mode === 'navigate' || e.request.url.endsWith('/index.html') || e.request.url.endsWith('/');
  if (isDocument) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  /* static assets (images, icons, fonts): cache-first, refresh in the background */
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
