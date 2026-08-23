import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { displayChar, CORRECT, WRONG } from "../engine/lesson.js";
import { speakChar, speakRun } from "../engine/speech.js";
import { difficultyBand } from "../engine/difficulty.js";

/**
 * The typing surface.
 *
 * Input is driven by a visually-hidden <input> rather than a focusable <div>: a
 * div cannot summon a mobile keyboard and is invisible to assistive tech.
 * `beforeinput` is handled alongside `keydown` because many Android keyboards
 * never emit a usable keydown.
 *
 * Being *operable* by keyboard was only half the job. The code itself renders
 * as a run of styled character spans — unreadable aloud — so a parallel
 * accessible description carries the lesson text, and live regions announce
 * line progress and mistakes as they happen.
 */
export default function TypingZone({
  text,
  entries,
  autoMask,
  cursor,
  status,
  paused,
  progress,
  live,
  snippet,
  drill,
  focusToken,
  onChar,
  onBackspace,
  onRetry,
  onNext,
}) {
  const inputRef = useRef(null);
  const cursorRef = useRef(null);
  const codeRef = useRef(null);
  const lastErrorRef = useRef(0);
  const [announcement, setAnnouncement] = useState("");
  const [focused, setFocused] = useState(false);

  const focusInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    // preventScroll stops the page jumping every time a lesson loads.
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [text, focusToken, focusInput]);

  /* Keep the cursor in view by scrolling the code box, never the page. */
  useEffect(() => {
    const el = cursorRef.current;
    const box = codeRef.current;
    if (!el || !box) return;

    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop + 8 || bottom > box.scrollTop + box.clientHeight - 8) {
      box.scrollTop = top - box.clientHeight / 2 + el.offsetHeight / 2;
    }
  }, [cursor, text]);

  /* Line-level progress for screen readers — per character would be a torrent. */
  const lines = useMemo(() => text.split("\n"), [text]);
  const lineIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < cursor && i < text.length; i++) if (text[i] === "\n") count++;
    return count;
  }, [cursor, text]);

  useEffect(() => {
    if (status === "done") return;
    const line = lines[lineIndex] ?? "";
    setAnnouncement(`Line ${lineIndex + 1} of ${lines.length}. ${speakRun(line.trimStart())}`);
  }, [lineIndex, lines, status]);

  const handleWrong = useCallback((expected, typed) => {
    // Throttled: a fast typist making several mistakes shouldn't build a
    // backlog of speech that outlives the mistakes themselves.
    const now = Date.now();
    if (now - lastErrorRef.current < 700) return;
    lastErrorRef.current = now;
    setAnnouncement(`Wrong. Expected ${speakChar(expected)}, you typed ${speakChar(typed)}.`);
  }, []);

  const press = useCallback(
    (ch) => {
      const expected = text[cursor];
      if (expected !== undefined && ch !== expected) handleWrong(expected, ch);
      onChar(ch);
    },
    [text, cursor, onChar, handleWrong]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Leave browser and app shortcuts alone.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        onBackspace();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        press("\n");
        return;
      }
      if (e.key === "Tab") {
        // Indentation is filled in automatically, so Tab has nothing to do —
        // but swallowing it keeps focus from silently leaving the trainer.
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        press(e.key);
      }
    },
    [press, onBackspace]
  );

  const handleBeforeInput = useCallback(
    (e) => {
      if (e.inputType === "deleteContentBackward") {
        e.preventDefault();
        onBackspace();
        return;
      }
      if (e.data) {
        e.preventDefault();
        for (const ch of e.data) press(ch);
      }
    },
    [press, onBackspace]
  );

  const done = status === "done";
  const band = snippet?.difficulty != null ? difficultyBand(snippet.difficulty) : null;

  return (
    <div className="tt-zone" onMouseDown={focusInput}>
      <input
        ref={inputRef}
        className="tt-capture"
        type="text"
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Typing practice input"
        aria-describedby="tt-instructions tt-lesson-text"
      />

      <p id="tt-instructions" className="tt-sr-only">
        Type the code shown; indentation is inserted for you. Escape restarts the lesson, and Enter
        moves to the next one once it is finished.
      </p>
      <p id="tt-lesson-text" className="tt-sr-only">
        {snippet?.title ? `${snippet.title}. ` : ""}
        {lines.length} lines. {speakRun(text, 400)}
      </p>

      <div className="tt-zone-head">
        <div className="tt-snippet-meta">
          <span className="tt-topic">{snippet?.topic}</span>
          <span className="tt-title">{snippet?.title}</span>
          {band && (
            <span
              className={`tt-diff ${band}`}
              title={`measured typing difficulty ${snippet.difficulty} of 100`}
            >
              {band}
            </span>
          )}
        </div>
        <div className="tt-zone-hint">{paused ? "paused" : "⏎ enter · · space"}</div>
      </div>

      {drill && (
        <div className="tt-drill-note">
          {drill.coldStart
            ? "warm-up drill"
            : `drilling ${drill.targets.map(displayChar).join(" ")}${
                drill.pairs.length ? ` · ${drill.pairs.join("  ")}` : ""
              }`}
        </div>
      )}

      <div
        className="tt-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Lesson progress"
      >
        <div className="tt-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {!focused && status !== "done" && (
        <button className="tt-resume" onClick={focusInput} tabIndex={-1} aria-hidden="true">
          click or press any key to resume
        </button>
      )}

      <pre className="tt-code" ref={codeRef} aria-hidden="true">
        {text.split("").map((c, i) => {
          // Belt and braces: a lesson swap must never be able to crash the app,
          // even if some future change reintroduces a render-order mismatch.
          const entry = entries[i] || { state: "pending" };
          let cls = "ch";
          if (autoMask[i]) cls += " auto";
          else if (entry.state === CORRECT) cls += " correct";
          else if (entry.state === WRONG) cls += " incorrect";
          else cls += " pending";

          const isCursor = i === cursor && !done;
          if (isCursor) cls += " current";

          return (
            <React.Fragment key={i}>
              <span className={cls} ref={isCursor ? cursorRef : undefined}>
                {displayChar(c)}
              </span>
              {c === "\n" && "\n"}
            </React.Fragment>
          );
        })}
      </pre>

      <div className="tt-sr-only" role="status" aria-live="polite">
        {done
          ? `Lesson complete. ${live.netWpm} words per minute, ${live.accuracy} percent first-try accuracy.`
          : announcement}
      </div>

      {done && (
        <div className="tt-done">
          <div className="tt-done-stats">
            <div>
              <strong>{live.netWpm}</strong>
              <span>net wpm</span>
            </div>
            <div>
              <strong>{live.accuracy}%</strong>
              <span>accuracy</span>
            </div>
            <div>
              <strong>{live.rawWpm}</strong>
              <span>raw wpm</span>
            </div>
          </div>
          <div className="tt-done-actions">
            <button className="tt-btn" onClick={onNext}>
              next <kbd>⏎</kbd>
            </button>
            <button className="tt-btn ghost" onClick={onRetry}>
              retry <kbd>esc</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
