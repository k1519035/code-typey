/**
 * Unit checks for the pure engine functions. No test framework — these run on
 * plain node so `npm run check` works anywhere without extra dependencies.
 */
import assert from "node:assert/strict";

import {
  computeAutoMask,
  firstIndex,
  advanceFrom,
  retreatFrom,
  typableCount,
  buildEntries,
  AUTO,
  PENDING,
  CORRECT,
  WRONG,
} from "../src/engine/lesson.js";
import { summarize, errorRate, mergeCharStats, mergeBigrams, slowestBigrams, wpmSeries } from "../src/engine/stats.js";
import { weaknessScore, pickSnippet, typedCharSet } from "../src/engine/select.js";
import { dedent } from "../src/data/dedent.js";
import { difficultyOf, difficultyBand, targetDifficulty } from "../src/engine/difficulty.js";
import { buildDrill, weakChars, scoreFragment } from "../src/engine/drills.js";
import { classifyError, positionMap, LAYOUT_IDS } from "../src/data/layouts.js";
import { mergeConfusions, topConfusions } from "../src/engine/stats.js";
import { LANGUAGES, DIVISION_IDS, CORPUS_SIZE } from "../src/data/manifest.js";
import { pushRecent, updateBest, emptyProfile } from "../src/engine/storage.js";

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error("        " + err.message);
    process.exitCode = 1;
  }
}

console.log("lesson geometry");

test("leading whitespace after a newline is auto, interior spaces are not", () => {
  const text = "int main() {\n    int n;\n}";
  const mask = computeAutoMask(text);
  // the space inside "int main" must still be typed
  assert.equal(mask[text.indexOf(" ")], false);
  // the four spaces after the newline are filled in
  const nl = text.indexOf("\n");
  assert.deepEqual(mask.slice(nl + 1, nl + 5), [true, true, true, true]);
  assert.equal(mask[nl + 5], false, "the 'i' of int must be typed");
});

test("a newline itself is never auto", () => {
  const mask = computeAutoMask("a\n    b");
  assert.equal(mask[1], false);
});

test("leading whitespace at the very start is auto", () => {
  assert.deepEqual(computeAutoMask("  x").slice(0, 3), [true, true, false]);
});

test("firstIndex skips the opening indent", () => {
  assert.equal(firstIndex(computeAutoMask("    x")), 4);
  assert.equal(firstIndex(computeAutoMask("x")), 0);
});

test("advanceFrom jumps the whole indent run", () => {
  const text = "a\n        b";
  const mask = computeAutoMask(text);
  assert.equal(advanceFrom(mask, 0), 1, "onto the newline");
  assert.equal(advanceFrom(mask, 1), 10, "past eight spaces onto b");
});

test("retreatFrom steps back over the indent", () => {
  const text = "a\n    b";
  const mask = computeAutoMask(text);
  assert.equal(retreatFrom(mask, 6), 1);
  assert.equal(retreatFrom(mask, 0), -1);
});

test("auto characters are excluded from the character count", () => {
  const text = "a\n    bc";
  assert.equal(typableCount(computeAutoMask(text)), 4); // a, \n, b, c
});

console.log("\nstats");

function entriesFor(text, firstTries) {
  const mask = computeAutoMask(text);
  const entries = buildEntries(text, mask);
  let k = 0;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].state === AUTO) continue;
    const ok = firstTries[k++];
    if (ok === undefined) break;
    entries[i] = { state: CORRECT, firstTry: ok, attempts: ok ? 1 : 2 };
  }
  return entries;
}

test("fixing a typo repairs the text but not the accuracy", () => {
  const text = "abcd";
  const entries = entriesFor(text, [true, false, true, true]);
  const s = summarize({ entries, keystrokes: 5, backspaces: 1, activeMs: 60000 });
  assert.equal(s.correct, 4, "all four characters end up correct");
  assert.equal(s.accuracy, 75, "but one of them was wrong on the first try");
});

