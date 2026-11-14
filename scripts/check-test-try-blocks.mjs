import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const CSHARP_TEST_ATTRIBUTE = /^\s*\[(?:Fact|Theory|SkippableFact)\b/;
const CSHARP_METHOD =
  /^(\s*)(?:(?:public|private|protected|internal|static|async|override|virtual|sealed|unsafe|extern)\s+)+[^=;(]*?\b(\w+)\s*(?:<[^>]*>)?\s*\(/;
const CSHARP_TRY = /^\s*try\b\s*(?:\{|$)/;

const PYTHON_FUNCTION = /^(\s*)(?:async\s+)?def\s+(\w+)\s*\(/;
// tests/sdks/python/pyproject.toml sets python_functions = ["Should_*"].
const PYTHON_TEST_NAME = /^Should_/;
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

const TS_IDENTIFIER = /(?<![\w$])(?<!\.\s*)[A-Za-z_$][\w$]*/g;
const TS_FUNCTION =
  /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^>(]*>)?\s*\(/g;
const TS_INITIALIZER =
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]*)?=\s*(?:async\s+)?(?=\(|function\b|[A-Za-z_$][\w$]*\s*=>)/g;
// The arrow must follow the parameters, after an optional return type.
const ARROW_AFTER_PARAMETERS = /\s*(?::[^;=]*?)?=>/y;
const ARROW_AFTER_PARAMETER = /[A-Za-z_$][\w$]*\s*=>/y;

function closingBraceOf(masked, start) {
  let depth = 0;
  for (let index = start; index < masked.length; index++) {
    if (masked[index] === '{') depth++;
    else if (masked[index] === '}' && --depth === 0) return index;
  }
  return masked.length;
}

/**
 * Finds the `{` that opens a function body after its parameter list,
 * skipping a return type annotation such as `: { code: number }`.
 */
function bodyOpenAfter(masked, from) {
  let previous = ')';
  for (let index = from; index < masked.length; index++) {
    const char = masked[index];
    if (/\s/.test(char)) continue;
    if (char === '{') {
      if (!/^[:|&<,(]$/.test(previous)) return index;
      index = closingBraceOf(masked, index);
      previous = '}';
      continue;
    }
    if (char === '=' && masked[index + 1] === '>') {
      previous = '=>';
      index++;
      continue;
    }
    if (char === ';') return undefined;
    previous = char;
  }
  return undefined;
}

/** Returns where an arrow function's expression body ends. */
function expressionEnd(masked, from) {
  let depth = 0;
  for (let index = from; index < masked.length; index++) {
    const char = masked[index];
    if ('([{'.includes(char)) depth++;
    else if (')]}'.includes(char)) {
      if (depth === 0) return index;
      depth--;
    } else if ((char === ';' || char === '\n') && depth === 0) return index;
  }
  return masked.length;
}

function typeScriptBlock(text, masked, name, start, end) {
  const range = masked.slice(start, end);
  return {
    name,
    tries: [...range.matchAll(TRY_BLOCK)].map((match) =>
      lineAt(text, start + match.index),
    ),
    refs: new Set(range.match(TS_IDENTIFIER)),
  };
}

/** Returns the braced body of a function whose parameters open here. */
function functionBody(masked, parametersOpen) {
  const open = bodyOpenAfter(masked, closingOf(masked, parametersOpen) + 1);
  return open === undefined
    ? undefined
    : { start: open, end: closingBraceOf(masked, open) };
}

/** Returns where the `=>` of an arrow whose parameters start here ends. */
function arrowEndAt(masked, from) {
  const arrow =
    masked[from] === '(' ? ARROW_AFTER_PARAMETERS : ARROW_AFTER_PARAMETER;
  arrow.lastIndex = masked[from] === '(' ? closingOf(masked, from) + 1 : from;
  return arrow.exec(masked) ? arrow.lastIndex : undefined;
}

function arrowBody(masked, arrowEnd) {
  const start = arrowEnd + masked.slice(arrowEnd).search(/\S/);
  const end =
    masked[start] === '{'
      ? closingBraceOf(masked, start)
      : expressionEnd(masked, start);
  return { start, end };
}

/** Returns the body of a function assigned to a variable, if it is one. */
function initializerBody(masked, from) {
  if (masked.startsWith('function', from)) {
    return functionBody(masked, masked.indexOf('(', from));
  }
  const arrowEnd = arrowEndAt(masked, from);
  return arrowEnd === undefined ? undefined : arrowBody(masked, arrowEnd);
}

function typeScriptHelpers(text, masked) {
  const declared = [...masked.matchAll(TS_FUNCTION)].map((match) => ({
    name: match[1],
    body: functionBody(masked, match.index + match[0].length - 1),
  }));
  const assigned = [...masked.matchAll(TS_INITIALIZER)].map((match) => ({
    name: match[1],
    body: initializerBody(masked, match.index + match[0].length),
  }));
  return [...declared, ...assigned]
    .filter(({ body }) => body !== undefined)
    .map(({ name, body }) =>
      typeScriptBlock(text, masked, name, body.start, body.end),
    );
}

function parseTypeScript(text) {
  const masked = maskNonCode(text);
  const tests = [];
  for (const call of masked.matchAll(TEST_CALL)) {
    const args = testArguments(masked, call.index + call[0].length);
    if (args) {
      const name = testName(text, args.open);
      tests.push(typeScriptBlock(text, masked, name, args.open, args.close));
    }
  }
  return { tests, helpers: typeScriptHelpers(text, masked) };
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

const IDENTIFIER = /[A-Za-z_]\w*/g;
// An optional prefix (f"", $"", $@"") marks a string that interpolates code.
const STRING_LITERAL =
  /(?<![\w$@])([A-Za-z$@]{0,3})("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g;
const INTERPOLATING_PREFIX = /[fF$]/;
const ESCAPED_BRACES = /\{\{|\}\}/g;

/**
 * Keeps the code a string interpolates: the text inside `{...}`, nested
 * braces included, after dropping the `{{` and `}}` escapes.
 */
function interpolationsOf(literal) {
  let depth = 0;
  return [...literal.replace(ESCAPED_BRACES, '  ')]
    .map((char) => {
      const inside = depth > 0 || char === '{';
      depth += char === '{' ? 1 : char === '}' ? -1 : 0;
      return inside ? char : ' ';
    })
    .join('');
}
const PYTHON_COMMENTS = [/#.*/g];
const CSHARP_COMMENTS = [/\/\*[\s\S]*?\*\//g, /\/\/.*/g];

/**
 * Keeps the code of a body: each string literal becomes the expressions it
 * interpolates, then comments are dropped.
 */
function codeOf(body, comments) {
  const withoutStrings = body.replace(STRING_LITERAL, (_, prefix, literal) =>
    INTERPOLATING_PREFIX.test(prefix) ? ` ${interpolationsOf(literal)} ` : ' ',
  );
  return comments.reduce(
    (code, comment) => code.replace(comment, ' '),
    withoutStrings,
  );
}

function lineBlock(name, lines, tryPattern, comments) {
  const body = lines.map(({ line }) => line).join('\n');
  return {
    name,
    tries: lines
      .filter(({ line }) => tryPattern.test(line))
      .map(({ number }) => number),
    refs: new Set(codeOf(body, comments).match(IDENTIFIER)),
  };
}

function parsePython(text) {
  const lines = codeLines(text);
  const tests = [];
  const helpers = [];
  lines.forEach(({ line }, start) => {
    const declaration = line.match(PYTHON_FUNCTION);
    if (!declaration) {
      return;
    }
    const indent = declaration[1].length;
    let index = start;
    while (
      index < lines.length &&
      !PYTHON_SIGNATURE_END.test(lines[index].line)
    ) {
      index++;
    }
    const body = [];
    for (index++; index < lines.length; index++) {
      if (indentationOf(lines[index].line) <= indent) break;
      body.push(lines[index]);
    }
    const name = declaration[2];
    const block = lineBlock(name, body, PYTHON_TRY, PYTHON_COMMENTS);
    (PYTHON_TEST_NAME.test(name) ? tests : helpers).push(block);
  });
  return { tests, helpers };
}

/** Collects a C# method body: the lines between its braces. */
function cSharpBody(lines, start, indent) {
  let index = start;
  while (index < lines.length) {
    const trimmed = lines[index].line.trimEnd();
    if (trimmed.endsWith('{')) break;
    if (trimmed.endsWith(';')) return [];
    index++;
  }
  const body = [];
  for (index++; index < lines.length; index++) {
    const { line } = lines[index];
    if (indentationOf(line) <= indent && line.trim().startsWith('}')) break;
    body.push(lines[index]);
  }
  return body;
}

function parseCSharp(text) {
  const lines = codeLines(text);
  const tests = [];
  const helpers = [];
  let isTest = false;
  lines.forEach(({ line }, start) => {
    if (CSHARP_TEST_ATTRIBUTE.test(line)) {
      isTest = true;
      return;
    }
    if (line.trim().startsWith('[')) {
      return;
    }
    const declaration = line.match(CSHARP_METHOD);
    if (declaration) {
      const body = cSharpBody(lines, start, declaration[1].length);
      const block = lineBlock(
        declaration[2],
        body,
        CSHARP_TRY,
        CSHARP_COMMENTS,
      );
      (isTest ? tests : helpers).push(block);
    }
    isTest = false;
  });
  return { tests, helpers };
}

/**
 * Follows every helper a test references, directly or through other
 * helpers of the same file, and reports each `try` reached on the way.
 * Helpers that only hooks reference are never reached.
 */
function triesReachedFromTests({ tests, helpers }) {
  const helpersByName = Map.groupBy(helpers, (helper) => helper.name);
  const findings = new Map();
  const report = (line, finding) => {
    if (!findings.has(line)) findings.set(line, { line, ...finding });
  };
  for (const test of tests) {
    for (const line of test.tries) {
      report(line, { test: test.name });
    }
    const visited = new Set();
    const pending = [...test.refs];
    while (pending.length > 0) {
      const name = pending.shift();
      if (visited.has(name)) continue;
      visited.add(name);
      for (const helper of helpersByName.get(name) ?? []) {
        for (const line of helper.tries) {
          report(line, { test: test.name, helper: helper.name });
        }
        pending.push(...helper.refs);
      }
    }
  }
  return [...findings.values()].sort((a, b) => a.line - b.line);
}

const PARSERS = new Map([
  ['.ts', parseTypeScript],
  ['.tsx', parseTypeScript],
  ['.mts', parseTypeScript],
  ['.cts', parseTypeScript],
  ['.js', parseTypeScript],
  ['.mjs', parseTypeScript],
  ['.py', parsePython],
  ['.cs', parseCSharp],
]);

/**
 * Lists the `try` statements a test runs: in its body or in a helper of the
 * same file it calls, directly or through other helpers. Tests clean up with
 * framework teardown and check errors with the framework's throw assertions,
 * so a `try` there hides a failure or skips an assertion. Hooks, and helpers
 * only hooks call, are not checked.
 */
export function findTryBlocksInTests(path, text) {
  const parse = PARSERS.get(extname(path));
  return parse ? triesReachedFromTests(parse(text)) : [];
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
      ({ line, test, helper }) =>
        `::error file=${path},line=${line}::try block ${helper ? `in helper "${helper}", called from test "${test}"` : `inside test "${test}"`}. Use framework teardown (afterEach, onTestFinished, IAsyncLifetime, pytest yield fixtures) for cleanup and the framework's throw assertions for errors.`,
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
