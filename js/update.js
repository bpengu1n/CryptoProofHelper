/* Service-worker registration and the "update available" bar.
 * sw.js no longer activates a new version on its own: the new worker
 * installs, then waits. When one is waiting, this file shows a bar with an
 * Update button; tapping it tells the worker to take over and reloads once
 * it has. Nothing is shown when there is no update.
 */
(function (root) {
  'use strict';

  var CHECK_EVERY = 30 * 60 * 1000;   // re-check when the app comes back into view
  var reloading = false, lastCheck = Date.now();

  function hideBar() {
    var b = document.getElementById('updatebar');
    if (b) b.parentNode.removeChild(b);
    if (!document.getElementById('installbar')) document.body.classList.remove('has-installbar');
  }

  function showBar(worker) {
    if (document.getElementById('updatebar')) return;
    if (root.CPInstall) root.CPInstall.hide();   // one bar at a time
    var bar = document.createElement('div');
    bar.className = 'installbar';
    bar.id = 'updatebar';
    bar.setAttribute('role', 'status');
    bar.innerHTML =
      '<div class="ib-text"><b>Update available</b>' +
      '<span>A newer version of Proof Helper is ready.</span></div>' +
      '<div class="ib-acts"><button class="btn sm" id="update-go">Update</button>' +
      '<button class="ib-x" aria-label="Not now">&times;</button></div>';
    document.body.appendChild(bar);
    document.body.classList.add('has-installbar');
    bar.querySelector('.ib-x').onclick = hideBar;   // back on the next launch
    bar.querySelector('#update-go').onclick = function () {
      this.disabled = true;
      this.textContent = 'Updating…';
      reloading = true;
      worker.postMessage('skipWaiting');
    };
  }

  /** Show the bar once `worker` has finished installing, if a page is already controlled. */
  function watch(worker) {
    if (!worker) return;
    function check() {
      // No controller means this is the very first install, not an update.
      if (worker.state === 'installed' && navigator.serviceWorker.controller) showBar(worker);
    }
    check();
    worker.addEventListener('statechange', check);
  }

  function register() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      // Only reload when the learner asked for it, never on a first install.
      if (!reloading) return;
      location.reload();
    });
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      watch(reg.waiting);
      reg.addEventListener('updatefound', function () { watch(reg.installing); });
      // An installed app can stay open for days; look for updates when it is reopened.
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible' || Date.now() - lastCheck < CHECK_EVERY) return;
        lastCheck = Date.now();
        reg.update().catch(function () { /* offline */ });
      });
    }).catch(function () { /* offline-only is fine */ });
  }

  root.CPUpdate = { register: register };
})(window);
