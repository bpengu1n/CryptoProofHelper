/* This app's localStorage instance. The guarded get/set implementation
 * lives in vendor/puzzlepieces/js/local-store — change it there, not here.
 */
(function (root) {
  'use strict';
  root.CPStore = root.LocalStore('cph:');
})(window);
