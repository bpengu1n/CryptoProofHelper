# Crypto Proof Helper

An offline mobile app for learning to **think through and write proofs** in a
graduate applied-cryptography course. It is not a formula sheet: every page is
organised around the move you make next.

It starts further back than that suggests. A built-in primer teaches the
discrete maths and the proof-writing basics the rest of the app assumes, so
someone who has never written a proof — or met a quantifier — can start at the
beginning and arrive at the worked proofs able to read them.

It installs to a phone home screen and runs with the radio off — on a train, in
an exam-prep room, wherever. No accounts, no network calls, no dependencies.

## What is in it

| Section | What it is for |
| --- | --- |
| **Start** | Two doors: the primer for a cold start, and triage — nine descriptions of "what you have been asked to prove", each pointing at the technique that handles it. |
| **Basics** | The primer: 19 lessons in three tracks. *Ground floor* — sets and strings, probability, counting and pigeonhole, modular arithmetic, groups and discrete log, growth rates, logic and quantifiers. *Writing proofs* — what a proof is, direct, contrapositive and contradiction, induction, cases and counterexamples, how to write one down. *Crypto ideas* — why security must be proved, keys and randomness, adversaries and oracles, games and advantage, what a reduction is without symbols. Each lesson carries a worked example, a "saying it out loud" glossary, and hidden-answer self-checks. |
| **Notation** | Every symbol the app uses — 48 of them — with how you say it out loud and what it means, filterable. |
| **Techniques** | The playbook: reduction, game hopping, hybrid arguments, identical-until-bad, the switching lemma, random-oracle programming, rewinding, simulation, information-theoretic counting. Each has *when to reach for it*, a numbered skeleton, and the specific ways it goes wrong. |
| **Proofs** | Eight worked proofs — PRG one-time secrecy, the hybrid ladder, PRF ⟹ IND-CPA for CTR mode, DDH ⟹ ElGamal, encrypt-then-MAC ⟹ IND-CCA, one-time-pad optimality, Merkle–Damgård, hashed ElGamal in the ROM. Every step carries a **"why this step"** note naming the move that produced it, so you can learn the reasoning rather than memorise the algebra. |
| **Build** | Guided prompts that emit a LaTeX proof skeleton with the structure already correct. Drafts save on-device; copy the result into your problem set. |
| **Drill** | 34 items in three sets: *warm-up* (the primer material), *which technique applies*, and *spot the flaw* — the flaws are the ones that actually cost marks. Options are reshuffled per question. |
| **Foundations** | The ten definitions you must be able to state cold, each with a "watch out" list. |
| **Checklist** | A pre-submission self-review, saved between sessions. |

Every technique, definition and worked proof opens with an **In plain English**
box saying the same thing without the machinery, and links back to the primer
lessons it assumes. Full-text search covers every page, primer and notation
included.

## Put it on your iPhone

**[bpengu1n.github.io/CryptoProofHelper](https://bpengu1n.github.io/CryptoProofHelper/)** — open that on the phone, or scan:

<img src="docs/install-qr.png" alt="QR code linking to the app" width="180">

Then, in **Safari** (Chrome and Firefox on iOS cannot add to the home screen):

1. Tap the Share button in the toolbar.
2. Scroll down, tap **Add to Home Screen**, then **Add**.
3. Open it once while online so it caches itself. After that it runs with no
   connection at all.

The app nudges you through those steps itself the first time you open it in
iOS Safari, and `#/install` has the instructions for every platform.

### First, switch Pages on (once per repo)

Publishing is automatic — `.github/workflows/pages.yml` deploys every push to
`main` — but GitHub needs to be told to accept it:

**Settings → Pages → Source: GitHub Actions.**

Then re-run the workflow (Actions → *Deploy to GitHub Pages* → *Run workflow*)
or push any commit, and the URL above goes live in about a minute. If you
forked or renamed the repo, your URL is
`https://<owner>.github.io/<repo>/` — regenerate the QR with
`pip install segno && python3 tools/make_qr.py`.

The workflow publishes only the app itself; `tools/`, `docs/` and this README
stay out of the deployed site. It also fails the build if a shipped file is
missing from the service worker's precache list, since that would leave
installed copies serving a half-updated app.

### Running it locally instead

```sh
python3 tools/serve.py        # http://localhost:8000
```

Serving over `http://` matters — service workers do not register from `file://`.
The app itself still renders if you open `index.html` directly, just without
offline caching.

## Layout

```
index.html              app shell + tab bar
css/app.css             one stylesheet, light and dark
js/store.js             this app's localStorage instance (see vendor/ below)
js/install.js           this app's add-to-home-screen banner (see vendor/ below)
js/app.js               hash router and views
js/data/primer.js       the primer, notation glossary, and suggested route
js/data/*.js            all content: concepts, techniques, examples, drills, templates
vendor/puzzlepieces/    git submodule (github.com/bpengu1n/PuzzlePieces):
                          the math renderer, localStorage wrapper, and PWA
                          install-prompt detection, shared with other projects
sw.js                   cache-first service worker
.github/workflows/      GitHub Pages deployment
tools/                  dev helpers (not shipped to the phone)
```

Reusable pieces of this app — anything that isn't specific to teaching
crypto proofs — live in [PuzzlePieces](https://github.com/bpengu1n/PuzzlePieces)
and are pulled in here as a git submodule rather than owned by this repo.
A fresh clone needs `git submodule update --init --recursive` before the app
will run. See `AGENTS.md` for the full rationale and the workflow for
changing anything under `vendor/puzzlepieces/`.

**Why a hand-rolled math renderer.** KaTeX and MathJax load from a CDN, which
would defeat an offline app, and vendoring them costs hundreds of kilobytes for
a subset of notation this app never uses. `vendor/puzzlepieces/js/math-renderer`
(~200 lines) renders the subset that actually appears in crypto proofs —
`\Adv`, `\negl`, `\rand`, `\bits`, sub/superscripts, fractions, greek, the
standard relation and set symbols — as styled HTML.

## Editing the content

The content is plain data in `js/data/`. Prose supports `**bold**`, `*italic*`,
`` `code` ``, and `$math$` / `$$display math$$`.

After any content edit:

```sh
node tools/lint-content.js    # unbalanced $, unrendered markup
node tools/smoke.js           # every route renders, no console errors
node tools/test-install.js    # iOS nudge, Pages subpath, offline after the origin dies
```

The last two need playwright (`npm i playwright`).

`smoke.js` also asserts the things a reader would notice before a test would:
that the drill reshuffles its options (every item stores its correct answer
first, so a fixed order would make the whole drill guessable), that
check-yourself answers stay hidden until asked for, and that search reaches the
primer.

`lint-content.js` exists because markup mistakes fail silently — a `**bold**`
that spans a `$math$` boundary, or an unclosed `$`, renders as literal noise
rather than throwing.

**Bump `CACHE` in `sw.js`** after changing any shipped file, or installed copies
keep serving the old bundle.

Icons are generated, not committed by hand: `python3 tools/make_icons.py`.

## A caveat on the content

Conventions differ between courses — notably the factor of 2 in the definition
of advantage, and whether adversaries are uniform or non-uniform. The material
here flags both, but check it against your own lecture notes before quoting a
bound in a problem set.
