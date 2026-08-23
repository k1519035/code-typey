/**
 * Adaptive snippet selection.
 *
 * The previous version summed miss-counts over every character in a snippet,
 * which just meant the longest snippet always won. This scores the *density* of
 * your weak characters — the mean smoothed error rate across the distinct
 * characters a snippet contains — so a short line packed with `>>` and `::`
 * can beat a long one full of letters you already type cleanly.
 */

import { errorRate } from "./stats.js";
import { computeAutoMask } from "./lesson.js";
import { bucketKey } from "./storage.js";

/** Distinct characters a snippet will actually make you type. */
export function typedCharSet(code) {
  const autoMask = computeAutoMask(code);
  const set = new Set();
  for (let i = 0; i < code.length; i++) {
    if (autoMask[i]) continue;
    if (code[i] === "\n") continue;
    set.add(code[i]);
  }
  return set;
}

export function weaknessScore(code, charStats) {
  const chars = typedCharSet(code);
  if (chars.size === 0) return 0;

  let total = 0;
  let weakCount = 0;
  for (const ch of chars) {
    const rate = errorRate(charStats[ch]);
    total += rate;
    if (rate > 0.05) weakCount++;
  }

  const mean = total / chars.size;
  // A small bonus for hitting several weak keys at once, so a snippet covering
  // five problem characters edges out one that only drills a single character.
  return mean * (1 + 0.12 * Math.log(1 + weakCount));
}

/**
 * Picks the next snippet.
 *
 * Three signals, deliberately kept legible:
 *   weakness  — how densely this snippet covers characters you get wrong
 *   fit       — how close its measured difficulty is to where you should be
 *   recency   — pushed down, not banned, so a small pool still works
 *
 * `target` comes from difficulty.targetDifficulty(): hold above 96% accuracy
 * and it drifts upward, drop below 88% and it eases off. That gives a real
 * ramp, which divisions alone never provided — bronze and platinum turn out to
 * be equally symbol-dense, because difficulty here is dominated by language.
 */
export function pickSnippet(
  pool,
  {
    charStats = {},
    recent = {},
    lang,
    division,
    exclude = null,
    target = null,
    random = Math.random,
  } = {}
) {
  if (!pool.length) return null;
  const seen = recent[bucketKey(lang, division)] || [];

  const scored = pool.map((snippet) => {
    const weakness = weaknessScore(snippet.code, charStats);

    const recencyIdx = seen.indexOf(snippet.id);
    // Most-recent gets the full penalty, older ones taper off to nothing.
    const recencyPenalty = recencyIdx === -1 ? 0 : 0.6 * (1 - recencyIdx / seen.length);

    // Distance from the target difficulty, normalised so that being 20 points
    // off costs about as much as a middling weakness score.
    const fit =
      target === null || typeof snippet.difficulty !== "number"
        ? 0
        : -Math.abs(snippet.difficulty - target) / 60;

    const jitter = random() * 0.05;
    const blocked = exclude && snippet.id === exclude ? 1e6 : 0;

    return { snippet, score: weakness + fit + jitter - recencyPenalty - blocked };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].snippet;
}
