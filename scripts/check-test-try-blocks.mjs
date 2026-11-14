import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const CSHARP_TEST_ATTRIBUTE = /^\s*\[(?:Fact|Theory|SkippableFact)\b/;
const CSHARP_METHOD =
  /^(\s*)(?:(?:public|private|protected|internal|static|async|override|virtual|sealed|unsafe|extern)\s+)+[^=;(]*?\b(\w+)\s*(?:<[^>]*>)?\s*\(/;
const CSHARP_TRY = /^\s*try\b\s*(?:\{|$)/;
// A signature ends where its body opens, or with `;` when it has none.
const CSHARP_SIGNATURE_END = /[{;]\s*$/;

const PYTHON_FUNCTION = /^(\s*)(?:async\s+)?def\s+(\w+)\s*\(/;
// tests/sdks/python/pyproject.toml sets python_functions = ["Should_*"].
const PYTHON_TEST_NAME = /^Should_/;
const PYTHON_SIGNATURE_END = /:\s*(?:#.*)?$/;
const PYTHON_TRY = /^\s*try\s*:/;

function indentationOf(line) {
  return line.match(/^\s*/)[0].length;
}

/** Blanks a range of the masked text, keeping its line breaks. */
function blank(scan, from, to) {
  for (let index = from; index < Math.min(to, scan.masked.length); index++) {
    if (!LINE_BREAK.test(scan.masked[index])) scan.masked[index] = ' ';
  }
}

function charAt(scan) {
  return scan.text[scan.index];
}

/** Masks up to `closer` (or the end of the text), then moves past it. */
function skipComment(scan, closer, closerWidth) {
  const end = scan.text.indexOf(closer, scan.index + 2);
  const stop = end === -1 ? scan.text.length : end + closerWidth;
  blank(scan, scan.index, stop);
  scan.index = stop;
  return true;
}

/** Masks a literal's contents and moves past its closing delimiter. */
function skipLiteral(scan, end) {
  blank(scan, scan.index + 1, end);
  scan.previous = 'value';
  scan.index = end + 1;
  return true;
}

function quotedEnd(text, start, quote) {
  let end = start + 1;
  while (end < text.length && text[end] !== quote && text[end] !== '\n') {
    end += text[end] === '\\' ? 2 : 1;
  }
  return end;
}

function regexContinues(text, end, inClass) {
  return (
    end < text.length && text[end] !== '\n' && (inClass || text[end] !== '/')
  );
}

function regexEnd(text, start) {
  let inClass = false;
  let end = start + 1;
  while (regexContinues(text, end, inClass)) {
    inClass = CHARACTER_CLASS_STATE[text[end]] ?? inClass;
    end += text[end] === '\\' ? 2 : 1;
  }
  return end;
}

function closesTemplateExpression(scan) {
  return (
    charAt(scan) === '}' &&
    scan.stack.at(-1).depth === 0 &&
    scan.stack.length > 1
  );
}

const TEMPLATE_STEPS = [
  function templateEnd(scan) {
    if (charAt(scan) !== '`') return false;
    scan.stack.pop();
    scan.previous = 'value';
    scan.index++;
    return true;
  },
  function templateExpressionStart(scan) {
    if (!scan.text.startsWith('${', scan.index)) return false;
    scan.stack.push({ inTemplate: false, depth: 0 });
    scan.previous = '{';
    scan.index += 2;
    return true;
  },
  function templateText(scan) {
    const width = charAt(scan) === '\\' ? 2 : 1;
    blank(scan, scan.index, scan.index + width);
    scan.index += width;
    return true;
  },
];

const CODE_STEPS = [
  (scan) =>
    scan.text.startsWith('//', scan.index) && skipComment(scan, '\n', 0),
  (scan) =>
    scan.text.startsWith('/*', scan.index) && skipComment(scan, '*/', 2),
  (scan) =>
    QUOTE.test(charAt(scan)) &&
    skipLiteral(scan, quotedEnd(scan.text, scan.index, charAt(scan))),
  function templateStart(scan) {
    if (charAt(scan) !== '`') return false;
    scan.stack.push({ inTemplate: true });
    scan.index++;
    return true;
  },
  (scan) =>
    charAt(scan) === '/' &&
    REGEX_MAY_FOLLOW.test(scan.previous) &&
    skipLiteral(scan, regexEnd(scan.text, scan.index)),
  function templateExpressionEnd(scan) {
    if (!closesTemplateExpression(scan)) return false;
    scan.stack.pop();
    scan.previous = 'value';
    scan.index++;
    return true;
  },
  function brace(scan) {
    const change = BRACE_DEPTH_CHANGE[charAt(scan)];
    if (change === undefined) return false;
    scan.stack.at(-1).depth += change;
    scan.previous = charAt(scan);
    scan.index++;
    return true;
  },
  function identifier(scan) {
    WORD.lastIndex = scan.index;
    const word = WORD.exec(scan.text);
    if (!word) return false;
    // A property such as `stats.in` is a value, never a keyword.
    scan.previous = scan.previous === '.' ? 'value' : word[0];
    scan.index += word[0].length;
    return true;
  },
  function other(scan) {
    if (!/\s/.test(charAt(scan))) scan.previous = charAt(scan);
    scan.index++;
    return true;
  },
];

/**
 * Replaces the contents of strings, template literals, comments and regex
 * literals with spaces, keeping every offset and line break, so the code
 * that is left can be searched for calls and keywords.
 */
function maskNonCode(text) {
  const scan = {
    text,
    masked: text.split(''),
    index: 0,
    previous: '',
    stack: [{ inTemplate: false, depth: 0 }],
  };
  while (scan.index < text.length) {
    const steps = scan.stack.at(-1).inTemplate ? TEMPLATE_STEPS : CODE_STEPS;
    steps.find((step) => step(scan));
  }
  return scan.masked.join('');
}

const LINE_BREAK = /[\r\n]/;
const QUOTE = /['"]/;
const WORD = /[\w$]+/y;
const BRACE_DEPTH_CHANGE = { '{': 1, '}': -1 };
const CHARACTER_CLASS_STATE = { '[': true, ']': false };

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
  const token = /\s*(=>|\S)/y;
  token.lastIndex = from;
  let previous = ')';
  for (let match = token.exec(masked); match && match[1] !== ';'; ) {
    if (opensBody(match[1], previous)) return token.lastIndex - 1;
    token.lastIndex = indexAfterToken(masked, match[1], token.lastIndex);
    previous = match[1];
    match = token.exec(masked);
  }
  return undefined;
}

/** A `{` opens the body unless it follows `:` or `|`, where it is a type. */
function opensBody(token, previous) {
  return token === '{' && !TYPE_POSITION.test(previous);
}

/** Skips an object type such as `{ code: number }` as a single token. */
function indexAfterToken(masked, token, next) {
  return token === '{' ? closingBraceOf(masked, next - 1) + 1 : next;
}

/** Returns where an arrow function's expression body ends. */
function expressionEnd(masked, from) {
  let depth = 0;
  for (let index = from; index < masked.length; index++) {
    if (depth === 0 && EXPRESSION_END.test(masked[index])) return index;
    depth += NESTING_DEPTH_CHANGE[masked[index]] ?? 0;
  }
  return masked.length;
}

const TYPE_POSITION = /^[:|&<,(]$/;
const EXPRESSION_END = /^[)\]};\n]$/;
const NESTING_DEPTH_CHANGE = {
  '(': 1,
  '[': 1,
  '{': 1,
  ')': -1,
  ']': -1,
  '}': -1,
};

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
const ESCAPED_BRACE = /^(?:\{\{|\}\})$/;

/**
 * Keeps the code a string interpolates: the text inside `{...}`, nested
 * braces included. `{{` and `}}` are escapes only outside an interpolation.
 */
function interpolationsOf(literal) {
  const scan = { literal, code: '', depth: 0 };
  for (let index = 0; index < literal.length; ) {
    index += interpolate(scan, index);
  }
  return scan.code;
}

/** Copies the piece at `index` when it is code; returns how far it reaches. */
function interpolate(scan, index) {
  const pair = scan.literal.slice(index, index + 2);
  if (scan.depth === 0 && ESCAPED_BRACE.test(pair)) {
    scan.code += '  ';
    return 2;
  }
  scan.code += interpolatedChar(scan, scan.literal[index]);
  return 1;
}

function interpolatedChar(scan, char) {
  const inside = scan.depth > 0 || char === '{';
  scan.depth += BRACE_DEPTH_CHANGE[char] ?? 0;
  return inside ? char : ' ';
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

/** Returns the lines from `from` up to, not including, the first that ends. */
function linesUntil(lines, from, isEnd) {
  const end = lines.findIndex(
    ({ line }, index) => index >= from && isEnd(line),
  );
  return lines.slice(from, end === -1 ? lines.length : end);
}

/** Returns the index of the first line at or after `from` that matches. */
function firstLineMatching(lines, from, pattern) {
  return lines.findIndex(
    ({ line }, index) => index >= from && pattern.test(line),
  );
}

/** Collects a Python function body: the lines indented under its signature. */
function pythonBody(lines, start, indent) {
  const signatureEnd = firstLineMatching(lines, start, PYTHON_SIGNATURE_END);
  const from = signatureEnd === -1 ? lines.length : signatureEnd + 1;
  return linesUntil(lines, from, (line) => indentationOf(line) <= indent);
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
    const name = declaration[2];
    const body = pythonBody(lines, start, declaration[1].length);
    const block = lineBlock(name, body, PYTHON_TRY, PYTHON_COMMENTS);
    (PYTHON_TEST_NAME.test(name) ? tests : helpers).push(block);
  });
  return { tests, helpers };
}

/** Collects a C# method body: the lines between its braces. */
function cSharpBody(lines, start, indent) {
  const open = firstLineMatching(lines, start, CSHARP_SIGNATURE_END);
  if (open === -1 || lines[open].line.trimEnd().endsWith(';')) {
    return [];
  }
  return linesUntil(
    lines,
    open + 1,
    (line) => indentationOf(line) <= indent && line.trim().startsWith('}'),
  );
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
  for (const finding of tests.flatMap((test) => triesOf(test, helpersByName))) {
    if (!findings.has(finding.line)) findings.set(finding.line, finding);
  }
  return [...findings.values()].sort((a, b) => a.line - b.line);
}

/** Lists the tries a test runs: its own first, then its helpers' tries. */
function triesOf(test, helpersByName) {
  const own = test.tries.map((line) => ({ line, test: test.name }));
  const reached = reachedHelpers(test, helpersByName).flatMap((helper) =>
    helper.tries.map((line) => ({
      line,
      test: test.name,
      helper: helper.name,
    })),
  );
  return [...own, ...reached];
}

/** Walks the names a test references, through helpers, breadth first. */
function reachedHelpers(test, helpersByName) {
  const visited = new Set();
  const reached = [];
  const pending = [...test.refs];
  while (pending.length > 0) {
    const name = pending.shift();
    if (visited.has(name)) continue;
    visited.add(name);
    const found = helpersByName.get(name) ?? [];
    reached.push(...found);
    pending.push(...found.flatMap((helper) => [...helper.refs]));
  }
  return reached;
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
