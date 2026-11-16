import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLE_START = '<header class="docs-header';
const ARTICLE_END = '<nav class="docs-pager';
const TAG = /<\/?[a-zA-Z][^\s>/]*(?:"[^"]*"|'[^']*'|[^>"'])*>/g;

/**
 * Visible article text of a built docs page: the header (title and intro)
 * plus every section, up to the pager. The navbar, breadcrumb, sidebar,
 * footer and JSON-LD sit outside that range, so they never affect the hash.
 */
export function articleText(html) {
  const start = html.indexOf(ARTICLE_START);
  const end = html.indexOf(ARTICLE_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `Cannot find the article body (${ARTICLE_START} ... ${ARTICLE_END}).`,
    );
  }

  return html
    .slice(start, end)
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, ' ')
    .replace(TAG, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashText(text) {
  return createHash('sha256').update(text).digest('hex');
}

/** Route path (e.g. /docs/cli/pull/) to content hash, for every English docs article. */
export function hashDocsPages(distDirectory) {
  const root = join(distDirectory, 'docs');
  const hashes = {};
  const walk = (directory, route) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(directory, entry.name), `${route}${entry.name}/`);
      }
    }
    const file = join(directory, 'index.html');
    if (route !== '/docs/' && existsSync(file)) {
      hashes[route] = hashText(articleText(readFileSync(file, 'utf-8')));
    }
  };
  walk(root, '/docs/');

  return Object.fromEntries(
    Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function syncManifest(manifest, hashes, today) {
  return Object.fromEntries(
    Object.entries(hashes).map(([route, hash]) => [
      route,
      manifest[route]?.hash === hash
        ? manifest[route]
        : { hash, dateModified: today },
    ]),
  );
}

export function compareManifest(manifest, hashes) {
  return [
    ...Object.entries(hashes).flatMap(([route, hash]) => {
      if (!manifest[route]) {
        return [`${route}: missing from manifest`];
      }
      return manifest[route].hash === hash ? [] : [`${route}: content changed`];
    }),
    ...Object.keys(manifest)
      .filter((route) => !(route in hashes))
      .map((route) => `${route}: no longer exists`),
  ];
}
