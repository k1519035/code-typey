import React, { useMemo } from "react";

/**
 * Progress across sessions.
 *
 * The pace chart only ever showed the last attempt, so the app couldn't answer
 * the one question that keeps anyone coming back: am I better than last week?
 * All of this comes from history that was already being stored.
 */

function median(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Centred rolling median — robust to the one run where you fumbled the keyboard. */
function rollingMedian(values, window = 5) {
  const half = Math.floor(window / 2);
  return values.map((_, i) =>
    median(values.slice(Math.max(0, i - half), Math.min(values.length, i + half + 1)))
  );
}

export default function TrendChart({ history, lang, division, scope, onScope }) {
  const runs = useMemo(() => {
    const filtered =
      scope === "all" ? history : history.filter((h) => h.lang === lang && h.division === division);
    // Stored newest-first; charts read left-to-right through time.
    return filtered.slice(0, 40).reverse();
  }, [history, lang, division, scope]);

  const chart = useMemo(() => {
    if (runs.length < 2) return null;

    const W = 260;
    const H = 78;
    const pad = 3;

    const wpm = runs.map((r) => r.netWpm);
    const smooth = rollingMedian(wpm);
    const maxWpm = Math.max(20, ...wpm);

    const x = (i) => (i / (runs.length - 1)) * W;
    const y = (v) => H - pad - (v / maxWpm) * (H - pad * 2);

    const line = (values) =>
      values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

    // Accuracy rides its own 0..100 scale along the bottom third.
    const accY = (v) => H - pad - (v / 100) * (H - pad * 2) * 0.32;
    const accLine = runs
      .map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${accY(r.accuracy).toFixed(1)}`)
      .join(" ");

    const first = median(wpm.slice(0, Math.max(1, Math.floor(wpm.length / 3))));
    const last = median(wpm.slice(-Math.max(1, Math.floor(wpm.length / 3))));
    const delta = Math.round(last - first);

    return { W, H, raw: line(wpm), smooth: line(smooth), accLine, maxWpm, delta, count: runs.length };
  }, [runs]);

  return (
    <div className="tt-card">
      <h3>
        progress
        <span className="tt-scope">
          <button
            className={scope === "bucket" ? "on" : ""}
            onClick={() => onScope("bucket")}
            aria-pressed={scope === "bucket"}
          >
            this pool
          </button>
          <button
            className={scope === "all" ? "on" : ""}
            onClick={() => onScope("all")}
            aria-pressed={scope === "all"}
          >
            all
          </button>
        </span>
      </h3>

      {chart ? (
        <>
          <svg
            className="trend-chart"
            viewBox={`0 0 ${chart.W} ${chart.H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Net words per minute across your last ${chart.count} runs, ${
              chart.delta >= 0 ? "up" : "down"
            } ${Math.abs(chart.delta)} words per minute`}
          >
            <path d={chart.accLine} className="trend-acc" />
            <path d={chart.raw} className="trend-raw" />
            <path d={chart.smooth} className="trend-smooth" />
          </svg>
          <div className="trend-legend">
            <span className="trend-key raw">runs</span>
            <span className="trend-key smooth">median</span>
            <span className="trend-key acc">accuracy</span>
          </div>
          <div className={`trend-delta${chart.delta >= 0 ? " up" : " down"}`}>
            {chart.delta >= 0 ? "▲" : "▼"} {Math.abs(chart.delta)} wpm across {chart.count} runs
            <span className="trend-peak">peak {chart.maxWpm}</span>
          </div>
        </>
      ) : (
<div className="empty-note">needs two runs</div>
      )}
    </div>
  );
}
