/**
 * All the arithmetic that turns keystroke events into numbers. Kept pure and
 * separate so the displayed result and the logged result can never disagree —
 * both call summarize() on the same session.
 */

import { CORRECT, AUTO } from "./lesson.js";

const CHARS_PER_WORD = 5;
const MIN_MINUTES = 1 / 60; // never divide by a sub-second interval

export function minutesOf(ms) {
  return Math.max(ms / 60000, MIN_MINUTES);
}

/**
 * One object describing a finished (or in-progress) attempt.
 *
 *  netWpm   — characters currently standing correct, per five, per minute
 *  rawWpm   — every character key pressed, including mistakes and retypes
 *  accuracy — share of characters that were right the FIRST time
 */
export function summarize({ entries, keystrokes, backspaces, activeMs }) {
  const minutes = minutesOf(activeMs);

  let correct = 0;
  let firstTryRight = 0;
  let attempted = 0;

  for (const e of entries) {
    if (e.state === AUTO) continue;
    if (e.state === CORRECT) correct++;
    if (e.firstTry !== null) {
      attempted++;
      if (e.firstTry) firstTryRight++;
    }
  }

  return {
    netWpm: Math.round(correct / CHARS_PER_WORD / minutes),
    rawWpm: Math.round(keystrokes / CHARS_PER_WORD / minutes),
    accuracy: attempted ? Math.round((firstTryRight / attempted) * 100) : 100,
    correct,
    attempted,
    keystrokes,
    backspaces,
    activeMs,
  };
}

/**
 * Rolling WPM samples for the chart. Each event is {t, ok}; we walk a window
 * of `windowMs` and report net WPM inside it, so a stall shows up as a dip
 * instead of being smoothed into the average.
 */
export function wpmSeries(events, windowMs = 4000, buckets = 40) {
  if (events.length < 2) return [];
  const end = events[events.length - 1].t;
  const start = events[0].t;
  const span = end - start;
  if (span < 500) return [];

  const out = [];
  for (let b = 1; b <= buckets; b++) {
    const at = start + (span * b) / buckets;
    const from = at - windowMs;
    let ok = 0;
    for (const e of events) {
      if (e.t > at) break;
      if (e.t >= from && e.ok) ok++;
    }
    const minutes = minutesOf(Math.min(windowMs, at - start));
    out.push({ t: at - start, wpm: Math.round(ok / CHARS_PER_WORD / minutes) });
  }
  return out;
}

/**
 * Merges this attempt's per-character results into the running profile totals.
 * Only first attempts count, so hammering backspace cannot inflate or deflate
 * a character's error rate.
 */
export function mergeCharStats(existing, entries, text) {
  const next = { ...existing };
  entries.forEach((e, i) => {
    if (e.state === AUTO || e.firstTry === null) return;
    const ch = text[i];
    const prev = next[ch] || { attempts: 0, errors: 0 };
    next[ch] = {
      attempts: prev.attempts + 1,
      errors: prev.errors + (e.firstTry ? 0 : 1),
    };
  });
  return next;
}

/**
 * Smoothed error rate. The +4 keeps a single miss on a rarely-seen character
 * from making it look like the worst key on the board.
 */
export function errorRate(stat) {
  if (!stat) return 0;
  return stat.errors / (stat.attempts + 4);
}

/** Merge bigram timings, keeping the map bounded. */
export function mergeBigrams(existing, samples, cap = 400) {
  const next = { ...existing };
  for (const { pair, ms } of samples) {
    const prev = next[pair] || { n: 0, totalMs: 0 };
    next[pair] = { n: prev.n + 1, totalMs: prev.totalMs + ms };
  }
  const keys = Object.keys(next);
  if (keys.length > cap) {
    keys
      .sort((a, b) => next[a].n - next[b].n)
      .slice(0, keys.length - cap)
      .forEach((k) => delete next[k]);
  }
  return next;
}

/**
 * Merges observed mistakes into a substitution matrix: what was expected
 * against what was actually pressed. Only first attempts count, matching how
 * accuracy is computed.
 *
 * Both characters are always exactly one code unit, so the key is a plain
 * two-character string. A separator would turn ambiguous the moment someone
 * mistypes a space, which is an entirely ordinary thing to do.
 */
export function mergeConfusions(existing, samples, cap = 200) {
  const next = { ...existing };
  for (const { expected, typed } of samples) {
    if (!expected || !typed) continue;
    if (expected.length !== 1 || typed.length !== 1) continue;
    const key = expected + typed;
    next[key] = (next[key] || 0) + 1;
  }
  const keys = Object.keys(next);
  if (keys.length > cap) {
    keys
      .sort((a, b) => next[a] - next[b])
      .slice(0, keys.length - cap)
      .forEach((k) => delete next[k]);
  }
  return next;
}

/** Most frequent mistakes, decoded back into expected/typed pairs. */
export function topConfusions(confusions, { limit = 8, minCount = 2 } = {}) {
  return Object.entries(confusions)
    .map(([key, count]) => ({ expected: key[0], typed: key[1], count }))
    .filter((c) => c.count >= minCount && c.expected !== undefined && c.typed !== undefined)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Slowest two-character transitions with enough samples to be meaningful. */
export function slowestBigrams(bigrams, { minSamples = 3, limit = 8 } = {}) {
  return Object.entries(bigrams)
    .filter(([, v]) => v.n >= minSamples)
    .map(([pair, v]) => ({ pair, avgMs: Math.round(v.totalMs / v.n), n: v.n }))
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, limit);
}

export function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