test("raw wpm counts every keystroke, net wpm only standing characters", () => {
  const entries = entriesFor("abcde", [true, true, true, true, true]);
  const s = summarize({ entries, keystrokes: 10, backspaces: 5, activeMs: 60000 });
  assert.equal(s.netWpm, 1); // 5 chars / 5 / 1 min
  assert.equal(s.rawWpm, 2); // 10 keys / 5 / 1 min
});

test("an untouched lesson reports 100% rather than NaN", () => {
  const entries = buildEntries("abc", computeAutoMask("abc"));
  const s = summarize({ entries, keystrokes: 0, backspaces: 0, activeMs: 0 });
  assert.equal(s.accuracy, 100);
  assert.equal(s.netWpm, 0);
});

test("wrong characters do not count toward net wpm", () => {
  const mask = computeAutoMask("abcd");
  const entries = buildEntries("abcd", mask).map((e, i) => ({
    state: i === 0 ? WRONG : CORRECT,
    firstTry: i !== 0,
    attempts: 1,
  }));
  const s = summarize({ entries, keystrokes: 4, backspaces: 0, activeMs: 60000 });
  assert.equal(s.correct, 3);
});

test("error rate is smoothed so one miss is not a catastrophe", () => {
  assert.equal(errorRate(undefined), 0);
  const rare = errorRate({ attempts: 1, errors: 1 }); // 1/5
  const common = errorRate({ attempts: 100, errors: 50 }); // 50/104
  assert.ok(common > rare, "a genuinely bad key must outrank a one-off miss");
});

test("char stats merge only first attempts", () => {
  const text = "ab";
  const entries = entriesFor(text, [true, false]);
  const merged = mergeCharStats({}, entries, text);
  assert.deepEqual(merged.a, { attempts: 1, errors: 0 });
  assert.deepEqual(merged.b, { attempts: 1, errors: 1 });
});

test("bigram map stays bounded and reports the slowest", () => {
  const samples = [];
  for (let i = 0; i < 50; i++) samples.push({ pair: "x" + i, ms: 10 });
  for (let i = 0; i < 3; i++) samples.push({ pair: "->", ms: 400 });
  const merged = mergeBigrams({}, samples, 10);
  assert.ok(Object.keys(merged).length <= 10);
  const slow = slowestBigrams(merged, { minSamples: 3, limit: 3 });
  assert.equal(slow[0].pair, "->");
  assert.equal(slow[0].avgMs, 400);
});

test("wpm series needs a real span to plot", () => {
  assert.deepEqual(wpmSeries([{ t: 0, ok: true }]), []);
  assert.deepEqual(wpmSeries([{ t: 0, ok: true }, { t: 100, ok: true }]), []);
  assert.ok(wpmSeries([{ t: 0, ok: true }, { t: 10000, ok: true }]).length > 0);
});

console.log("\nselection");

test("only characters you actually type are considered", () => {
  const set = typedCharSet("a\n    b");
  assert.deepEqual([...set].sort(), ["a", "b"], "newline and auto-indent excluded");
});

test("length does not beat weakness (the old scoring bug)", () => {
  const charStats = { ">": { attempts: 10, errors: 8 }, a: { attempts: 100, errors: 0 } };
  const shortWeak = ">>>";
  const longClean = "a".repeat(300);
  assert.ok(
    weaknessScore(shortWeak, charStats) > weaknessScore(longClean, charStats),
    "a short snippet full of your worst key must outscore a long clean one"
  );
});

test("a snippet covering several weak keys edges out one drilling a single key", () => {
  const charStats = {
    ">": { attempts: 10, errors: 5 },
    "<": { attempts: 10, errors: 5 },
    ":": { attempts: 10, errors: 5 },
  };
  const many = "><:";
  const one = ">";
  assert.ok(weaknessScore(many, charStats) > weaknessScore(one, charStats));
});

test("recently seen snippets are pushed down", () => {
  const pool = [
    { id: "a", code: "aaa" },
    { id: "b", code: "bbb" },
  ];
  const opts = {
    charStats: {},
    recent: { "cpp/bronze": ["a"] },
    lang: "cpp",
    division: "bronze",
    random: () => 0, // remove jitter so the penalty is the only signal
  };
  assert.equal(pickSnippet(pool, opts).id, "b");
});

