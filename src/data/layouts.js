/**
 * Physical keyboard layouts for the heatmap and for classifying near-miss
 * errors.
 *
 * Hardcoding US QWERTY meant the heatmap was simply wrong for anyone on
 * Colemak or Dvorak — and "which key is next to which" is what turns a bare
 * error count into "you're hitting the neighbouring key".
 */

const SHIFT = {
  "`": "~", 1: "!", 2: "@", 3: "#", 4: "$", 5: "%", 6: "^", 7: "&", 8: "*",
  9: "(", 0: ")", "-": "_", "=": "+", "[": "{", "]": "}", "\\": "|",
  ";": ":", "'": '"', ",": "<", ".": ">", "/": "?",
};

function key(ch) {
  if (/[a-z]/.test(ch)) return { u: ch, s: ch.toUpperCase() };
  const s = SHIFT[ch];
  return s ? { u: ch, s } : { u: ch };
}

function row(chars) {
  return [...chars.split(" ")].map(key);
}

const NUMBER_ROW = "` 1 2 3 4 5 6 7 8 9 0 - =";
const BACKSPACE = { label: "⌫", wide: 2, backspace: true };
const TAB = { label: "tab", wide: 1.4 };
const CAPS = { label: "caps", wide: 1.6 };
const ENTER = { label: "enter", wide: 1.9, enter: true };
const SHIFT_L = { label: "shift", wide: 2 };
const SHIFT_R = { label: "shift", wide: 2 };
const SPACE = { label: "space", wide: 8, u: " " };

function build({ top, home, bottom, numbers = NUMBER_ROW }) {
  return [
    [...row(numbers), BACKSPACE],
    [TAB, ...row(top)],
    [CAPS, ...row(home), ENTER],
    [SHIFT_L, ...row(bottom), SHIFT_R],
    [SPACE],
  ];
}

export const LAYOUTS = {
  qwerty: {
    id: "qwerty",
    label: "qwerty",
    rows: build({
      top: "q w e r t y u i o p [ ] \\",
      home: "a s d f g h j k l ; '",
      bottom: "z x c v b n m , . /",
    }),
  },
  colemak: {
    id: "colemak",
    label: "colemak",
    rows: build({
      top: "q w f p g j l u y ; [ ] \\",
      home: "a r s t d h n e i o '",
      bottom: "z x c v b k m , . /",
    }),
  },
  dvorak: {
    id: "dvorak",
    label: "dvorak",
    rows: build({
      numbers: "` 1 2 3 4 5 6 7 8 9 0 [ ]",
      top: "' , . p y f g c r l / = \\",
      home: "a o e u i d h t n s -",
      bottom: "; q j k x b m w v z",
    }),
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

export function layoutRows(id) {
  return (LAYOUTS[id] || LAYOUTS.qwerty).rows;
}

/**
 * Maps every character to its physical position, so we can ask whether two
 * characters live on neighbouring keys.
 */
const positionCache = new Map();

export function positionMap(id) {
  if (positionCache.has(id)) return positionCache.get(id);

  const map = new Map();
  layoutRows(id).forEach((keys, r) => {
    let x = 0;
    keys.forEach((k) => {
      const width = k.wide || 1;
      const centre = x + width / 2;
      if (k.u) map.set(k.u, { r, x: centre, shifted: false });
      if (k.s) map.set(k.s, { r, x: centre, shifted: true });
      x += width;
    });
  });

  positionCache.set(id, map);
  return map;
}

/**
 * Classifies a mistake. `shift` means the right key with the wrong modifier —
 * a timing problem, not a location problem — which is worth telling apart from
 * simply hitting the key next door.
 */
export function classifyError(expected, typed, layoutId = "qwerty") {
  if (!expected || !typed) return "other";

  if (expected !== typed && expected.toLowerCase() === typed.toLowerCase()) return "case";

  const pos = positionMap(layoutId);
  const a = pos.get(expected);
  const b = pos.get(typed);
  if (!a || !b) return "other";

  const sameKey = a.r === b.r && Math.abs(a.x - b.x) < 0.01;
  if (sameKey) return "shift";

  const adjacent = Math.abs(a.r - b.r) <= 1 && Math.abs(a.x - b.x) <= 1.2;
  if (adjacent) return "neighbour";

  return "other";
}

export const ERROR_LABELS = {
  shift: "shift timing",
  case: "wrong case",
  neighbour: "next-door key",
  other: "other",
};
