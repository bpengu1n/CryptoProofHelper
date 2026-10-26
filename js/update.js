/* Service-worker registration and the "update available" bar.
 * sw.js no longer activates a new version on its own: the new worker
 * installs, then waits. When one is waiting, this file shows a bar with an
 * Update button; tapping it tells the worker to take over and reloads once
 * it has. Nothing is shown when there is no update.
 */
(function (root) {
  'use strict';

  var CHECK_EVERY = 30 * 60 * 1000;   // re-check when the app comes back into view
  var reloading = false, lastCheck = Date.now(), reg = null;

  function reload() {
    if (reloading === 'done') return;
    reloading = 'done';
    location.reload();
  }

  function hideBar() {
    var b = document.getElementById('updatebar');
    if (b) b.parentNode.removeChild(b);
    if (!document.getElementById('installbar')) document.body.classList.remove('has-installbar');
  }

  function showBar() {
    if (document.getElementById('updatebar')) return;
    if (root.CPInstall) root.CPInstall.hide();   // one bar at a time
    var bar = document.createElement('div');
    bar.className = 'installbar';
    bar.id = 'updatebar';
    bar.setAttribute('role', 'status');
    document.body.appendChild(bar);
    document.body.classList.add('has-installbar');
    // Fill the live region after it is in the page, so screen readers announce it.
    setTimeout(function () {
      bar.innerHTML =
        '<div class="ib-text"><b>Update available</b>' +
        '<span>A newer version of Proof Helper is ready.</span></div>' +
        '<div class="ib-acts"><button class="btn sm" id="update-go">Update</button>' +
        '<button class="ib-x" aria-label="Not now">&times;</button></div>';
      bar.querySelector('.ib-x').onclick = hideBar;   // back on the next launch
      bar.querySelector('#update-go').onclick = function () {
        // Look the worker up now: a later deploy, or another tab, may have
        // replaced or already activated the one that was waiting earlier.
        var w = reg && reg.waiting;
        if (!w) { reload(); return; }
        this.disabled = true;
        this.textContent = 'Updating…';
        reloading = true;
        // Backstop in case controllerchange never arrives.
        w.addEventListener('statechange', function () {
          if (w.state === 'activated') reload();
        });
        w.postMessage('skipWaiting');
      };
    }, 0);
  }

  /** Show the bar once `worker` has finished installing, if a page is already controlled. */
  function watch(worker) {
    if (!worker) return;
    function check() {
      // No controller means this is the very first install, not an update.
      if (worker.state === 'installed' && navigator.serviceWorker.controller) showBar();
    }
    check();
    worker.addEventListener('statechange', check);
  }

  function register() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading) { reload(); return; }
      // Another tab applied the update: this page's code is now stale, so the
      // bar's job is done; the next navigation or launch picks up the new version.
      hideBar();
    });
    navigator.serviceWorker.register('sw.js').then(function (r) {
      reg = r;
      watch(reg.waiting);
      reg.addEventListener('updatefound', function () { watch(reg.installing); });
      // An installed app can stay open for days; look for updates when it is reopened.
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible' || Date.now() - lastCheck < CHECK_EVERY) return;
        lastCheck = Date.now();
        var u = reg.update();
        if (u && u.catch) u.catch(function () { /* offline */ });
      });
    }).catch(function () { /* offline-only is fine */ });
  }

  root.CPUpdate = { register: register };
})(window);
