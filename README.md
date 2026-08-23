# CodeTypey

A typing trainer for competitive programming syntax — C++, Java, Python, Rust, Go and
JavaScript, across USACO-style bronze / silver / gold / platinum divisions. React + Vite,
no backend.

Contest code is punctuation-dense in a way prose never is. `vector<vector<int>>`, `->`,
`::`, `});`, `dp[i][w]` — those are the sequences that cost you time on the clock, and
they're what this drills.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # static output in dist/
npm run preview  # serve the built output
npm run check    # corpus integrity + 43 engine unit tests
npm run e2e      # 43 checks driving a real browser
```

`npm run check` needs nothing but Node. `npm run e2e` needs Playwright, deliberately kept
out of the dependencies: `npm i -D playwright && npx playwright install chromium`.

## How it works

**Indentation is automatic.** Leading whitespace is shown dimmed, filled in, and excluded
from every statistic. You type the code, not the formatting.

**Accuracy is first-attempt only.** Fixing a typo repairs the text but not your accuracy.
`net wpm` counts characters standing correct at the end; `raw wpm` counts every keypress.

**The clock stops when you do,** after three seconds without a keystroke. Any key resumes
it — including when focus has drifted off the trainer, which is usually why you stopped.

**Difficulty is measured, not asserted.** Each snippet is scored on symbol density, rare
and shifted keys, distinct symbols, nesting and symbol runs. Selection aims slightly above
where you sit: above 96% accuracy the target drifts up, below 88% it eases off.

Divisions turned out not to vary typing difficulty — bronze and platinum both average
55/100. Difficulty is dominated by *language* (Python 42, C++ 64). So divisions stay a
topic axis and the ramp comes from the measured score. `npm run lint:corpus` prints the
distribution.

**Drill mode** builds a lesson from your weak characters and slow transitions instead of
picking an existing snippet — far more repetitions of what you're bad at.

**Mistakes record what you pressed,** not just that you were wrong, classified as
shift-timing, next-door key, wrong case or other.

**Progress** plots WPM and accuracy over your last 40 runs with a rolling median.

**The dashboard stays out of the way.** Code, one stats row, and everything else folded
behind a collapsed section with four tabs.

**Profile** in `localStorage`: per-character error rates, transition timings, confusions,
history, bests and settings. v1 profiles are migrated.

**Layouts:** QWERTY, Colemak, Dvorak — driving both the heatmap and the adjacency test
behind next-door-key classification.

**Screen-reader usable.** A visually-hidden input takes the keystrokes; the lesson is
exposed as spoken character names, with live announcements of line progress and mistakes.

**URLs:** `?lang=rust&division=gold&mode=drill` restores a setup, and finishing a run
offers a link carrying the result.

**Paste your own code** to practise on something specific.

## Layout

```
main.jsx                        mount only
src/App.jsx                     state, selection, persistence
src/index.css                   all styles
src/engine/lesson.js            auto-indent geometry, cursor movement
src/engine/useTypingSession.js  the typing state machine
src/engine/stats.js             wpm, accuracy, bigrams, confusions
src/engine/difficulty.js        measured typing difficulty and the ramp
src/engine/select.js            adaptive snippet scoring
src/engine/drills.js            weak-key drill generation
src/engine/storage.js           versioned localStorage profile
src/engine/speech.js            spoken names for punctuation
src/engine/urlState.js          bookmarkable state, shareable results
src/data/manifest.js            static corpus description (stays in the main bundle)
src/data/<language>.js          snippet banks, one lazy chunk each
src/data/fragments.js           drill building blocks
src/data/layouts.js             qwerty / colemak / dvorak
src/components/                 UI
scripts/                        corpus linter, engine tests, browser test
```

## The corpus

276 snippets across 6 languages × 4 divisions, tagged by topic — Dijkstra, DSU, Kruskal,
segment trees with lazy propagation, Tarjan SCC, binary lifting, convex hull, Z-function,
Mo's algorithm, Dinic level graphs, and the everyday I/O and prefix-sum patterns
underneath them.

These are original implementations written for typing practice — idiomatic contest code,
not copies of anyone's submissions, and written to be *typed* rather than run. Some are
deliberately partial.

Each language is its own lazily-loaded chunk. `npm run lint:corpus` checks the manifest
counts against the banks and enforces that every snippet is typeable on a US keyboard: no
tabs, CRLF, trailing whitespace or smart quotes.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/node.js.yml`, which runs `npm run check` before building. This
requires **Settings → Pages → Source** to be set to **GitHub Actions** — with the default
"Deploy from a branch" the raw repository is served instead of the build, and the site
renders blank.
