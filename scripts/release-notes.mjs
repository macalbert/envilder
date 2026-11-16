import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const REPOSITORY_URL = 'https://github.com/macalbert/envilder';

const COMPONENTS = {
  cli: {
    tagPrefix: 'v',
    changelog: 'cli.md',
    title: '🍄 Envilder level up',
    upgrade: (version) => [
      '```yaml',
      `- uses: macalbert/envilder@v${version}`,
      '  with:',
      '    map-file: envilder.json',
      '    env-file: .env',
      '```',
      '',
      '```bash',
      `npm install -g envilder@${version}`,
      '```',
    ],
    docs: { label: 'Getting started', path: 'getting-started' },
  },
  'sdk-nodejs': {
    tagPrefix: 'sdk-nodejs/v',
    changelog: 'sdk-nodejs.md',
    title: '🟢 Envilder Node.js SDK',
    upgrade: (version) => [
      '```bash',
      `npm install @envilder/sdk@${version}`,
      '```',
    ],
    docs: { label: 'Node.js SDK guide', path: 'sdks/nodejs' },
  },
  'sdk-dotnet': {
    tagPrefix: 'sdk-dotnet/v',
    changelog: 'sdk-dotnet.md',
    title: '📦 Envilder .NET SDK',
    upgrade: (version) => [
      '```bash',
      `dotnet add package Envilder --version ${version}`,
      '```',
    ],
    docs: { label: '.NET SDK guide', path: 'sdks/dotnet' },
  },
  'sdk-python': {
    tagPrefix: 'sdk-python/v',
    changelog: 'sdk-python.md',
    title: '🐍 Envilder Python SDK',
    upgrade: (version) => [
      '```bash',
      `pip install envilder==${version}`,
      '# or',
      `uv add envilder==${version}`,
      '```',
    ],
    docs: { label: 'Python SDK guide', path: 'sdks/python' },
  },
};

const SECTION_EMOJI = {
  added: '✨',
  changed: '🔄',
  fixed: '🛡️',
  security: '🔒',
  documentation: '📝',
  dependencies: '🔧',
  migration: '🧭',
  removed: '🗑️',
  deprecated: '⚠️',
  breaking: '⚠️',
  'breaking changes': '⚠️',
  testing: '🧪',
  tests: '🧪',
};

