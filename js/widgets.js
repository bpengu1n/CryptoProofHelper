/* Interactive number-theory widgets for the course chapters.
 * A section opts in with `widget: 'key'`; app.js calls CPWidgets.html(key)
 * while rendering and CPWidgets.wire(main) once the DOM is in place.
 * All arithmetic uses plain JS numbers, so every input is capped to keep
 * intermediate products below 2^53.
 */
(function (root) {
  'use strict';

  var M = root.MathRenderer, S = root.CPStore;
  function T(s) { return M.text(s); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                                   .replace(/"/g,'&quot;'); }

  /* ---------------------------- arithmetic ---------------------------- */

  function mod(a, n) { return ((a % n) + n) % n; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function powmod(b, e, n) {
    var r = 1 % n; b = mod(b, n);
    while (e > 0) {
      if (e % 2 === 1) r = (r * b) % n;
      b = (b * b) % n; e = Math.floor(e / 2);
    }
    return r;
  }
  /* Extended Euclid on (n, a): rows of r = s*n + t*a, ending with r = 0. */
  function egcdRows(n, a) {
    var rows = [{ r: n, s: 1, t: 0, q: null }, { r: a, s: 0, t: 1, q: null }];
    while (rows[rows.length - 1].r !== 0) {
      var p = rows[rows.length - 2], c = rows[rows.length - 1], q = Math.floor(p.r / c.r);
      c.q = q;
      rows.push({ r: p.r - q * c.r, s: p.s - q * c.s, t: p.t - q * c.t, q: null });
    }
    return rows;
  }
  function inverse(a, n) {
    var rows = egcdRows(n, mod(a, n)), last = rows[rows.length - 2];
    return last.r === 1 ? mod(last.t, n) : null;
  }
  function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (var d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
    return true;
  }
  function factorize(n) {
    var f = [], d = 2;
    while (d * d <= n) {
      if (n % d === 0) { var k = 0; while (n % d === 0) { n /= d; k++; } f.push({ p: d, k: k }); }
      d += d === 2 ? 1 : 2;
    }
    if (n > 1) f.push({ p: n, k: 1 });
    return f;
  }
  function phi(n) {
    var r = n;
    factorize(n).forEach(function (f) { r = r / f.p * (f.p - 1); });
    return r;
  }
  function order(a, n) {
    if (gcd(a, n) !== 1) return null;
    var x = mod(a, n), k = 1;
    while (x !== 1 % n) { x = (x * a) % n; k++; }
    return k;
  }
  function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function primesIn(lo, hi) { var p = []; for (var i = lo; i <= hi; i++) if (isPrime(i)) p.push(i); return p; }
  function generators(p) {
    var qs = factorize(p - 1).map(function (f) { return f.p; }), g = [];
    for (var a = 2; a < p; a++) {
      var ok = true;
      for (var i = 0; i < qs.length; i++) if (powmod(a, (p - 1) / qs[i], p) === 1) { ok = false; break; }
      if (ok) g.push(a);
    }
    if (p === 2) g.push(1);
    return g;
  }
  function factorTeX(n) {
    return factorize(n).map(function (f) { return f.p + (f.k > 1 ? '^{' + f.k + '}' : ''); }).join(' \\cdot ');
  }
  function binary(x) { return x.toString(2); }
  function paren(x) { return x < 0 ? '(' + x + ')' : String(x); }

  /* ------------------------------- DOM -------------------------------- */

  function field(name, label, val, w) {
    return '<label class="wg-f"><span>' + T(label) + '</span>' +
           '<input type="text" inputmode="numeric" autocomplete="off" data-f="' + name + '" value="' + val + '"' +
           (w ? ' style="width:' + w + '"' : '') + '></label>';
  }
  function box(key, title, inner) {
    return '<div class="wg" data-wg="' + key + '"><div class="wg-h"><span class="wg-tag">Try it</span>' +
           esc(title) + '</div>' + inner + '</div>';
  }
  function q(el, sel) { return el.querySelector(sel); }
  function qa(el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); }
  /* Reads an integer field; returns null (and marks the field) when out of range. */
  function intOf(el, name, lo, hi) {
    var inp = q(el, '[data-f="' + name + '"]'), s = String(inp.value).replace(/[\s,]/g, '').replace(/−/g, '-');
    var v = /^-?\d+$/.test(s) ? parseInt(s, 10) : NaN;
    var ok = !isNaN(v) && v >= lo && v <= hi;
    inp.className = ok ? '' : 'bad';
    return ok ? v : null;
  }
  function onInput(el, fn) {
    qa(el, 'input[data-f]').forEach(function (i) { i.addEventListener('input', fn); });
  }
  function alive(el) { return document.body.contains(el); }
  function warn(msg) { return '<p class="wg-warn">' + T(msg) + '</p>'; }

  /* A ring of labelled nodes; `cls` maps index -> class name. */
  function ringSVG(n, label, cls, arcs) {
    var R = 92, C = 120, rr = n > 20 ? 9 : n > 12 ? 11 : 13, fs = n > 20 ? 8 : n > 12 ? 10 : 11;
    var s = '<svg class="wg-ring" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="120" cy="120" r="' + R + '" class="track"/>';
    function pos(i) {
      var ang = -Math.PI / 2 + 2 * Math.PI * i / n;
      return [C + R * Math.cos(ang), C + R * Math.sin(ang)];
    }
    (arcs || []).forEach(function (a) {
      var p0 = pos(a[0]), p1 = pos(a[1]);
      s += '<line x1="' + p0[0].toFixed(1) + '" y1="' + p0[1].toFixed(1) + '" x2="' + p1[0].toFixed(1) +
           '" y2="' + p1[1].toFixed(1) + '" class="chord"/>';
    });
    for (var i = 0; i < n; i++) {
      var p = pos(i);
      s += '<g class="node ' + (cls[i] || '') + '"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) +
           '" r="' + rr + '"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + fs * 0.36).toFixed(1) +
           '" text-anchor="middle" font-size="' + fs + '">' + label(i) + '</text></g>';
    }
    return s + '</svg>';
  }

  /* Runs `frames` (an array of functions) one per tick; cancels when the widget leaves the page. */
  function player(el) {
    var timer = null;
    return {
      play: function (frames, ms, done) {
        this.stop(); var i = 0;
        timer = setInterval(function () {
          if (!alive(el) || i >= frames.length) { clearInterval(timer); timer = null; if (alive(el) && done) done(); return; }
          frames[i++]();
        }, ms);
      },
      stop: function () { if (timer) clearInterval(timer); timer = null; }
    };
  }

  /* A table whose rows reveal one at a time. */
  function stepper(el, outSel) {
    var st = { rows: [], shown: 0, foot: '' };
    function paint() {
      var out = q(el, outSel), h = st.head;
      for (var i = 0; i < st.shown && i < st.rows.length; i++) h += st.rows[i];
      h += '</tbody></table></div>';
      if (st.shown >= st.rows.length) h += st.foot;
      else h += '<p class="wg-dim">' + (st.rows.length - st.shown) + ' more step' + (st.rows.length - st.shown > 1 ? 's' : '') + '…</p>';
      out.innerHTML = h;
      var stepBtn = q(el, '[data-act=step]');
      if (stepBtn) stepBtn.disabled = st.shown >= st.rows.length;
    }
    st.set = function (head, rows, foot, shown) { st.head = head; st.rows = rows; st.foot = foot; st.shown = shown; paint(); };
    st.step = function () { if (st.shown < st.rows.length) { st.shown++; paint(); } };
    st.all = function () { st.shown = st.rows.length; paint(); };
    return st;
  }

  var W = {};

  /* ------------------------- 1. modular clock ------------------------- */

  W['mod-clock'] = {
    title: 'The modular clock',
    html: function () {
      return '<div class="wg-in">' + field('a', '$a$', 9) + field('b', '$b$', 5) + field('n', '$N$', 12) + '</div>' +
        '<div class="wg-seg" role="group" aria-label="Operation">' +
        '<button data-op="+" class="on">a + b</button><button data-op="-">a − b</button><button data-op="*">a × b</button></div>' +
        '<div class="wg-fig"></div><div class="wg-out"></div>' +
        '<p class="wg-dim">' + T('Addition walks $b$ steps clockwise from $a$. Multiplication starts at $0$ and takes $b$ jumps of size $a$. Try negative numbers, and numbers much bigger than $N$.') + '</p>';
    },
    init: function (el) {
      var op = '+', pl = player(el);
      function draw(n, marks, arcs) {
        q(el, '.wg-fig').innerHTML = ringSVG(n, function (i) { return i; }, marks, arcs);
      }
      function run(animate) {
        var a = intOf(el, 'a', -999999, 999999), b = intOf(el, 'b', -999999, 999999), n = intOf(el, 'n', 2, 30);
        pl.stop();
        if (a === null || b === null || n === null) {
          q(el, '.wg-out').innerHTML = warn('Use integers with $|a|, |b| < 10^6$ and $2 \\le N \\le 30$.'); return;
        }
        var raw = op === '+' ? a + b : op === '-' ? a - b : a * b;
        var r = mod(raw, n), qt = (raw - r) / n, sym = op === '+' ? '+' : op === '-' ? '-' : '\\cdot';
        var final = {}; final[r] = 'r';
        q(el, '.wg-out').innerHTML = '<p>' + T('$' + paren(a) + ' ' + sym + ' ' + paren(b) + ' = ' + raw + '$, and $' + raw +
          ' = ' + paren(qt) + ' \\cdot ' + n + ' + ' + r + '$, so the answer is $' + r + '$:') + '</p>' +
          '<p class="wg-big">' + T('$' + paren(a) + ' ' + sym + ' ' + paren(b) + ' \\equiv ' + r + ' \\pmod{' + n + '}$') + '</p>';

        /* Build the walk around the clock. */
        var path = [], start, step, count;
        if (op === '*') { start = 0; step = mod(a, n); count = Math.abs(b); if (b < 0) step = mod(-a, n); }
        else { start = mod(a, n); step = op === '+' ? (b >= 0 ? 1 : n - 1) : (b >= 0 ? n - 1 : 1); count = Math.abs(b); }
        if (!animate || count > 3 * n || count === 0) {
          var m = {}; if (op !== '*') m[mod(a, n)] = 'a'; m[r] = 'r'; draw(n, m); return;
        }
        var cur = start, frames = [], arcs = [];
        path.push(cur);
        for (var i = 0; i < count; i++) {
          (function (from, to) {
            frames.push(function () {
              if (op === '*') arcs.push([from, to]);
              var m = {}; if (op !== '*') m[start] = 'a'; m[to] = 'cur'; draw(n, m, arcs);
            });
          })(cur, (cur + step) % n);
          cur = (cur + step) % n;
        }
        var s0 = {}; s0[start] = op === '*' ? 'cur' : 'a'; draw(n, s0);
        pl.play(frames, op === '*' ? 380 : 170, function () {
          var m = {}; if (op !== '*') m[start] = 'a'; m[r] = 'r'; draw(n, m, arcs);
        });
      }
      qa(el, '[data-op]').forEach(function (b) {
        b.onclick = function () {
          op = b.getAttribute('data-op');
          qa(el, '[data-op]').forEach(function (x) { x.className = x === b ? 'on' : ''; });
          run(true);
        };
      });
      onInput(el, function () { run(false); });
      run(false);
    }
  };

  /* ------------------------- 2. Euclid's algorithm -------------------- */

  W['euclid'] = {
    title: "Euclid's algorithm, one division at a time",
    html: function () {
      return '<div class="wg-in">' + field('a', '$a$', 252, '7em') + field('b', '$b$', 105, '7em') + '</div>' +
        '<div class="wg-btns"><button class="btn sm" data-act="step">Next step</button>' +
        '<button class="btn sm ghost" data-act="all">Show all</button></div><div class="wg-out"></div>';
    },
    init: function (el) {
      var st = stepper(el, '.wg-out');
      function build() {
        var a = intOf(el, 'a', 1, 1e12), b = intOf(el, 'b', 0, 1e12);
        if (a === null || b === null) { q(el, '.wg-out').innerHTML = warn('Use whole numbers $a \\ge 1$, $b \\ge 0$, up to $10^{12}$.'); return; }
        var rows = [], chain = ['\\gcd(' + a + ', ' + b + ')'], x = a, y = b, k = 0;
        while (y !== 0) {
          var qt = Math.floor(x / y), r = x % y; k++;
          rows.push('<tr><td>' + k + '</td><td>' + T('$' + x + ' = ' + qt + ' \\cdot ' + y + ' + \\mathbf{' + r + '}$') +
                    '</td><td>' + T('$\\gcd(' + y + ', ' + r + ')$') + '</td></tr>');
          x = y; y = r; chain.push('\\gcd(' + x + ', ' + y + ')');
        }
        var bound = Math.max(1, Math.ceil(2 * Math.log(Math.max(2, Math.min(a, b))) / Math.LN2));
        var foot = '<p class="wg-big">' + T('$\\gcd(' + a + ', ' + b + ') = ' + x + '$') + '</p>' +
          '<p>' + T('The chain: $' + chain.join(' = ') + ' = ' + x + '$.') + '</p>' +
          (b ? '<p class="wg-dim">' + T(k + ' division' + (k > 1 ? 's' : '') + '. The remainder at least halves every two steps, so it can never take more than about $2 \\log_2 ' + Math.min(a, b) + ' \\approx ' + bound + '$.') + '</p>' : '');
        st.set('<div class="wg-scroll"><table class="wg-t"><thead><tr><th>#</th><th>divide</th><th>same gcd as</th></tr></thead><tbody>', rows, foot, 0);
      }
      q(el, '[data-act=step]').onclick = st.step;
      q(el, '[data-act=all]').onclick = st.all;
      onInput(el, build);
      build();
    }
  };

  /* --------------------- 3. extended Euclid / inverses ---------------- */

  W['egcd'] = {
    title: 'Extended Euclid: find an inverse',
    html: function () {
      return '<div class="wg-in">' + field('a', 'invert $a =$', 17, '6em') + field('n', 'modulo $N =$', 43, '7em') + '</div>' +
        '<div class="wg-btns"><button class="btn sm" data-act="step">Next row</button>' +
        '<button class="btn sm ghost" data-act="all">Show all</button></div><div class="wg-out"></div>' +
        '<p class="wg-dim">' + T('Every row keeps the invariant $r = s \\cdot N + t \\cdot a$. Each new row is the row two above, minus $q$ times the row above — exactly the division step of Euclid, done to all three columns at once.') + '</p>';
    },
    init: function (el) {
      var st = stepper(el, '.wg-out');
      function build() {
        var a = intOf(el, 'a', 1, 1e9), n = intOf(el, 'n', 2, 1e9);
        if (a === null || n === null) { q(el, '.wg-out').innerHTML = warn('Use $1 \\le a$ and $2 \\le N \\le 10^9$.'); return; }
        var ar = mod(a, n), rows = egcdRows(n, ar), html = [];
        rows.forEach(function (r, i) {
          html.push('<tr' + (r.r === 0 ? ' class="dim"' : '') + '><td>' + (r.q === null ? '' : r.q) + '</td><td><b>' + r.r + '</b></td><td>' + r.s + '</td><td>' + r.t +
                    '</td><td>' + T('$' + r.s + ' \\cdot ' + n + ' + ' + paren(r.t) + ' \\cdot ' + ar + '$') + '</td></tr>');
        });
        var last = rows[rows.length - 2], d = last.r, foot;
        var pre = ar !== a ? '<p class="wg-dim">' + T('First reduce: $' + a + ' \\bmod ' + n + ' = ' + ar + '$.') + '</p>' : '';
        if (d === 1) {
          var inv = mod(last.t, n);
          foot = '<p>' + T('Last nonzero row: $1 = ' + last.s + ' \\cdot ' + n + ' + ' + paren(last.t) + ' \\cdot ' + ar + '$. Reduce mod $' + n + '$ and the $N$ term vanishes:') + '</p>' +
            '<p class="wg-big">' + T('$' + ar + '^{-1} \\equiv ' + paren(last.t) + ' \\equiv ' + inv + ' \\pmod{' + n + '}$') + '</p>' +
            '<p class="wg-ok">' + T('Check: $' + ar + ' \\cdot ' + inv + ' = ' + (ar * inv) + ' = ' + Math.floor(ar * inv / n) + ' \\cdot ' + n + ' + 1$ ✓') + '</p>';
        } else {
          foot = '<p class="wg-big">' + T('$\\gcd(' + ar + ', ' + n + ') = ' + d + ' \\neq 1$') + '</p>' +
            '<p>' + T('No inverse exists. Every $s \\cdot ' + n + ' + t \\cdot ' + ar + '$ is a multiple of $' + d + '$, so it can never equal $1$.') + '</p>';
        }
        st.set(pre + '<div class="wg-scroll"><table class="wg-t"><thead><tr><th>' + T('$q$') + '</th><th>' + T('$r$') + '</th><th>' + T('$s$') +
               '</th><th>' + T('$t$') + '</th><th>check</th></tr></thead><tbody>', html, foot, 2);
      }
      q(el, '[data-act=step]').onclick = st.step;
      q(el, '[data-act=all]').onclick = st.all;
      onInput(el, build);
      build();
    }
  };

  /* --------------------------- 4. Z_N^* explorer ---------------------- */

  W['units'] = {
    title: 'Who has an inverse?',
    html: function () {
      return '<div class="wg-in">' + field('n', '$N =$', 20) + '</div><div class="wg-sum"></div>' +
        '<div class="wg-grid"></div><div class="wg-out"><p class="wg-dim">Tap any number.</p></div>';
    },
    init: function (el) {
      var n = 20, sel = null;
      function paint() {
        var h = '', inv = sel !== null && gcd(sel, n) === 1 ? inverse(sel, n) : null;
        for (var x = 0; x < n; x++) {
          var c = gcd(x, n) === 1 ? 'u' : '';
          if (x === sel) c += ' sel'; else if (x === inv) c += ' pair';
          h += '<button class="wg-cell ' + c + '" data-x="' + x + '">' + x + '</button>';
        }
        q(el, '.wg-grid').innerHTML = h;
        qa(el, '.wg-cell').forEach(function (b) {
          b.onclick = function () { sel = parseInt(b.getAttribute('data-x'), 10); paint(); explain(); };
        });
      }
      function explain() {
        var out = q(el, '.wg-out'), x = sel, d = gcd(x, n);
        if (d === 1) {
          var inv = inverse(x, n), units = [], row = [];
          for (var k = 1; k < n; k++) if (gcd(k, n) === 1) { units.push(k); row.push((x * k) % n); }
          out.innerHTML = '<p class="wg-big">' + T('$' + x + '^{-1} \\equiv ' + inv + ' \\pmod{' + n + '}$') + '</p>' +
            '<p>' + T('$' + x + ' \\cdot ' + inv + ' = ' + (x * inv) + ' \\equiv 1$. Multiplying every unit by $' + x + '$ just shuffles them:') + '</p>' +
            '<p class="wg-mono">' + units.join(' ') + '<br>→ ' + row.join(' ') + '</p>' +
            '<p class="wg-dim">The same numbers in a new order. That shuffle is the heart of the proof of Euler\'s theorem below.</p>';
        } else {
          var mult = [];
          for (var j = 0; j < n; j++) mult.push((x * j) % n);
          var seen = mult.filter(function (v, i) { return mult.indexOf(v) === i; }).sort(function (u, v) { return u - v; });
          out.innerHTML = '<p class="wg-big">' + T('$\\gcd(' + x + ', ' + n + ') = ' + d + '$ — no inverse') + '</p>' +
            '<p>' + T('Every multiple $' + x + ' \\cdot k \\bmod ' + n + '$ lands on a multiple of $' + d + '$:') + '</p>' +
            '<p class="wg-mono">{ ' + seen.join(', ') + ' }</p><p class="wg-dim">' + T('$1$ is never hit, so nothing times $' + x + '$ gives $1$.') + '</p>';
        }
      }
      function build() {
        var v = intOf(el, 'n', 2, 120);
        if (v === null) { q(el, '.wg-sum').innerHTML = warn('Pick $2 \\le N \\le 120$.'); return; }
        n = v; sel = null;
        var f = factorize(n), ph = phi(n);
        var formula = f.map(function (x) { return '\\left(1 - \\frac{1}{' + x.p + '}\\right)'; }).join('');
        q(el, '.wg-sum').innerHTML = '<p>' + T('$' + n + (f.length === 1 && f[0].k === 1 ? '$ is prime' : ' = ' + factorTeX(n) + '$') +
          '. Highlighted: the units, $\\gcd(x, ' + n + ') = 1$. There are $\\varphi(' + n + ') = ' + ph + '$ of them.') + '</p>' +
          '<p class="wg-dim">' + T('$\\varphi(' + n + ') = ' + n + ' ' + formula + ' = ' + ph + '$') + '</p>';
        q(el, '.wg-out').innerHTML = '<p class="wg-dim">Tap any number.</p>';
        paint();
      }
      onInput(el, build);
      build();
    }
  };

  /* ------------------------ 5. powers and order ----------------------- */

  W['powers'] = {
    title: 'Powers go round in cycles',
    html: function () {
      return '<div class="wg-in">' + field('a', '$a =$', 3) + field('n', '$N =$', 7) + field('x', 'exponent $x =$', 1000, '8em') + '</div>' +
        '<div class="wg-fig"></div><div class="wg-out"></div>';
    },
    init: function (el) {
      function build() {
        var a = intOf(el, 'a', 0, 99999), n = intOf(el, 'n', 2, 2000), x = intOf(el, 'x', 0, 1e15);
        var out = q(el, '.wg-out'), fig = q(el, '.wg-fig');
        if (a === null || n === null || x === null) { fig.innerHTML = ''; out.innerHTML = warn('Use $0 \\le a$, $2 \\le N \\le 2000$, $0 \\le x \\le 10^{15}$.'); return; }
        var am = mod(a, n), seq = [1 % n], v = 1 % n;
        while (true) {
          v = (v * am) % n;
          if (seq.indexOf(v) >= 0) { seq.push(v); break; }
          seq.push(v);
        }
        var back = seq.indexOf(seq[seq.length - 1]), cyc = seq.length - 1 - back, ph = phi(n);
        function chip(val, i) {
          var c = i === seq.length - 1 ? 'rep' : val === 1 ? 'one' : '';
          return '<span class="wg-chip ' + c + '"><sup>' + am + '<sup>' + i + '</sup></sup>' + val + '</span>';
        }
        var shown = seq.length > 41 ? seq.slice(0, 40) : seq;
        var chips = shown.map(chip).join('<span class="wg-arr">→</span>') +
          (shown.length < seq.length ? '<span class="wg-arr">→ … →</span>' + chip(seq[seq.length - 1], seq.length - 1) : '');
        fig.innerHTML = '<div class="wg-chips">' + chips + '</div>';
        var h = '';
        if (gcd(am, n) === 1) {
          var k = cyc;
          h += '<p>' + T('The powers return to $1$ after $' + k + '$ steps, so the **order** of $' + am + '$ mod $' + n + '$ is $' + k + '$.') + '</p>' +
            '<p>' + T('$\\varphi(' + n + ') = ' + ph + '$, and $' + k + ' \\mid ' + ph + '$ (' + ph + ' $= ' + (ph / k) + ' \\cdot ' + k + '$), as Lagrange\'s theorem promises.') + '</p>' +
            '<p class="wg-ok">' + T('Euler: $' + am + '^{' + ph + '} \\equiv ' + powmod(am, ph, n) + ' \\pmod{' + n + '}$ ✓') + '</p>' +
            '<p>' + T('So exponents only matter mod $' + k + '$: $' + am + '^{' + x + '} = ' + am + '^{' + x + ' \\bmod ' + k + '} = ' + am + '^{' + (x % k) + '} \\equiv \\mathbf{' + powmod(am, x, n) + '}$.') + '</p>';
        } else {
          h += '<p>' + T('$\\gcd(' + am + ', ' + n + ') = ' + gcd(am, n) + '$, so $' + am + '$ is not a unit: its powers ' + (back > 0 ? 'fall into a loop that never contains $1$' : 'never return to $1$') +
               ' (loop length $' + cyc + '$). Euler\'s theorem only covers $\\Z_N^*$.') + '</p>' +
            '<p>' + T('$' + am + '^{' + x + '} \\equiv \\mathbf{' + powmod(am, x, n) + '} \\pmod{' + n + '}$') + '</p>';
        }
        /* Fermat test as a bonus: it is a witness of compositeness. */
        if (am > 1) {
          var f = powmod(am, n - 1, n), prime = isPrime(n);
          h += '<p class="wg-dim">' + T('Fermat test: $' + am + '^{' + (n - 1) + '} \\bmod ' + n + ' = ' + f + '$. ') +
            (f !== 1 ? T('Not $1$, so $' + n + '$ is certainly **not prime** — and we learned it without factoring.')
                     : prime ? T('$' + n + '$ is prime, so this is always $1$.')
                             : T('$1$ even though $' + n + '$ is composite: $' + am + '$ is a *Fermat liar* for $' + n + '$. (Try $a = 2$, $N = 341$, or any $a$ coprime to $561$.)')) + '</p>';
        }
        out.innerHTML = h;
      }
      onInput(el, build);
      build();
    }
  };

  /* ------------------------ 6. square-and-multiply -------------------- */

  W['modexp'] = {
    title: 'Square-and-multiply',
    html: function () {
      return '<div class="wg-in">' + field('g', 'base', 5, '6em') + field('x', 'exponent', 117, '8em') + field('n', 'modulus', 19, '7em') + '</div>' +
        '<div class="wg-btns"><button class="btn sm" data-act="step">Next bit</button>' +
        '<button class="btn sm ghost" data-act="all">Show all</button></div><div class="wg-out"></div>';
    },
    init: function (el) {
      var st = stepper(el, '.wg-out');
      function build() {
        var g = intOf(el, 'g', 0, 1e7), x = intOf(el, 'x', 1, Math.pow(2, 52)), n = intOf(el, 'n', 2, 1e7);
        if (g === null || x === null || n === null) { q(el, '.wg-out').innerHTML = warn('Base and modulus up to $10^7$, exponent from $1$ to $2^{52}$.'); return; }
        var bits = binary(x), r = 1 % n, gm = mod(g, n), rows = [], sq = 0, mu = 0, sofar = '';
        for (var i = 0; i < bits.length; i++) {
          var b = bits.charAt(i), r2 = (r * r) % n, line;
          sofar += b;
          if (i === 0) { r = gm; line = 'start with $' + gm + '$'; }
          else {
            sq++; line = '$' + r + '^2 = ' + (r * r) + ' \\equiv ' + r2 + '$';
            r = r2;
            if (b === '1') { mu++; line += ', then $\\times ' + gm + '$: $' + (r * gm) + ' \\equiv ' + ((r * gm) % n) + '$'; r = (r * gm) % n; }
          }
          rows.push('<tr><td class="wg-bit b' + b + '">' + b + '</td><td>' + (i === 0 ? '' : b === '1' ? 'square, multiply' : 'square') + '</td><td>' + T(line) +
                    '</td><td>' + T('$' + gm + '^{' + parseInt(sofar, 2) + '} \\equiv \\mathbf{' + r + '}$') + '</td></tr>');
        }
        var foot = '<p class="wg-big">' + T('$' + g + '^{' + x + '} \\equiv ' + r + ' \\pmod{' + n + '}$') + '</p>' +
          '<p>' + T('$' + sq + '$ squarings and $' + mu + '$ multiplications — $' + (sq + mu) + '$ operations. Multiplying by $' + gm + '$ over and over would take $' + (x - 1) + '$.') + '</p>' +
          '<p class="wg-dim">' + T('Reading bits left to right, squaring doubles the exponent so far and multiplying adds $1$ — the last column shows the exponent being built up. For a 2048-bit exponent this is about $3000$ operations instead of $2^{2048}$.') + '</p>';
        st.set('<p>' + T('$' + x + ' = ' + bits + '_2$ (' + bits.length + ' bits)') + '</p><div class="wg-scroll"><table class="wg-t"><thead><tr><th>bit</th><th>do</th><th>work</th><th>so far</th></tr></thead><tbody>', rows, foot, 1);
      }
      q(el, '[data-act=step]').onclick = st.step;
      q(el, '[data-act=all]').onclick = st.all;
      onInput(el, build);
      build();
    }
  };

  /* -------------------- 7. Chinese Remainder Theorem ------------------ */

  W['crt'] = {
    title: 'The CRT grid',
    html: function () {
      return '<div class="wg-in">' + field('n1', '$N_1 =$', 3) + field('n2', '$N_2 =$', 5) + '</div>' +
        '<div class="wg-in">' + field('r1', '$x \\equiv$', 2) + '<span class="wg-lbl">' + T('$\\pmod{N_1}$') + '</span>' +
        field('r2', '$x \\equiv$', 3) + '<span class="wg-lbl">' + T('$\\pmod{N_2}$') + '</span></div>' +
        '<div class="wg-btns"><button class="btn sm ghost" data-act="walk">Count x = 0, 1, 2, … into the grid</button></div>' +
        '<div class="wg-fig"></div><div class="wg-out"></div>';
    },
    init: function (el) {
      var pl = player(el), cur = null;
      function grid(n1, n2, upTo, target) {
        var cells = {}, x;
        for (x = 0; x < upTo; x++) { var k = (x % n1) + ',' + (x % n2); (cells[k] = cells[k] || []).push(x); }
        var h = '<div class="wg-scroll"><table class="wg-t wg-crt"><thead><tr><th>' + T('$\\bmod N_1 \\backslash \\bmod N_2$') + '</th>';
        for (var j = 0; j < n2; j++) h += '<th>' + j + '</th>';
        h += '</tr></thead><tbody>';
        for (var i = 0; i < n1; i++) {
          h += '<tr><th>' + i + '</th>';
          for (j = 0; j < n2; j++) {
            var v = cells[i + ',' + j] || [], c = [];
            if (target && target[0] === i && target[1] === j) c.push('tgt');
            if (v.length > 1) c.push('clash');
            if (!target && v.length && v[v.length - 1] === upTo - 1) c.push('new');
            h += '<td class="' + c.join(' ') + '">' + v.join('/') + '</td>';
          }
          h += '</tr>';
        }
        return h + '</tbody></table></div>';
      }
      function read() {
        var n1 = intOf(el, 'n1', 2, 1000), n2 = intOf(el, 'n2', 2, 1000), r1 = intOf(el, 'r1', -1e6, 1e6), r2 = intOf(el, 'r2', -1e6, 1e6);
        if (n1 === null || n2 === null || r1 === null || r2 === null) return null;
        return { n1: n1, n2: n2, r1: mod(r1, n1), r2: mod(r2, n2) };
      }
      function build() {
        pl.stop();
        cur = read();
        var fig = q(el, '.wg-fig'), out = q(el, '.wg-out');
        if (!cur) { fig.innerHTML = ''; out.innerHTML = warn('Moduli from $2$ to $1000$.'); return; }
        var n1 = cur.n1, n2 = cur.n2, r1 = cur.r1, r2 = cur.r2, N = n1 * n2, d = gcd(n1, n2), small = n1 <= 16 && n2 <= 16;
        q(el, '[data-act=walk]').disabled = !small;
        fig.innerHTML = small ? grid(n1, n2, N, [r1, r2]) : '<p class="wg-dim">(Grid shown when both moduli are at most 16.)</p>';
        if (d === 1) {
          var i1 = inverse(n2, n1), i2 = inverse(n1, n2), x = mod(r1 * n2 * i1 + r2 * n1 * i2, N);
          out.innerHTML = '<p>' + T('$\\gcd(' + n1 + ', ' + n2 + ') = 1$, so every cell holds exactly one $x \\in \\Z_{' + N + '}$. Building it:') + '</p>' +
            '<ul class="tight"><li>' + T('$' + n2 + '^{-1} \\bmod ' + n1 + ' = ' + i1 + '$, so $e_1 = ' + n2 + ' \\cdot ' + i1 + ' = ' + (n2 * i1) + '$ is $\\equiv 1 \\pmod{' + n1 + '}$ and $\\equiv 0 \\pmod{' + n2 + '}$.') + '</li>' +
            '<li>' + T('$' + n1 + '^{-1} \\bmod ' + n2 + ' = ' + i2 + '$, so $e_2 = ' + n1 + ' \\cdot ' + i2 + ' = ' + (n1 * i2) + '$ is $\\equiv 0 \\pmod{' + n1 + '}$ and $\\equiv 1 \\pmod{' + n2 + '}$.') + '</li>' +
            '<li>' + T('$x = ' + r1 + ' e_1 + ' + r2 + ' e_2 = ' + (r1 * n2 * i1 + r2 * n1 * i2) + ' \\equiv \\mathbf{' + x + '} \\pmod{' + N + '}$.') + '</li></ul>' +
            '<p class="wg-ok">' + T('Check: $' + x + ' \\bmod ' + n1 + ' = ' + (x % n1) + '$, $' + x + ' \\bmod ' + n2 + ' = ' + (x % n2) + '$ ✓') + '</p>';
        } else {
          var sols = [];
          for (var y = 0; y < N && sols.length < 12; y++) if (y % n1 === r1 && y % n2 === r2) sols.push(y);
          out.innerHTML = '<p>' + T('$\\gcd(' + n1 + ', ' + n2 + ') = ' + d + '$, so the CRT does **not** apply. Counting $0, 1, 2, \\ldots$ only reaches $\\lcm = ' + (N / d) + '$ cells before repeating — some cells get two numbers, others none.') + '</p>' +
            '<p>' + (sols.length ? T('This system happens to be solvable (because $' + r1 + ' \\equiv ' + r2 + ' \\pmod{' + d + '}$): $x \\in \\{' + sols.join(', ') + '\\}$ — more than one answer mod $' + N + '$.')
                                 : T('This system has **no** solution: it needs $' + r1 + ' \\equiv ' + r2 + ' \\pmod{' + d + '}$.')) + '</p>';
        }
      }
      q(el, '[data-act=walk]').onclick = function () {
        if (!cur) return;
        var fig = q(el, '.wg-fig'), frames = [], N = cur.n1 * cur.n2;
        for (var u = 1; u <= N; u++) (function (u) { frames.push(function () { fig.innerHTML = grid(cur.n1, cur.n2, u, null); }); })(u);
        fig.innerHTML = grid(cur.n1, cur.n2, 0, null);
        pl.play(frames, N > 120 ? 40 : 110, function () { fig.innerHTML = grid(cur.n1, cur.n2, N, [cur.r1, cur.r2]); });
      };
      onInput(el, build);
      build();
    }
  };

  /* ------------------ 8. generators and discrete log ------------------ */

  W['generators'] = {
    title: 'Generators and the discrete log',
    html: function () {
      return '<div class="wg-in">' + field('p', 'prime $p =$', 11) + '</div><div class="wg-sum"></div>' +
        '<div class="wg-grid"></div><div class="wg-fig"></div><div class="wg-out"><p class="wg-dim">Tap an element to see the subgroup it generates.</p></div>' +
        '<div class="wg-sub"><div class="wg-h2">Discrete-log challenge</div><div class="wg-dl"></div>' +
        '<div class="wg-btns"><button class="btn sm" data-act="new">New challenge</button>' +
        '<button class="btn sm ghost" data-act="brute">Brute-force it</button></div></div>';
    },
    init: function (el) {
      var p = 11, gens = [], sel = null, ch = null, pl = player(el);
      function paint() {
        var members = {};
        if (sel !== null) { var v = 1; do { members[v] = 1; v = (v * sel) % p; } while (v !== 1); }
        var h = '';
        for (var a = 1; a < p; a++) {
          var c = gens.indexOf(a) >= 0 ? 'u' : '';
          if (a === sel) c += ' sel'; else if (members[a]) c += ' pair';
          h += '<button class="wg-cell ' + c + '" data-x="' + a + '">' + a + '<small>' + order(a, p) + '</small></button>';
        }
        q(el, '.wg-grid').innerHTML = h;
        qa(el, '.wg-grid .wg-cell').forEach(function (b) {
          b.onclick = function () { sel = parseInt(b.getAttribute('data-x'), 10); paint(); explain(); };
        });
      }
      function explain() {
        var g = sel, k = order(g, p), pw = [], v = 1, qs = factorize(p - 1).map(function (f) { return f.p; });
        for (var i = 0; i < k; i++) { pw.push(v); v = (v * g) % p; }
        var marks = {}; pw.forEach(function (x, i) { marks[i] = i === 0 ? 'a' : ''; });
        q(el, '.wg-fig').innerHTML = k <= 30 ? ringSVG(k, function (i) { return pw[i]; }, marks) : '';
        var tests = qs.map(function (qq) {
          var r = powmod(g, (p - 1) / qq, p);
          return '$' + g + '^{' + (p - 1) + '/' + qq + '} = ' + g + '^{' + ((p - 1) / qq) + '} \\equiv ' + r + '$' + (r === 1 ? ' ✗' : ' ✓');
        });
        q(el, '.wg-out').innerHTML = '<p>' + T('$\\langle ' + g + ' \\rangle = \\{' + pw.slice().sort(function (x, y) { return x - y; }).join(', ') + '\\}$ has ' + k + ' element' + (k > 1 ? 's' : '') +
          ' — read the ring clockwise from $1$ to see $' + g + '^0, ' + g + '^1, ' + g + '^2, \\ldots$') + '</p>' +
          '<p>' + (k === p - 1 ? T('Order $p - 1 = ' + (p - 1) + '$: $' + g + '$ is a **generator**.') : T('Order $' + k + '$, a proper divisor of $' + (p - 1) + '$: not a generator.')) + '</p>' +
          '<p class="wg-dim">' + T('Generator test without listing powers — check $g^{(p-1)/q} \\neq 1$ for each prime $q \\mid p - 1$: ' + tests.join('; ')) + '</p>';
      }
      function challenge() {
        pl.stop();
        var g = pick(gens), x = rnd(1, p - 2);
        ch = { g: g, x: x, X: powmod(g, x, p), tries: 0 };
        q(el, '.wg-dl').innerHTML = '<p>' + T('Find $x$ with $' + g + '^x \\equiv ' + ch.X + ' \\pmod{' + p + '}$, where $0 \\le x < ' + (p - 1) + '$.') + '</p>' +
          '<div class="wg-in">' + field('guess', '$x =$', '', '6em') + '<button class="btn sm" data-act="guess">Check</button></div><div class="wg-dlout"></div>';
        var inp = q(el, '[data-f=guess]');
        function check() {
          var v = intOf(el, 'guess', 0, p - 2), o = q(el, '.wg-dlout');
          if (v === null) { o.innerHTML = warn('Enter a whole number from $0$ to $' + (p - 2) + '$.'); return; }
          ch.tries++;
          o.innerHTML = v === ch.x
            ? '<p class="wg-ok">' + T('Yes: $' + g + '^{' + v + '} \\equiv ' + ch.X + '$. Found in ' + ch.tries + ' tr' + (ch.tries > 1 ? 'ies' : 'y') + '.') + '</p>'
            : '<p class="wg-bad">' + T('$' + g + '^{' + v + '} \\equiv ' + powmod(g, v, p) + '$, not $' + ch.X + '$. Try again.') + '</p>';
        }
        q(el, '[data-act=guess]').onclick = check;
        inp.addEventListener('keydown', function (e) { if (e.keyCode === 13) check(); });
      }
      q(el, '[data-act=new]').onclick = challenge;
      q(el, '[data-act=brute]').onclick = function () {
        if (!ch) challenge();
        var o = q(el, '.wg-dlout'), frames = [], v = 1;
        for (var i = 0; i <= ch.x; i++) {
          (function (i, v) {
            frames.push(function () {
              o.innerHTML = '<p class="wg-mono">' + ch.g + '^' + i + ' ≡ ' + v + (v === ch.X ? '  ← found' : '') + '</p>';
            });
          })(i, v);
          v = (v * ch.g) % p;
        }
        pl.play(frames, Math.max(30, Math.min(220, 2400 / (ch.x + 1))), function () {
          o.innerHTML += '<p>' + T('$x = ' + ch.x + '$ after $' + (ch.x + 1) + '$ tries. Brute force needs up to $p - 1$ tries; with a 2048-bit $p$ that is about $2^{2048}$, and even the best known algorithms are hopeless at that size.') + '</p>';
        });
      };
      function build() {
        var v = intOf(el, 'p', 3, 199);
        pl.stop();
        if (v === null || !isPrime(v)) {
          q(el, '.wg-sum').innerHTML = warn('Pick a prime between $3$ and $199$.');
          q(el, '.wg-grid').innerHTML = ''; return;
        }
        p = v; gens = generators(p); sel = null; ch = null;
        q(el, '.wg-sum').innerHTML = '<p>' + T('$\\Z_{' + p + '}^*$ has $p - 1 = ' + (p - 1) + (isPrime(p - 1) ? '' : ' = ' + factorTeX(p - 1)) + '$ elements. Small numbers show each element\'s order — always a divisor of $' + (p - 1) +
          '$. Highlighted: the $\\varphi(' + (p - 1) + ') = ' + gens.length + '$ generators.') + '</p>';
        q(el, '.wg-fig').innerHTML = '';
        q(el, '.wg-out').innerHTML = '<p class="wg-dim">Tap an element to see the subgroup it generates.</p>';
        q(el, '.wg-dl').innerHTML = '<p class="wg-dim">Press “New challenge”.</p>';
        paint();
      }
      onInput(el, function (e) { if (e.target.getAttribute('data-f') === 'p') build(); });
      build();
    }
  };

  /* ------------------------ 9. quadratic residues --------------------- */

  W['qr'] = {
    title: 'Squares modulo a prime',
    html: function () {
      return '<div class="wg-in">' + field('p', 'prime $p =$', 13) + '</div><div class="wg-out"></div>';
    },
    init: function (el) {
      function build() {
        var p = intOf(el, 'p', 3, 199), out = q(el, '.wg-out');
        if (p === null || !isPrime(p)) { out.innerHTML = warn('Pick an odd prime up to $199$.'); return; }
        var h2 = (p - 1) / 2, sq = {}, rows = '', g = generators(p)[0], gx = '', x;
        for (x = 1; x < p; x++) sq[(x * x) % p] = 1;
        for (x = 1; x < p; x++) {
          var e = powmod(x, h2, p);
          rows += '<tr' + (sq[x] ? ' class="hi"' : '') + '><td>' + x + '</td><td>' + ((x * x) % p) + '</td><td>' + (e === 1 ? '1' : '−1') + '</td><td>' + (sq[x] ? 'square' : '') + '</td></tr>';
        }
        for (x = 0; x < p - 1 && x < 24; x++) {
          var v = powmod(g, x, p);
          gx += '<span class="wg-chip' + (sq[v] ? ' one' : '') + '"><sup>' + g + '<sup>' + x + '</sup></sup>' + v + '</span>';
        }
        var list = Object.keys(sq).map(Number).sort(function (a, b) { return a - b; });
        out.innerHTML = '<p>' + T('Exactly $(p-1)/2 = ' + h2 + '$ of the $' + (p - 1) + '$ units are squares: $\\{' + list.join(', ') + '\\}$. ' +
          'Euler\'s criterion: $a^{(p-1)/2} \\equiv 1$ for squares and $\\equiv -1$ for the rest.') + '</p>' +
          '<div class="wg-scroll wg-tall"><table class="wg-t"><thead><tr><th>' + T('$a$') + '</th><th>' + T('$a^2 \\bmod p$') + '</th><th>' + T('$a^{' + h2 + '}$') + '</th><th>' + T('is $a$ a square?') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
          '<p>' + T('With the generator $g = ' + g + '$, the squares are exactly the **even** powers:') + '</p><div class="wg-chips">' + gx + '</div>' +
          '<p class="wg-dim">' + T('So from $g^x$ alone anyone can learn whether $x$ is even — one bit of the secret exponent leaks for free.') + '</p>';
      }
      onInput(el, build);
      build();
    }
  };

  /* ------------------------ 10. factoring is slow --------------------- */

  W['factor'] = {
    title: 'Multiply in a blink, factor forever',
    html: function () {
      return '<div class="wg-in"><label class="wg-f"><span>digits in each prime</span><select data-f="d">' +
        '<option>3</option><option>4</option><option selected>5</option><option>6</option><option>7</option></select></label>' +
        '<button class="btn sm" data-act="new">New p, q</button></div>' +
        '<div class="wg-out"></div><div class="wg-btns"><button class="btn sm" data-act="go">Factor N by trial division</button></div>' +
        '<div class="wg-fig"></div>';
    },
    init: function (el) {
      var N = 0, run = 0;
      function fresh() {
        run++;
        var d = parseInt(q(el, '[data-f=d]').value, 10), lo = Math.pow(10, d - 1), hi = Math.pow(10, d) - 1, p, qq;
        do { p = rnd(lo, hi); } while (!isPrime(p));
        do { qq = rnd(lo, hi); } while (!isPrime(qq) || qq === p);
        N = p * qq;
        q(el, '.wg-out').innerHTML = '<p>' + T('$p = ' + p + '$, $q = ' + qq + '$. Multiplying takes one step:') + '</p>' +
          '<p class="wg-big">' + T('$N = ' + N + '$') + '</p><p class="wg-dim">Now pretend you only see N.</p>';
        q(el, '.wg-fig').innerHTML = '';
        q(el, '[data-act=go]').disabled = false;
      }
      q(el, '[data-act=new]').onclick = fresh;
      q(el, '[data-f=d]').onchange = fresh;
      q(el, '[data-act=go]').onclick = function () {
        var me = ++run, d = 3, tries = 0, t0 = Date.now(), fig = q(el, '.wg-fig'), lim = Math.floor(Math.sqrt(N));
        q(el, '[data-act=go]').disabled = true;
        function chunk() {
          if (me !== run || !alive(el)) return;
          var end = Math.min(lim, d + 40000);
          for (; d <= end; d += 2) { tries++; if (N % d === 0) break; }
          if (d <= lim && N % d === 0) return done(d);
          if (d > lim) return done(null);
          fig.innerHTML = '<p class="wg-mono">trying ' + d + ' …  (' + tries.toLocaleString() + ' divisions)</p>';
          setTimeout(chunk, 16);
        }
        function done(f) {
          var ms = Date.now() - t0, digits = String(N).length, perSec = tries / Math.max(ms, 1) * 1000;
          fig.innerHTML = '<p class="wg-ok">' + T('$' + N + ' = ' + f + ' \\cdot ' + (N / f) + '$') + ' — ' + tries.toLocaleString() + ' divisions, ' + ms + ' ms.</p>' +
            '<p>' + T('Trial division needs about $\\sqrt{N}/2$ divisions, and $\\sqrt{N}$ has half as many digits as $N$. Each extra digit of $p$ multiplies the work by $10$. Projected at a billion divisions per second:') + '</p>' +
            '<table class="wg-t"><thead><tr><th>digits of N</th><th>time</th></tr></thead><tbody>' +
            [digits, 40, 100, 617].map(function (dg) {
              var secs = Math.pow(10, dg / 2) / 2 / 1e9;
              return '<tr><td>' + dg + (dg === 617 ? ' (2048-bit RSA)' : '') + '</td><td>' + human(secs) + '</td></tr>';
            }).join('') + '</tbody></table>' +
            '<p class="wg-dim">The best real algorithm (the number field sieve) is vastly faster than trial division, yet still nowhere near practical for 2048-bit moduli. Your browser just managed about ' + Math.round(perSec).toLocaleString() + ' divisions per second.</p>';
          q(el, '[data-act=go]').disabled = false;
        }
        if (N % 2 === 0) return done(2);
        chunk();
      };
      function human(s) {
        if (s < 1) return 'instant';
        if (s < 3600) return Math.round(s) + ' seconds';
        if (s < 86400 * 365) return Math.round(s / 86400) + ' days';
        var y = s / (86400 * 365);
        if (y < 1e6) return Math.round(y).toLocaleString() + ' years';
        return '10^' + Math.round(Math.log(y) / Math.LN10) + ' years (the universe is ~10^10 years old)';
      }
      fresh();
    }
  };

  /* ---------------------- 11. endless practice ------------------------ */

  var GEN = {
    reduce: function () {
      var n = rnd(5, 31), a = rnd(-150, 999), r = mod(a, n), qt = (a - r) / n;
      return { q: 'Compute $' + a + ' \\bmod ' + n + '$.', a: r, hint: 'answer in $0, \\ldots, ' + (n - 1) + '$',
        steps: ['$' + a + ' = ' + paren(qt) + ' \\cdot ' + n + ' + ' + r + '$ with $0 \\le ' + r + ' < ' + n + '$' + (a < 0 ? ' (for a negative number, the quotient rounds down, so the remainder stays non-negative)' : '') + '.'] };
    },
    multiply: function () {
      var n = rnd(7, 41), a = rnd(12, 99), b = rnd(12, 99), am = a % n, bm = b % n, r = (a * b) % n;
      return { q: 'Compute $' + a + ' \\cdot ' + b + ' \\bmod ' + n + '$.', a: r, hint: 'reduce first to keep numbers small',
        steps: ['Reduce each factor first: $' + a + ' \\equiv ' + am + '$, $' + b + ' \\equiv ' + bm + '$.', '$' + am + ' \\cdot ' + bm + ' = ' + (am * bm) + ' \\equiv ' + r + ' \\pmod{' + n + '}$.'] };
    },
    gcd: function () {
      var g = pick([1, 1, 2, 3, 4, 6, 7, 9, 12]), a = g * rnd(5, 90), b = g * rnd(5, 90), x = Math.max(a, b), y = Math.min(a, b), st = [];
      if (x === y) return GEN.gcd();
      while (y) { st.push('$' + x + ' = ' + Math.floor(x / y) + ' \\cdot ' + y + ' + ' + (x % y) + '$'); var r = x % y; x = y; y = r; }
      st.push('Last nonzero remainder: $' + x + '$.');
      return { q: 'Compute $\\gcd(' + a + ', ' + b + ')$.', a: x, hint: 'Euclid', steps: st };
    },
    inverse: function () {
      var n = pick([11, 13, 17, 19, 23, 26, 29, 31, 35, 37, 41, 43, 47, 50, 53, 59, 61, 97]), a;
      do { a = rnd(2, n - 1); } while (gcd(a, n) !== 1);
      var rows = egcdRows(n, a), st = [], inv = inverse(a, n);
      for (var i = 2; i < rows.length - 1; i++) st.push('$' + rows[i].r + ' = ' + rows[i].s + ' \\cdot ' + n + ' + ' + paren(rows[i].t) + ' \\cdot ' + a + '$');
      st.push('So $' + a + '^{-1} \\equiv ' + paren(rows[rows.length - 2].t) + ' \\equiv ' + inv + '$. Check: $' + a + ' \\cdot ' + inv + ' = ' + (a * inv) + ' \\equiv 1$.');
      return { q: 'Find $' + a + '^{-1} \\bmod ' + n + '$.', a: inv, hint: 'extended Euclid', steps: st };
    },
    power: function () {
      var p = pick(primesIn(11, 61)), g = rnd(2, p - 1), x = rnd(p + 5, 400), e = x % (p - 1), r = powmod(g, x, p);
      return { q: 'Compute $' + g + '^{' + x + '} \\bmod ' + p + '$. ($' + p + '$ is prime.)', a: r, hint: 'Fermat, then square-and-multiply',
        steps: ['Fermat: $' + g + '^{' + (p - 1) + '} \\equiv 1$, so reduce the exponent mod $' + (p - 1) + '$: $' + x + ' \\bmod ' + (p - 1) + ' = ' + e + '$.',
                'Now compute $' + g + '^{' + e + '} \\bmod ' + p + '$ by square-and-multiply ($' + e + ' = ' + binary(e || 0) + '_2$): the result is $' + r + '$.'] };
    },
    phi: function () {
      var forms = [
        function () { var p = pick(primesIn(3, 23)), q2 = pick(primesIn(3, 23)); if (p === q2) return null; return p * q2; },
        function () { var p = pick([2, 3, 5, 7]), k = rnd(2, 4); return Math.pow(p, k) <= 400 ? Math.pow(p, k) : null; },
        function () { var p = pick(primesIn(11, 97)); return p; },
        function () { var n = rnd(12, 200); return n; }
      ], n = null;
      while (!n) n = pick(forms)();
      var f = factorize(n), ph = phi(n);
      return { q: 'Compute $\\varphi(' + n + ')$.', a: ph, hint: 'factor first',
        steps: ['$' + n + ' = ' + factorTeX(n) + '$.',
                '$\\varphi(' + n + ') = ' + f.map(function (x) { return x.k > 1 ? x.p + '^{' + (x.k - 1) + '}(' + x.p + '-1)' : '(' + x.p + '-1)'; }).join(' \\cdot ') + ' = ' + ph + '$.'] };
    },
    order: function () {
      var p = pick([7, 11, 13, 17, 19]), a = rnd(2, p - 1), k = order(a, p), pw = [], v = 1;
      for (var i = 1; i <= k; i++) { v = (v * a) % p; pw.push('$' + a + '^{' + i + '} \\equiv ' + v + '$'); }
      return { q: 'What is the order of $' + a + '$ in $\\Z_{' + p + '}^*$?', a: k, hint: 'must divide $' + (p - 1) + '$',
        steps: [pw.join(', ') + '.', 'First return to $1$ at exponent $' + k + '$ — a divisor of $' + (p - 1) + '$, as Lagrange requires.'] };
    },
    crt: function () {
      var pairs = [[3, 5], [3, 7], [4, 5], [5, 7], [4, 9], [5, 8], [7, 9], [3, 11], [5, 9]], pr = pick(pairs), n1 = pr[0], n2 = pr[1];
      var r1 = rnd(0, n1 - 1), r2 = rnd(0, n2 - 1), i1 = inverse(n2, n1), i2 = inverse(n1, n2), N = n1 * n2, x = mod(r1 * n2 * i1 + r2 * n1 * i2, N);
      return { q: 'Find $x \\in \\Z_{' + N + '}$ with $x \\equiv ' + r1 + ' \\pmod{' + n1 + '}$ and $x \\equiv ' + r2 + ' \\pmod{' + n2 + '}$.', a: x, hint: 'CRT',
        steps: ['$e_1 = ' + n2 + ' \\cdot (' + n2 + '^{-1} \\bmod ' + n1 + ') = ' + n2 + ' \\cdot ' + i1 + ' = ' + (n2 * i1) + '$, $e_2 = ' + n1 + ' \\cdot (' + n1 + '^{-1} \\bmod ' + n2 + ') = ' + n1 + ' \\cdot ' + i2 + ' = ' + (n1 * i2) + '$.',
                '$x = ' + r1 + ' \\cdot ' + (n2 * i1) + ' + ' + r2 + ' \\cdot ' + (n1 * i2) + ' \\equiv ' + x + ' \\pmod{' + N + '}$.',
                'Or just list $' + r2 + ', ' + (r2 + n2) + ', ' + (r2 + 2 * n2) + ', \\ldots$ (the numbers $\\equiv ' + r2 + ' \\bmod ' + n2 + '$) until one is $\\equiv ' + r1 + ' \\bmod ' + n1 + '$.'] };
    },
    dlog: function () {
      var p = pick([7, 11, 13, 17, 19, 23]), g = pick(generators(p)), x = rnd(2, p - 2), X = powmod(g, x, p), pw = [], v = 1;
      for (var i = 1; i <= x; i++) { v = (v * g) % p; pw.push('$' + g + '^{' + i + '} \\equiv ' + v + '$'); }
      return { q: 'Solve $' + g + '^x \\equiv ' + X + ' \\pmod{' + p + '}$ for $0 \\le x < ' + (p - 1) + '$.', a: x, hint: 'list powers — no shortcut',
        steps: [pw.join(', ') + '.', 'So $x = ' + x + '$. At this size listing works; at 2048 bits it is the discrete log problem.'] };
    }
  };
  var TOPICS = [['mixed', 'Mixed'], ['reduce', 'Reduce'], ['multiply', 'Multiply'], ['gcd', 'gcd'], ['inverse', 'Inverses'],
                ['power', 'Powers'], ['phi', 'φ(N)'], ['order', 'Order'], ['crt', 'CRT'], ['dlog', 'Discrete log']];

  W['nt-practice'] = {
    title: 'Endless practice',
    html: function () {
      return '<div class="wg-in"><label class="wg-f"><span>topic</span><select data-f="topic">' +
        TOPICS.map(function (t) { return '<option value="' + t[0] + '">' + esc(t[1]) + '</option>'; }).join('') + '</select></label>' +
        '<span class="wg-streak"></span></div><div class="wg-prob"></div>';
    },
    init: function (el) {
      var cur = null, streak = 0, best = S ? S.get('nt:practice:best', 0) : 0, answered = false;
      function score() {
        q(el, '.wg-streak').innerHTML = 'streak <b>' + streak + '</b> · best <b>' + best + '</b>';
      }
      function next() {
        var topic = q(el, '[data-f=topic]').value;
        if (topic === 'mixed') topic = pick(TOPICS.slice(1))[0];
        cur = GEN[topic](); answered = false;
        q(el, '.wg-prob').innerHTML = '<p class="wg-big">' + T(cur.q) + '</p><p class="wg-dim">' + T('Hint: ' + cur.hint) + '</p>' +
          '<div class="wg-in">' + field('ans', 'answer', '', '7em') + '<button class="btn sm" data-act="check">Check</button>' +
          '<button class="btn sm ghost" data-act="show">Show solution</button></div><div class="wg-res"></div>';
        var inp = q(el, '[data-f=ans]');
        inp.addEventListener('keydown', function (e) { if (e.keyCode === 13) check(); });
        q(el, '[data-act=check]').onclick = check;
        q(el, '[data-act=show]').onclick = function () { reveal(false, null); };
      }
      function reveal(right, given) {
        if (!answered) {
          answered = true;
          if (right) { streak++; if (streak > best) { best = streak; if (S) S.set('nt:practice:best', best); } }
          else streak = 0;
          score();
        }
        q(el, '.wg-res').innerHTML = (given === null ? '' : right ? '<p class="wg-ok">Correct.</p>' : '<p class="wg-bad">' + T('Not quite — you said $' + given + '$, the answer is $' + cur.a + '$.') + '</p>') +
          '<ol class="wg-steps">' + cur.steps.map(function (s) { return '<li>' + T(s) + '</li>'; }).join('') + '</ol>' +
          '<button class="btn sm" data-act="next">Next problem</button>';
        q(el, '[data-act=next]').onclick = next;
        q(el, '[data-act=check]').disabled = true;
        q(el, '[data-act=show]').disabled = true;
      }
      function check() {
        if (answered) return next();
        var v = intOf(el, 'ans', -1e9, 1e9);
        if (v === null) { q(el, '.wg-res').innerHTML = warn('Type a whole number.'); return; }
        reveal(v === cur.a, v);
      }
      q(el, '[data-f=topic]').onchange = next;
      score(); next();
    }
  };

  /* ------------------------------ export ------------------------------ */

  root.CPWidgets = {
    has: function (key) { return !!W[key]; },
    html: function (key) { var w = W[key]; return w ? box(key, w.title, w.html()) : ''; },
    wire: function (scope) {
      qa(scope, '.wg[data-wg]').forEach(function (el) {
        var w = W[el.getAttribute('data-wg')];
        if (w) w.init(el);
      });
    },
    /* Exposed for tools/lint-content.js and tests. */
    _math: { mod: mod, gcd: gcd, powmod: powmod, inverse: inverse, phi: phi, order: order, isPrime: isPrime, generators: generators, gen: GEN }
  };
})(window);
