import { difficultyScore } from "../engine/difficulty.js";
import {
  LANGUAGES,
  DIVISIONS,
  DIVISION_IDS,
  CORPUS_SIZE,
  poolSize,
  isLanguage,
  isDivision,
} from "./manifest.js";

export { LANGUAGES, DIVISIONS, DIVISION_IDS, CORPUS_SIZE, poolSize, isLanguage, isDivision };

/**
 * One dynamic import per language. Vite turns each into its own chunk, so the
 * initial download carries the app and the manifest but none of the snippet
 * text — practising Python no longer means fetching C++, Java, Rust, Go and
 * JavaScript first, and the corpus can grow without moving first paint.
 */
const LOADERS = {
  cpp: () => import("./cpp.js").then((m) => m.CPP),
  java: () => import("./java.js").then((m) => m.JAVA),
  python: () => import("./python.js").then((m) => m.PYTHON),
  rust: () => import("./rust.js").then((m) => m.RUST),
  go: () => import("./go.js").then((m) => m.GO),
  javascript: () => import("./javascript.js").then((m) => m.JAVASCRIPT),
};

const cache = new Map();

/** Decorates raw bank entries with stable ids and measured difficulty. */
function hydrate(langId, bank) {
  const out = {};
  for (const division of DIVISION_IDS) {
    out[division] = (bank[division] || []).map((entry, i) => ({
      id: `${langId}-${division}-${i}`,
      lang: langId,
      division,
      topic: entry.topic,
      title: entry.title,
      code: entry.code,
      difficulty: difficultyScore(entry.code),
    }));
  }
  return out;
}

/** Loads (and caches) every snippet for one language. */
export function loadLanguage(langId) {
  if (!LOADERS[langId]) return Promise.reject(new Error(`unknown language: ${langId}`));
  if (!cache.has(langId)) {
    cache.set(
      langId,
      LOADERS[langId]()
        .then((bank) => hydrate(langId, bank))
        .catch((err) => {
          // Never cache a failed chunk fetch — one flaky moment shouldn't
          // permanently break that language for the rest of the session.
          cache.delete(langId);
          throw err;
        })
    );
  }
  return cache.get(langId);
}

export async function loadPool(langId, division) {
  const bank = await loadLanguage(langId);
  return bank[division] || [];
}

/** Tooling helper: pull the entire corpus in one go. */
export async function loadEverything() {
  const banks = await Promise.all(LANGUAGES.map((l) => loadLanguage(l.id)));
  const all = [];
  banks.forEach((bank) => {
    for (const division of DIVISION_IDS) all.push(...bank[division]);
  });
  return all;
}
