/**
 * Corpus integrity check.
 *
 * Every snippet has to be typeable on a US keyboard with the on-screen key map,
 * so anything outside printable ASCII (smart quotes, em dashes, non-breaking
 * spaces) is a bug, as are tabs, CRLF and trailing whitespace.
 *
 * It also verifies the static manifest against reality. Those counts ship in
 * the main bundle so the UI can show pool sizes before a language chunk has
 * loaded, and a silently stale number would be a lie in the interface.
 */
import {
  loadEverything,
  LANGUAGES,
  DIVISIONS,
  DIVISION_IDS,
  CORPUS_SIZE,
} from "../src/data/index.js";
import { difficultyOf, difficultyBand } from "../src/engine/difficulty.js";

const SNIPPETS = await loadEverything();

const problems = [];
const seenIds = new Set();

for (const s of SNIPPETS) {
  const where = `${s.id} (${s.lang}/${s.division} "${s.title}")`;

  if (seenIds.has(s.id)) problems.push(`${where}: duplicate id`);
  seenIds.add(s.id);

  if (!s.topic || !s.title) problems.push(`${where}: missing topic or title`);
  if (s.code.includes("\t")) problems.push(`${where}: contains a tab`);
  if (s.code.includes("\r")) problems.push(`${where}: contains a carriage return`);

  for (const ch of s.code) {
    const cp = ch.codePointAt(0);
    if (ch === "\n") continue;
    if (cp < 0x20 || cp > 0x7e) {
      problems.push(
        `${where}: untypeable character U+${cp.toString(16).padStart(4, "0")} (${JSON.stringify(ch)})`
      );
      break;
    }
  }

  const lines = s.code.split("\n");
  lines.forEach((line, i) => {
    if (/[ ]+$/.test(line)) problems.push(`${where}: trailing whitespace on line ${i + 1}`);
  });

  if (s.code !== s.code.trim()) problems.push(`${where}: leading or trailing blank space`);
  if (s.code.length < 20) problems.push(`${where}: suspiciously short (${s.code.length} chars)`);
  if (s.code.length > 900) problems.push(`${where}: very long (${s.code.length} chars)`);
  if (/^\s/.test(lines[0])) problems.push(`${where}: first line is indented (dedent failed)`);
  if (typeof s.difficulty !== "number") problems.push(`${where}: no difficulty score`);
}

/* ------------------------- manifest must not drift ------------------------ */

const actual = {};
for (const s of SNIPPETS) {
  actual[s.lang] ??= {};
  actual[s.lang][s.division] = (actual[s.lang][s.division] || 0) + 1;
}

for (const lang of LANGUAGES) {
  for (const division of DIVISION_IDS) {
    const claimed = lang.counts[division];
    const real = actual[lang.id]?.[division] ?? 0;
    if (claimed !== real) {
      problems.push(`manifest: ${lang.id}/${division} claims ${claimed} but the bank holds ${real}`);
    }
  }
}
if (CORPUS_SIZE !== SNIPPETS.length) {
  problems.push(`manifest: CORPUS_SIZE is ${CORPUS_SIZE} but the corpus holds ${SNIPPETS.length}`);
}

/* -------------------------------- report --------------------------------- */

console.log(
  `corpus: ${SNIPPETS.length} snippets across ${LANGUAGES.length} languages and ${DIVISIONS.length} divisions`
);

for (const lang of LANGUAGES) {
  const diffs = SNIPPETS.filter((s) => s.lang === lang.id).map((s) => s.difficulty);
  const avg = Math.round(diffs.reduce((n, d) => n + d, 0) / diffs.length);
  const row = DIVISION_IDS.map((d) => String(actual[lang.id]?.[d] ?? 0).padStart(2)).join(" ");
  console.log(
    `  ${lang.label.padEnd(11)} ${row}  |  difficulty ${String(Math.min(...diffs)).padStart(2)}-${String(
      Math.max(...diffs)
    ).padStart(2)} avg ${String(avg).padStart(2)}`
  );
}

console.log("\n  difficulty by division (measured, not asserted):");
for (const division of DIVISION_IDS) {
  const mine = SNIPPETS.filter((s) => s.division === division).map((s) => s.difficulty);
  const avg = Math.round(mine.reduce((n, d) => n + d, 0) / mine.length);
  console.log(`    ${division.padEnd(9)} avg ${String(avg).padStart(2)}  (${difficultyBand(avg)})`);
}

const bands = {};
for (const s of SNIPPETS) {
  const b = difficultyBand(s.difficulty);
  bands[b] = (bands[b] || 0) + 1;
}
console.log(
  "\n  spread: " +
    Object.entries(bands)
      .map(([b, n]) => `${b} ${n}`)
      .join("  ")
);

const topics = new Set(SNIPPETS.map((s) => s.topic));
const avgLen = Math.round(SNIPPETS.reduce((n, s) => n + s.code.length, 0) / SNIPPETS.length);
console.log(`  ${topics.size} distinct topics, average ${avgLen} chars`);

const hardest = SNIPPETS.slice().sort((a, b) => b.difficulty - a.difficulty)[0];
const detail = difficultyOf(hardest.code).components;
console.log(
  `  hardest: ${hardest.id} (${hardest.difficulty}) - ${Math.round(
    detail.symbolDensity * 100
  )}% symbols, nesting depth ${detail.maxDepth}`
);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.error("  - " + p);
  process.exit(1);
}
console.log("\ncorpus ok");
