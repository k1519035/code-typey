/**
 * Versioned profile persistence.
 *
 * The whole premise of the trainer is that it adapts to the keys you miss, so
 * throwing that model away on every refresh quietly deletes the feature. Every
 * access is wrapped because localStorage throws outright in private windows and
 * when site data is blocked.
 */

const KEY = "codetypey.profile.v2";
const LEGACY_KEY = "codetypey.profile.v1";
const HISTORY_CAP = 200;
const RECENT_CAP = 12;

export const PROFILE_VERSION = 2;

export function emptyProfile() {
  return {
    version: PROFILE_VERSION,
    settings: {
      theme: "dark",
      lang: "cpp",
      division: "bronze",
      layout: "qwerty",
      mode: "snippets",
    },
    charStats: {},
    bigrams: {},
    confusions: {},
    history: [],
    best: {},
    recent: {},
    totals: { lessons: 0, keystrokes: 0, activeMs: 0 },
  };
}

/**
 * v1 profiles predate confusion tracking, layouts and modes. Everything it did
 * hold is still meaningful, so it is carried forward rather than discarded —
 * losing someone's weak-key model on an upgrade would be the exact failure this
 * module exists to prevent.
 */
function migrate(parsed) {
  const base = emptyProfile();
  if (!parsed || typeof parsed !== "object") return base;

  return {
    ...base,
    ...parsed,
    version: PROFILE_VERSION,
    settings: { ...base.settings, ...(parsed.settings || {}) },
    totals: { ...base.totals, ...(parsed.totals || {}) },
    confusions: parsed.confusions || {},
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return emptyProfile();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do — the caller resets in-memory state either way */
  }
  return emptyProfile();
}

export function bucketKey(lang, division) {
  return `${lang}/${division}`;
}

export function pushHistory(history, run) {
  return [run, ...history].slice(0, HISTORY_CAP);
}

export function pushRecent(recent, lang, division, snippetId) {
  const key = bucketKey(lang, division);
  const list = [snippetId, ...(recent[key] || []).filter((id) => id !== snippetId)];
  return { ...recent, [key]: list.slice(0, RECENT_CAP) };
}

export function updateBest(best, lang, division, run) {
  const key = bucketKey(lang, division);
  const cur = best[key];
  // A blazing run at 60% accuracy isn't a personal best worth chasing.
  if (run.accuracy < 90) return best;
  if (cur && cur.netWpm >= run.netWpm) return best;
  return { ...best, [key]: { netWpm: run.netWpm, accuracy: run.accuracy, ts: run.ts } };
}
