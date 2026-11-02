import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createFenceTracker } from './release-notes.mjs';

const CHANGELOGS = [
  { file: 'docs/changelogs/cli.md', tagPrefix: 'v' },
  { file: 'docs/changelogs/gha.md', tagPrefix: 'v' },
  { file: 'docs/changelogs/sdk-nodejs.md', tagPrefix: 'sdk-nodejs/v' },
  { file: 'docs/changelogs/sdk-dotnet.md', tagPrefix: 'sdk-dotnet/v' },
  { file: 'docs/changelogs/sdk-python.md', tagPrefix: 'sdk-python/v' },
];

function splitSections(changelog) {
  const sections = new Map();
  let lines;
  const isFenced = createFenceTracker();
  for (const line of changelog.replace(/\r\n/g, '\n').split('\n')) {
    const fenced = isFenced(line);
    const heading = !fenced && line.match(/^## \[([^\]]+)\]/);
    if (heading) {
      lines = [];
      sections.set(heading[1], lines);
    } else if (!fenced && /^## /.test(line)) {
      lines = undefined;
    } else if (lines && line.trim() !== '' && line.trim() !== '---') {
      lines.push(line.trim());
    }
  }
  return sections;
}

/**
 * Lists the lines a change adds to changelog sections whose version is
 * already tagged. Those entries describe code the tagged release did not
 * ship, so they belong in a new version section.
 */
export function findAdditionsToReleasedSections({
  base,
  head,
  tags,
  tagPrefix,
}) {
  const released = new Set(tags);
  const baseSections = splitSections(base);
  const findings = [];
  for (const [version, lines] of splitSections(head)) {
    if (!released.has(`${tagPrefix}${version}`)) {
      continue;
    }
    const remaining = new Map();
    for (const line of baseSections.get(version) ?? []) {
      remaining.set(line, (remaining.get(line) ?? 0) + 1);
    }
    const added = lines.filter((line) => {
      const count = remaining.get(line) ?? 0;
      remaining.set(line, count - 1);
      return count <= 0;
    });
    if (added.length > 0) {
      findings.push({ version, lines: added });
    }
  }
  return findings;
}

function readAtRef(ref, file) {
  try {
    return execFileSync('git', ['show', `${ref}:${file}`], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function main() {
  const base = process.argv
    .slice(2)
    .find((arg) => arg.startsWith('--base='))
    ?.slice('--base='.length);
  if (!base) {
    throw new Error(
      'Usage: node scripts/check-released-changelogs.mjs --base=<git ref>',
    );
  }
  const tags = execFileSync('git', ['tag', '--list'], { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);

  let failed = false;
  for (const { file, tagPrefix } of CHANGELOGS) {
    const findings = findAdditionsToReleasedSections({
      base: readAtRef(base, file),
      head: readFileSync(new URL(`../${file}`, import.meta.url), 'utf-8'),
      tags,
      tagPrefix,
    });
    for (const { version, lines } of findings) {
      failed = true;
      console.log(
        `::error file=${file}::Version ${version} is already tagged (${tagPrefix}${version}), but this change adds to its section. Move the entry to a new version section.`,
      );
      for (const line of lines) {
        console.log(`  + ${line}`);
      }
    }
  }
  if (failed) {
    process.exitCode = 1;
  } else {
    console.log('No changelog entries added to already tagged versions.');
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
