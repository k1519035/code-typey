/**
 * Measured typing difficulty.
 *
 * Divisions (bronze → platinum) describe the *algorithm*, not how hard the code
 * is to type — a Dijkstra implementation is conceptually advanced but its
 * characters are ordinary. Measuring difficulty separately lets selection ramp
 * on the thing this app actually trains: symbol load.
 *
 * The score is deliberately interpretable rather than clever. Every component
 * lands in 0..1 and is weighted, so a snippet's rating can be explained.
 */

/** Keys that are awkward on a US keyboard: far from home row, or shift-heavy. */
const RARE = new Set(["~", "`", "^", "|", "\\", "{", "}", "<", ">", "&", "%", "@", "#", "$", "_", "+"]);

/** Characters that need shift on US QWERTY. */
const SHIFTED = new Set([
  "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+",
  "{", "}", "|", ":", '"', "<", ">", "?",
]);

function isSymbol(ch) {
  return ch !== "\n" && ch !== " " && !/[A-Za-z0-9]/.test(ch);
}

/**
 * Returns the raw components plus a 0..100 score. Exported whole so the corpus
 * linter can report *why* a snippet rates the way it does.
 */
export function difficultyOf(code) {
  const chars = [...code].filter((c) => c !== "\n");
  const total = chars.length || 1;

  let symbols = 0;
  let rare = 0;
  let shifted = 0;
  let upper = 0;
  const distinctSymbols = new Set();

  for (const ch of chars) {
    if (isSymbol(ch)) {
      symbols++;
      distinctSymbols.add(ch);
      if (RARE.has(ch)) rare++;
    }
    if (SHIFTED.has(ch)) shifted++;
    if (/[A-Z]/.test(ch)) upper++;
  }

  // Deepest bracket nesting — a proxy for runs like `))));` and `>>>`.
  let depth = 0;
  let maxDepth = 0;
  for (const ch of code) {
    if (ch === "(" || ch === "[" || ch === "{" || ch === "<") {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (ch === ")" || ch === "]" || ch === "}" || ch === ">") {
      depth = Math.max(0, depth - 1);
    }
  }

  // Longest unbroken run of symbols, e.g. `>>>`, `});` or `)]` chains.
  let run = 0;
  let maxRun = 0;
  for (const ch of chars) {
    if (isSymbol(ch)) {
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 0;
    }
  }

  const components = {
    symbolDensity: symbols / total,
    rareDensity: rare / total,
    shiftDensity: shifted / total,
    upperDensity: upper / total,
    distinctSymbols: distinctSymbols.size,
    maxDepth,
    maxRun,
    length: code.length,
  };

  // Each term normalised to roughly 0..1 over the range real code occupies.
  const terms = {
    symbols: Math.min(1, components.symbolDensity / 0.42),
    rare: Math.min(1, components.rareDensity / 0.1),
    shift: Math.min(1, components.shiftDensity / 0.2),
    distinct: Math.min(1, components.distinctSymbols / 22),
    depth: Math.min(1, components.maxDepth / 5),
    run: Math.min(1, components.maxRun / 6),
    // Length matters, but far less than density — a long easy snippet is
    // tiring, not difficult.
    length: Math.min(1, components.length / 600),
  };

  const score =
    100 *
    (0.3 * terms.symbols +
      0.18 * terms.rare +
      0.14 * terms.shift +
      0.14 * terms.distinct +
      0.1 * terms.depth +
      0.08 * terms.run +
      0.06 * terms.length);

  return { score: Math.round(score), components, terms };
}

export function difficultyScore(code) {
  return difficultyOf(code).score;
}

/**
 * Human-readable band for the badge in the UI.
 *
 * The thresholds are the corpus quartiles rather than round numbers, so the
 * labels actually separate snippets instead of filing four fifths of them under
 * the same word. `npm run lint:corpus` prints the spread; if the corpus shifts
 * a long way, re-cut these.
 */
export function difficultyBand(score) {
  if (score < 47) return "light";
  if (score < 56) return "moderate";
  if (score < 64) return "heavy";
  return "brutal";
}

/**
 * Where the user currently sits, derived from recent runs. Used to pick
 * snippets slightly above their comfort zone rather than at random.
 *
 * Accuracy is the signal, not speed: struggling shows up as errors first.
 */
export function targetDifficulty(history, { fallback = 38 } = {}) {
  const recent = history.slice(0, 10).filter((h) => typeof h.difficulty === "number");
  if (!recent.length) return fallback;

  const avgDifficulty = recent.reduce((n, h) => n + h.difficulty, 0) / recent.length;
  const avgAccuracy = recent.reduce((n, h) => n + h.accuracy, 0) / recent.length;

  // Comfortable above 96% — push harder. Below 88% — ease off.
  if (avgAccuracy >= 96) return avgDifficulty + 6;
  if (avgAccuracy < 88) return avgDifficulty - 6;
  return avgDifficulty + 1;
}
