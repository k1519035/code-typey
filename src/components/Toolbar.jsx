import React, { useRef } from "react";
import { LANGUAGES, DIVISIONS } from "../data/index.js";

const MODES = [
  { id: "snippets", label: "snippets", hint: "contest patterns" },
  { id: "drill", label: "drill", hint: "your weak keys" },
];

/**
 * Every control here hands focus back to the typing surface once it has done
 * its job — otherwise clicking "next" leaves focus on the button and the next
 * thing you type goes nowhere.
 *
 * Selects are the exception: a keyboard user arrowing through options would be
 * yanked out of the control mid-choice, so focus is only returned when the
 * interaction started with a pointer.
 */
export default function Toolbar({
  lang,
  division,
  mode,
  onLang,
  onDivision,
  onMode,
  onNext,
  onRetry,
  onCustom,
  onReset,
  onRefocus,
  customActive,
  poolSize,
  loading,
}) {
  const pointerRef = useRef(false);

  const selectProps = {
    className: "tt-select",
    onPointerDown: () => {
      pointerRef.current = true;
    },
    onKeyDown: () => {
      pointerRef.current = false;
    },
  };

  const afterSelect = () => {
    if (pointerRef.current) onRefocus?.();
    pointerRef.current = false;
  };

  const act = (fn) => () => {
    fn();
    onRefocus?.();
  };

  return (
    <div className="tt-bar">
      <span className="tt-prompt">$</span>
      <span className="tt-cmd">train</span>

      <span className="tt-flag">--lang</span>
      <select
        {...selectProps}
        value={lang}
        aria-label="Language"
        onChange={(e) => {
          onLang(e.target.value);
          afterSelect();
        }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>

      <span className="tt-flag">--division</span>
      <select
        {...selectProps}
        value={division}
        aria-label="Division"
        onChange={(e) => {
          onDivision(e.target.value);
          afterSelect();
        }}
      >
        {DIVISIONS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>

      <span className="tt-pool">{loading ? "loading…" : `${poolSize} snippets`}</span>

      <span className="tt-modes" role="group" aria-label="Practice mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`tt-mode${mode === m.id && !customActive ? " on" : ""}`}
            aria-pressed={mode === m.id && !customActive}
            title={m.hint}
            onClick={act(() => onMode(m.id))}
          >
            {m.label}
          </button>
        ))}
        <button
          className={`tt-mode${customActive ? " on" : ""}`}
          aria-pressed={customActive}
          title="code you paste in"
          onClick={onCustom}
        >
          custom
        </button>
      </span>

      <span className="tt-bar-spacer" />

      <button className="tt-btn" onClick={act(onNext)}>
        next
      </button>
      <button className="tt-btn ghost" onClick={act(onRetry)}>
        retry <kbd>esc</kbd>
      </button>
      <button className="tt-btn ghost danger" onClick={act(onReset)}>
        reset profile
      </button>
    </div>
  );
}
