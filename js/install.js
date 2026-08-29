/* Install affordances.
 *
 * iOS has no install API at all: Safari only offers Share -> Add to Home
 * Screen, and nothing in JS can trigger or detect it. So on iOS the best we
 * can do is show the steps, pointed at the right button. Android/desktop
 * Chrome fire `beforeinstallprompt`, which we capture and replay on a tap.
 */
(function (root) {
  'use strict';

  var S = root.CPStore;

  function standalone() {
    // iOS uses the legacy navigator.standalone; everyone else display-mode.
    return root.navigator.standalone === true ||
           !!(root.matchMedia && root.matchMedia('(display-mode: standalone)').matches);
  }

  function ios() {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
    // iPadOS 13+ reports a Mac user agent; touch points give it away.
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  }

  // On iOS every browser is WebKit, but only Safari can add to the home screen.
  function iosSafari() {
    return ios() && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(navigator.userAgent);
  }

  function android() { return /Android/.test(navigator.userAgent); }

  var deferredPrompt = null;
  root.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();            // keep the mini-infobar off; we place our own
    deferredPrompt = e;
    document.documentElement.classList.add('can-install');
  });
  root.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    S.set('installed', true);
    hideBanner();
  });

  /** The iOS share glyph, so the instruction points at a recognisable shape. */
  var SHARE_SVG =
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" ' +
    'style="vertical-align:-2px"><path fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
    'd="M12 3v11M8.5 6.5 12 3l3.5 3.5M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';

  function hideBanner() {
    var b = document.getElementById('installbar');
    if (b) b.parentNode.removeChild(b);
    document.body.classList.remove('has-installbar');
  }

  function showBanner() {
    if (document.getElementById('installbar')) return;
    var bar = document.createElement('div');
    bar.className = 'installbar';
    bar.id = 'installbar';
    bar.innerHTML =
      '<div class="ib-text"><b>Add to your home screen</b>' +
      '<span>Tap ' + SHARE_SVG + ' then <b>Add to Home Screen</b> — it then works offline.</span></div>' +
      '<div class="ib-acts"><a class="ib-more" href="#/install">Details</a>' +
      '<button class="ib-x" aria-label="Dismiss">&times;</button></div>';
    document.body.appendChild(bar);
    document.body.classList.add('has-installbar');
    bar.querySelector('.ib-x').onclick = function () {
      S.set('install:dismissed', true);
      hideBanner();
    };
    bar.querySelector('.ib-more').onclick = function () { hideBanner(); };
  }

  root.CPInstall = {
    standalone: standalone,
    ios: ios,
    iosSafari: iosSafari,
    android: android,
    canPrompt: function () { return !!deferredPrompt; },

    /** Fire the captured Chrome install prompt. Resolves to true if accepted. */
    prompt: function () {
      if (!deferredPrompt) return Promise.resolve(false);
      var p = deferredPrompt;
      deferredPrompt = null;
      p.prompt();
      return p.userChoice.then(function (c) { return c.outcome === 'accepted'; });
    },

    shareIcon: SHARE_SVG,

    /** Redundant while the install page itself is open. */
    hide: hideBanner,

    /** Nudge iOS Safari users once; they have no other way to discover this. */
    maybeBanner: function () {
      if (standalone() || S.get('install:dismissed', false) || S.get('installed', false)) return;
      if (!iosSafari()) return;
      if (location.hash === '#/install') return;
      setTimeout(showBanner, 1200);   // let the page settle first
    }
  };
})(window);
