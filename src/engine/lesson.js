/**
 * Pure lesson geometry: which characters the user actually has to type, and
 * where the cursor lands next.
 *
 * The central idea is auto-indent. Real editors indent for you, so making
 * someone type four leading spaces after every newline is busywork that
 * inflates WPM and teaches nothing. Leading whitespace is marked "auto": it is
 * displayed, skipped over, and excluded from every statistic.
 */

export const AUTO = "auto";
export const PENDING = "pending";
export const CORRECT = "correct";
export const WRONG = "wrong";

/**
 * mask[i] === true when index i is leading whitespace on its line and should
 * be filled in for the user.
 */
export function computeAutoMask(text) {
  const mask = new Array(text.length).fill(false);
  let atLineStart = true;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      atLineStart = true;
      continue;
    }
    if (atLineStart && (ch === " " || ch === "\t")) {
      mask[i] = true;
      continue;
    }
    atLineStart = false;
  }
  return mask;
}

/** First index the user is actually asked to type. */
export function firstIndex(autoMask) {
  let i = 0;
  while (i < autoMask.length && autoMask[i]) i++;
  return i;
}

/** Where the cursor goes after resolving index `i`. */
export function advanceFrom(autoMask, i) {
  let j = i + 1;
  while (j < autoMask.length && autoMask[j]) j++;
  return j;
}

/** Where backspace goes from index `i` (skipping back over auto-indent). */
export function retreatFrom(autoMask, i) {
  let j = i - 1;
  while (j >= 0 && autoMask[j]) j--;
  return j;
}

/** Number of characters that count toward completion and WPM. */
export function typableCount(autoMask) {
  let n = 0;
  for (const isAuto of autoMask) if (!isAuto) n++;
  return n;
}

/**
 * Builds the per-index record the session state machine mutates.
 * `firstTry` is what accuracy is computed from and is never overwritten once
 * set, so going back and fixing a typo repairs the text without silently
 * repairing your accuracy.
 */
export function buildEntries(text, autoMask) {
  return Array.from({ length: text.length }, (_, i) => ({
    state: autoMask[i] ? AUTO : PENDING,
    firstTry: null,
    attempts: 0,
  }));
}

export function displayChar(ch) {
  if (ch === "\n") return "⏎";
  if (ch === " ") return "·";
  if (ch === "\t") return "→";
  return ch;
}

/** Line number (0-based) of each index, for rendering gutters. */
export function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}
