import React, { useState, useRef, useEffect } from "react";

/**
 * Practise on your own code. Tabs are converted to spaces and trailing
 * whitespace is stripped so the text matches what the engine can score.
 */
function normalize(raw) {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function CustomTextDialog({ open, onClose, onUse }) {
  const [value, setValue] = useState("");
  const areaRef = useRef(null);

  useEffect(() => {
    if (open) areaRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const cleaned = normalize(value);
  const tooShort = cleaned.length < 10;

  return (
    <div className="tt-modal-backdrop" onMouseDown={onClose}>
      <div className="tt-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Practise your own code">
        <h3>paste code</h3>
<p className="tt-modal-note">Tabs become four spaces.</p>
        <textarea
          ref={areaRef}
          className="tt-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck="false"
          placeholder="paste some code…"
        />
        <div className="tt-modal-actions">
          <span className="tt-modal-count">{cleaned.length} characters</span>
          <button className="tt-btn ghost" onClick={onClose}>
            cancel
          </button>
          <button className="tt-btn" disabled={tooShort} onClick={() => onUse(cleaned)}>
            practise this
          </button>
        </div>
      </div>
    </div>
  );
}
