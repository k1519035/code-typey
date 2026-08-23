/**
 * Browser test. Drives the real app in headless Chromium and asserts on
 * behaviour that unit tests can't reach: focus handling, lazy chunk loading,
 * persistence across reloads, and whether the numbers on screen agree.
 *
 * Needs Playwright, which is deliberately not a project dependency:
 *   npm i -D playwright && npx playwright install chromium
 */
import { chromium } from "playwright";

// Point at a running dev server (`npm run dev`) or a preview of the build
// (`npm run preview`, port 4173) with URL=…
const URL = process.env.URL || "http://localhost:5173/";
// CHROMIUM=… overrides the browser binary; otherwise Playwright resolves its own.
const EXE = process.env.CHROMIUM;

const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/TUNNEL|net::ERR|404|favicon/.test(m.text())) {
    errors.push("CONSOLE: " + m.text());
  }
});

const log = console.log;
let checks = 0;
function ok(label, condition, detail = "") {
  checks++;
  if (!condition) throw new Error(`${label}${detail ? " — " + detail : ""}`);
  log(`  ok  ${label}${detail ? " — " + detail : ""}`);
}

/** Read the lesson out of the DOM, undoing the display substitutions. */
async function readLesson() {
  return page.$$eval(".tt-code .ch", (spans) =>
    spans.map((s) => {
      const t = s.textContent;
      const ch = t === "·" ? " " : t === "⏎" ? "\n" : t === "→" ? "\t" : t;
      return { ch, auto: s.classList.contains("auto"), current: s.classList.contains("current") };
    })
  );
}

async function stat(label) {
  return page.$$eval(
    ".tt-strip-cell",
    (cells, want) => {
      for (const c of cells) {
        if (c.querySelector(".tt-strip-label")?.textContent.trim() === want) {
          return c.firstElementChild.textContent.trim();
        }
      }
      return null;
    },
    label
  );
}

/** The analysis panels are collapsed by default; open one by tab name. */
async function openTab(name) {
  const isOpen = await page.$$eval(".tt-tabs", (n) => n.length > 0);
  if (!isOpen) await page.click(".tt-analysis-toggle");
  await page.waitForSelector(".tt-tabs");
  await page.click(`.tt-tab:text-is("${name}")`);
  await page.waitForSelector(".tt-tabpanel .tt-card");
}

/** Advance to a fresh lesson and wait for the completion panel to clear. */
async function advance() {
  await page.keyboard.press("Enter");
  await page.waitForSelector(".tt-done", { state: "detached", timeout: 8000 });
  await waitForLesson();
}

async function waitForLesson() {
  await page.waitForFunction(() => {
    const spans = document.querySelectorAll(".tt-code .ch");
    return spans.length > 0 && [...spans].some((s) => !s.classList.contains("auto"));
  }, undefined, { timeout: 8000 });
}

/**
 * Types the whole lesson. `typoOn` fumbles the first `typoCount` occurrences of
 * a given character by pressing z instead, then correcting — which produces a
 * repeated, predictable substitution the confusion matrix should pick up.
 */
async function typeLesson({ typoAt = null, typoOn = null, typoCount = 2 } = {}) {
  const cells = (await readLesson()).filter((c) => !c.auto);
  let fumbled = 0;
  for (const [i, cell] of cells.entries()) {
    const byIndex = typoAt !== null && i === typoAt;
    const byChar = typoOn !== null && cell.ch === typoOn && fumbled < typoCount;
    if ((byIndex || byChar) && cell.ch !== "\n" && cell.ch !== "z") {
      await page.keyboard.press("KeyZ");
      await page.keyboard.press("Backspace");
      if (byChar) fumbled++;
    }
    if (cell.ch === "\n") await page.keyboard.press("Enter");
    else await page.keyboard.type(cell.ch);
  }
  await page.waitForSelector(".tt-done", { timeout: 8000 });
  // The completion panel renders a frame before the profile write lands, so
  // waiting on `.tt-done` alone races the history row.
  return { length: cells.length, fumbled };
}

/* ============================== 1. render ============================== */
log("\nrender");
await page.goto(URL, { waitUntil: "domcontentloaded" });
await waitForLesson();

const rootLen = await page.$eval("#root", (el) => el.innerHTML.length);
ok("app renders", rootLen > 5000, `${rootLen} chars of DOM`);
ok("difficulty badge shown", (await page.$$(".tt-diff")).length === 1);

/* =========================== 2. auto-indent =========================== */
log("\nauto-indent");
const cells = await readLesson();
const autoCount = cells.filter((c) => c.auto).length;
const cursorAt = cells.findIndex((c) => c.current);
ok("indentation is pre-filled", autoCount > 0, `${autoCount} characters`);
ok("cursor never starts on filled-in indentation", !cells[cursorAt].auto);

/* ====================== 3. a lesson end to end ======================== */
log("\ntyping a lesson");
const run1 = await typeLesson({ typoOn: ";", typoCount: 2, typoAt: 3 });
const typed = run1.length;
ok("nothing left pending", (await page.$$(".tt-code .ch.pending")).length === 0);

