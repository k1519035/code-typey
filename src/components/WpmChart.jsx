import React, { useMemo } from "react";

/**
 * Rolling WPM across the last completed attempt. A four-second window means a
 * stall shows up as a visible dip instead of disappearing into the average.
 */
export default function WpmChart({ series }) {
  const path = useMemo(() => {
    if (series.length < 2) return null;

    const W = 260;
    const H = 64;
    const maxWpm = Math.max(20, ...series.map((p) => p.wpm));
    const span = series[series.length - 1].t || 1;

    const pt = (p) => [(p.t / span) * W, H - (p.wpm / maxWpm) * (H - 6) - 3];

    const line = series.map((p, i) => `${i === 0 ? "M" : "L"}${pt(p)[0].toFixed(1)},${pt(p)[1].toFixed(1)}`).join(" ");
    const area = `${line} L${W},${H} L0,${H} Z`;

    return { line, area, W, H, maxWpm };
  }, [series]);

  return (
    <div className="tt-card">
      <h3>last run</h3>
      {path ? (
        <>
          <svg className="wpm-chart" viewBox={`0 0 ${path.W} ${path.H}`} preserveAspectRatio="none" role="img" aria-label="Words per minute over the last attempt">
            <path d={path.area} className="wpm-area" />
            <path d={path.line} className="wpm-line" />
          </svg>
          <div className="wpm-scale">
            <span>0s</span>
            <span>peak {path.maxWpm} wpm</span>
          </div>
        </>
      ) : (
        <div className="empty-note">no runs yet</div>
      )}
    </div>
  );
}
