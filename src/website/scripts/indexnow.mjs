import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const indexNowEndpoint = 'https://api.indexnow.org/indexnow';
const defaultSiteUrl = 'https://envilder.com';
const requestTimeoutMs = 15_000;
const KEY_FILE = /^[0-9a-f]{32}\.txt$/;

/** Every <loc> of a sitemap file, with XML entities decoded. */
export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((match) =>
    match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&'),
  );
}

/**
 * Page markup reduced to what is stable across builds of the same content:
 * whitespace runs collapse outside <pre> (inside it whitespace is content),
 * the content hash that Astro puts in bundled asset
 * names (/_assets/Name.HASH.ext) is dropped (otherwise editing one stylesheet
 * would flag every page), and the random ids TabbedCodeBlock.astro generates
 * per build (data-block-id, tab-ID-n, panel-ID-n) are blanked.
 */
export function normalizeHtml(html) {
  return html
    .replace(
      /(\/_assets\/[^"'\s)?#]*?)\.[A-Za-z0-9_-]{8}(\.[a-z0-9]+)/g,
      '$1$2',
    )
    .replace(/data-block-id="[0-9a-f]{8}"/g, 'data-block-id=""')
    .replace(/\b(tab|panel)-[0-9a-f]{8}-(\d+)/g, '$1-$2')
    .split(/(<pre\b[\s\S]*?<\/pre>)/i)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/\s+/g, ' ')))
    .join('')
    .trim();
}

const digest = (html) =>
  createHash('sha256').update(normalizeHtml(html)).digest('hex');

/**
 * URLs whose built page differs from the live one. `built` and `live` map a
 * URL to its HTML; a live value of null means the page is not published yet.
 * URLs without a built page are skipped.
 */
export function changedUrls(urls, built, live) {
  return urls.filter((url) => {
    if (built[url] == null) {
      return false;
    }
    if (live[url] == null) {
      return true;
    }
    return digest(built[url]) !== digest(live[url]);
  });
}

export function buildPayload({ siteUrl, key, urls }) {
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList: urls,
  };
}

/** The IndexNow key: the dist file named <32 hex>.txt whose content is its own name. */
export function findKey(distDirectory) {
  for (const name of readdirSync(distDirectory)) {
    if (
      KEY_FILE.test(name) &&
      readFileSync(join(distDirectory, name), 'utf8').trim() ===
        name.replace(/\.txt$/, '')
    ) {
      return name.replace(/\.txt$/, '');
    }
  }
  throw new Error(`No IndexNow key file found in ${distDirectory}.`);
}

function builtPagePath(distDirectory, _siteUrl, url) {
  const { pathname } = new URL(url);
  const relative = decodeURIComponent(pathname).replace(/^\//, '');
  const file = pathname.endsWith('/')
    ? join(distDirectory, relative, 'index.html')
    : join(distDirectory, relative);
  return existsSync(file) ? file : null;
}

function sitemapUrls(distDirectory) {
  return readdirSync(distDirectory)
    .filter((name) => /^sitemap-\d+\.xml$/.test(name))
    .flatMap((name) =>
      parseSitemapUrls(readFileSync(join(distDirectory, name), 'utf8')),
    );
}

async function fetchLive(url) {
  try {
    const response = await fetch(url, {
      headers: { 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    // Unknown live state: report the page as changed rather than miss an update.
    console.warn(
      `Could not fetch ${url} (${error.message}); treating as changed.`,
    );
    return null;
  }
}

export async function detectChanged({ distDirectory, siteUrl }) {
  const urls = sitemapUrls(distDirectory);
  const built = {};
  for (const url of urls) {
    const file = builtPagePath(distDirectory, siteUrl, url);
    built[url] = file ? readFileSync(file, 'utf8') : null;
  }
  const entries = await Promise.all(
    urls.map(async (url) => [url, await fetchLive(url)]),
  );
  return changedUrls(urls, built, Object.fromEntries(entries));
}

export async function submit({ distDirectory, siteUrl, urls, dryRun }) {
  if (urls.length === 0) {
    console.log('IndexNow: no changed pages, nothing to submit.');
    return;
  }
  const payload = buildPayload({
    siteUrl,
    key: findKey(distDirectory),
    urls,
  });
  if (dryRun) {
    console.log(`IndexNow (dry run): would POST to ${indexNowEndpoint}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  const response = await fetch(indexNowEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  console.log(`IndexNow: ${response.status} ${response.statusText}`);
  console.log(urls.join('\n'));
  if (!response.ok) {
    throw new Error(
      `IndexNow rejected the submission (HTTP ${response.status}).`,
    );
  }
}

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

/**
 * node indexnow.mjs [--dist dist] [--site https://envilder.com] [--dry-run]
 *   --out <file>  detect changed pages against the live site, write them, do not submit
 *   --in <file>   submit the pages listed in <file>, do not detect
 *   (neither)     detect and submit
 */
async function main(args) {
  const here = dirname(fileURLToPath(import.meta.url));
  const distDirectory = resolve(
    option(args, '--dist') ?? join(here, '../dist'),
  );
  const siteUrl = option(args, '--site') ?? defaultSiteUrl;
  const dryRun = args.includes('--dry-run');
  const outFile = option(args, '--out');
  const inFile = option(args, '--in');

  const urls = inFile
    ? JSON.parse(readFileSync(inFile, 'utf8'))
    : await detectChanged({ distDirectory, siteUrl });

  if (outFile) {
    writeFileSync(outFile, JSON.stringify(urls, null, 2));
    console.log(
      `IndexNow: ${urls.length} changed page(s) written to ${outFile}`,
    );
    return;
  }
  await submit({ distDirectory, siteUrl, urls, dryRun });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
