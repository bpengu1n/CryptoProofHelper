/* localStorage with guards: private mode and blocked site data must not break the app. */
(function (root) {
  'use strict';
  var K = 'cph:';
  function get(k, dflt) {
    try {
      var v = localStorage.getItem(K + k);
      return v == null ? dflt : JSON.parse(v);
    } catch (e) { return dflt; }
  }
  function set(k, v) {
    try { localStorage.setItem(K + k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }
  root.CPStore = { get: get, set: set };
})(window);
