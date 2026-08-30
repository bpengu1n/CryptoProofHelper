# AGENTS.md — CryptoProofHelper

Agent-readable guide to the repository. Keep this file current when you add files, change workflows, or shift architectural constraints.

---

## Project overview

CryptoProofHelper is an offline-first Progressive Web App (PWA) that teaches applied cryptography and proof writing. It targets learners with no background in discrete mathematics or academic cryptography. Content follows Bellare & Rogaway *Introduction to Modern Cryptography* for the course track; the primer and tools tracks are independent.

**Live URL:** https://bpengu1n.github.io/CryptoProofHelper/  
**Repository:** https://github.com/bpengu1n/CryptoProofHelper  
**Active branch:** `claude/accessible-crypto-proofs-3e8isj`

---

## Hard constraints

- **No build step.** No bundler, no transpiler, no package manager required for the app itself. Plain HTML + CSS + ES5 JS.
- **No CDN URLs in page JS or CSS.** The service worker caches a fixed asset list; any URL not in that list won't be available offline and will also be blocked by the SW on first load.
- **No external dependencies at runtime.** KaTeX, MathJax, and similar math renderers require a CDN — use `window.MathRenderer` (from `vendor/puzzlepieces/js/math-renderer`) instead.
- **ES5 only in app code.** The codebase targets old WebKit (iOS Safari 12). Arrow functions, `let`/`const`, template literals, and `class` syntax work on modern browsers but break this target. Use `var`, `function`, and string concatenation.
- **Service worker CACHE version must be bumped on every shipped file change.** See [Service worker](#service-worker) below.

---

## Repository layout

```
index.html                 Shell — tabs, router anchor, script tags
css/
  app.css                  All styles; dark-mode via @media prefers-color-scheme
js/
  store.js                 Instantiates this app's CPStore from vendor/puzzlepieces
  install.js               This app's install-banner UI, wrapping vendor/puzzlepieces
  app.js                   Router, views, all UI logic
js/data/
  course.js                window.CP_COURSE — B&R course chapters
  primer.js                window.CP_PRIMER — standalone primer lessons
  concepts.js              window.CP_CONCEPTS — definition cards
  techniques.js            window.CP_TECHNIQUES — proof-technique library
  examples.js              window.CP_EXAMPLES — worked examples
  drills.js                window.CP_DRILLS — drill/quiz sets
  templates.js             window.CP_TEMPLATES — proof-draft templates
vendor/puzzlepieces/       Git submodule: github.com/bpengu1n/PuzzlePieces
  js/math-renderer/        Custom LaTeX-subset renderer (window.MathRenderer)
  js/local-store/          Guarded localStorage wrapper (window.LocalStore)
  js/pwa-install-detect/   PWA install-prompt platform detection (window.PwaInstallDetect)
  python/                  Dev tools this repo's tools/ scripts wrap (see below)
sw.js                      Cache-first service worker
manifest.webmanifest       PWA manifest
icons/                     App icons (192, 512, 180, maskable-512)
tools/
  serve.py                 Dev server (localhost:8000); wraps vendor/puzzlepieces/python/static-dev-server
  make_icons.py            Icon drawing; wraps vendor/puzzlepieces/python/png-writer
  make_qr.py               Install-QR generator; wraps vendor/puzzlepieces/python/pages-qr
  lint-content.js          Content linter (no deps)
  smoke.js                 Playwright smoke test
  test-install.js          Playwright PWA install test
```

### The `vendor/puzzlepieces` submodule

Anything in this app that is generic enough to be useful outside it — the
math renderer, the localStorage wrapper, PWA install-prompt detection, and
a few no-dependency dev tools — lives in the
[PuzzlePieces](https://github.com/bpengu1n/PuzzlePieces) repo instead of
here, and is pulled in as a git submodule at `vendor/puzzlepieces`.

**This repo does not own those files. Never edit anything under
`vendor/puzzlepieces/` directly** — it is a pinned commit of another repo;
edits made there are invisible outside this checkout and are silently
discarded the next time the submodule pointer is updated. If a fix or a new
capability is needed in one of those modules:

1. Make the change in the PuzzlePieces repo itself (clone/open it
   separately if it isn't already available alongside this checkout),
   following its own `AGENTS.md`. Commit and push it there.
2. Come back here, update the submodule pointer, and commit that:
   ```bash
   cd vendor/puzzlepieces && git pull origin <branch> && cd ../..
   git add vendor/puzzlepieces
   git commit -m "vendor/puzzlepieces: pull in <what changed>"
   ```
3. If the change affects this app's behavior (e.g. a `MathRenderer` API
   change), update `js/app.js` and this file's usage notes in the same
   commit.

A fresh clone of this repo needs the submodule initialized before the app
will run:

```bash
git submodule update --init --recursive
```

If something in this app currently feels app-specific but is really
general-purpose, extract it into PuzzlePieces rather than growing it here
— see that repo's `AGENTS.md` for the extraction workflow.

---

## Development workflow

### Serve

```bash
python3 tools/serve.py
```

Open http://localhost:8000. **Do not open `index.html` via `file://`** — service workers require HTTP.

### Lint content

After editing any `js/data/*.js` file:

```bash
node tools/lint-content.js
```

No npm install needed. Reports missing required fields, malformed quiz items, and broken references.

### Run tests

```bash
npm install playwright   # one-time; Playwright only, no other deps
node tools/smoke.js
node tools/test-install.js
```

Tests use a headless Chromium launched by Playwright; they verify routing, math rendering, and quiz interactivity.

---

## Service worker

`sw.js` exports a `CACHE` constant (currently `'cph-v5'`) and an `ASSETS` array.

**Every time you add, rename, or remove a file that the app loads:**

1. Add or update the path in the `ASSETS` array in `sw.js`.
2. Bump `CACHE` to the next version (e.g. `'cph-v5'`).

Failing to bump the cache means users who already have the app installed will keep loading the old version indefinitely.

---

## Math markup

The renderer lives in `vendor/puzzlepieces/js/math-renderer` (submodule —
see above) and exposes two functions on `window.MathRenderer`:

| Call | Use |
|------|-----|
| `MathRenderer.render(src)` | Pure math expression → HTML |
| `MathRenderer.text(src)` | Prose with embedded `$...$` / `$$...$$` → HTML |

In `app.js`, `M` aliases `window.MathRenderer` and `t(s)` is shorthand for `M.text(s)`.

### Supported syntax

- `$inline math$` and `$$display math$$` delimiters inside prose strings passed to `t()`.
- Greek: `\alpha`, `\beta`, `\Sigma`, etc. (see `MACROS` in `vendor/puzzlepieces/js/math-renderer/math-renderer.js`).
- Relations: `\le`, `\ge`, `\equiv`, `\approx`, `\neq`, etc.
- Arrows: `\to`, `\Rightarrow`, `\iff`, `\mapsto`, etc.
- Operators: `\oplus`, `\times`, `\sum`, `\prod`, `\frac{n}{d}`, `\binom{n}{k}`, `\sqrt{x}`.
- Named functions (rendered upright): `\Pr`, `\Adv`, `\negl`, `\Enc`, `\Dec`, `\Gen`, `\PRF`, etc. (see `WORDS` in `vendor/puzzlepieces/js/math-renderer/math-renderer.js`).
- Subscripts/superscripts: `x_i`, `x^n`, `x_{ij}`, `x^{n+1}`.
- Text in math: `\text{some text}`, `\mathrm{name}`, `\mathsf{label}`.
- Script letters: `\mathcal{A}` → 𝒜, `\mathcal{F}` → ℱ, etc.
- Blackboard bold: `\Z` (ℤ), `\N` (ℕ), `\R` (ℝ), `\F` (𝔽), etc.
- Overline: `\overline{x}`, hat: `\hat{x}`.
- Uniform sampling: `\rand` → ←$
- QED: `\qed` → ∎
- `\square` → □, `\checkmark` → ✓, `\dagger` → †.

**Before using any `\command`, check that it is in `MACROS` or `WORDS` or handled in `Parser.prototype.command`.** Unknown commands fall through to plain upright text (the name without the backslash), which is usually wrong. Add missing symbols to the appropriate map in `vendor/puzzlepieces/js/math-renderer/math-renderer.js` (per that repo's own contribution rules — see its `AGENTS.md`), then pull the updated submodule pointer here.

### Common mistakes

- `\mathit{pk}` — supported as a pass-through, but letters are already italic in math mode, so bare `pk` is simpler and identical in output.
- Display-math paragraphs: pass `'$$...$$'` as a full prose string to `t()`. Do not strip the `$$` delimiters before calling `t()` — the renderer needs them.
- Grouping braces `{...}` are consumed by the parser; use `\{` and `\}` for literal curly braces.

---

## Adding content

### Course chapter (B&R track)

1. Open `js/data/course.js`.
2. Find the placeholder object with the chapter's `id` (e.g. `'ch3'`) and `locked: true`.
3. Replace `locked: true` with full `sections` and `mastery` arrays. Remove the `locked` key.
4. Chapter structure:
   ```js
   {
     id: 'ch3',
     num: 3,
     title: 'Symmetric Encryption',
     blurb: 'One short sentence shown on the course map.',
     sections: [
       {
         id: 'ch3-intro',          // must be globally unique
         title: 'Section heading',
         anim: 'key-name',         // optional; add handler in animHTML() in app.js
         body: [                   // array of paragraph strings; t() renders each
           'Plain prose with $inline math$ and $$display math$$.',
           'Another paragraph.'
         ],
         quiz: [                   // optional inline check-your-understanding
           { q: 'Question?', opts: ['A', 'B', 'C', 'D'], answer: 1, why: 'Because...' }
         ]
       }
     ],
     mastery: [                    // end-of-chapter quiz, 4–6 items
       { q: 'Question?', opts: ['A', 'B', 'C', 'D'], answer: 0, why: 'Because...' }
     ]
   }
   ```
5. The router (`/course/:id`) is already wired; no changes to `app.js` routing needed.
6. Bump `CACHE` in `sw.js` (content-only changes still need a cache bump so SW-cached users get fresh data).

### SVG animation

To add a new animation key (referenced via `anim: 'key-name'` in a section):

1. Add a `case 'key-name':` branch to `animHTML(key)` in `app.js`.
2. Return an inline SVG string. Use `fill="currentColor"` for text and structural elements to respect dark/light mode. Hardcode accent colors where needed (e.g. `#7aa2f7` for highlights).
3. No external files — the SVG must be fully inline.

### Primer lesson

Add to `window.CP_PRIMER` in `js/data/primer.js`:

```js
{
  id: 'lesson-id',          // kebab-case, globally unique
  track: 'foundations',     // 'foundations' | 'crypto' | 'proofs'
  title: 'Lesson title',
  oneline: 'One-sentence description.',
  body: ['Paragraph one.', 'Paragraph two.'],
  jargon: [{ word: 'Term', def: 'Definition.' }],
  example: 'A worked example string.',
  check: [{ q: 'Question?', opts: ['A','B','C','D'], answer: 2, why: 'Because...' }],
  use: ['Applied use case 1.', 'Applied use case 2.']
}
```

### Drill set

Add to `window.CP_DRILLS` in `js/data/drills.js`:

```js
{
  id: 'set-id',
  title: 'Set title',
  items: [
    { q: 'Question?', opts: ['A','B','C','D'], answer: 0, why: 'Because...' }
  ]
}
```

---

## LocalStorage schema

All keys are plain strings; no namespacing beyond what is listed.

| Key | Type | Description |
|-----|------|-------------|
| `primer:read` | JSON array of lesson IDs | Lessons the user has opened |
| `course:visited` | JSON array of chapter IDs | Chapters the user has visited |
| `course:quiz:<chId>` | JSON `{ best, total, ts }` | Mastery quiz best score per chapter |
| `drill:best:<setId>` | JSON `{ best, total }` | Best drill score per set |
| `draft:<templateId>` | String | In-progress proof draft text |
| `checklist` | JSON object `{ [itemId]: bool }` | Proof-writing checklist state |

---

## UI architecture

- **Hash router:** All navigation uses `location.hash` (`#/route`). The router in `app.js` matches `location.hash.slice(1)` against an ordered list of `[/regex/, handler]` pairs.
- **Views:** Each view is a function (e.g. `vHome()`, `vCourse()`, `vChapter(id)`) that returns `{ html, tab, back?, after? }`. `html` is injected into `#main`. `after` is a function called after DOM insertion to wire events.
- **Tabs:** The active tab is set from the `tab` field of the current view. Tab names: `home`, `course`, `primer`, `learn`, `drills`, `templates`, `glossary`.
- **Search index:** `buildIndex()` in `app.js` flattens all content into `{ id, title, body, route }` records. Add new content types here if you want them searchable.

---

## Current work in progress

**Branch:** `claude/accessible-crypto-proofs-3e8isj`

Completed on this branch:
- 19-lesson primer (foundations, crypto, proofs tracks)
- Plain-English explanatory layers on all definitions, techniques, and proofs
- 48-symbol notation glossary
- Warm-up drill sets
- Course map view and chapter viewer
- B&R Chapter 1 (Introduction) — 5 sections, inline quizzes, mastery quiz, 2 SVG animations
- B&R Chapter 2 (Classical Encryption) — 6 sections, inline quizzes, mastery quiz, 3 SVG animations
- Math rendering fixes: `\square`, `\mathit`, display-math paragraph rendering

**Pending (Ch 3–6):**
Chapters 3–6 exist in `course.js` as locked placeholder cards. To unlock a chapter, replace `locked: true` with full `sections` and `mastery` content per the schema above.

Suggested chapter priorities per B&R:
- Ch 3: Symmetric Encryption (IND-CPA, PRF-based constructions)
- Ch 4: Message Authentication Codes (UFCMA, HMAC)
- Ch 5: Authenticated Encryption (AE, nonce-based)
- Ch 6: Hash Functions (collision resistance, SHA)

---

## Commit and push

This project uses no CI; push directly to the feature branch:

```bash
git add <files>
git commit -m "descriptive message"
git push -u origin claude/accessible-crypto-proofs-3e8isj
```

Do not push to `main` directly. Open a pull request on GitHub when a feature is complete.
