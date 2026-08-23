import React from "react";
import TrendChart from "./TrendChart.jsx";
import WpmChart from "./WpmChart.jsx";
import Heatmap from "./Heatmap.jsx";
import ConfusionPanel from "./ConfusionPanel.jsx";
import BigramPanel from "./BigramPanel.jsx";
import SessionLog from "./SessionLog.jsx";

const TABS = [
  { id: "progress", label: "progress" },
  { id: "keys", label: "keys" },
  { id: "pace", label: "pace" },
  { id: "history", label: "history" },
];

/**
 * Everything that isn't needed mid-run, folded away behind one toggle and four
 * tabs. Collapsed it shows a one-line summary, so the information is still
 * there without eight panels competing with the code.
 */
export default function Analysis({
  open,
  tab,
  onToggle,
  onTab,
  summary,
  profile,
  session,
  series,
  lang,
  division,
  layout,
  onLayout,
  trendScope,
  onTrendScope,
}) {
  return (
    <section className="tt-analysis">
      <button className="tt-analysis-toggle" aria-expanded={open} onClick={onToggle}>
        <span className="chev">{open ? "▾" : "▸"}</span>
        <span className="tt-analysis-title">stats</span>
        {!open && <span className="tt-analysis-summary">{summary}</span>}
      </button>

      {open && (
        <>
          <div className="tt-tabs" role="tablist" aria-label="Statistics">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`tt-tab${tab === t.id ? " on" : ""}`}
                onClick={() => onTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="tt-tabpanel" role="tabpanel">
            {tab === "progress" && (
              <TrendChart
                history={profile.history}
                lang={lang}
                division={division}
                scope={trendScope}
                onScope={onTrendScope}
              />
            )}

            {tab === "keys" && (
              <>
                <Heatmap
                  charStats={profile.charStats}
                  backspaces={session.backspaces}
                  layout={layout}
                  onLayout={onLayout}
                />
                <ConfusionPanel confusions={profile.confusions} layout={layout} />
              </>
            )}

            {tab === "pace" && (
              <>
                <WpmChart series={series} />
                <BigramPanel bigrams={profile.bigrams} />
              </>
            )}

            {tab === "history" && <SessionLog history={profile.history} totals={profile.totals} />}
          </div>
        </>
      )}
    </section>
  );
}
