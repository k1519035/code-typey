import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import {
  computeAutoMask,
  buildEntries,
  firstIndex,
  advanceFrom,
  retreatFrom,
  typableCount,
  PENDING,
  CORRECT,
  WRONG,
} from "./lesson.js";
import { summarize } from "./stats.js";

/** Stop the clock after this long without a keystroke. */
export const IDLE_MS = 3000;
const TICK_MS = 200;
/** Gaps longer than this aren't a bigram, they're a pause. */
const BIGRAM_MAX_MS = 2000;

function init(text) {
  const autoMask = computeAutoMask(text);
  return {
    text,
    autoMask,
    entries: buildEntries(text, autoMask),
    total: typableCount(autoMask),
    cursor: firstIndex(autoMask),
    keystrokes: 0,
    backspaces: 0,
    startedAt: null,
    activeMs: 0,
    lastTickAt: 0,
    lastKeyAt: 0,
    lastTypedIndex: -1,
    paused: false,
    status: "idle",
    events: [],
    bigrams: [],
    confusions: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return init(action.text);

    case "tick": {
      if (state.status !== "running") return state;
      const { now } = action;
      if (state.paused) return { ...state, lastTickAt: now };

      if (now - state.lastKeyAt > IDLE_MS) {
        // Credit only up to the last real keystroke, then stop the clock.
        const add = Math.max(0, state.lastKeyAt - state.lastTickAt);
        return { ...state, activeMs: state.activeMs + add, lastTickAt: now, paused: true };
      }
      return { ...state, activeMs: state.activeMs + (now - state.lastTickAt), lastTickAt: now };
    }

    case "backspace": {
      if (state.status === "done") return state;
      const prev = retreatFrom(state.autoMask, state.cursor);
      if (prev < 0) return state;

      const entries = state.entries.slice();
      entries[prev] = { ...entries[prev], state: PENDING };

      return {
        ...state,
        entries,
        cursor: prev,
        backspaces: state.backspaces + 1,
        lastKeyAt: action.now,
        lastTypedIndex: -1,
        paused: false,
        lastTickAt: state.paused ? action.now : state.lastTickAt,
      };
    }

    case "key": {
      if (state.status === "done") return state;
      const { ch, now } = action;

      let { activeMs, lastTickAt, startedAt, status } = state;
      if (status === "idle") {
        startedAt = now;
        lastTickAt = now;
        status = "running";
      } else if (state.paused) {
        // Resuming: the idle gap is simply not credited.
        lastTickAt = now;
      } else {
        activeMs += now - lastTickAt;
        lastTickAt = now;
      }

      const i = state.cursor;
      const expected = state.text[i];
      const ok = ch === expected;

      const entries = state.entries.slice();
      const prevEntry = entries[i];
      entries[i] = {
        state: ok ? CORRECT : WRONG,
        firstTry: prevEntry.firstTry === null ? ok : prevEntry.firstTry,
        attempts: prevEntry.attempts + 1,
      };

      const bigrams = state.bigrams;
      let nextBigrams = bigrams;
      const prevIdx = retreatFrom(state.autoMask, i);
      if (
        ok &&
        state.lastTypedIndex === prevIdx &&
        prevIdx >= 0 &&
        state.text[prevIdx] !== "\n" &&
        expected !== "\n" &&
        !state.paused
      ) {
        const dt = now - state.lastKeyAt;
        if (dt > 0 && dt < BIGRAM_MAX_MS) {
          nextBigrams = bigrams.concat({ pair: state.text[prevIdx] + expected, ms: dt });
        }
      }

      // Record *what* was pressed, not merely that it was wrong. Only on the
      // first attempt, so the substitution matrix matches accuracy — and only
      // for single characters, since Enter maps to a newline we can't confuse.
      let nextConfusions = state.confusions;
      if (!ok && prevEntry.firstTry === null) {
        nextConfusions = state.confusions.concat({ expected, typed: ch });
      }

      const cursor = advanceFrom(state.autoMask, i);
      const done = cursor >= state.text.length;

      return {
        ...state,
        entries,
        cursor,
        confusions: nextConfusions,
        keystrokes: state.keystrokes + 1,
        startedAt,
        activeMs,
        lastTickAt,
        lastKeyAt: now,
        lastTypedIndex: i,
        paused: false,
        status: done ? "done" : "running",
        events: state.events.concat({ t: now - startedAt, ok }),
        bigrams: nextBigrams,
      };
    }

    default:
      return state;
  }
}

/**
 * Drives one attempt at one snippet. Everything the UI shows — the live
 * numbers, the completion banner, the row written to the session log — is
 * derived from `summarize` on this same state, so they cannot drift apart.
 */
export function useTypingSession(text, onComplete) {
  const [state, dispatch] = useReducer(reducer, text, init);
  const completedRef = useRef(false);

  // Reset during render rather than in an effect. An effect runs *after*
  // children have rendered, which would hand them the new text alongside the
  // previous lesson's (shorter) entries array — React discards this pass and
  // re-runs with the fresh state, so consumers never see the mismatched pair.
  if (state.text !== text) {
    completedRef.current = false;
    dispatch({ type: "reset", text });
  }

  useEffect(() => {
    if (state.status !== "running") return undefined;
    const id = setInterval(() => dispatch({ type: "tick", now: Date.now() }), TICK_MS);
    return () => clearInterval(id);
  }, [state.status]);

  const live = useMemo(
    () =>
      summarize({
        entries: state.entries,
        keystrokes: state.keystrokes,
        backspaces: state.backspaces,
        activeMs: state.activeMs,
      }),
    [state.entries, state.keystrokes, state.backspaces, state.activeMs]
  );

  useEffect(() => {
    if (state.status === "done" && !completedRef.current) {
      completedRef.current = true;
      onComplete?.({
        result: live,
        entries: state.entries,
        text: state.text,
        events: state.events,
        bigrams: state.bigrams,
        confusions: state.confusions,
      });
    }
  }, [
    state.status,
    state.entries,
    state.text,
    state.events,
    state.bigrams,
    state.confusions,
    live,
    onComplete,
  ]);

  const pressChar = useCallback((ch) => dispatch({ type: "key", ch, now: Date.now() }), []);
  const pressBackspace = useCallback(() => dispatch({ type: "backspace", now: Date.now() }), []);
  const restart = useCallback(() => {
    completedRef.current = false;
    dispatch({ type: "reset", text });
  }, [text]);

  const typedCount = useMemo(
    () => state.entries.filter((e, i) => !state.autoMask[i] && e.state !== PENDING).length,
    [state.entries, state.autoMask]
  );

  return {
    ...state,
    live,
    typedCount,
    progress: state.total ? typedCount / state.total : 0,
    pressChar,
    pressBackspace,
    restart,
  };
}

export { PENDING, CORRECT, WRONG };