const banner = await page.$$eval(".tt-done-stats div", (d) =>
  d.map((x) => x.querySelector("strong").textContent)
);
const panelNet = parseInt(await stat("net wpm"), 10);
const panelAcc = parseInt(await stat("accuracy"), 10);
ok(
  "banner and live panel agree",
  parseInt(banner[0], 10) === panelNet && parseInt(banner[1], 10) === panelAcc,
  `${banner[0]}/${panelNet} wpm, ${banner[1]}/${panelAcc}%`
);
ok("the deliberate typo cost accuracy", panelAcc < 100 && panelAcc > 80, `${panelAcc}%`);
ok("every character was counted", (await stat("characters")) === `${typed}/${typed}`);

/* ==================== 4. confusion matrix recorded ==================== */
log("\nconfusions");
await openTab("keys");
const confusion = await page.evaluate(() => {
  const rows = [...document.querySelectorAll(".confusion-row")].map((r) => ({
    want: r.querySelector(".want").textContent,
    got: r.querySelector(".got").textContent,
    kind: r.querySelector(".confusion-kind").textContent,
  }));
  return { rows, summary: document.querySelector(".confusion-summary")?.innerText || "" };
});
ok(
  "a repeated mistake is recorded with what was actually pressed",
  confusion.rows.length >= 1 && run1.fumbled >= 2,
  confusion.rows.map((r) => `${r.want}->${r.got} (${r.kind})`).join(", ")
);
ok(
  "the semicolon-for-z substitution we injected is the one reported",
  confusion.rows.some((r) => r.got === "z"),
  JSON.stringify(confusion.rows[0] || null)
);
ok("mistakes are classified by kind", /timing|door|case|other/.test(confusion.summary), confusion.summary.replace(/\n/g, " "));

/* ========================= 5. trend + history ========================= */
log("\nprogress");
await advance();
await typeLesson();
await openTab("history");
const historyRows = await page.$$eval(".log-row", (n) => n.length);
ok("both runs recorded separately", historyRows >= 2, `${historyRows} rows`);

await openTab("progress");
ok("trend chart appears once there are two runs", (await page.$$(".trend-smooth")).length === 1);

const deltaText = await page.$eval(".trend-delta", (el) => el.innerText).catch(() => "");
ok("trend reports a direction", /wpm across \d+ runs/.test(deltaText), deltaText.replace(/\n/g, " "));

/* ========================== 6. persistence =========================== */
log("\npersistence");
await openTab("history");
const before = await page.$$eval(".log-row", (n) => n.length);
await page.reload({ waitUntil: "domcontentloaded" });
await waitForLesson();
await openTab("history");
ok("history survives a reload", (await page.$$eval(".log-row", (n) => n.length)) === before);
await openTab("keys");
ok(
  "the weak-key model survives a reload",
  (await page.$$eval(".kb-key[style*='rgba(255']", (n) => n.length)) >= 1
);
ok("the analysis section remembers it was open", (await page.$$(".tt-tabs")).length === 1);

/* ============================ 7. drill mode ========================== */
log("\ndrill mode");
await page.click('.tt-mode[title*="weak keys"]');
await waitForLesson();
const drillNote = await page.$eval(".tt-drill-note", (el) => el.innerText);
ok("drill mode explains what it is targeting", drillNote.length > 10, drillNote.slice(0, 60));
const drillCells = (await readLesson()).filter((c) => !c.auto);
ok("drill produced a real lesson", drillCells.length > 30, `${drillCells.length} characters`);
ok("url records the mode", page.url().includes("mode=drill"));

/* ===================== 8. lazy language chunks ======================= */
log("\ncode splitting");
const chunkRequests = [];
page.on("request", (r) => {
  if (/\/assets\/(rust|go|javascript|python|java|cpp)-/.test(r.url())) chunkRequests.push(r.url());
});
await page.click('.tt-mode[title*="contest"]');
await page.selectOption('select[aria-label="Language"]', "rust");
await waitForLesson();
ok(
  "switching language fetches only that language's chunk",
  chunkRequests.length <= 1,
  chunkRequests.map((u) => u.split("/").pop()).join(", ") || "already cached (dev server)"
);
ok("url records the language", page.url().includes("lang=rust"));
const rustTitle = await page.$eval(".tt-title", (el) => el.textContent);
ok("rust snippets load", rustTitle.length > 0, rustTitle);

/* ====================== 9. focus returns to input ==================== */
log("\nfocus handling");
for (const [label, action] of [
  ["next button", () => page.click(".tt-bar .tt-btn:not(.ghost)")],
  ["theme toggle", () => page.click(".tt-theme")],
  [
    "layout select",
    async () => {
      await openTab("keys");
      await page.selectOption('select[aria-label="Keyboard layout"]', "colemak");
    },
  ],
  ["division select", () => page.selectOption('select[aria-label="Division"]', "gold")],
]) {
  await action();
  await waitForLesson();
  const was = await stat("characters");
  const first = (await readLesson()).find((c) => !c.auto);
  if (first.ch === "\n") await page.keyboard.press("Enter");
  else await page.keyboard.type(first.ch);
  const now = await stat("characters");
  ok(`typing still works after using the ${label}`, was !== now, `${was} → ${now}`);
  await page.keyboard.press("Escape");
}

