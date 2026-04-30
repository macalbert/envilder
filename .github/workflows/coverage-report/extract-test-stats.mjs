/**
 * extract-test-stats.mjs
 *
 * Parses test runner stdout/stderr to extract test statistics.
 * Supports dotnet test, Jest/Vitest, and pytest output formats.
 *
 * Usage:
 *   node extract-test-stats.mjs <test-output.txt> <output.json> [runner]
 *
 * runner: dotnet | jest | vitest | pytest | auto (default: auto)
 *
 * Output (test-stats.json):
 *   { "total": 196, "passed": 196, "failed": 0, "skipped": 0, "duration": "1m 3s" }
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

if (!process.argv[2] || !process.argv[3]) {
  console.error(
    'Usage: node extract-test-stats.mjs <test-output.txt> <output.json> [runner]',
  );
  process.exit(1);
}

const inputFile = resolve(process.argv[2]);
const outputFile = resolve(process.argv[3]);
const runner = process.argv[4] ?? 'auto';

function stripAnsi(raw) {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ESC for ANSI stripping
  return raw.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

const text = stripAnsi(readFileSync(inputFile, 'utf8'));

function parseDotnet(text) {
  // Classic vstest format: "Failed: 0, Passed: 92, Skipped: 0, Total: 92, Duration: 3.2 s"
  const classic = text.match(
    /Failed:\s*(\d+),\s*Passed:\s*(\d+),\s*Skipped:\s*(\d+),\s*Total:\s*(\d+),\s*Duration:\s*(.+)/,
  );
  if (classic) {
    return {
      total: +classic[4],
      passed: +classic[2],
      failed: +classic[1],
      skipped: +classic[3],
      duration: normalizeDuration(classic[5].trim()),
    };
  }

  // .NET 9+ terminal logger: "total: 92, failed: 0, succeeded: 92, skipped: 0, duration: 4.7s"
  const terminal = text.match(
    /total:\s*(\d+),\s*failed:\s*(\d+),\s*succeeded:\s*(\d+),\s*skipped:\s*(\d+),\s*duration:\s*([\d.]+\s*[ms]*s)/i,
  );
  if (terminal) {
    return {
      total: +terminal[1],
      passed: +terminal[3],
      failed: +terminal[2],
      skipped: +terminal[4],
      duration: normalizeDuration(terminal[5].trim()),
    };
  }

  // Fallback: "Total tests: 92 Passed: 92 Failed: 0 Skipped: 0" + "Total time: 4.72 Seconds"
  const totalMatch = text.match(/Total\s+tests:\s*(\d+)/i);
  const passedMatch = text.match(/Passed:\s*(\d+)/i);
  const failedMatch = text.match(/Failed:\s*(\d+)/i);
  const skippedMatch = text.match(/Skipped:\s*(\d+)/i);
  const timeMatch = text.match(/Total\s+time:\s*([\d.]+)\s*Seconds/i);
  if (totalMatch && passedMatch) {
    return {
      total: +totalMatch[1],
      passed: +passedMatch[1],
      failed: +(failedMatch?.[1] ?? 0),
      skipped: +(skippedMatch?.[1] ?? 0),
      duration: timeMatch ? normalizeDuration(`${timeMatch[1]}s`) : null,
    };
  }

  return null;
}

function parseJest(text) {
  const lines = [...text.matchAll(/^Tests:\s+(.+)$/gm)];
  if (lines.length === 0) {
    return null;
  }

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const [, line] of lines) {
    total += +(line.match(/(\d+)\s+total/)?.[1] ?? 0);
    passed += +(line.match(/(\d+)\s+passed/)?.[1] ?? 0);
    failed += +(line.match(/(\d+)\s+failed/)?.[1] ?? 0);
    skipped += +(line.match(/(\d+)\s+(?:skipped|pending)/)?.[1] ?? 0);
  }

  const times = [...text.matchAll(/^Time:\s+([\d.]+)\s*s/gm)];
  let durationS = 0;
  for (const [, s] of times) {
    durationS += parseFloat(s);
  }

  return {
    total,
    passed,
    failed,
    skipped,
    duration:
      durationS > 0 ? normalizeDuration(`${durationS.toFixed(1)} s`) : null,
  };
}

function parseVitest(text) {
  const testsMatch = text.match(
    /Tests\s+(?:(\d+)\s+failed\s+\|?\s*)?(\d+)\s+passed(?:\s+\|?\s*(\d+)\s+skipped)?\s+\((\d+)\)/,
  );
  if (!testsMatch) {
    return null;
  }

  const total = +testsMatch[4];
  const passed = +testsMatch[2];
  const failed = +(testsMatch[1] ?? 0);
  const skipped = +(testsMatch[3] ?? 0);

  const durationMatch = text.match(
    /Duration\s+([\d.]+(?:m\s*)?[\d.]*s?)\s*(?:\(|$)/m,
  );
  let durationRaw = null;
  if (durationMatch) {
    durationRaw = durationMatch[1];
  } else {
    const altMatch = text.match(/Duration\s+([\d.]+)s/);
    if (altMatch) {
      durationRaw = `${altMatch[1]}s`;
    }
  }

  return {
    total,
    passed,
    failed,
    skipped,
    duration: durationRaw ? normalizeDuration(durationRaw) : null,
  };
}

function parsePytest(text) {
  const match = text.match(/=+\s+([\d\w\s,]+)\s+in\s+([\d.]+)s?\s*=+/);
  if (!match) {
    return null;
  }

  const summary = match[1];
  const passed = +(summary.match(/(\d+)\s+passed/)?.[1] ?? 0);
  const failed = +(summary.match(/(\d+)\s+failed/)?.[1] ?? 0);
  const skipped = +(summary.match(/(\d+)\s+skipped/)?.[1] ?? 0);

  return {
    total: passed + failed + skipped,
    passed,
    failed,
    skipped,
    duration: normalizeDuration(`${match[2]}s`),
  };
}

function normalizeDuration(raw) {
  if (!raw) {
    return null;
  }

  let seconds = 0;
  const msMatch = raw.match(/([\d.]+)\s*ms/);
  const minMatch = raw.match(/(\d+)\s*m(?!s)/);
  const secMatch = raw.match(/([\d.]+)\s*s(?!.*ms)/);

  if (msMatch) {
    seconds += parseFloat(msMatch[1]) / 1000;
  }
  if (minMatch) {
    seconds += parseInt(minMatch[1], 10) * 60;
  }
  if (secMatch) {
    seconds += parseFloat(secMatch[1]);
  }

  if (seconds <= 0) {
    return raw;
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function autoDetect(text) {
  if (
    /Failed:\s*\d+,\s*Passed:/.test(text) ||
    /total:\s*\d+,\s*failed:\s*\d+,\s*succeeded:/i.test(text) ||
    /Total\s+tests:\s*\d+/i.test(text)
  ) {
    return parseDotnet(text);
  }
  if (/Test Files\s+/.test(text) && /Duration\s+/.test(text)) {
    return parseVitest(text);
  }
  if (/^Tests:\s+/m.test(text)) {
    return parseJest(text);
  }
  if (/=+\s+\d+\s+passed/.test(text)) {
    return parsePytest(text);
  }
  return null;
}

const parsers = {
  dotnet: parseDotnet,
  jest: parseJest,
  vitest: parseVitest,
  pytest: parsePytest,
  auto: autoDetect,
};
const stats = (parsers[runner] ?? autoDetect)(text);

if (stats) {
  writeFileSync(outputFile, JSON.stringify(stats, null, 2), 'utf8');
  console.log(`📊 Test stats extracted: ${JSON.stringify(stats)}`);
} else {
  console.warn('⚠️  Could not extract test stats from output');
}
