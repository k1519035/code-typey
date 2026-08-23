/**
 * Bookmarkable state, and shareable results without a backend.
 *
 * `?lang=python&division=gold&mode=drill` restores a setup; `?run=…` carries a
 * finished result so a link can say "beat this" — everything encoded in the URL
 * itself, since this deploys as a static site with nothing behind it.
 */

import { isLanguage, isDivision } from "../data/manifest.js";

const MODES = ["snippets", "drill"];

function params() {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
}

/** URL wins over saved settings — a shared link should show what it promises. */
export function readUrlState(fallback) {
  const q = params();
  const lang = q.get("lang");
  const division = q.get("division");
  const mode = q.get("mode");

  return {
    lang: isLanguage(lang) ? lang : fallback.lang,
    division: isDivision(division) ? division : fallback.division,
    mode: MODES.includes(mode) ? mode : fallback.mode || "snippets",
  };
}

export function writeUrlState({ lang, division, mode }) {
  try {
    const q = params();
    q.set("lang", lang);
    q.set("division", division);
    q.set("mode", mode);
    // A run in the URL belongs to the link that was opened, not to whatever the
    // reader does next.
    q.delete("run");
    const url = `${window.location.pathname}?${q.toString()}`;
    window.history.replaceState(null, "", url);
  } catch {
    /* history is unavailable in some embedded contexts; state just isn't shared */
  }
}

/** Compact, human-inspectable: lang.division.netWpm.accuracy */
export function encodeRun(run) {
  return [run.lang, run.division, run.netWpm, run.accuracy].join(".");
}

export function readSharedRun() {
  const raw = params().get("run");
  if (!raw) return null;

  const [lang, division, wpm, acc] = raw.split(".");
  const netWpm = Number(wpm);
  const accuracy = Number(acc);

  if (!isLanguage(lang) || !isDivision(division)) return null;
  if (!Number.isFinite(netWpm) || !Number.isFinite(accuracy)) return null;
  if (netWpm < 0 || netWpm > 400 || accuracy < 0 || accuracy > 100) return null;

  return { lang, division, netWpm: Math.round(netWpm), accuracy: Math.round(accuracy) };
}

export function shareUrl(run) {
  try {
    const q = new URLSearchParams();
    q.set("lang", run.lang);
    q.set("division", run.division);
    q.set("run", encodeRun(run));
    return `${window.location.origin}${window.location.pathname}?${q.toString()}`;
  } catch {
    return "";
  }
}