/* ========================= 10. keyboard layout ======================= */
log("\nlayouts");
await openTab("keys");
const colemakHome = await page.$$eval(".kb-row:nth-child(3) .kb-key .u", (n) =>
  n.map((x) => x.textContent).join("")
);
ok("heatmap redraws for colemak", colemakHome.includes("arst"), colemakHome);

/* ======================== 11. accessibility ========================== */
log("\naccessibility");
const a11y = await page.evaluate(() => {
  const input = document.querySelector(".tt-capture");
  const ids = (input.getAttribute("aria-describedby") || "").split(" ");
  const described = ids.map((id) => document.getElementById(id)?.textContent?.trim() || "");
  return {
    hasLabel: Boolean(input.getAttribute("aria-label")),
    describedBy: described,
    liveRegions: document.querySelectorAll("[aria-live]").length,
    progress: document.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"),
  };
});
ok("the input is labelled", a11y.hasLabel);
ok(
  "every aria-describedby target exists and has content",
  a11y.describedBy.length === 2 && a11y.describedBy.every((t) => t.length > 20),
  a11y.describedBy.map((t) => t.slice(0, 40) + "…").join(" | ")
);
ok("lesson text is exposed as speakable names", /colon|semicolon|open paren|space/.test(a11y.describedBy[1]));
ok("there is a live region for progress and errors", a11y.liveRegions >= 1);
ok("progress bar reports a value", a11y.progress !== null);

/* ===================== 11b. idle pause and resuming =================== */
log("\nidle and focus");
await page.click(".tt-zone");
await page.keyboard.type("i");
await page.waitForTimeout(3600);
ok("the clock stops after a spell of not typing", (await page.$eval(".tt-zone-hint", (e) => e.textContent)) === "paused");
await page.keyboard.type("f");
await page.waitForTimeout(200);
ok("typing resumes the clock", (await page.$eval(".tt-zone-hint", (e) => e.textContent)) !== "paused");

await page.click(".tt-head h1"); // the usual reason you go idle: you clicked away
await page.waitForTimeout(200);
ok("losing focus is visible rather than silent", (await page.$$(".tt-resume")).length === 1);
const beforeResume = await stat("characters");
await page.keyboard.type("x");
await page.waitForTimeout(250);
ok(
  "any key resumes from an unfocused state",
  (await stat("characters")) !== beforeResume && (await page.$$(".tt-resume")).length === 0,
  `${beforeResume} → ${await stat("characters")}`
);

await page.evaluate(() => document.querySelector(".tt-theme").focus());
const themeBefore = await page.evaluate(() => document.querySelector(".tt-root").dataset.theme);
await page.keyboard.press("Space");
await page.waitForTimeout(250);
ok(
  "space on a focused button still activates it",
  (await page.evaluate(() => document.querySelector(".tt-root").dataset.theme)) !== themeBefore
);

/* ========================= 12. shared results ======================== */
log("\nsharing");
await page.goto(`${URL}?lang=python&division=gold&run=python.gold.84.97`, {
  waitUntil: "domcontentloaded",
});
await waitForLesson();
const sharedText = await page.$eval(".tt-shared", (el) => el.innerText);
ok("a shared run renders from the url alone", /84 wpm/.test(sharedText), sharedText.replace(/\n/g, " "));
ok("a shared link restores its language", (await page.$eval('select[aria-label="Language"]', (e) => e.value)) === "python");

const junk = await page.goto(`${URL}?lang=nonsense&division=zzz&run=evil.evil.999.999`, {
  waitUntil: "domcontentloaded",
}).then(() => page.waitForSelector(".tt-code .ch")).then(() =>
  page.evaluate(() => ({
    shared: document.querySelectorAll(".tt-shared").length,
    lang: document.querySelector('select[aria-label="Language"]').value,
  }))
);
ok("a malformed url is ignored rather than trusted", junk.shared === 0 && junk.lang !== "nonsense", `lang fell back to ${junk.lang}`);

/* ========================== 13. mobile layout ======================== */
log("\nmobile");
const mobile = await ctx.newPage();
await mobile.setViewportSize({ width: 390, height: 780 });
await mobile.goto(URL, { waitUntil: "domcontentloaded" });
await mobile.waitForSelector(".tt-code");
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
ok("no horizontal overflow at 390px", overflow <= 2, `${overflow}px`);
ok("a focusable input exists for mobile keyboards", (await mobile.$$(".tt-capture")).length === 1);

await page.screenshot({ path: "/tmp/ct4-desktop.png", fullPage: true });
await mobile.screenshot({ path: "/tmp/ct4-mobile.png", fullPage: true });

if (errors.length) {
  console.error("\npage errors:", errors);
  await browser.close();
  process.exit(1);
}

log(`\n${checks} browser checks passed`);
await browser.close();
