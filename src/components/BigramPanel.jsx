import React, { useMemo } from "react";
import { slowestBigrams } from "../engine/stats.js";
import { displayChar } from "../engine/lesson.js";

/**
 * Where the time actually goes. Miss counts tell you what you get wrong;
 * transition timings tell you what you get *slowly* — usually the two-symbol
 * sequences that define a language (`->`, `::`, `>>`, `});`, `[-1]`).
 */
export default function BigramPanel({ bigrams }) {
  const slowest = useMemo(() => slowestBigrams(bigrams), [bigrams]);
  const peak = slowest.length ? slowest[0].avgMs : 1;

  return (
    <div className="tt-card">
      <h3>transitions</h3>
      {slowest.length ? (
        <div className="bigram-list">
          {slowest.map(({ pair, avgMs, n }) => (
            <div className="bigram-row" key={pair}>
              <span className="bigram-pair">
                {displayChar(pair[0])}
                {displayChar(pair[1])}
              </span>
              <span className="bigram-bar">
                <span className="bigram-fill" style={{ width: `${(avgMs / peak) * 100}%` }} />
              </span>
              <span className="bigram-ms" title={`${n} samples`}>
                {avgMs}ms
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-note">not enough data yet</div>
      )}
    </div>
  );
}
