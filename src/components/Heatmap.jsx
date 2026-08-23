import React, { useMemo } from "react";
import { layoutRows, LAYOUTS } from "../data/layouts.js";
import { errorRate } from "../engine/stats.js";

/**
 * Colours each key by its smoothed error rate rather than a raw miss count, so
 * a key you've hit 400 times with two misses stays cool while one you've missed
 * three times out of five lights up.
 *
 * The layout is selectable: a QWERTY picture is simply wrong for someone typing
 * Colemak or Dvorak, and "which key is next to which" is also what lets the
 * confusion panel tell a next-door slip from a shift-timing error.
 */
export default function Heatmap({ charStats, backspaces, layout, onLayout }) {
  const rows = useMemo(() => layoutRows(layout), [layout]);

  const rates = useMemo(() => {
    const map = {};
    for (const [ch, stat] of Object.entries(charStats)) map[ch] = errorRate(stat);
    return map;
  }, [charStats]);

  const peak = useMemo(() => Math.max(0.02, ...Object.values(rates)), [rates]);

  return (
    <div className="tt-card">
      <h3>
        heatmap
        <select
          className="tt-mini-select"
          value={layout}
          onChange={(e) => onLayout(e.target.value)}
          aria-label="Keyboard layout"
        >
          {Object.values(LAYOUTS).map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </h3>
      <div className="kb">
        {rows.map((row, ri) => (
          <div className="kb-row" key={ri}>
            {row.map((k, ki) => {
              if (k.label && !k.u) {
                const isBs = k.backspace;
                const alpha = isBs ? Math.min(1, backspaces / 20) : 0;
                return (
                  <div
                    key={ki}
                    className="kb-key mod"
                    style={{
                      flex: k.wide || 1,
                      background:
                        isBs && alpha > 0 ? `rgba(108,182,255,${0.1 + alpha * 0.5})` : undefined,
                      borderColor: isBs && alpha > 0 ? "var(--blue)" : undefined,
                      color: isBs && alpha > 0 ? "var(--blue)" : undefined,
                    }}
                  >
                    {k.label}
                  </div>
                );
              }

              const rate = Math.max(rates[k.u] || 0, k.s ? rates[k.s] || 0 : 0);
              const alpha = rate > 0 ? 0.14 + 0.62 * (rate / peak) : 0;

              return (
                <div
                  key={ki}
                  className="kb-key"
                  style={{
                    flex: k.wide || 1,
                    background: rate > 0 ? `rgba(255,107,107,${alpha})` : undefined,
                    borderColor: rate > 0 ? "var(--red)" : undefined,
                  }}
                  title={`${k.u === " " ? "space" : k.u}${k.s ? " / " + k.s : ""} — ${(
                    rate * 100
                  ).toFixed(0)}% miss rate`}
                >
                  {k.s && <span className="s">{k.s}</span>}
                  <span className="u">{k.u === " " ? "" : k.u}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
