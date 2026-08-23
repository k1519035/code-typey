/**
 * Static description of the corpus.
 *
 * The snippet banks themselves are loaded on demand — practising Python should
 * not mean downloading C++, Java, Rust, Go and JavaScript first. This manifest
 * stays in the main bundle so the UI can show counts before anything is
 * fetched. `npm run lint:corpus` fails if these numbers drift from reality.
 */

export const DIVISIONS = [
  { id: "bronze", label: "bronze" },
  { id: "silver", label: "silver" },
  { id: "gold", label: "gold" },
  { id: "platinum", label: "platinum" },
];

export const LANGUAGES = [
  { id: "cpp", label: "c++", ext: "cpp", counts: { bronze: 14, silver: 14, gold: 14, platinum: 18 } },
  { id: "java", label: "java", ext: "java", counts: { bronze: 14, silver: 14, gold: 14, platinum: 18 } },
  { id: "python", label: "python", ext: "py", counts: { bronze: 14, silver: 14, gold: 14, platinum: 18 } },
  { id: "rust", label: "rust", ext: "rs", counts: { bronze: 8, silver: 8, gold: 8, platinum: 8 } },
  { id: "go", label: "go", ext: "go", counts: { bronze: 8, silver: 8, gold: 8, platinum: 8 } },
  { id: "javascript", label: "javascript", ext: "js", counts: { bronze: 8, silver: 8, gold: 8, platinum: 8 } },
];

export const LANGUAGE_IDS = LANGUAGES.map((l) => l.id);
export const DIVISION_IDS = DIVISIONS.map((d) => d.id);

export const CORPUS_SIZE = LANGUAGES.reduce(
  (n, l) => n + DIVISION_IDS.reduce((m, d) => m + l.counts[d], 0),
  0
);

export function poolSize(lang, division) {
  return LANGUAGES.find((l) => l.id === lang)?.counts[division] ?? 0;
}

export function isLanguage(id) {
  return LANGUAGE_IDS.includes(id);
}

export function isDivision(id) {
  return DIVISION_IDS.includes(id);
}
