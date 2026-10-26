/* Cache-first service worker: the app must work with the radio off.
 * Bump CACHE on every content change to roll users onto the new bundle.
 * A new version installs and then waits; js/update.js shows an Update
 * button and sends 'skipWaiting' when the learner taps it. */
var CACHE = 'cph-v9';
// cph-v8 is the first version whose page code has the Update button. Older
// pages can't ask a waiting worker to take over, so replacing one of those
// still activates immediately, as before.
var FIRST_WITH_UPDATE_UI = 8;
var ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css',
  './vendor/puzzlepieces/js/math-renderer/math-renderer.js',
  './vendor/puzzlepieces/js/local-store/local-store.js',
  './vendor/puzzlepieces/js/pwa-install-detect/pwa-install-detect.js',
  './js/store.js', './js/install.js', './js/update.js', './js/widgets.js', './js/app.js',
  './js/data/course.js', './js/data/primer.js', './js/data/concepts.js',
  './js/data/techniques.js', './js/data/examples.js',
  './js/data/drills.js', './js/data/templates.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        // Bypass the HTTP cache so an update never caches a stale file.
        return c.addAll(ASSETS.map(function (u) { return new Request(u, { cache: 'reload' }); }));
      })
      .then(function () { return caches.keys(); })
      .then(function (keys) {
        var fromOldUI = keys.some(function (k) {
          var m = /^cph-v(\d+)$/.exec(k);
          return m && +m[1] < FIRST_WITH_UPDATE_UI;
        });
        if (fromOldUI) return self.skipWaiting();
      })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      // Only this app's caches: other apps on the same github.io origin share Cache Storage.
      return Promise.all(keys.map(function (k) {
        return k === CACHE || k.indexOf('cph-') !== 0 ? null : caches.delete(k);
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
