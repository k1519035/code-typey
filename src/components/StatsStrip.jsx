import React from "react";
import { fmtTime } from "../engine/stats.js";

/**
 * The numbers worth glancing at mid-run, in one row under the code. Everything
 * else lives behind the analysis section — a wall of panels beside a six-line
 * snippet is noise while you're actually typing.
 */
export default function StatsStrip({ live, elapsedMs, paused, best, total, typedCount }) {
  const cells = [
    { key: "net", value: live.netWpm, label: "net wpm", big: true },
    { key: "raw", value: live.rawWpm, label: "raw wpm", big: true, alt: true },
    { key: "acc", value: `${live.accuracy}%`, label: "accuracy" },
    { key: "time", value: fmtTime(elapsedMs), label: paused ? "paused" : "time", dim: paused },
    { key: "chars", value: `${typedCount}/${total}`, label: "characters" },
    { key: "back", value: live.backspaces, label: "backspaces" },
  ];

  return (
    <div className="tt-strip">
      {cells.map((c) => (
        <div className={`tt-strip-cell${c.dim ? " dim" : ""}`} key={c.key}>
          <div className={`tt-strip-value${c.big ? " big" : ""}${c.alt ? " alt" : ""}`}>{c.value}</div>
          <div className="tt-strip-label">{c.label}</div>
        </div>
      ))}
      {best && (
        <div className="tt-strip-cell best">
          <div className="tt-strip-value">{best.netWpm}</div>
          <div className="tt-strip-label">best here</div>
        </div>
      )}
    </div>
  );
}