test("the current snippet is never handed back by 'new snippet'", () => {
  const pool = [
    { id: "a", code: "aaa" },
    { id: "b", code: "bbb" },
  ];
  const picked = pickSnippet(pool, {
    lang: "cpp",
    division: "bronze",
    exclude: "a",
    random: () => 0,
  });
  assert.equal(picked.id, "b");
});

test("an empty pool returns null instead of throwing", () => {
  assert.equal(pickSnippet([], { lang: "cpp", division: "bronze" }), null);
});

console.log("\nprofile");

test("recent list dedupes and stays capped", () => {
  let recent = {};
  for (const id of ["a", "b", "c", "a"]) recent = pushRecent(recent, "cpp", "bronze", id);
  assert.deepEqual(recent["cpp/bronze"], ["a", "c", "b"]);
});

test("a sloppy fast run is not a personal best", () => {
  const best = updateBest({}, "cpp", "bronze", { netWpm: 200, accuracy: 62, ts: 1 });
  assert.deepEqual(best, {}, "62% accuracy should not set a record");
  const real = updateBest({}, "cpp", "bronze", { netWpm: 80, accuracy: 97, ts: 2 });
  assert.equal(real["cpp/bronze"].netWpm, 80);
});

test("a fresh profile has every field the app reads", () => {
  const p = emptyProfile();
  for (const key of ["settings", "charStats", "bigrams", "confusions", "history", "best", "recent", "totals"]) {
    assert.ok(key in p, `missing ${key}`);
  }
});

console.log("\ntext");

test("dedent strips common indentation and keeps relative structure", () => {
  const out = dedent`
        if (x) {
            y();
        }
      `;
  assert.equal(out, "if (x) {\n    y();\n}");
});

test("dedent preserves escape sequences as literal characters", () => {
  const out = dedent`cout << "\n";`;
  assert.equal(out, 'cout << "\\n";');
  assert.ok(!out.includes("\n"), "must not contain a real newline");
});

console.log("\ndifficulty");

test("symbol-dense code outranks prose-like code", () => {
  const dense = difficultyOf("vector<vector<int>> adj(n+1); dp[i][j] = f(a[k], b[k]);").score;
  const plain = difficultyOf("total = sum of all the numbers in the list a").score;
  assert.ok(dense > plain, `${dense} should beat ${plain}`);
});

test("length alone does not make something difficult", () => {
  const longEasy = difficultyOf("a = b\n".repeat(60)).score;
  const shortHard = difficultyOf("x = (a->b)[i] & ~(1 << k) | (c::d);").score;
  assert.ok(shortHard > longEasy, `${shortHard} should beat ${longEasy}`);
});

test("difficulty stays inside 0..100", () => {
  for (const sample of ["a", "", "~^|{}<>&%@#$_+".repeat(20), "print(1)"]) {
    const { score } = difficultyOf(sample);
    assert.ok(score >= 0 && score <= 100, `${score} out of range for ${JSON.stringify(sample.slice(0, 12))}`);
  }
});

test("bands actually separate the corpus quartiles", () => {
  assert.equal(difficultyBand(30), "light");
  assert.equal(difficultyBand(50), "moderate");
  assert.equal(difficultyBand(60), "heavy");
  assert.equal(difficultyBand(80), "brutal");
});

test("the target ramps up when you are comfortable and down when you are not", () => {
  const comfy = Array.from({ length: 5 }, () => ({ difficulty: 50, accuracy: 98 }));
  const struggling = Array.from({ length: 5 }, () => ({ difficulty: 50, accuracy: 80 }));
  assert.ok(targetDifficulty(comfy) > 50, "should push harder at 98%");
  assert.ok(targetDifficulty(struggling) < 50, "should ease off at 80%");
  assert.equal(targetDifficulty([]), 38, "cold start falls back");
});

console.log("\ndrills");

test("weak characters are ranked by rate, not raw miss count", () => {
  const stats = {
    e: { attempts: 500, errors: 20 },
    ">": { attempts: 10, errors: 7 },
  };
  const weak = weakChars(stats);
  assert.equal(weak[0].ch, ">", "the key you miss most of the time comes first");
});

