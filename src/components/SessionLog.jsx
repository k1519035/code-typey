import React from "react";

function timeLabel(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function SessionLog({ history, totals }) {
  return (
    <div className="tt-card">
      <h3>history</h3>
      {history.length ? (
        <>
          <div className="log-list">
            {history.slice(0, 12).map((h) => (
              <div className="log-row" key={h.ts}>
                <span className="log-time">{timeLabel(h.ts)}</span>
                <span className="tag">
                  {h.lang}/{h.division}
                </span>
                <span className="wpm">{h.netWpm}wpm</span>
                <span className={`acc${h.accuracy >= 95 ? " good" : ""}`}>{h.accuracy}%</span>
              </div>
            ))}
          </div>
          <div className="tt-totals">
            {totals.lessons} lessons · {totals.keystrokes.toLocaleString()} keystrokes ·{" "}
            {Math.round(totals.activeMs / 60000)} min
          </div>
        </>
      ) : (
        <div className="empty-note">no runs yet</div>
      )}
    </div>
  );
}
