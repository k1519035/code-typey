import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { loadPool, CORPUS_SIZE, LANGUAGES, poolSize as manifestPoolSize } from "./data/index.js";
import { pickSnippet } from "./engine/select.js";
import { useTypingSession } from "./engine/useTypingSession.js";
import {
  mergeCharStats,
  mergeBigrams,
  mergeConfusions,
  topConfusions,
  wpmSeries,
} from "./engine/stats.js";
import { displayChar } from "./engine/lesson.js";
import { difficultyScore, targetDifficulty } from "./engine/difficulty.js";
import { buildDrill } from "./engine/drills.js";
import { readUrlState, writeUrlState, readSharedRun, shareUrl } from "./engine/urlState.js";
import {
  loadProfile,
  saveProfile,
  clearProfile,
  pushHistory,
  pushRecent,
  updateBest,
  bucketKey,
} from "./engine/storage.js";

import Toolbar from "./components/Toolbar.jsx";
import TypingZone from "./components/TypingZone.jsx";
import StatsStrip from "./components/StatsStrip.jsx";
import Analysis from "./components/Analysis.jsx";
import CustomTextDialog from "./components/CustomTextDialog.jsx";

const CUSTOM = { id: "custom", topic: "custom", title: "your own code" };

export default function App() {
  const [profile, setProfile] = useState(loadProfile);

  // A shared link should show what it promises, so the URL beats saved settings.
  const initial = useMemo(() => readUrlState(profile.settings), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLang] = useState(initial.lang);
  const [division, setDivision] = useState(initial.division);
  const [mode, setMode] = useState(initial.mode);
  const [theme, setTheme] = useState(profile.settings.theme);
  const [layout, setLayout] = useState(profile.settings.layout || "qwerty");

  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [snippet, setSnippet] = useState(null);
  const [drill, setDrill] = useState(null);
  const [customText, setCustomText] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [series, setSeries] = useState([]);
  const [trendScope, setTrendScope] = useState("bucket");
  const [analysisOpen, setAnalysisOpen] = useState(Boolean(profile.settings.analysisOpen));
  const [analysisTab, setAnalysisTab] = useState(profile.settings.analysisTab || "progress");
  const [sharedRun] = useState(readSharedRun);
  const [lastRun, setLastRun] = useState(null);
  const [copied, setCopied] = useState(false);

  // Bumped whenever a control finishes, to hand focus back to the typing input.
  const [focusToken, setFocusToken] = useState(0);
  const refocus = useCallback(() => setFocusToken((t) => t + 1), []);

  // Selection reads the profile, but re-picking whenever the profile changes
  // would swap the lesson out from under the user mid-run.
  const profileRef = useRef(profile);
  profileRef.current = profile;

  /* ------------------------- snippet + drill choice ------------------------ */

  const choose = useCallback((availablePool, { exclude = null } = {}) => {
    const p = profileRef.current;
    return pickSnippet(availablePool, {
      charStats: p.charStats,
      recent: p.recent,
      lang: availablePool[0]?.lang,
      division: availablePool[0]?.division,
      target: targetDifficulty(p.history),
      exclude,
    });
  }, []);

  const makeDrill = useCallback((forLang) => {
    const p = profileRef.current;
    return buildDrill({ lang: forLang, charStats: p.charStats, bigrams: p.bigrams });
  }, []);

  /* The corpus arrives per language as its own chunk. */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    loadPool(lang, division)
      .then((loaded) => {
        if (cancelled) return;
        setPool(loaded);
        setLoading(false);
        setSnippet(choose(loaded));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, division, choose]);

  /* Drills are generated locally, so they need no pool at all. */
  useEffect(() => {
    if (mode === "drill" && !drill) setDrill(makeDrill(lang));
  }, [mode, drill, lang, makeDrill]);

  useEffect(() => {
    writeUrlState({ lang, division, mode });
  }, [lang, division, mode]);

  const nextLesson = useCallback(() => {
    setCustomText(null);
    setCopied(false);
    if (mode === "drill") {
      setDrill(makeDrill(lang));
    } else if (pool.length) {
      setSnippet(choose(pool, { exclude: snippet?.id }));
    }
  }, [mode, makeDrill, lang, pool, choose, snippet]);

  /* --------------------------- the active lesson --------------------------- */

  const isCustom = Boolean(customText);
  const isDrill = !isCustom && mode === "drill";

  const text = isCustom ? customText : isDrill ? drill?.text ?? "" : snippet?.code ?? "";

  const activeSnippet = useMemo(() => {
    if (isCustom) return { ...CUSTOM, difficulty: difficultyScore(customText) };
    if (isDrill) {
      return drill
        ? { id: "drill", topic: "drill", title: "weak-key drill", difficulty: difficultyScore(drill.text) }
        : null;
    }
    return snippet;
  }, [isCustom, isDrill, customText, drill, snippet]);

  const handleComplete = useCallback(
    ({ result, entries, text: lessonText, events, bigrams, confusions }) => {
      setSeries(wpmSeries(events));

      const run = {
        ts: Date.now(),
        lang: isCustom ? "custom" : lang,
        division: isCustom ? "custom" : isDrill ? "drill" : division,
        snippetId: activeSnippet?.id ?? "custom",
        difficulty: activeSnippet?.difficulty ?? difficultyScore(lessonText),
        netWpm: result.netWpm,
        rawWpm: result.rawWpm,
        accuracy: result.accuracy,
        backspaces: result.backspaces,
        ms: result.activeMs,
      };
      setLastRun({ ...run, lang, division });
      setCopied(false);

      setProfile((prev) => {
        const next = {
          ...prev,
          charStats: mergeCharStats(prev.charStats, entries, lessonText),
          bigrams: mergeBigrams(prev.bigrams, bigrams),
          confusions: mergeConfusions(prev.confusions, confusions),
          history: pushHistory(prev.history, run),
          totals: {
            lessons: prev.totals.lessons + 1,
            keystrokes: prev.totals.keystrokes + result.keystrokes,
            activeMs: prev.totals.activeMs + result.activeMs,
          },
        };

        // Recency and personal bests belong to real snippets — a generated
        // drill has no id worth remembering and no leaderboard to top.
        if (!isCustom && !isDrill && activeSnippet) {
          next.recent = pushRecent(prev.recent, lang, division, activeSnippet.id);
          next.best = updateBest(prev.best, lang, division, run);
        }

        saveProfile(next);
        return next;
      });
    },
    [lang, division, activeSnippet, isCustom, isDrill]
  );

  const session = useTypingSession(text, handleComplete);

  /* ------------------------------- settings ------------------------------- */

  const persistSettings = useCallback((patch) => {
    setProfile((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...patch } };
      saveProfile(next);
      return next;
    });
  }, []);

  const handleLang = useCallback(
    (value) => {
      setLang(value);
      setCustomText(null);
      setDrill(null);
      persistSettings({ lang: value });
    },
    [persistSettings]
  );

  const handleDivision = useCallback(
    (value) => {
      setDivision(value);
      setCustomText(null);
      persistSettings({ division: value });
    },
    [persistSettings]
  );

  const handleMode = useCallback(
    (value) => {
      setMode(value);
      setCustomText(null);
      if (value === "drill") setDrill(makeDrill(lang));
      persistSettings({ mode: value });
    },
    [persistSettings, makeDrill, lang]
  );

  const handleLayout = useCallback(
    (value) => {
      setLayout(value);
      persistSettings({ layout: value });
    },
    [persistSettings]
  );

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persistSettings({ theme: next });
    refocus();
  }, [theme, persistSettings, refocus]);

  const handleReset = useCallback(() => {
    const fresh = { ...clearProfile(), settings: { theme, lang, division, layout, mode } };
    setProfile(fresh);
    saveProfile(fresh);
    setSeries([]);
    setLastRun(null);
  }, [theme, lang, division, layout, mode]);

  const handleUseCustom = useCallback(
    (value) => {
      setCustomText(value);
      setDialogOpen(false);
      refocus();
    },
    [refocus]
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    refocus();
  }, [refocus]);

  const handleShare = useCallback(async () => {
    if (!lastRun) return;
    const url = shareUrl(lastRun);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard is blocked outside a secure context — put the link where it
      // can at least be copied by hand.
      window.prompt("Copy this link", url);
    }
  }, [lastRun]);

  /* ------------------------------ shortcuts ------------------------------ */

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (dialogOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        session.restart();
        refocus();
        return;
      }
      if (e.key === "Enter" && session.status === "done") {
        e.preventDefault();
        nextLesson();
        refocus();
        return;
      }

      // Focus having escaped the typing input is the usual reason a run stalls
      // — clicking or tabbing away is exactly what causes the idle pause in the
      // first place. Rather than leaving keystrokes going nowhere, take them.
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      // Space and Enter belong to a focused button; everything else does not.
      if (tag === "BUTTON" && (e.key === " " || e.key === "Enter")) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        refocus();
        session.pressBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        refocus();
        session.pressChar("\n");
      } else if (e.key.length === 1) {
        e.preventDefault();
        refocus();
        session.pressChar(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    session.status,
    session.restart,
    session.pressChar,
    session.pressBackspace,
    nextLesson,
    dialogOpen,
    refocus,
  ]);

  const toggleAnalysis = useCallback(() => {
    setAnalysisOpen((wasOpen) => {
      persistSettings({ analysisOpen: !wasOpen });
      return !wasOpen;
    });
    refocus();
  }, [persistSettings, refocus]);

  const chooseTab = useCallback(
    (id) => {
      setAnalysisTab(id);
      persistSettings({ analysisTab: id });
      refocus();
    },
    [persistSettings, refocus]
  );

  const best = profile.best[bucketKey(lang, division)];

  const analysisSummary = useMemo(() => {
    const parts = [];
    if (profile.totals.lessons) parts.push(`${profile.totals.lessons} runs`);
    if (best) parts.push(`best ${best.netWpm} wpm`);
    const worst = topConfusions(profile.confusions, { limit: 1, minCount: 2 })[0];
    if (worst) parts.push(`${displayChar(worst.expected)} → ${displayChar(worst.typed)}`);
    return parts.join("  ·  ");
  }, [profile.totals.lessons, profile.confusions, best]);
  const shownPoolSize = loading ? manifestPoolSize(lang, division) : pool.length;

  return (
    <div className="tt-root" data-theme={theme}>
      <div className="tt-window">
        <div className="tt-titlebar">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          <span className="tt-titletext">
            codetypey — {isCustom ? "custom" : isDrill ? `drill/${lang}` : `${lang}/${division}`}
          </span>
          <button className="tt-theme" onClick={toggleTheme} aria-label="Toggle colour theme">
            {theme === "dark" ? "light" : "dark"}
          </button>
        </div>

        <div className="tt-body">
          <header className="tt-head">
            <h1>
              <span className="tt-dollar">$</span> CodeTypey
            </h1>
            <p>{CORPUS_SIZE} contest patterns across {LANGUAGES.length} languages.</p>
          </header>

          {sharedRun && (
            <div className="tt-shared">
              shared run: <strong>{sharedRun.netWpm} wpm</strong> at {sharedRun.accuracy}% on{" "}
              {sharedRun.lang}/{sharedRun.division}
            </div>
          )}

          <Toolbar
            lang={lang}
            division={division}
            mode={mode}
            poolSize={shownPoolSize}
            loading={loading}
            customActive={isCustom}
            onLang={handleLang}
            onDivision={handleDivision}
            onMode={handleMode}
            onNext={nextLesson}
            onRetry={session.restart}
            onCustom={() => setDialogOpen(true)}
            onReset={handleReset}
            onRefocus={refocus}
          />

          {loadError && (
            <div className="tt-error">
              couldn't load the {lang} snippets
              <button className="tt-btn ghost" onClick={() => handleLang(lang)}>
                retry
              </button>
            </div>
          )}

          <main className="tt-main">
            {text ? (
              <TypingZone
                text={text}
                entries={session.entries}
                autoMask={session.autoMask}
                cursor={session.cursor}
                status={session.status}
                paused={session.paused}
                progress={session.progress}
                live={session.live}
                snippet={activeSnippet}
                drill={isDrill ? drill : null}
                focusToken={focusToken}
                onChar={session.pressChar}
                onBackspace={session.pressBackspace}
                onRetry={() => {
                  session.restart();
                  refocus();
                }}
                onNext={() => {
                  nextLesson();
                  refocus();
                }}
              />
            ) : (
              <div className="tt-zone tt-zone-empty">{loading ? "loading…" : "no lesson"}</div>
            )}

            <StatsStrip
              live={session.live}
              elapsedMs={session.activeMs}
              paused={session.paused}
              best={best}
              total={session.total}
              typedCount={session.typedCount}
            />

            {session.status === "done" && lastRun && (
              <button className="tt-btn ghost tt-share" onClick={handleShare}>
                {copied ? "link copied" : "share this run"}
              </button>
            )}

            <Analysis
              open={analysisOpen}
              tab={analysisTab}
              onToggle={toggleAnalysis}
              onTab={chooseTab}
              summary={analysisSummary}
              profile={profile}
              session={session}
              series={series}
              lang={lang}
              division={division}
              layout={layout}
              onLayout={handleLayout}
              trendScope={trendScope}
              onTrendScope={setTrendScope}
            />
          </main>
        </div>
      </div>

      <CustomTextDialog open={dialogOpen} onClose={closeDialog} onUse={handleUseCustom} />
    </div>
  );
}
