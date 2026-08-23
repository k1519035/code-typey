/**
 * Weak-key drill generator.
 *
 * Snippet selection can only choose among snippets that happen to exist; the
 * best it can do is find one that is comparatively dense in your weak keys.
 * A drill is assembled the other way round — start from the characters and
 * transitions you actually miss, then pick the lines that hammer them.
 */

import { errorRate, slowestBigrams } from "./stats.js";
import { fragmentsFor } from "../data/fragments.js";

const DEFAULT_LINES = 7;

/** Characters worth drilling, worst first. */
export function weakChars(charStats, { limit = 10, minAttempts = 3 } = {}) {
  return Object.entries(charStats)
    .filter(([ch, stat]) => stat.attempts >= minAttempts && stat.errors > 0 && ch !== "\n")
    .map(([ch, stat]) => ({ ch, rate: errorRate(stat), attempts: stat.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit);
}

/**
 * Scores a fragment against the current weakness profile.
 *
 * Repeats are worth progressively less — the first occurrence of a character
 * counts fully, the fifth barely at all. A flat cap wasn't enough: with one, a
 * line of five identical brackets tied with a line covering three different
 * problem keys, which is the opposite of what a drill should prefer.
 */
function diminishing(hits, ceiling = 2) {
  return Math.min(Math.sqrt(hits), ceiling);
}

export function scoreFragment(fragment, { weak, slowPairs }) {
  let score = 0;

  for (const { ch, rate } of weak) {
    const hits = fragment.split(ch).length - 1;
    if (hits > 0) score += rate * diminishing(hits);
  }

  for (const { pair, avgMs } of slowPairs) {
    const hits = fragment.split(pair).length - 1;
    if (hits > 0) score += (avgMs / 1000) * diminishing(hits, 1.5);
  }

  // Mild preference for denser lines when nothing else separates candidates.
  const symbols = [...fragment].filter((c) => !/[A-Za-z0-9 ]/.test(c)).length;
  return score + 0.02 * (symbols / Math.max(1, fragment.length));
}

/**
 * Builds a drill lesson. Returns the text plus the characters it is targeting,
 * so the UI can say *why* it chose these lines.
 */
export function buildDrill({
  lang,
  charStats = {},
  bigrams = {},
  lines = DEFAULT_LINES,
  random = Math.random,
} = {}) {
  const pool = fragmentsFor(lang);
  const weak = weakChars(charStats);
  const slowPairs = slowestBigrams(bigrams, { minSamples: 3, limit: 6 });

  const scored = pool
    .map((fragment) => ({ fragment, score: scoreFragment(fragment, { weak, slowPairs }) }))
    .sort((a, b) => b.score - a.score);

  // Cold start: nothing is known yet, so take a spread rather than the same
  // three lines every time.
  const haveSignal = weak.length > 0 || slowPairs.length > 0;
  const candidates = haveSignal ? scored : shuffle(scored, random);

  const chosen = [];
  const seen = new Set();
  for (const { fragment } of candidates) {
    if (seen.has(fragment)) continue;
    seen.add(fragment);
    chosen.push(fragment);
    if (chosen.length >= Math.min(lines, pool.length)) break;
  }

  // Repeat the single worst line once more at the end — spaced repetition on
  // the thing that actually needs it.
  if (haveSignal && chosen.length > 1 && chosen.length < lines) {
    chosen.push(chosen[0]);
  }

  const text = shuffle(chosen, random).join("\n");

  return {
    text,
    targets: weak.slice(0, 6).map((w) => w.ch),
    pairs: slowPairs.slice(0, 4).map((p) => p.pair),
    coldStart: !haveSignal,
  };
}

function shuffle(list, random) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