const BLOCK_START = /^\s*(?:[*-] |\d+\. |#{1,6} |```|~~~|---|\||>)/;
const FENCE_OPEN = /^([ \t]*)(`{3,}|~{3,})/;
const FENCE_CLOSE = /^([ \t]*)(`{3,}|~{3,})\s*$/;

/** Width of leading whitespace, with tabs advancing to the next multiple of 4. */
function indentWidth(whitespace) {
  let width = 0;
  for (const char of whitespace) {
    width += char === '\t' ? 4 - (width % 4) : 1;
  }
  return width;
}

/**
 * Tracks fenced code blocks as CommonMark does: a fence closes only with the
 * opener's character, repeated at least as many times, nothing after it, and
 * at most three spaces more indented than the opener. The opener itself may
 * be indented, since changelog fences sit inside list items.
 */
export function createFenceTracker() {
  let opener;
  return (line) => {
    if (!opener) {
      const open = line.match(FENCE_OPEN);
      if (open) {
        opener = { indent: indentWidth(open[1]), marker: open[2] };
        return true;
      }
      return false;
    }
    const close = line.match(FENCE_CLOSE);
    if (
      close &&
      close[2][0] === opener.marker[0] &&
      close[2].length >= opener.marker.length &&
      indentWidth(close[1]) < opener.indent + 4
    ) {
      opener = undefined;
    }
    return true;
  };
}

function getComponent(name) {
  const component = COMPONENTS[name];
  if (!component) {
    throw new Error(
      `Unknown component "${name}". Expected one of: ${Object.keys(COMPONENTS).join(', ')}`,
    );
  }
  return component;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSection(changelog, version) {
  const lines = changelog.replace(/\r\n/g, '\n').split('\n');
  const heading = new RegExp(`^## \\[${escapeRegExp(version)}\\]`);
  const start = lines.findIndex((line) => heading.test(line));
  if (start === -1) {
    throw new Error(`No "## [${version}]" section in the changelog`);
  }
  const rest = lines.slice(start + 1);
  const isCode = createFenceTracker();
  const end = rest.findIndex((line) => !isCode(line) && /^## /.test(line));
  const section = end === -1 ? rest : rest.slice(0, end);
  return section
    .join('\n')
    .replace(/\n---\s*$/, '')
    .trim();
}

function parseReleaseComment(section) {
  const match = section.match(/<!--\s*release\s*\n([\s\S]*?)-->/);
  if (!match) {
    return { title: undefined, summary: undefined, rest: section };
  }
  const fields = {};
  let current;
  for (const line of match[1].split('\n')) {
    const field = line.match(/^\s*(title|summary):\s*(.*)$/);
    if (field) {
      current = field[1];
      fields[current] = field[2].trim();
    } else if (current && line.trim() !== '') {
      fields[current] = `${fields[current]} ${line.trim()}`;
    }
  }
  return {
    title: fields.title || undefined,
    summary: fields.summary || undefined,
    rest: section.replace(match[0], '').trim(),
  };
}

function unwrapLines(markdown) {
  const out = [];
  const isCode = createFenceTracker();
  let previousJoinable = false;
  for (const line of markdown.split('\n')) {
    if (isCode(line)) {
      out.push(line);
      previousJoinable = false;
      continue;
    }
    if (line.trim() === '') {
      out.push(line);
      previousJoinable = false;
      continue;
    }
    if (previousJoinable && !BLOCK_START.test(line)) {
      out[out.length - 1] = `${out.at(-1)} ${line.trim()}`;
      continue;
    }
    out.push(line);
    previousJoinable = !/^\s*(?:#{1,6} |---|\|)/.test(line);
  }
  return out.join('\n');
}

function formatSections(markdown, tag) {
  const linkBase = `${REPOSITORY_URL}/blob/${tag}/docs/changelogs/`;
  const isCode = createFenceTracker();
  return markdown
    .split('\n')
    .map((line) => {
      if (isCode(line)) {
        return line;
      }
      const subheading = line.match(/^### (.+)$/);
      if (subheading) {
        const emoji = SECTION_EMOJI[subheading[1].trim().toLowerCase()];
        return emoji ? `## ${emoji} ${subheading[1]}` : `## ${subheading[1]}`;
      }
      return line
        .replace(/^#### /, '### ')
        .replace(/^(\s*)\* /, '$1- ')
        .replace(/\]\(([^)]+)\)/g, (_match, href) =>
          /^(?:[a-z]+:|#)/i.test(href)
            ? `](${href})`
            : `](${new URL(href, linkBase).href})`,
        );
    })
    .join('\n');
}

/**
 * Builds the GitHub release title and body for a component version from its
 * changelog section, so the published release always matches the changelog
 * at the released commit.
 */
export function renderReleaseNotes({
  component: componentName,
  version,
  changelog,
  previousTag,
  pullRequests,
}) {
  const component = getComponent(componentName);
  const tag = `${component.tagPrefix}${version}`;
  const { title, summary, rest } = parseReleaseComment(
    extractSection(changelog, version),
  );
  const campaign = tag.replace('/', '-');
  const docsUrl = `https://envilder.com/docs/${component.docs.path}/?utm_source=github&utm_medium=release&utm_campaign=${campaign}`;

  const body = [
    ...(summary ? [summary, ''] : []),
    formatSections(unwrapLines(rest), tag),
    '',
    '## 📦 Upgrade',
    '',
    ...component.upgrade(version),
    '',
    `📖 **${component.docs.label}:** [envilder.com/docs/${component.docs.path}](${docsUrl})`,
    '',
    '<details>',
    '<summary>All changes in this release</summary>',
    '',
    ...pullRequests,
    '',
    '</details>',
    ...(previousTag
      ? [
          '',
          `**Full Changelog**: ${REPOSITORY_URL}/compare/${previousTag}...${tag}`,
        ]
      : []),
    '',
  ].join('\n');

  return {
    title: `${component.title} v${version}${title ? `: ${title}` : ''}`,
    body,
  };
}

function parseVersion(text) {
  const match = text.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/,
  );
  if (!match) {
    return undefined;
  }
  return {
    core: match.slice(1, 4).map(Number),
    prerelease: match[4]?.split('.') ?? [],
  };
}

function compareIdentifiers(left, right) {
  const leftNumeric = /^\d+$/.test(left);
  const rightNumeric = /^\d+$/.test(right);
  if (leftNumeric && rightNumeric) {
    return Number(left) - Number(right);
  }
  if (leftNumeric !== rightNumeric) {
    return leftNumeric ? -1 : 1;
  }
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Orders versions by semver precedence: a prerelease sorts below its release. */
function compareVersions(left, right) {
  for (let i = 0; i < 3; i++) {
    if (left.core[i] !== right.core[i]) {
      return left.core[i] - right.core[i];
    }
  }
  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    return right.prerelease.length - left.prerelease.length;
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let i = 0; i < length; i++) {
    if (left.prerelease[i] === undefined) {
      return -1;
    }
    if (right.prerelease[i] === undefined) {
      return 1;
    }
    const order = compareIdentifiers(left.prerelease[i], right.prerelease[i]);
    if (order !== 0) {
      return order;
    }
  }
  return 0;
}

/**
 * Returns the highest tag of the component below `version`. A stable release
 * compares against the previous stable release, skipping prereleases.
 */
export function findPreviousTag(tags, componentName, version) {
  const { tagPrefix } = getComponent(componentName);
  const current = parseVersion(version);
  if (!current) {
    throw new Error(`"${version}" is not a semantic version`);
  }
  const isStable = current.prerelease.length === 0;
  return tags
    .filter((tag) => tag.startsWith(tagPrefix))
    .map((tag) => ({ tag, version: parseVersion(tag.slice(tagPrefix.length)) }))
    .filter(
      (candidate) =>
        candidate.version &&
        (!isStable || candidate.version.prerelease.length === 0) &&
        compareVersions(candidate.version, current) < 0,
    )
    .sort((a, b) => compareVersions(b.version, a.version))
    .at(0)?.tag;
}

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    const match = arg.match(/^--([a-z]+)=(.*)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  }
  if (!args.component || !args.version || !(args.out || args.dryRun)) {
    throw new Error(
      'Usage: node scripts/release-notes.mjs --component=<cli|sdk-nodejs|sdk-dotnet|sdk-python> --version=<x.y.z> (--out=<file> | --dry-run)',
    );
  }
  return args;
}

function listPullRequests(tag, previousTag) {
  const repository = process.env.GITHUB_REPOSITORY ?? 'macalbert/envilder';
  const commit =
    process.env.GITHUB_SHA ??
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).trim();
  const args = [
    'api',
    `repos/${repository}/releases/generate-notes`,
    '-f',
    `tag_name=${tag}`,
    '-f',
    `target_commitish=${commit}`,
    ...(previousTag ? ['-f', `previous_tag_name=${previousTag}`] : []),
    '-q',
    '.body',
  ];
  return execFileSync('gh', args, { encoding: 'utf-8' })
    .split('\n')
    .filter((line) => line.startsWith('* '));
}

function main() {
  const {
    component: componentName,
    version,
    out,
    dryRun,
  } = parseArgs(process.argv.slice(2));
  const component = getComponent(componentName);
  const changelog = readFileSync(
    new URL(`../docs/changelogs/${component.changelog}`, import.meta.url),
    'utf-8',
  );
  const tags = execFileSync('git', ['tag', '--list'], { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);
  const previousTag = findPreviousTag(tags, componentName, version);
  const pullRequests = dryRun
    ? []
    : listPullRequests(`${component.tagPrefix}${version}`, previousTag);
  const { title, body } = renderReleaseNotes({
    component: componentName,
    version,
    changelog,
    previousTag,
    pullRequests,
  });

  if (!dryRun) {
    writeFileSync(out, body);
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, `title=${title}\n`);
    }
  }
  console.log(`${title}\n\n${body}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
