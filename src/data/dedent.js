/**
 * Strips the common leading indentation from a template literal so snippet
 * source can be written naturally indented inside the data files while the
 * text the user actually types starts flush left.
 *
 * Blank lines are ignored when computing the common indent, and leading /
 * trailing blank lines are trimmed.
 */
export function dedent(strings, ...values) {
  // String.raw so that escape sequences inside snippet source (cout << "\n")
  // survive as the literal two characters the user has to type, rather than
  // being interpreted by JavaScript.
  const raw = typeof strings === "string" ? strings : String.raw(strings, ...values);

  const lines = raw.split("\n");

  // drop leading and trailing blank lines
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  let indent = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const match = line.match(/^[ \t]*/);
    indent = Math.min(indent, match[0].length);
  }
  if (!Number.isFinite(indent)) indent = 0;

  return lines.map((line) => line.slice(indent)).join("\n");
}