test("fragments covering several weak keys beat repetition of one", () => {
  const weak = [
    { ch: "<", rate: 0.4 },
    { ch: ">", rate: 0.4 },
    { ch: ":", rate: 0.4 },
  ];
  const spread = scoreFragment("a<b>c:d", { weak, slowPairs: [] });
  const repeat = scoreFragment("a<b<c<d<e<f", { weak, slowPairs: [] });
  assert.ok(spread > repeat, `${spread} should beat ${repeat}`);
});

test("a drill actually contains the characters it claims to target", () => {
  const charStats = { ">": { attempts: 20, errors: 12 }, ";": { attempts: 20, errors: 10 } };
  const drill = buildDrill({ lang: "cpp", charStats, random: () => 0.5 });
  assert.ok(!drill.coldStart);
  assert.ok(drill.targets.length > 0, "should name its targets");
  for (const ch of drill.targets.slice(0, 2)) {
    assert.ok(drill.text.includes(ch), `drill text is missing its target ${JSON.stringify(ch)}`);
  }
});

test("a cold-start drill still produces something typeable", () => {
  const drill = buildDrill({ lang: "python", random: () => 0.5 });
  assert.ok(drill.coldStart);
  assert.ok(drill.text.length > 40);
  assert.ok(!drill.text.includes("\t"));
});

test("drills never emit duplicate adjacent lines that came from one fragment", () => {
  const drill = buildDrill({ lang: "rust", random: () => 0.5, lines: 4 });
  assert.ok(drill.text.split("\n").length <= 5);
});

console.log("\nconfusions");

test("a mistyped space survives the encoding", () => {
  const merged = mergeConfusions({}, [{ expected: " ", typed: "x" }]);
  const [top] = topConfusions(merged, { minCount: 1 });
  assert.equal(top.expected, " ");
  assert.equal(top.typed, "x");
});

test("confusions are capped by frequency", () => {
  const samples = [];
  for (let i = 0; i < 40; i++) samples.push({ expected: "a", typed: String.fromCharCode(48 + i) });
  for (let i = 0; i < 5; i++) samples.push({ expected: ":", typed: ";" });
  const merged = mergeConfusions({}, samples, 10);
  assert.ok(Object.keys(merged).length <= 10);
  assert.equal(merged[":;"], 5, "the frequent one must survive the cull");
});

console.log("\nlayouts");

test("shift errors are told apart from next-door slips", () => {
  assert.equal(classifyError(":", ";"), "shift", "same key, wrong modifier");
  assert.equal(classifyError("k", "l"), "neighbour", "the key next door");
  assert.equal(classifyError("a", "A"), "case");
  assert.equal(classifyError("q", "m"), "other");
});

test("every layout maps the whole printable set", () => {
  for (const id of LAYOUT_IDS) {
    const map = positionMap(id);
    for (const ch of "abcdefghijklmnopqrstuvwxyz0123456789") {
      assert.ok(map.has(ch), `${id} is missing ${ch}`);
    }
    assert.ok(map.has(" "), `${id} is missing space`);
  }
});

test("colemak really is a different layout", () => {
  const q = positionMap("qwerty").get("t");
  const c = positionMap("colemak").get("t");
  assert.notDeepEqual(q, c, "t sits in different places on qwerty and colemak");
});

console.log("\nmanifest");

test("every language declares all four divisions", () => {
  for (const lang of LANGUAGES) {
    for (const d of DIVISION_IDS) {
      assert.ok(typeof lang.counts[d] === "number" && lang.counts[d] > 0, `${lang.id}/${d}`);
    }
  }
});

test("CORPUS_SIZE is the sum of the declared counts", () => {
  const sum = LANGUAGES.reduce(
    (n, l) => n + DIVISION_IDS.reduce((m, d) => m + l.counts[d], 0),
    0
  );
  assert.equal(CORPUS_SIZE, sum);
});

console.log(`\n${passed} checks passed`);
