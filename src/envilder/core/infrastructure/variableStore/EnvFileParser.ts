/**
 * dotenv's `LINE` grammar and `parse`, copied from dotenv 17 with two changes.
 * The key class also admits `/`, the hierarchy separator map files use
 * (`Database/Password`). dotenv skips such a line, so reading the files we
 * write through it would lose those keys, both when merging into an existing
 * file and when checking the result before it reaches disk.
 *
 * And the blanks before a key stop at a line break. dotenv's `\s*` there lets
 * every blank line start an attempt that scans the whole run after it, so a
 * file of blank lines takes quadratic time: about 100 s for 200 KB. The match
 * that begins on the key's own line captures the same key and value, so the
 * result does not change. dotenv 18 keeps the same grammar.
 *
 * Everything else is dotenv's, value rules included, so a file without `/` in
 * its keys parses exactly as dotenv parses it. The conformance tests pin that.
 */
const LINE =
  /(?:^|^)[^\S\n\r\u2028\u2029]*(?:export\s+)?([\w./-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

export function parseEnvFile(src: string): Record<string, string> {
  // A plain object on purpose, as in dotenv: `__proto__` must vanish here too,
  // which is why the name rule rejects it.
  const obj: Record<string, string> = {};
  const lines = src.replace(/\r\n?/gm, '\n');

  for (const match of lines.matchAll(LINE)) {
    const key = match[1];
    let value = (match[2] || '').trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }
    obj[key] = value;
  }

  return obj;
}
