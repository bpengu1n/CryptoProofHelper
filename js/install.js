/* This app's install banner. Platform detection and beforeinstallprompt
 * capture come from vendor/puzzlepieces/js/pwa-install-detect — change
 * that there, not here. This file only owns the banner UI, its copy, and
 * where "dismissed"/"installed" get remembered.
 */
(function (root) {
  'use strict';

  var D = root.PwaInstallDetect;
  var S = root.CPStore;

  D.onInstalled(function () { S.set('installed', true); hideBanner(); });

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
    standalone: D.standalone,
    ios: D.ios,
    iosSafari: D.iosSafari,
    android: D.android,
    canPrompt: D.canPrompt,
    prompt: D.prompt,

    shareIcon: SHARE_SVG,

    /** Redundant while the install page itself is open. */
    hide: hideBanner,

    /** Nudge iOS Safari users once; they have no other way to discover this. */
    maybeBanner: function () {
      if (D.standalone() || S.get('install:dismissed', false) || S.get('installed', false)) return;
      if (!D.iosSafari()) return;
      if (location.hash === '#/install') return;
      setTimeout(showBanner, 1200);   // let the page settle first
    }
  };
})(window);
