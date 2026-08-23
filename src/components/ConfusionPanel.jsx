import React, { useMemo } from "react";
import { topConfusions } from "../engine/stats.js";
import { displayChar } from "../engine/lesson.js";
import { classifyError, ERROR_LABELS } from "../data/layouts.js";

/**
 * What you press instead of what you meant.
 *
 * A bare error count says "you miss the colon". The substitution matrix says
 * you press semicolon instead — which is a shift-release timing problem, not a
 * problem finding the key. Those need different practice, so they're worth
 * telling apart.
 */
export default function ConfusionPanel({ confusions, layout }) {
  const rows = useMemo(() => {
    const top = topConfusions(confusions, { limit: 7, minCount: 2 });
    return top.map((c) => ({ ...c, kind: classifyError(c.expected, c.typed, layout) }));
  }, [confusions, layout]);

  const summary = useMemo(() => {
    const counts = {};
    for (const [key, n] of Object.entries(confusions)) {
      const kind = classifyError(key[0], key[1], layout);
      counts[kind] = (counts[kind] || 0) + n;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (!total) return null;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([kind, n]) => ({ kind, share: Math.round((n / total) * 100) }))
      .filter((x) => x.share >= 5);
  }, [confusions, layout]);

  return (
    <div className="tt-card">
      <h3>mistakes</h3>
      {rows.length ? (
        <>
          <div className="confusion-list">
            {rows.map((c) => (
              <div className="confusion-row" key={c.expected + c.typed}>
                <span className="confusion-pair">
                  <span className="want">{displayChar(c.expected)}</span>
                  <span className="arrow">→</span>
                  <span className="got">{displayChar(c.typed)}</span>
                </span>
                <span className={`confusion-kind ${c.kind}`}>{ERROR_LABELS[c.kind]}</span>
                <span className="confusion-count">{c.count}×</span>
              </div>
            ))}
          </div>
          {summary && (
            <div className="confusion-summary">
              {summary.map((s) => (
                <span key={s.kind}>
                  {ERROR_LABELS[s.kind]} {s.share}%
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
<div className="empty-note">no repeated mistakes yet</div>
      )}
    </div>
  );
}
