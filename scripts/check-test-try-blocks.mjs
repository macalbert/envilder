import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const CSHARP_TEST_ATTRIBUTE = /^\s*\[(?:Fact|Theory|SkippableFact)\b/;
const CSHARP_METHOD_NAME = /\b(\w+)\s*(?:<[^>]*>)?\s*\(/;
const CSHARP_TRY = /^\s*try\b\s*(?:\{|$)/;

// tests/sdks/python/pyproject.toml sets python_functions = ["Should_*"].
const PYTHON_TEST_FUNCTION = /^(\s*)(?:async\s+)?def\s+(Should_\w*)\s*\(/;
const PYTHON_SIGNATURE_END = /:\s*(?:#.*)?$/;
const PYTHON_TRY = /^\s*try\s*:/;

function indentationOf(line) {
  return line.match(/^\s*/)[0].length;
}

/**
 * Replaces the contents of strings, template literals, comments and regex
 * literals with spaces, keeping every offset and line break, so the code
 * that is left can be searched for calls and keywords.
 */
function maskNonCode(text) {
  const masked = text.split('');
  const blank = (from, to) => {
    for (let index = from; index < to && index < masked.length; index++) {
      if (masked[index] !== '\n' && masked[index] !== '\r') {
        masked[index] = ' ';
      }
    }
  };
  const word = /[\w$]+/y;
  const stack = [{ inTemplate: false, depth: 0 }];
  let previous = '';
  let index = 0;
  while (index < text.length) {
    const top = stack.at(-1);
    const char = text[index];
    const next = text[index + 1];
    if (top.inTemplate) {
      if (char === '`') {
        stack.pop();
        previous = 'value';
        index++;
      } else if (char === '$' && next === '{') {
        stack.push({ inTemplate: false, depth: 0 });
        previous = '{';
        index += 2;
      } else {
        const width = char === '\\' ? 2 : 1;
        blank(index, index + width);
        index += width;
      }
      continue;
    }
    if (char === '/' && next === '/') {
      const end = text.indexOf('\n', index);
      const stop = end === -1 ? text.length : end;
      blank(index, stop);
      index = stop;
      continue;
    }
    if (char === '/' && next === '*') {
      const end = text.indexOf('*/', index + 2);
      const stop = end === -1 ? text.length : end + 2;
      blank(index, stop);
      index = stop;
      continue;
    }
    if (char === "'" || char === '"') {
      let end = index + 1;
      while (end < text.length && text[end] !== char && text[end] !== '\n') {
        end += text[end] === '\\' ? 2 : 1;
      }
      blank(index + 1, end);
      previous = 'value';
      index = end + 1;
      continue;
    }
    if (char === '`') {
      stack.push({ inTemplate: true });
      index++;
      continue;
    }
    if (char === '/' && REGEX_MAY_FOLLOW.test(previous)) {
      let end = index + 1;
      let inClass = false;
      while (end < text.length && text[end] !== '\n') {
        if (text[end] === '\\') {
          end += 2;
          continue;
        }
        if (text[end] === '[') inClass = true;
        else if (text[end] === ']') inClass = false;
        else if (text[end] === '/' && !inClass) break;
        end++;
      }
      blank(index + 1, end);
      previous = 'value';
      index = end + 1;
      continue;
    }
    if (char === '{') {
      top.depth++;
    } else if (char === '}') {
      if (top.depth === 0 && stack.length > 1) {
        stack.pop();
        previous = 'value';
        index++;
        continue;
      }
      top.depth--;
    }
    word.lastIndex = index;
    const identifier = word.exec(text);
    if (identifier) {
      // A property such as `stats.in` is a value, never a keyword.
      previous = previous === '.' ? 'value' : identifier[0];
      index += identifier[0].length;
      continue;
    }
    if (!/\s/.test(char)) {
      previous = char;
    }
    index++;
  }
  return masked.join('');
}

const REGEX_MAY_FOLLOW =
  /^(?:|[(,=:[!&|?{};+\-*%<>~^]|return|typeof|case|do|else|in|of|void|yield|await)$/;

const TEST_CALL = /(?<![\w$.]\s*)\b(?:it|test)(?![\w$])/g;
const TRY_BLOCK = /\btry\s*\{/g;

function closingOf(masked, start) {
  let depth = 0;
  for (let index = start; index < masked.length; index++) {
    if (masked[index] === '(') depth++;
    else if (masked[index] === ')' && --depth === 0) return index;
  }
  return masked.length;
}

/** Returns the argument list of the call that runs the test body. */
function testArguments(masked, from) {
  const chainPart = /\s*(?:\.\s*[\w$]+|`[^`]*`|\()/y;
  let args;
  let index = from;
  for (;;) {
    chainPart.lastIndex = index;
    const part = chainPart.exec(masked);
    if (!part) return args;
    if (part[0].endsWith('(')) {
      const open = index + part[0].length - 1;
      const close = closingOf(masked, open);
      args = { open, close };
      index = close + 1;
    } else {
      index += part[0].length;
    }
  }
}

function testName(text, open) {
  const name = text.slice(open + 1).match(/^\s*(['"`])((?:\\.|(?!\1).)*)\1/);
  return name ? name[2] : '<dynamic name>';
}

function lineAt(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

function findInTypeScript(text) {
  const masked = maskNonCode(text);
  const findings = [];
  for (const call of masked.matchAll(TEST_CALL)) {
    const args = testArguments(masked, call.index + call[0].length);
    if (!args) {
      continue;
    }
    const test = testName(text, args.open);
    const body = masked.slice(args.open, args.close);
    for (const statement of body.matchAll(TRY_BLOCK)) {
      findings.push({ line: lineAt(text, args.open + statement.index), test });
    }
  }
  return findings;
}

function codeLines(text) {
  let insideTripleQuotes = false;
  return text.split(/\r?\n/).flatMap((line, index) => {
    const wasInside = insideTripleQuotes;
    const quotes = (line.match(/"""|'''/g) ?? []).length;
    insideTripleQuotes = insideTripleQuotes !== (quotes % 2 === 1);
    if (wasInside || quotes > 0 || line.trim() === '') {
      return [];
    }
    return [{ line, number: index + 1 }];
  });
}

function findInPython(text) {
  const findings = [];
  let current;
  for (const { line, number } of codeLines(text)) {
    if (current?.inSignature) {
      current.inSignature = !PYTHON_SIGNATURE_END.test(line);
      continue;
    }
    if (current && indentationOf(line) <= current.indent) {
      current = undefined;
    }
    const declaration = line.match(PYTHON_TEST_FUNCTION);
    if (declaration && !current) {
      current = {
        indent: declaration[1].length,
        test: declaration[2],
        inSignature: !PYTHON_SIGNATURE_END.test(line),
      };
      continue;
    }
    if (current && PYTHON_TRY.test(line)) {
      findings.push({ line: number, test: current.test });
    }
  }
  return findings;
}

function findInCSharp(text) {
  const findings = [];
  let pending;
  let current;
  for (const { line, number } of codeLines(text)) {
    if (current) {
      if (indentationOf(line) === current.indent && line.trim() === '}') {
        current = undefined;
      } else if (CSHARP_TRY.test(line)) {
        findings.push({ line: number, test: current.test });
      }
      continue;
    }
    if (CSHARP_TEST_ATTRIBUTE.test(line)) {
      pending ??= { indent: indentationOf(line) };
      continue;
    }
    if (pending && !line.trim().startsWith('[')) {
      const test = line.match(CSHARP_METHOD_NAME)?.[1] ?? '<unknown>';
      current = { indent: pending.indent, test };
      pending = undefined;
    }
  }
  return findings;
}

/**
 * Lists the `try` statements written inside a test body. Tests clean up with
 * framework teardown and check errors with the framework's throw assertions,
 * so a `try` there hides a failure or skips an assertion.
 */
export function findTryBlocksInTests(path, text) {
  switch (extname(path)) {
    case '.ts':
    case '.tsx':
    case '.mts':
    case '.cts':
    case '.js':
    case '.mjs':
      return findInTypeScript(text);
    case '.py':
      return findInPython(text);
    case '.cs':
      return findInCSharp(text);
    default:
      return [];
  }
}

function isTestFile(path) {
  return (
    /\.(?:test|spec)\.(?:ts|tsx|mts|cts|js|mjs)$/.test(path) ||
    /(?:^|\/)test_[^/]*\.py$/.test(path) ||
    /(?:^|\/)tests?\/.*\.cs$/.test(path)
  );
}

function main() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf-8' })
    .split('\0')
    .filter((path) => isTestFile(path) && existsSync(path));
  const findings = files.flatMap((path) =>
    findTryBlocksInTests(path, readFileSync(path, 'utf-8')).map(
      ({ line, test }) =>
        `::error file=${path},line=${line}::try block inside test "${test}". Use framework teardown (afterEach, onTestFinished, IAsyncLifetime, pytest yield fixtures) for cleanup and the framework's throw assertions for errors.`,
    ),
  );
  if (findings.length > 0) {
    console.log(findings.join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log(`No try blocks inside tests in ${files.length} test files.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
