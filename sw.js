// Network-first: online vždy čerstvá verze, offline z cache.
const CACHE = 'noty-v5';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  ...['main', 'music', 'pitch', 'store', 'audio', 'draw', 'dial', 'practice', 'stats', 'lessons', 'lessons-content', 'live'].map(f => `js/${f}.js`)];

self.oninstall = e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); };
self.onactivate = e => e.waitUntil(clients.claim());
self.onfetch = e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
};
