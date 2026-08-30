/* CryptoProofHelper — offline PWA. Hash router, no dependencies. */
(function () {
  'use strict';

  var M = window.CPMath, S = window.CPStore;
  var CONCEPTS = window.CP_CONCEPTS, TECHS = window.CP_TECHNIQUES,
      EXAMPLES = window.CP_EXAMPLES, DRILLS = window.CP_DRILLS,
      TEMPLATES = window.CP_TEMPLATES, TRIAGE = window.CP_TRIAGE,
      CHECKLIST = window.CP_CHECKLIST, PRIMER = window.CP_PRIMER,
      TRACKS = window.CP_TRACKS, GLOSSARY = window.CP_GLOSSARY,
      PATH = window.CP_PATH, COURSE = window.CP_COURSE;

  var main = document.getElementById('main'),
      title = document.getElementById('title'),
      back = document.getElementById('back'),
      tabs = document.getElementById('tabs');

  function t(s) { return M.text(s); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                                   .replace(/"/g,'&quot;'); }
  function byId(list, id) { for (var i=0;i<list.length;i++) if (list[i].id===id) return list[i]; return null; }
  function go(h) { location.hash = h; }

  /* Which primer lessons have been opened. Progress, not grading. */
  function readSet() { return S.get('primer:read', {}); }
  function markRead(id) {
    var r = readSet();
    if (r[id]) return;
    r[id] = 1; S.set('primer:read', r);
  }

  /* The plain-English opening every dense page now carries, plus the primer
     lessons worth reading first. Both are no-ops when the fields are absent. */
  function plainHTML(x) {
    var h = '';
    if (x.plain) h += '<div class="plain"><b>In plain English</b>' + t(x.plain) + '</div>';
    if (x.pre && x.pre.length) {
      h += '<div class="pre"><b>New to this?</b> ' + x.pre.map(function (p) {
        return '<a href="' + p.href + '">' + t(p.label) + '</a>';
      }).join(' &middot; ') + '</div>';
    }
    return h;
  }

  /* ------------------------------ views ------------------------------ */

  function vHome() {
    var read = readSet(), doneCount = 0;
    PRIMER.forEach(function (l) { if (read[l.id]) doneCount++; });

    var h = '<p class="lead">Two ways in. Learn the groundwork from scratch, or jump straight to the ' +
            'technique that matches the problem in front of you.</p>';
    h += '<a class="card hero" href="#/course"><h3>&#128218; Bellare &amp; Rogaway Course</h3>' +
         '<p>Chapters 1 &amp; 2 in a friendly format: channel models, substitution ciphers, the one-time pad, and perfect security — with inline quizzes and a scored mastery test per chapter.</p>' +
         '<span class="chip ok">' + (doneCount ? doneCount + ' of ' + PRIMER.length + ' primer lessons read' : 'interactive &middot; offline') + '</span></a>';
    h += '<a class="card" href="#/primer"><h3>&#9650; New to the maths? Start with the Primer</h3>' +
         '<p>' + PRIMER.length + ' short lessons assuming nothing past high-school algebra: the ' +
         'discrete maths, how proofs actually work, and what a security definition is saying.</p>' +
         (doneCount
            ? '<span class="chip ok">' + doneCount + ' of ' + PRIMER.length + ' read</span>'
            : '<span class="chip ok">no background assumed</span>') + '</a>';
    h += '<div class="eyebrow">What are you proving?</div>';
    TRIAGE.forEach(function (r) {
      var tech = byId(TECHS, r.tech);
      h += '<a class="card" href="#/learn/' + r.tech + '"><h3 class="ask">' + t(r.q) + '</h3>' +
           '<p>' + t(r.hint) + '</p>' +
           '<span class="chip tech">' + t(tech ? tech.title : r.tech) + '</span></a>';
    });
    h += '<div class="eyebrow">Everything else</div><div class="grid">' +
         card('#/basics', 'Foundations', CONCEPTS.length + ' definitions to know cold') +
         card('#/glossary', 'Notation', 'Every symbol, and how to say it') +
         card('#/proofs', 'Worked proofs', EXAMPLES.length + ' proofs, annotated line by line') +
         card('#/build', 'Proof builder', 'Guided prompts &rarr; LaTeX skeleton') +
         card('#/drill', 'Drills', DRILLS.length + ' items, warm-up set included') +
         card('#/checklist', 'Before you submit', 'Self-review checklist') +
         card('#/path', 'Where to start', 'The route through the whole app') +
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
            'These are the ones that show up in every problem set. Each opens with a ' +
            'plain-English version before the formal one.</p>';
    h += '<a class="card" href="#/primer"><h3>Not ready for these yet?</h3><p>The primer covers the ' +
         'maths and the proof-writing basics these definitions assume.</p></a>';
    CONCEPTS.forEach(function (c) {
      h += '<a class="card" href="#/basics/' + c.id + '"><h3>' + t(c.title) + '</h3>' +
           '<p>' + t(c.body[0].slice(0, 110).replace(/\s+\S*$/, '')) + '&hellip;</p></a>';
    });
    return { title: 'Foundations', html: h, tab: 'home', back: '#/' };
  }

  function vConcept(id) {
    var c = byId(CONCEPTS, id);
    if (!c) return notFound();
    var h = plainHTML(c);
    h += '<div class="eyebrow">Formally</div><div class="prose">';
    c.body.forEach(function (p) { h += '<p>' + t(p) + '</p>'; });
    h += '</div>';
    if (c.watch && c.watch.length) {
      h += '<div class="eyebrow">Watch out</div>';
      c.watch.forEach(function (w) { h += '<div class="note"><b>&#9888;</b> ' + t(w) + '</div>'; });
    }
    (c.tags||[]).forEach(function (tag) { h += '<span class="chip">' + tag + '</span>'; });
    return { title: c.title, html: h, tab: 'home', back: '#/basics' };
  }

  /* ---------------------------- the primer ---------------------------- */

  function lessonsIn(track) {
    return PRIMER.filter(function (l) { return l.track === track; });
  }

  function vPrimer() {
    var read = readSet(), total = PRIMER.length, done = 0;
    PRIMER.forEach(function (l) { if (read[l.id]) done++; });

    var h = '<p class="lead">Nothing here assumes more than high-school algebra. Every symbol is ' +
            'introduced and translated where it first appears, so you can read these in order and ' +
            'arrive at the rest of the app able to follow it.</p>';

    if (done) {
      h += '<div class="progress"><i style="width:' + Math.round(100 * done / total) + '%"></i></div>' +
           '<p class="score">' + done + ' of ' + total + ' lessons opened</p>';
    }

    h += '<a class="card" href="#/path"><h3>The route through the whole app</h3>' +
         '<p>Eight steps in order, from this page to writing a proof of your own.</p></a>';

    TRACKS.forEach(function (tr) {
      var ls = lessonsIn(tr.id), d = 0;
      ls.forEach(function (l) { if (read[l.id]) d++; });
      h += '<div class="eyebrow">' + esc(tr.title) + ' &middot; ' + d + '/' + ls.length + '</div>';
      h += '<p class="lead sm">' + t(tr.blurb) + '</p>';
      ls.forEach(function (l) {
        h += '<a class="card lesson' + (read[l.id] ? ' read' : '') + '" href="#/primer/' + l.id + '">' +
             '<h3><span class="tick">' + (read[l.id] ? '&#10003;' : '&#9675;') + '</span>' +
             t(l.title) + '</h3><p>' + t(l.oneline) + '</p></a>';
      });
    });

    h += '<div class="eyebrow">Reference</div><div class="grid">' +
         card('#/glossary', 'Notation', 'Every symbol, and how to say it') +
         card('#/basics', 'Foundations', 'The same ideas, formally stated') +
         '</div>';

    if (done) h += '<button class="btn wide ghost" id="resetread" style="margin-top:14px">' +
                   'Reset reading progress</button>';

    return { title: 'Start here', html: h, tab: 'primer', back: '#/', after: function () {
      var b = document.getElementById('resetread');
      if (b) b.onclick = function () {
        if (!confirm('Clear which lessons are marked as read?')) return;
        S.set('primer:read', {});
        route();
      };
    }};
  }

  function vLesson(id) {
    var l = byId(PRIMER, id);
    if (!l) return notFound();
    markRead(id);

    var siblings = lessonsIn(l.track), at = 0;
    siblings.forEach(function (x, i) { if (x.id === l.id) at = i; });
    var track = byId(TRACKS, l.track);

    var h = '<p class="eyebrow" style="margin-top:0">' + esc(track ? track.title : '') +
            ' &middot; ' + (at + 1) + ' of ' + siblings.length + '</p>';
    h += '<p class="lead">' + t(l.oneline) + '</p>';
    h += '<div class="prose">';
    l.body.forEach(function (para) { h += '<p>' + t(para) + '</p>'; });
    h += '</div>';

    if (l.jargon && l.jargon.length) {
      h += '<div class="eyebrow">Saying it out loud</div><dl class="jargon">';
      l.jargon.forEach(function (j) {
        h += '<dt>' + t(j.t) + '</dt><dd>' + t(j.p) + '</dd>';
      });
      h += '</dl>';
    }

    if (l.example) {
      h += '<div class="eyebrow">Worked through</div><div class="card worked"><h3>' +
           t(l.example.h) + '</h3><div class="prose">';
      l.example.body.forEach(function (para) { h += '<p>' + t(para) + '</p>'; });
      h += '</div></div>';
    }

    if (l.check && l.check.length) {
      h += '<div class="eyebrow">Check yourself</div>';
      l.check.forEach(function (c, i) {
        h += '<div class="qa"><p class="qq">' + t(c.q) + '</p>' +
             '<button class="btn ghost sm reveal" data-i="' + i + '">Show answer</button>' +
             '<div class="qans" id="qa' + i + '" hidden>' + t(c.a) + '</div></div>';
      });
    }

    if (l.use && l.use.length) {
      h += '<div class="eyebrow">Where this pays off</div>';
      l.use.forEach(function (u) {
        h += '<a class="card slim" href="' + u.href + '"><h3>' + t(u.label) + '</h3></a>';
      });
    }

    h += '<div class="row nav">' +
      (at > 0
        ? '<a class="btn ghost" href="#/primer/' + siblings[at-1].id + '">&#8249; Previous</a>'
        : '<a class="btn ghost" href="#/primer">&#8249; All lessons</a>') +
      (at < siblings.length - 1
        ? '<a class="btn" href="#/primer/' + siblings[at+1].id + '">Next &#8250;</a>'
        : nextTrackBtn(l.track)) +
      '</div>';

    return { title: l.title, html: h, tab: 'primer', back: '#/primer', after: function () {
      Array.prototype.forEach.call(main.querySelectorAll('.reveal'), function (b) {
        b.onclick = function () {
          var box = document.getElementById('qa' + b.dataset.i);
          box.hidden = !box.hidden;
          b.textContent = box.hidden ? 'Show answer' : 'Hide answer';
        };
      });
    }};
  }

  /* At the end of a track, point at the next one rather than a dead end. */
  function nextTrackBtn(trackId) {
    var i = 0;
    TRACKS.forEach(function (tr, n) { if (tr.id === trackId) i = n; });
    var nxt = TRACKS[i + 1];
    if (nxt) {
      var first = lessonsIn(nxt.id)[0];
      return '<a class="btn" href="#/primer/' + first.id + '">' + esc(nxt.title) + ' &#8250;</a>';
    }
    return '<a class="btn" href="#/basics">On to Foundations &#8250;</a>';
  }

  function vPath() {
    var read = readSet();
    var h = '<p class="lead">If you are starting cold, this is the order that works. Each step ' +
            'assumes the one before it and nothing else.</p>';
    PATH.forEach(function (st, i) {
      var lid = st.href.indexOf('#/primer/') === 0 ? st.href.slice(9) : null;
      h += '<a class="card step-card' + (lid && read[lid] ? ' read' : '') + '" href="' + st.href + '">' +
           '<h3><span class="num">' + (i + 1) + '</span>' + t(st.label) + '</h3>' +
           '<p>' + t(st.note) + '</p></a>';
    });
    h += '<div class="note"><b>&#8594;</b> Nobody absorbs this in one pass. The second reading of a ' +
         'proof you have already met is where it stops being symbols and starts being an argument.</div>';
    return { title: 'Where to start', html: h, tab: 'primer', back: '#/' };
  }

  function vGlossary(q) {
    var h = '<p class="lead">Every symbol this app uses, with how you would say it out loud. ' +
            'Come back here whenever a line stops you.</p>' +
            '<label class="f"><input type="text" id="gq" placeholder="Filter symbols and words…" ' +
            'value="' + esc(q || '') + '" autocomplete="off"></label><div id="gres"></div>';
    return { title: 'Notation', html: h, tab: 'primer', back: '#/primer', after: function () {
      var input = document.getElementById('gq'), res = document.getElementById('gres');
      function run() {
        var term = input.value.trim().toLowerCase(), out = '', hits = 0;
        GLOSSARY.forEach(function (g) {
          var items = g.items.filter(function (it) {
            return !term || (it.s + ' ' + it.n + ' ' + it.p).toLowerCase().indexOf(term) >= 0;
          });
          if (!items.length) return;
          hits += items.length;
          out += '<div class="eyebrow">' + esc(g.g) + '</div><dl class="jargon sym">';
          items.forEach(function (it) {
            out += '<dt>' + t(it.s) + '</dt><dd><b>' + t(it.n) + '</b>' + t(it.p) + '</dd>';
          });
          out += '</dl>';
        });
        res.innerHTML = hits ? out : '<p class="empty">Nothing matches that.</p>';
      }
      input.addEventListener('input', function () {
        run();
        history.replaceState(null, '', '#/glossary/' + encodeURIComponent(input.value.trim()));
      });
      run();
    }};
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
    h += plainHTML(x);
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
    var h = plainHTML(e);
    h += '<div class="card"><h3>Claim</h3><div class="prose"><p>' + t(e.claim) + '</p></div></div>';
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

  /* Drills come in three flavours; a beginner should meet the warm-up set
     first rather than being dropped into spot-the-flaw. */
  var DRILL_SETS = [
    { id: 'warmup',    kinds: ['basics'],
      title: 'Warm-up', sub: 'Notation, probability, and what the definitions actually say' },
    { id: 'technique', kinds: ['technique'],
      title: 'Which technique?', sub: 'Read the problem, name the move it calls for' },
    { id: 'flaw',      kinds: ['flaw'],
      title: 'Spot the flaw', sub: 'The errors that actually cost marks' },
    { id: 'all',       kinds: ['basics', 'technique', 'flaw'],
      title: 'Everything', sub: 'All of it, shuffled together' }
  ];

  function drillItems(set) {
    return DRILLS.filter(function (d) { return set.kinds.indexOf(d.kind) >= 0; });
  }

  function vDrillMenu() {
    var h = '<p class="lead">Cheap mistakes here instead of expensive ones on a problem set. ' +
            'Start with the warm-up if the rest of the app still reads as symbols.</p>';
    DRILL_SETS.forEach(function (set) {
      var n = drillItems(set).length, best = S.get('drill:best:' + set.id, 0);
      h += '<a class="card" href="#/drill/' + set.id + '"><h3>' + esc(set.title) + '</h3>' +
           '<p>' + esc(set.sub) + '</p><span class="chip">' + n + ' questions</span>' +
           (best ? '<span class="chip ok">best ' + best + '/' + n + '</span>' : '') + '</a>';
    });
    return { title: 'Drills', html: h, tab: 'drill' };
  }

  function vDrill(setId) {
    var set = byId(DRILL_SETS, setId || 'all') || DRILL_SETS[3];
    var items = drillItems(set);
    if (!items.length) return notFound();

    var state = { i: 0, right: 0, order: shuffle(items.map(function (d) { return d.id; })), cur: null };
    var bestKey = 'drill:best:' + set.id, best = S.get(bestKey, 0);
    var h = '<div class="progress"><i style="width:0%"></i></div>' +
            '<p class="score" id="score"></p><div id="q"></div>';

    return { title: set.title, html: h, tab: 'drill', back: '#/drill', after: function () {
      var qEl = document.getElementById('q'), sEl = document.getElementById('score'),
          bar = document.querySelector('.progress i');

      function scoreLine(n) {
        sEl.innerHTML = 'Question ' + Math.min(n, state.order.length) + ' of ' + state.order.length +
          ' &middot; ' + state.right + ' correct' +
          (best ? ' &middot; best ' + best + '/' + state.order.length : '');
      }

      function paint() {
        bar.style.width = (100 * state.i / state.order.length) + '%';
        scoreLine(state.i + 1);
        if (state.i >= state.order.length) return finish();

        // Shuffle the options too: every item stores its answer first, so a
        // fixed order would make the whole drill guessable.
        var d = byId(DRILLS, state.order[state.i]);
        var perm = shuffle(d.options.map(function (_, i) { return i; }));
        state.cur = { d: d, perm: perm, answer: perm.indexOf(d.answer) };

        var kind = d.kind === 'flaw' ? 'Spot the flaw'
                 : d.kind === 'basics' ? 'Warm-up' : 'Which technique?';
        var html = '<div class="eyebrow">' + kind + '</div>' +
                   '<div class="card"><div class="prose"><p>' + t(d.q) + '</p></div></div>';
        perm.forEach(function (orig, i) {
          html += '<button class="opt" data-i="' + i + '">' + t(d.options[orig]) + '</button>';
        });
        qEl.innerHTML = html;
        Array.prototype.forEach.call(qEl.querySelectorAll('.opt'), function (b) {
          b.onclick = function () { answer(parseInt(b.dataset.i, 10)); };
        });
      }

      function answer(pick) {
        var cur = state.cur, opts = qEl.querySelectorAll('.opt');
        Array.prototype.forEach.call(opts, function (b, i) {
          b.disabled = true;
          if (i === cur.answer) b.className = 'opt right';
          else if (i === pick) b.className = 'opt wrong';
        });
        if (pick === cur.answer) state.right++;
        scoreLine(state.i + 1);
        bar.style.width = (100 * (state.i + 1) / state.order.length) + '%';
        var box = document.createElement('div');
        box.className = 'why';
        box.innerHTML = '<b>' + (pick === cur.answer ? 'Correct.' : 'Not quite.') + '</b> ' + t(cur.d.why);
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
        if (state.right > best) { best = state.right; S.set(bestKey, best); }
        qEl.innerHTML = '<div class="card"><h3>' + state.right + ' / ' + state.order.length +
          '</h3><p>' + (state.right === state.order.length
            ? 'Every one. Go write the proof.'
            : 'Revisit the ones you missed — the explanation names the underlying rule each time.') +
          '</p></div>' +
          '<button class="btn wide" id="again">Run again (reshuffled)</button>' +
          '<a class="btn wide ghost" href="#/drill">Other drill sets</a>' +
          '<a class="btn wide ghost" href="#/learn">Back to the techniques</a>';
        document.getElementById('again').onclick = function () {
          state.i = 0; state.right = 0; state.order = shuffle(state.order); paint(); window.scrollTo(0,0);
        };
      }
      paint();
    }};
  }

  /* ========================== Course (B&R) ========================== */

  function courseVisited() { return S.get('course:visited', {}); }
  function markChapterVisited(id) {
    var v = courseVisited(); if (v[id]) return; v[id] = 1; S.set('course:visited', v);
  }
  function courseQuizKey(id) { return 'course:quiz:' + id; }

  /* SVG diagrams – keyed by the section.anim field. */
  function animHTML(key) {
    if (key === 'channel') return '' +
      '<figure class="anim-fig" aria-label="Channel model: Alice, channel, Bob, Eve">' +
      '<svg viewBox="0 0 380 190" xmlns="http://www.w3.org/2000/svg">' +
      '<style>' +
        '.af{font:13px/1.4 system-ui,sans-serif;fill:currentColor}' +
        '.af-sm{font-size:11px;opacity:.6}' +
        '@keyframes cpkt{0%{transform:translateX(0);opacity:1}45%{transform:translateX(52px);opacity:1}' +
          '55%{transform:translateX(52px);opacity:0}56%{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:1}}' +
        '@keyframes ceav{0%,100%{opacity:.25}50%{opacity:.9}}' +
        '.af-pkt{animation:cpkt 2.2s linear infinite}' +
        '.af-eav{animation:ceav 2.2s ease-in-out infinite}' +
      '</style>' +
      '<defs><marker id="aar" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">' +
        '<path d="M0,0 L0,6 L7,3z" fill="currentColor" opacity=".45"/></marker></defs>' +
      /* Alice */ '<rect x="8" y="40" width="82" height="56" rx="10" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="49" y="63" text-anchor="middle" class="af" font-weight="600">Alice</text>' +
      '<text x="49" y="82" text-anchor="middle" class="af af-sm">(sender S)</text>' +
      /* Channel */ '<rect x="149" y="40" width="82" height="56" rx="10" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="190" y="60" text-anchor="middle" class="af" font-weight="600">Channel</text>' +
      '<text x="190" y="78" text-anchor="middle" class="af af-sm">adversary</text>' +
      '<text x="190" y="92" text-anchor="middle" class="af af-sm">controls this</text>' +
      /* Bob */ '<rect x="290" y="40" width="82" height="56" rx="10" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="331" y="63" text-anchor="middle" class="af" font-weight="600">Bob</text>' +
      '<text x="331" y="82" text-anchor="middle" class="af af-sm">(receiver R)</text>' +
      /* Arrows */ '<line x1="90" y1="68" x2="149" y2="68" stroke="currentColor" stroke-opacity=".4" marker-end="url(#aar)"/>' +
      '<line x1="231" y1="68" x2="290" y2="68" stroke="currentColor" stroke-opacity=".4" marker-end="url(#aar)"/>' +
      /* Animated packet */ '<g class="af-pkt"><rect x="97" y="61" width="30" height="14" rx="3" fill="#7aa2f7" opacity=".85"/>' +
      '<text x="112" y="73" text-anchor="middle" style="font:9px system-ui;fill:#0b0e12">msg</text></g>' +
      /* Eve */ '<rect x="149" y="130" width="82" height="40" rx="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="190" y="155" text-anchor="middle" class="af" font-weight="600">Eve (A)</text>' +
      /* Tap line */ '<line x1="190" y1="130" x2="190" y2="96" stroke="currentColor" stroke-dasharray="4,3" class="af-eav"/>' +
      '<text x="207" y="120" class="af af-sm">reads!</text>' +
      '</svg>' +
      '<figcaption>The channel model: every bit Alice sends passes through infrastructure Eve controls. Cryptography hides the content even so.</figcaption>' +
      '</figure>';

    if (key === 'trust-models') return '' +
      '<figure class="anim-fig" aria-label="Symmetric vs public-key encryption">' +
      '<svg viewBox="0 0 380 160" xmlns="http://www.w3.org/2000/svg">' +
      '<style>.af{font:12px/1.4 system-ui,sans-serif;fill:currentColor}.af-lbl{font-size:10px;opacity:.6}</style>' +
      /* Symmetric side */ '<text x="95" y="18" text-anchor="middle" class="af" font-weight="700">Symmetric</text>' +
      '<rect x="8" y="28" width="60" height="36" rx="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="38" y="51" text-anchor="middle" class="af">Alice</text>' +
      '<rect x="122" y="28" width="60" height="36" rx="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="152" y="51" text-anchor="middle" class="af">Bob</text>' +
      '<line x1="68" y1="46" x2="122" y2="46" stroke="#7aa2f7" stroke-opacity=".7"/>' +
      '<text x="95" y="42" text-anchor="middle" class="af" style="font-size:10px;fill:#7aa2f7">K</text>' +
      '<text x="95" y="84" text-anchor="middle" class="af af-lbl">shared secret key</text>' +
      /* Separator */ '<line x1="190" y1="20" x2="190" y2="150" stroke="currentColor" stroke-opacity=".15"/>' +
      /* Public-key side */ '<text x="285" y="18" text-anchor="middle" class="af" font-weight="700">Public-key</text>' +
      '<rect x="200" y="28" width="60" height="36" rx="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="230" y="51" text-anchor="middle" class="af">Alice</text>' +
      '<rect x="312" y="28" width="60" height="36" rx="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="342" y="51" text-anchor="middle" class="af">Bob</text>' +
      '<text x="342" y="92" text-anchor="middle" class="af" style="font-size:10px;fill:#9d7cd8">pk (public)</text>' +
      '<text x="342" y="106" text-anchor="middle" class="af" style="font-size:10px;fill:#e57a7a">sk (private)</text>' +
      '<line x1="260" y1="46" x2="312" y2="46" stroke="#9d7cd8" stroke-opacity=".7" stroke-dasharray="3,2"/>' +
      '<text x="286" y="42" text-anchor="middle" class="af" style="font-size:10px;fill:#9d7cd8">pk</text>' +
      '<text x="285" y="84" text-anchor="middle" class="af af-lbl">no prior meeting needed</text>' +
      '</svg>' +
      '<figcaption>Symmetric encryption requires a shared secret key. Public-key encryption lets anyone encrypt using a published key; only the key holder can decrypt.</figcaption>' +
      '</figure>';

    if (key === 'subst-cipher') {
      var letters = 'ABCDEFGHIJKLM', mapped = 'QWERTYUIOPASDF';
      var svgRows = '';
      for (var ci = 0; ci < 13; ci++) {
        var x = 14 + ci * 27;
        svgRows += '<rect x="' + (x-1) + '" y="8" width="22" height="22" rx="4" fill="none" stroke="currentColor" stroke-opacity=".25"/>' +
                   '<text x="' + (x+10) + '" y="24" text-anchor="middle" style="font:13px/1 system-ui;fill:currentColor;font-weight:600">' + letters[ci] + '</text>' +
                   '<line x1="' + (x+10) + '" y1="30" x2="' + (x+10) + '" y2="44" stroke="currentColor" stroke-opacity=".3" marker-end="url(#sar)"/>' +
                   '<rect x="' + (x-1) + '" y="44" width="22" height="22" rx="4" fill="#7aa2f7" fill-opacity=".15" stroke="#7aa2f7" stroke-opacity=".4"/>' +
                   '<text x="' + (x+10) + '" y="60" text-anchor="middle" style="font:13px/1 system-ui;fill:#7aa2f7;font-weight:600">' + mapped[ci] + '</text>';
      }
      return '<figure class="anim-fig" aria-label="Substitution cipher alphabet mapping">' +
        '<svg viewBox="0 0 365 90" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><marker id="sar" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">' +
        '<path d="M0,0 L0,5 L5,2.5z" fill="currentColor" opacity=".3"/></marker></defs>' +
        svgRows +
        '<text x="182" y="84" text-anchor="middle" style="font:10px system-ui;fill:currentColor;opacity:.5">A–M shown; N–Z continue similarly</text>' +
        '</svg>' +
        '<figcaption>Each plaintext letter maps to a fixed ciphertext letter. The mapping is consistent and reversible — but it preserves frequency patterns.</figcaption>' +
        '</figure>';
    }

    if (key === 'freq-analysis') {
      var freqs = [
        {l:'E',f:12.7},{l:'T',f:9.1},{l:'A',f:8.2},{l:'O',f:7.5},{l:'I',f:7.0},
        {l:'N',f:6.7},{l:'S',f:6.3},{l:'H',f:6.1},{l:'R',f:6.0},{l:'D',f:4.3},
        {l:'L',f:4.0},{l:'C',f:2.8},{l:'U',f:2.8}
      ];
      var maxF = 13.5, bw = 22, gap = 4, leftPad = 24;
      var bars = '';
      freqs.forEach(function (d, i) {
        var x = leftPad + i * (bw + gap);
        var bh = Math.round((d.f / maxF) * 90);
        var top = 100 - bh;
        var accent = i < 6;
        bars += '<rect x="' + x + '" y="' + top + '" width="' + bw + '" height="' + bh + '" rx="3" fill="' +
                (accent ? '#7aa2f7' : 'currentColor') + '" ' + (accent ? '' : 'opacity=".3"') + '/>' +
                '<text x="' + (x + bw/2) + '" y="114" text-anchor="middle" style="font:11px system-ui;fill:currentColor;opacity:.7">' + d.l + '</text>' +
                '<text x="' + (x + bw/2) + '" y="' + (top - 3) + '" text-anchor="middle" style="font:9px system-ui;fill:' +
                (accent ? '#7aa2f7' : 'currentColor') + ';opacity:' + (accent ? '1' : '.5') + '">' + d.f + '</text>';
      });
      return '<figure class="anim-fig" aria-label="English letter frequencies">' +
        '<svg viewBox="0 0 390 128" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="195" y="12" text-anchor="middle" style="font:11px system-ui;fill:currentColor;opacity:.6">English letter frequency (%) — top 6 highlighted</text>' +
        bars +
        '</svg>' +
        '<figcaption>The top six letters (E, T, A, O, I, N) account for over half of all letters in typical English text. A substitution cipher maps each to a fixed ciphertext letter, so this pattern is visible in the ciphertext too.</figcaption>' +
        '</figure>';
    }

    if (key === 'otp-xor') return '' +
      '<figure class="anim-fig" aria-label="One-time pad XOR encryption">' +
      '<svg viewBox="0 0 360 130" xmlns="http://www.w3.org/2000/svg">' +
      '<style>.xf{font:13px/1.4 ui-monospace,monospace;fill:currentColor}.xl{font:11px system-ui;fill:currentColor;opacity:.6}</style>' +
      /* Labels */ '<text x="8" y="36" class="xl">M (message)</text>' +
      '<text x="8" y="72" class="xl">K (key)</text>' +
      '<text x="8" y="108" class="xl">C = M⊕K</text>' +
      /* Bits row M */ '<text x="130" y="36" class="xf">1</text><text x="155" y="36" class="xf">0</text>' +
      '<text x="180" y="36" class="xf">1</text><text x="205" y="36" class="xf">1</text>' +
      '<text x="230" y="36" class="xf">0</text><text x="255" y="36" class="xf">1</text><text x="280" y="36" class="xf">0</text>' +
      /* Bits row K */ '<text x="130" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">0</text>' +
      '<text x="155" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">1</text>' +
      '<text x="180" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">1</text>' +
      '<text x="205" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">0</text>' +
      '<text x="230" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">1</text>' +
      '<text x="255" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">1</text>' +
      '<text x="280" y="72" style="font:13px ui-monospace,monospace;fill:#9d7cd8">0</text>' +
      /* Divider */ '<line x1="120" y1="78" x2="310" y2="78" stroke="currentColor" stroke-opacity=".3"/>' +
      '<text x="118" y="76" text-anchor="end" style="font:12px ui-monospace,monospace;fill:currentColor;opacity:.5">⊕</text>' +
      /* Bits row C */ '<text x="130" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">1</text>' +
      '<text x="155" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">1</text>' +
      '<text x="180" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">0</text>' +
      '<text x="205" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">1</text>' +
      '<text x="230" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">1</text>' +
      '<text x="255" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">0</text>' +
      '<text x="280" y="108" style="font:13px ui-monospace,monospace;fill:#7aa2f7">0</text>' +
      '<text x="315" y="108" class="xl">← ciphertext</text>' +
      '</svg>' +
      '<figcaption>XOR each message bit with a key bit to get the ciphertext. Applying K again recovers M: C⊕K = (M⊕K)⊕K = M. The key is never reused.</figcaption>' +
      '</figure>';

    return '';
  }

  /* Inline multiple-choice quiz for a section. */
  function sectionQuizHTML(items, quizId) {
    if (!items || !items.length) return '';
    var h = '<div class="eyebrow">Check your understanding</div>';
    items.forEach(function (item, i) {
      var key = quizId + ':' + i;
      h += '<div class="cq-block" data-key="' + esc(key) + '" data-answer="' + item.answer + '">' +
           '<p class="cq-q">' + t(item.q) + '</p>';
      item.opts.forEach(function (opt, j) {
        h += '<button class="cq-opt" data-j="' + j + '">' + t(opt) + '</button>';
      });
      h += '<div class="cq-why" hidden>' + t(item.why) + '</div></div>';
    });
    return h;
  }

  /* Mastery quiz at bottom of chapter: scored, result saved. */
  function masteryQuizHTML(chId) {
    var ch = byId(COURSE, chId);
    if (!ch || !ch.mastery || !ch.mastery.length) return '';
    var saved = S.get(courseQuizKey(chId), null);
    var h = '<div class="eyebrow">Chapter mastery quiz</div>' +
            '<p class="lead sm">Answer all questions to gauge your understanding. Your best score is saved.</p>';
    if (saved) h += '<div class="cq-saved">Your best score: <b>' + saved + ' / ' + ch.mastery.length + '</b></div>';
    h += '<div id="mastery-quiz"></div>' +
         '<button class="btn wide" id="mastery-start">Start quiz</button>';
    return h;
  }

  function vCourse() {
    var visited = courseVisited();
    var unlocked = COURSE.filter(function (c) { return !c.locked; });
    var done = 0;
    unlocked.forEach(function (c) { if (visited[c.id]) done++; });

    var h = '<p class="lead">A walkthrough of Bellare &amp; Rogaway\'s <em>Introduction to Modern Cryptography</em>, ' +
            'one chapter at a time. Each chapter has worked examples, inline quizzes, and a scored mastery test at the end.</p>';

    if (done) {
      h += '<div class="progress"><i style="width:' + Math.round(100 * done / unlocked.length) + '%"></i></div>' +
           '<p class="score">' + done + ' of ' + unlocked.length + ' chapters opened</p>';
    }

    h += '<div class="eyebrow">Available now</div>';
    COURSE.forEach(function (ch) {
      if (ch.locked) return;
      var v = visited[ch.id];
      var score = S.get(courseQuizKey(ch.id), null);
      h += '<a class="card chapter-card' + (v ? ' visited' : '') + '" href="#/course/' + ch.id + '">' +
           '<h3><span class="ch-num">Ch ' + ch.num + '</span>' + esc(ch.title) + '</h3>' +
           '<p>' + esc(ch.blurb) + '</p>';
      if (score !== null) h += '<span class="chip ok">quiz ' + score + '/' + ch.mastery.length + '</span>';
      else if (v) h += '<span class="chip">opened</span>';
      h += '</a>';
    });

    h += '<div class="eyebrow">Coming soon</div><div class="grid">';
    COURSE.forEach(function (ch) {
      if (!ch.locked) return;
      h += '<div class="card locked-card"><span class="ch-num sm">Ch ' + ch.num + '</span>' +
           '<h3>' + esc(ch.title) + '</h3><p>' + esc(ch.blurb) + '</p></div>';
    });
    h += '</div>';

    h += '<div class="note"><b>&#8594;</b> Start with the Basics primer if any of the maths feels unfamiliar — ' +
         'it covers sets, functions, probability, and proof technique in plain English before you need them here.</div>';
    return { title: 'Course', html: h, tab: 'course' };
  }

  function vChapter(id) {
    var ch = byId(COURSE, id);
    if (!ch || ch.locked) return notFound();
    markChapterVisited(id);

    var h = '<p class="lead">' + esc(ch.blurb) + '</p>';

    /* Sections */
    ch.sections.forEach(function (sec) {
      h += '<h2 class="sec-heading">' + esc(sec.title) + '</h2>';
      h += '<div class="prose">';
      sec.body.forEach(function (para) {
        /* Display-math blocks get their own paragraph treatment */
        if (para.slice(0, 2) === '$$') {
          h += '<p class="mathblock">' + t(para.replace(/^\$\$|\$\$$/g, '')) + '</p>';
        } else {
          h += '<p>' + t(para) + '</p>';
        }
      });
      h += '</div>';
      if (sec.anim) h += animHTML(sec.anim);
      if (sec.quiz && sec.quiz.length) h += sectionQuizHTML(sec.quiz, sec.id);
    });

    /* Mastery quiz */
    h += '<div class="ch-divider"></div>';
    h += masteryQuizHTML(id);

    /* Navigation */
    var chList = COURSE.filter(function (c) { return !c.locked; });
    var at = 0; chList.forEach(function (c, i) { if (c.id === id) at = i; });
    h += '<div class="row nav">' +
         '<a class="btn ghost" href="#/course">&#8249; Course map</a>' +
         (at < chList.length - 1
           ? '<a class="btn" href="#/course/' + chList[at+1].id + '">Next chapter &#8250;</a>'
           : '') +
         '</div>';

    return { title: 'Ch ' + ch.num + ': ' + ch.title, html: h, tab: 'course', back: '#/course',
      after: function () {
        /* Inline section quiz interactivity */
        Array.prototype.forEach.call(main.querySelectorAll('.cq-block'), function (block) {
          var correct = parseInt(block.dataset.answer, 10);
          var why = block.querySelector('.cq-why');
          Array.prototype.forEach.call(block.querySelectorAll('.cq-opt'), function (btn) {
            btn.onclick = function () {
              if (btn.disabled) return;
              var j = parseInt(btn.dataset.j, 10);
              Array.prototype.forEach.call(block.querySelectorAll('.cq-opt'), function (b) {
                b.disabled = true;
                var bj = parseInt(b.dataset.j, 10);
                if (bj === correct) b.className = 'cq-opt right';
                else if (bj === j) b.className = 'cq-opt wrong';
              });
              why.hidden = false;
            };
          });
        });

        /* Mastery quiz */
        var startBtn = document.getElementById('mastery-start');
        var quizBox  = document.getElementById('mastery-quiz');
        if (!startBtn || !quizBox) return;
        startBtn.onclick = function () {
          startBtn.hidden = true;
          var items = shuffle(ch.mastery.slice());
          var state = { i: 0, right: 0 };

          function paintQ() {
            if (state.i >= items.length) return finish();
            var item = items[state.i];
            var perm = shuffle(item.opts.map(function (_, k) { return k; }));
            var ansPos = perm.indexOf(item.answer);
            var html = '<div class="progress"><i style="width:' + Math.round(100 * state.i / items.length) + '%"></i></div>' +
                       '<p class="score">Question ' + (state.i+1) + ' of ' + items.length + '</p>' +
                       '<div class="card"><div class="prose"><p>' + t(item.q) + '</p></div></div>';
            perm.forEach(function (orig, k) {
              html += '<button class="opt mq-opt" data-k="' + k + '" data-ans="' + ansPos + '">' +
                      t(item.opts[orig]) + '</button>';
            });
            quizBox.innerHTML = html;
            Array.prototype.forEach.call(quizBox.querySelectorAll('.mq-opt'), function (b) {
              b.onclick = function () {
                var k = parseInt(b.dataset.k, 10), ans = parseInt(b.dataset.ans, 10);
                Array.prototype.forEach.call(quizBox.querySelectorAll('.mq-opt'), function (x) {
                  x.disabled = true;
                  var xk = parseInt(x.dataset.k, 10);
                  if (xk === ans) x.className = 'opt right';
                  else if (xk === k) x.className = 'opt wrong';
                });
                if (k === ans) state.right++;
                var why = document.createElement('div');
                why.className = 'why';
                why.innerHTML = '<b>' + (k === ans ? 'Correct.' : 'Not quite.') + '</b> ' + t(item.why);
                quizBox.appendChild(why);
                var nx = document.createElement('button');
                nx.className = 'btn wide'; nx.style.marginTop = '12px';
                nx.textContent = state.i < items.length - 1 ? 'Next question' : 'See results';
                nx.onclick = function () { state.i++; paintQ(); window.scrollTo(0,0); };
                quizBox.appendChild(nx);
                why.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              };
            });
          }

          function finish() {
            var total = items.length;
            var prev = S.get(courseQuizKey(id), 0);
            if (state.right > prev) S.set(courseQuizKey(id), state.right);
            quizBox.innerHTML = '<div class="card"><h3>' + state.right + ' / ' + total + '</h3>' +
              '<p>' + (state.right === total
                ? 'Perfect. On to the next chapter.'
                : 'Review the explanations above, then try again.') + '</p></div>' +
              '<button class="btn wide" id="mq-again">Try again (reshuffled)</button>' +
              '<a class="btn wide ghost" href="#/course">Back to course map</a>';
            document.getElementById('mq-again').onclick = function () {
              state.i = 0; state.right = 0;
              items = shuffle(ch.mastery.slice()); paintQ(); window.scrollTo(0,0);
            };
          }
          paintQ();
        };
      }
    };
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
    PRIMER.forEach(function (l) {
      var tr = byId(TRACKS, l.track);
      INDEX.push({ href: '#/primer/' + l.id, title: l.title,
        kind: 'Primer &middot; ' + (tr ? tr.title : l.track),
        text: [l.oneline, l.body.join(' '),
               (l.jargon||[]).map(function (j) { return j.t + ' ' + j.p; }).join(' '),
               l.example ? l.example.h + ' ' + l.example.body.join(' ') : '',
               (l.check||[]).map(function (c) { return c.q + ' ' + c.a; }).join(' ')].join(' ') });
    });
    GLOSSARY.forEach(function (g) {
      g.items.forEach(function (it) {
        INDEX.push({ href: '#/glossary/' + encodeURIComponent(it.n), title: it.s + ' — ' + it.n,
          kind: 'Notation', text: it.n + ' ' + it.p + ' ' + g.g });
      });
    });
    COURSE.forEach(function (ch) {
      if (ch.locked) return;
      INDEX.push({ href: '#/course/' + ch.id, title: 'Ch ' + ch.num + ': ' + ch.title,
        kind: 'Course', text: ch.blurb + ' ' + (ch.sections || []).map(function (s) {
          return s.title + ' ' + s.body.join(' ');
        }).join(' ') });
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
    [/^\/primer$/,           function () { return vPrimer(); }],
    [/^\/primer\/(.+)$/,     function (m) { return vLesson(m[1]); }],
    [/^\/path$/,             function () { return vPath(); }],
    [/^\/glossary\/?(.*)$/,  function (m) { return vGlossary(decodeURIComponent(m[1] || '')); }],
    [/^\/basics$/,           function () { return vBasics(); }],
    [/^\/basics\/(.+)$/,     function (m) { return vConcept(m[1]); }],
    [/^\/learn$/,            function () { return vLearn(); }],
    [/^\/learn\/(.+)$/,      function (m) { return vTech(m[1]); }],
    [/^\/proofs$/,           function () { return vProofs(); }],
    [/^\/proofs\/(.+)$/,     function (m) { return vProof(m[1]); }],
    [/^\/build$/,            function () { return vBuild(); }],
    [/^\/build\/(.+)$/,      function (m) { return vBuilder(m[1]); }],
    [/^\/drill$/,            function () { return vDrillMenu(); }],
    [/^\/drill\/(.+)$/,      function (m) { return vDrill(m[1]); }],
    [/^\/checklist$/,        function () { return vChecklist(); }],
    [/^\/install$/,          function () { return vInstall(); }],
    [/^\/search\/?(.*)$/,    function (m) { return vSearch(decodeURIComponent(m[1] || '')); }],
    [/^\/course$/,           function () { return vCourse(); }],
    [/^\/course\/(.+)$/,     function (m) { return vChapter(m[1]); }]
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
