/* CryptoProofHelper — offline PWA. Hash router, no dependencies. */
(function () {
  'use strict';

  var M = window.CPMath, S = window.CPStore;
  var CONCEPTS = window.CP_CONCEPTS, TECHS = window.CP_TECHNIQUES,
      EXAMPLES = window.CP_EXAMPLES, DRILLS = window.CP_DRILLS,
      TEMPLATES = window.CP_TEMPLATES, TRIAGE = window.CP_TRIAGE,
      CHECKLIST = window.CP_CHECKLIST;

  var main = document.getElementById('main'),
      title = document.getElementById('title'),
      back = document.getElementById('back'),
      tabs = document.getElementById('tabs');

  function t(s) { return M.text(s); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                                   .replace(/"/g,'&quot;'); }
  function byId(list, id) { for (var i=0;i<list.length;i++) if (list[i].id===id) return list[i]; return null; }
  function go(h) { location.hash = h; }

  /* ------------------------------ views ------------------------------ */

  function vHome() {
    var h = '<p class="lead">Start from what you have been asked to prove. The move you need is ' +
            'almost always one of nine.</p>';
    h += '<div class="eyebrow">What are you proving?</div>';
    TRIAGE.forEach(function (r) {
      var tech = byId(TECHS, r.tech);
      h += '<a class="card" href="#/learn/' + r.tech + '"><h3 class="ask">' + t(r.q) + '</h3>' +
           '<p>' + t(r.hint) + '</p>' +
           '<span class="chip tech">' + t(tech ? tech.title : r.tech) + '</span></a>';
    });
    h += '<div class="eyebrow">Everything else</div><div class="grid">' +
         card('#/basics', 'Foundations', CONCEPTS.length + ' definitions to know cold') +
         card('#/proofs', 'Worked proofs', EXAMPLES.length + ' proofs, annotated line by line') +
         card('#/build', 'Proof builder', 'Guided prompts &rarr; LaTeX skeleton') +
         card('#/drill', 'Drills', DRILLS.length + ' technique &amp; spot-the-flaw items') +
         card('#/checklist', 'Before you submit', 'Self-review checklist') +
         card('#/search', 'Search', 'Across every page') +
         '</div>';
    h += window.CPInstall.standalone()
      ? '<p class="kbd">Installed and fully offline.</p>'
      : '<a class="card" href="#/install" style="margin-top:12px"><h3>Add to your ' +
        'home screen</h3><p>Two taps, and it works with no connection.</p></a>';
    return { title: 'Proof Helper', html: h, tab: 'home' };
  }
  function card(href, hd, sub) {
    return '<a class="card" href="' + href + '"><h3>' + hd + '</h3><p>' + sub + '</p></a>';
  }

  function vBasics() {
    var h = '<p class="lead">You cannot write the proof until you can state the definition. ' +
            'These are the ones that show up in every problem set.</p>';
    CONCEPTS.forEach(function (c) {
      h += '<a class="card" href="#/basics/' + c.id + '"><h3>' + t(c.title) + '</h3>' +
           '<p>' + t(c.body[0].slice(0, 110).replace(/\s+\S*$/, '')) + '&hellip;</p></a>';
    });
    return { title: 'Foundations', html: h, tab: 'home', back: '#/' };
  }

  function vConcept(id) {
    var c = byId(CONCEPTS, id);
    if (!c) return notFound();
    var h = '<div class="prose">';
    c.body.forEach(function (p) { h += '<p>' + t(p) + '</p>'; });
    h += '</div>';
    if (c.watch && c.watch.length) {
      h += '<div class="eyebrow">Watch out</div>';
      c.watch.forEach(function (w) { h += '<div class="note"><b>&#9888;</b> ' + t(w) + '</div>'; });
    }
    (c.tags||[]).forEach(function (tag) { h += '<span class="chip">' + tag + '</span>'; });
    return { title: c.title, html: h, tab: 'home', back: '#/basics' };
  }

  function vLearn() {
    var h = '<p class="lead">Nine techniques. For each: when it applies, the skeleton, and the ' +
            'mistakes that cost marks.</p>';
    TECHS.forEach(function (x) {
      h += '<a class="card" href="#/learn/' + x.id + '"><h3>' + t(x.title) + '</h3>' +
           '<p>' + t(x.oneline) + '</p></a>';
    });
    return { title: 'Techniques', html: h, tab: 'learn' };
  }

  function vTech(id) {
    var x = byId(TECHS, id);
    if (!x) return notFound();
    var h = '<p class="lead">' + t(x.oneline) + '</p>';
    h += '<div class="eyebrow">Reach for this when</div><ul class="tight">';
    x.when.forEach(function (w) { h += '<li>' + t(w) + '</li>'; });
    h += '</ul>';

    h += '<div class="eyebrow">The skeleton</div>';
    x.skeleton.forEach(function (s, i) { h += stepHTML(i + 1, s.h, s.t, null, true); });

    if (x.transitions) {
      h += '<div class="eyebrow">The three legal transitions</div>';
      x.transitions.forEach(function (s, i) { h += stepHTML(String.fromCharCode(97+i), s.h, s.t, null, true); });
    }
    h += '<div class="eyebrow">Where it goes wrong</div>';
    x.pitfalls.forEach(function (p) { h += '<div class="note"><b>&#9888;</b> ' + t(p) + '</div>'; });

    h += '<div class="eyebrow">In miniature</div><div class="prose"><p>' + t(x.micro) + '</p></div>';

    var rel = EXAMPLES.filter(function (e) { return e.technique === x.id; });
    if (rel.length) {
      h += '<div class="eyebrow">Worked proofs using it</div>';
      rel.forEach(function (e) {
        h += '<a class="card" href="#/proofs/' + e.id + '"><h3>' + t(e.title) + '</h3>' +
             '<p>' + t(e.idea.slice(0, 100).replace(/\s+\S*$/, '')) + '&hellip;</p></a>';
      });
    }
    h += '<a class="btn wide ghost" href="#/build/' + templateFor(x.id) +
         '">Draft one with this shape &rarr;</a>';
    return { title: x.title, html: h, tab: 'learn', back: '#/learn' };
  }

  /* Techniques that share a template with a neighbouring one. */
  var TEMPLATE_FOR = { badevent:'gamehop', switching:'gamehop', romprog:'reduction',
                       rewinding:'simulation', infotheoretic:'reduction' };
  function templateFor(id) {
    return byId(TEMPLATES, id) ? id : (TEMPLATE_FOR[id] || 'reduction');
  }

  function stepHTML(n, head, body, why, open) {
    return '<div class="step' + (open ? ' open' : '') + '">' +
      '<div class="sh"><span class="num">' + n + '</span><b>' + t(head) + '</b>' +
      '<span class="caret">&#9654;</span></div>' +
      '<div class="sbody"' + (open ? '' : ' hidden') + '>' + t(body) +
      (why ? '<div class="why"><b>Why this step:</b> ' + t(why) + '</div>' : '') +
      '</div></div>';
  }

  function vProofs() {
    var h = '<p class="lead">Full proofs with every step annotated by the move that produced it. ' +
            'Read the <b>why</b>, not just the algebra.</p>';
    EXAMPLES.forEach(function (e) {
      var tech = byId(TECHS, e.technique);
      h += '<a class="card" href="#/proofs/' + e.id + '"><h3>' + t(e.title) + '</h3>' +
           '<p>' + t(e.idea.slice(0, 120).replace(/\s+\S*$/, '')) + '&hellip;</p>' +
           '<span class="chip ' + e.difficulty + '">' + e.difficulty + '</span>' +
           '<span class="chip tech">' + t(tech ? tech.title : e.technique) + '</span></a>';
    });
    return { title: 'Worked proofs', html: h, tab: 'proofs' };
  }

  function vProof(id) {
    var e = byId(EXAMPLES, id);
    if (!e) return notFound();
    var h = '<div class="card"><h3>Claim</h3><div class="prose"><p>' + t(e.claim) + '</p></div></div>';
    h += '<div class="eyebrow">The idea in one breath</div><div class="prose"><p>' + t(e.idea) + '</p></div>';
    h += '<div class="eyebrow">Proof</div>';
    e.steps.forEach(function (s, i) { h += stepHTML(i + 1, s.h, s.t, s.why, i === 0); });
    if (e.remarks && e.remarks.length) {
      h += '<div class="eyebrow">Remarks &amp; things to try</div>';
      e.remarks.forEach(function (r) { h += '<div class="note"><b>&rarr;</b> ' + t(r) + '</div>'; });
    }
    h += '<a class="btn wide ghost" href="#/learn/' + e.technique + '">The technique behind it &rarr;</a>';
    return { title: e.title, html: h, tab: 'proofs', back: '#/proofs' };
  }

  function vBuild() {
    var h = '<p class="lead">Answer the prompts; get a LaTeX proof skeleton with the structure ' +
            'already correct. Drafts are saved on this device.</p>';
    TEMPLATES.forEach(function (x) {
      var saved = S.get('draft:' + x.id, null);
      h += '<a class="card" href="#/build/' + x.id + '"><h3>' + t(x.title) + '</h3>' +
           '<p>' + t(x.blurb) + '</p>' +
           (saved ? '<span class="chip">draft saved</span>' : '') + '</a>';
    });
    return { title: 'Proof builder', html: h, tab: 'build' };
  }

  function vBuilder(id) {
    var x = byId(TEMPLATES, id);
    if (!x) return notFound();
    var v = S.get('draft:' + id, {});
    var h = '<p class="lead">' + t(x.blurb) + '</p><form id="bform">';
    x.fields.forEach(function (f) {
      h += '<label class="f"><span>' + esc(f.label) + '</span>' +
           (f.hint ? '<em class="hint">' + t(f.hint) + '</em>' : '') +
           (f.rows
             ? '<textarea rows="' + f.rows + '" name="' + f.k + '" placeholder="' +
               esc(f.ph || '') + '">' + esc(v[f.k] || '') + '</textarea>'
             : '<input type="text" name="' + f.k + '" placeholder="' + esc(f.ph || '') +
               '" value="' + esc(v[f.k] || '') + '">') +
           '</label>';
    });
    h += '</form><div class="row"><button class="btn" id="gen">Generate</button>' +
         '<button class="btn ghost" id="copy">Copy</button>' +
         '<button class="btn ghost" id="clear">Clear</button></div>' +
         '<pre class="out" id="out">Fill in what you can — blanks become bracketed placeholders — ' +
         'then press Generate.</pre>';
    return { title: x.title, html: h, tab: 'build', back: '#/build', after: function () {
      var form = document.getElementById('bform'), out = document.getElementById('out');
      function values() {
        var o = {};
        Array.prototype.forEach.call(form.elements, function (el) { if (el.name) o[el.name] = el.value; });
        return o;
      }
      function render() {
        var val = values();
        S.set('draft:' + id, val);
        out.textContent = x.build(val);
      }
      form.addEventListener('input', function () { S.set('draft:' + id, values()); });
      document.getElementById('gen').onclick = function (ev) { ev.preventDefault(); render(); out.scrollIntoView({behavior:'smooth', block:'nearest'}); };
      document.getElementById('copy').onclick = function (ev) {
        ev.preventDefault();
        if (out.textContent.indexOf('\\begin') < 0) render();
        var txt = out.textContent, btn = ev.target;
        var done = function () { btn.textContent = 'Copied'; setTimeout(function(){btn.textContent='Copy';}, 1400); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(done, function () { legacyCopy(txt); done(); });
        } else { legacyCopy(txt); done(); }
      };
      document.getElementById('clear').onclick = function (ev) {
        ev.preventDefault();
        if (!confirm('Clear this draft?')) return;
        S.set('draft:' + id, {});
        Array.prototype.forEach.call(form.elements, function (el) { if (el.name) el.value = ''; });
        out.textContent = 'Cleared.';
      };
      if (Object.keys(v).length) render();
    }};
  }

  function legacyCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function vDrill() {
    var order = shuffle(DRILLS.map(function (d) { return d.id; }));
    var state = { i: 0, right: 0, order: order };
    var best = S.get('drill:best', 0);
    var h = '<div class="progress"><i style="width:0%"></i></div>' +
            '<p class="score" id="score"></p><div id="q"></div>';
    return { title: 'Drills', html: h, tab: 'drill', after: function () {
      var qEl = document.getElementById('q'), sEl = document.getElementById('score'),
          bar = document.querySelector('.progress i');

      function paint() {
        bar.style.width = (100 * state.i / state.order.length) + '%';
        sEl.innerHTML = 'Question ' + Math.min(state.i + 1, state.order.length) + ' of ' +
          state.order.length + ' &middot; ' + state.right + ' correct' +
          (best ? ' &middot; best ' + best + '/' + state.order.length : '');
        if (state.i >= state.order.length) return finish();
        var d = byId(DRILLS, state.order[state.i]);
        var kind = d.kind === 'flaw' ? 'Spot the flaw' : 'Which technique?';
        var html = '<div class="eyebrow">' + kind + '</div>' +
                   '<div class="card"><div class="prose"><p>' + t(d.q) + '</p></div></div>';
        d.options.forEach(function (o, i) {
          html += '<button class="opt" data-i="' + i + '">' + t(o) + '</button>';
        });
        qEl.innerHTML = html;
        Array.prototype.forEach.call(qEl.querySelectorAll('.opt'), function (b) {
          b.onclick = function () { answer(d, parseInt(b.dataset.i, 10)); };
        });
      }

      function answer(d, pick) {
        var opts = qEl.querySelectorAll('.opt');
        Array.prototype.forEach.call(opts, function (b, i) {
          b.disabled = true;
          if (i === d.answer) b.className = 'opt right';
          else if (i === pick) b.className = 'opt wrong';
        });
        if (pick === d.answer) state.right++;
        sEl.innerHTML = 'Question ' + (state.i + 1) + ' of ' + state.order.length +
          ' &middot; ' + state.right + ' correct' +
          (best ? ' &middot; best ' + best + '/' + state.order.length : '');
        bar.style.width = (100 * (state.i + 1) / state.order.length) + '%';
        var box = document.createElement('div');
        box.className = 'why';
        box.innerHTML = '<b>' + (pick === d.answer ? 'Correct.' : 'Not quite.') + '</b> ' + t(d.why);
        qEl.appendChild(box);
        var nx = document.createElement('button');
        nx.className = 'btn wide'; nx.style.marginTop = '12px';
        nx.textContent = state.i === state.order.length - 1 ? 'See results' : 'Next question';
        nx.onclick = function () { state.i++; paint(); window.scrollTo(0, 0); };
        qEl.appendChild(nx);
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      function finish() {
        bar.style.width = '100%';
        if (state.right > best) { best = state.right; S.set('drill:best', best); }
        qEl.innerHTML = '<div class="card"><h3>' + state.right + ' / ' + state.order.length +
          '</h3><p>' + (state.right === state.order.length
            ? 'Every one. Go write the proof.'
            : 'Revisit the ones you missed — the explanation names the underlying rule each time.') +
          '</p></div>' +
          '<button class="btn wide" id="again">Run again (reshuffled)</button>' +
          '<a class="btn wide ghost" href="#/learn">Back to the techniques</a>';
        document.getElementById('again').onclick = function () {
          state.i = 0; state.right = 0; state.order = shuffle(state.order); paint(); window.scrollTo(0,0);
        };
      }
      paint();
    }};
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  function vInstall() {
    var I = window.CPInstall;
    var h = '';

    if (I.standalone()) {
      h += '<div class="card"><h3>Installed &#10003;</h3><p>You are running the ' +
           'installed app. It works with no connection — the whole thing is on ' +
           'the device.</p></div>';
    }

    var steps = {
      ios: ['Open this page in <b>Safari</b> (Chrome and Firefox on iOS cannot ' +
              'add to the home screen).',
            'Tap the Share button ' + I.shareIcon + ' in the toolbar — bottom ' +
              'centre on iPhone, top right on iPad.',
            'Scroll down and tap <b>Add to Home Screen</b>.',
            'Tap <b>Add</b>. The icon appears with your apps.',
            'Open it once while online so it caches itself. After that, ' +
              'airplane mode is fine.'],
      android: ['Open this page in <b>Chrome</b>.',
            'Tap the &#8942; menu, then <b>Install app</b> or <b>Add to Home screen</b>.',
            'Confirm. Open it once while online so it caches itself.'],
      desktop: ['In Chrome or Edge, click the install icon in the address bar ' +
              '(or menu &rarr; <b>Install</b>).',
            'In Safari on macOS, choose File &rarr; <b>Add to Dock</b>.']
    };

    var first = I.ios() ? 'ios' : (I.android() ? 'android' : 'desktop');
    var names = { ios: 'iPhone &amp; iPad', android: 'Android', desktop: 'Desktop' };
    var order = [first].concat(['ios', 'android', 'desktop'].filter(function (k) {
      return k !== first;
    }));

    if (!I.standalone()) {
      h += '<p class="lead">Adding it to your home screen is what makes it work ' +
           'offline — and it opens without browser chrome, like any other app.</p>';
    }

    order.forEach(function (k, i) {
      h += '<div class="eyebrow">' + names[k] + (i === 0 && !I.standalone() ?
           ' &middot; you are here' : '') + '</div>';
      h += '<ol class="steps">' + steps[k].map(function (x) {
        return '<li>' + x + '</li>';
      }).join('') + '</ol>';
      if (k === 'android' && I.canPrompt()) {
        h += '<button class="btn wide" id="doinstall">Install now</button>';
      }
    });

    h += '<div class="note"><b>&#9888;</b> On iOS the app keeps its own storage: ' +
         'your drafts, checklist and drill scores live in the installed copy, ' +
         'separate from what you did in Safari.</div>';

    return { title: 'Install', html: h, tab: 'home', back: '#/', after: function () {
      var b = document.getElementById('doinstall');
      if (b) b.onclick = function () {
        window.CPInstall.prompt().then(function (ok) {
          if (ok) b.textContent = 'Installed';
        });
      };
    }};
  }

  function vChecklist() {
    var done = S.get('checklist', {});
    var h = '<p class="lead">Run this over the proof before you hand it in. Most lost marks are ' +
            'on this list, not in the mathematics.</p>';
    CHECKLIST.forEach(function (g, gi) {
      h += '<div class="eyebrow">' + esc(g.g) + '</div>';
      g.items.forEach(function (item, ii) {
        var k = gi + '.' + ii, on = !!done[k];
        h += '<label class="chk' + (on ? ' done' : '') + '" data-k="' + k + '">' +
             '<input type="checkbox"' + (on ? ' checked' : '') + '><span>' + t(item) + '</span></label>';
      });
    });
    h += '<button class="btn wide ghost" id="reset" style="margin-top:14px">Reset checklist</button>';
    return { title: 'Before you submit', html: h, tab: 'home', back: '#/', after: function () {
      Array.prototype.forEach.call(document.querySelectorAll('.chk'), function (el) {
        el.querySelector('input').onchange = function (e) {
          var d = S.get('checklist', {});
          d[el.dataset.k] = e.target.checked;
          S.set('checklist', d);
          el.classList.toggle('done', e.target.checked);
        };
      });
      document.getElementById('reset').onclick = function () {
        S.set('checklist', {});
        Array.prototype.forEach.call(document.querySelectorAll('.chk'), function (el) {
          el.querySelector('input').checked = false; el.classList.remove('done');
        });
      };
    }};
  }

  /* Search index built once from all content. */
  var INDEX = null;
  function buildIndex() {
    if (INDEX) return INDEX;
    INDEX = [];
    CONCEPTS.forEach(function (c) {
      INDEX.push({ href: '#/basics/' + c.id, title: c.title, kind: 'Foundations',
        text: c.body.join(' ') + ' ' + (c.watch||[]).join(' ') + ' ' + (c.tags||[]).join(' ') });
    });
    TECHS.forEach(function (x) {
      INDEX.push({ href: '#/learn/' + x.id, title: x.title, kind: 'Technique',
        text: [x.oneline, x.when.join(' '), x.skeleton.map(function(s){return s.h+' '+s.t;}).join(' '),
               x.pitfalls.join(' '), x.micro].join(' ') });
    });
    EXAMPLES.forEach(function (e) {
      INDEX.push({ href: '#/proofs/' + e.id, title: e.title, kind: 'Worked proof',
        text: [e.claim, e.idea, e.steps.map(function(s){return s.h+' '+s.t+' '+s.why;}).join(' '),
               (e.remarks||[]).join(' ')].join(' ') });
    });
    TEMPLATES.forEach(function (x) {
      INDEX.push({ href: '#/build/' + x.id, title: x.title, kind: 'Builder', text: x.blurb });
    });
    return INDEX;
  }

  function vSearch(q) {
    var h = '<label class="f"><input type="text" id="sq" placeholder="Search definitions, ' +
            'techniques, proofs…" value="' + esc(q || '') + '" autocomplete="off"></label>' +
            '<div id="res"></div>';
    return { title: 'Search', html: h, tab: 'home', back: '#/', after: function () {
      var input = document.getElementById('sq'), res = document.getElementById('res');
      function run() {
        var term = input.value.trim().toLowerCase();
        if (term.length < 2) { res.innerHTML = '<p class="empty">Type at least two characters.</p>'; return; }
        var hits = buildIndex().map(function (e) {
          var hay = (e.title + ' ' + e.text).toLowerCase(), n = 0, at = -1;
          while ((at = hay.indexOf(term, at + 1)) >= 0) n++;
          if (e.title.toLowerCase().indexOf(term) >= 0) n += 8;
          return { e: e, n: n };
        }).filter(function (x) { return x.n > 0; })
          .sort(function (a, b) { return b.n - a.n; }).slice(0, 25);
        if (!hits.length) { res.innerHTML = '<p class="empty">Nothing found for &ldquo;' +
          esc(term) + '&rdquo;.</p>'; return; }
        res.innerHTML = hits.map(function (x) {
          return '<a class="card" href="' + x.e.href + '"><h3>' + t(x.e.title) + '</h3>' +
                 '<p>' + snippet(x.e.text, term) + '</p>' +
                 '<span class="chip">' + x.e.kind + '</span></a>';
        }).join('');
      }
      input.addEventListener('input', function () {
        run();
        history.replaceState(null, '', '#/search/' + encodeURIComponent(input.value.trim()));
      });
      run();
      if (!q) input.focus();
    }};
  }

  function snippet(text, term) {
    var i = text.toLowerCase().indexOf(term);
    if (i < 0) return t(text.slice(0, 110)) + '&hellip;';
    var s = Math.max(0, i - 55);
    return (s ? '&hellip;' : '') + t(text.slice(s, s + 150).replace(/\$[^$]*$/, '')) + '&hellip;';
  }

  function notFound() {
    return { title: 'Not found', html: '<p class="empty">That page does not exist.</p>' +
             '<a class="btn wide ghost" href="#/">Back to start</a>', tab: 'home', back: '#/' };
  }

  /* ------------------------------ router ------------------------------ */

  var ROUTES = [
    [/^\/?$/,                function () { return vHome(); }],
    [/^\/basics$/,           function () { return vBasics(); }],
    [/^\/basics\/(.+)$/,     function (m) { return vConcept(m[1]); }],
    [/^\/learn$/,            function () { return vLearn(); }],
    [/^\/learn\/(.+)$/,      function (m) { return vTech(m[1]); }],
    [/^\/proofs$/,           function () { return vProofs(); }],
    [/^\/proofs\/(.+)$/,     function (m) { return vProof(m[1]); }],
    [/^\/build$/,            function () { return vBuild(); }],
    [/^\/build\/(.+)$/,      function (m) { return vBuilder(m[1]); }],
    [/^\/drill$/,            function () { return vDrill(); }],
    [/^\/checklist$/,        function () { return vChecklist(); }],
    [/^\/install$/,          function () { return vInstall(); }],
    [/^\/search\/?(.*)$/,    function (m) { return vSearch(decodeURIComponent(m[1] || '')); }]
  ];

  function route() {
    var path = location.hash.replace(/^#/, '') || '/';
    if (path === '/install') window.CPInstall.hide();
    var view = null;
    for (var i = 0; i < ROUTES.length; i++) {
      var m = path.match(ROUTES[i][0]);
      if (m) { view = ROUTES[i][1](m); break; }
    }
    if (!view) view = notFound();

    title.innerHTML = t(view.title);
    document.title = stripMath(view.title) + ' · Proof Helper';
    main.innerHTML = view.html;
    main.scrollTop = 0;

    back.hidden = !view.back;
    back.onclick = function () {
      if (history.length > 1) history.back(); else go(view.back);
    };

    Array.prototype.forEach.call(tabs.querySelectorAll('a'), function (a) {
      a.classList.toggle('on', a.dataset.tab === view.tab);
    });

    // Collapsible steps.
    Array.prototype.forEach.call(main.querySelectorAll('.step .sh'), function (sh) {
      sh.onclick = function () {
        var step = sh.parentNode, body = step.querySelector('.sbody');
        var open = step.classList.toggle('open');
        body.hidden = !open;
      };
    });

    if (view.after) view.after();
    window.scrollTo(0, 0);
  }

  function stripMath(s) {
    return String(s).replace(/\$([^$]*)\$/g, function (_, x) {
      return x.replace(/\\[a-zA-Z]+|[{}]/g, '').trim();
    }).replace(/\s+/g, ' ').trim();
  }

  window.addEventListener('hashchange', route);
  route();
  window.CPInstall.maybeBanner();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline-only is fine */ });
    });
  }
})();
