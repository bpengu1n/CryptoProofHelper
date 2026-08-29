/* Cache-first service worker: the app must work with the radio off.
 * Bump CACHE on every content change to roll users onto the new bundle. */
var CACHE = 'cph-v1';
var ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css',
  './js/math.js', './js/store.js', './js/app.js',
  './js/data/concepts.js', './js/data/techniques.js', './js/data/examples.js',
  './js/data/drills.js', './js/data/templates.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        // Cache same-origin successes so a first visit to a deep link stays offline-capable.
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        // Offline and uncached: navigations fall back to the shell.
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
