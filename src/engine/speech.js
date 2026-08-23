/**
 * Readable names for characters.
 *
 * A screen reader announcing "semicolon" instead of silently skipping a
 * punctuation glyph is the difference between the trainer being operable and
 * being usable. Symbols are exactly the content of this app, so they cannot be
 * left to the reader's default punctuation settings.
 */
const NAMES = {
  " ": "space",
  "\n": "new line",
  "\t": "tab",
  "!": "exclamation mark",
  '"': "double quote",
  "#": "hash",
  $: "dollar",
  "%": "percent",
  "&": "ampersand",
  "'": "apostrophe",
  "(": "open paren",
  ")": "close paren",
  "*": "asterisk",
  "+": "plus",
  ",": "comma",
  "-": "hyphen",
  ".": "dot",
  "/": "slash",
  ":": "colon",
  ";": "semicolon",
  "<": "less than",
  "=": "equals",
  ">": "greater than",
  "?": "question mark",
  "@": "at sign",
  "[": "open bracket",
  "\\": "backslash",
  "]": "close bracket",
  "^": "caret",
  _: "underscore",
  "`": "backtick",
  "{": "open brace",
  "|": "pipe",
  "}": "close brace",
  "~": "tilde",
};

export function speakChar(ch) {
  if (ch === undefined || ch === null) return "";
  if (NAMES[ch]) return NAMES[ch];
  if (/[A-Z]/.test(ch)) return `capital ${ch}`;
  return ch;
}

/** Spells a short run of text symbol-by-symbol for the live region. */
export function speakRun(text, limit = 24) {
  return [...text.slice(0, limit)].map(speakChar).join(" ");
}
