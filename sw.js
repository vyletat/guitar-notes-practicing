// Network-first: online vždy čerstvá verze, offline z cache.
const CACHE = 'noty-v4';
const FILES = ['./', 'index.html', 'app.js', 'lessons.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

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
