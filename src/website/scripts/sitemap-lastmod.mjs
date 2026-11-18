import { readFileSync } from 'node:fs';

/**
 * Builds the sitemap `serialize` hook: English docs articles get a `lastmod`
 * from the docs-dates manifest; every other URL is left without one rather
 * than carrying an invented date.
 */
export function createSitemapSerializer(manifest, siteUrl) {
  return (item) => {
    const route = item.url.startsWith(siteUrl)
      ? item.url.slice(siteUrl.length)
      : undefined;
    const dateModified = route ? manifest[route]?.dateModified : undefined;

    return dateModified ? { ...item, lastmod: dateModified } : item;
  };
}

export function readDocsDatesManifest(fileUrl) {
  try {
    return JSON.parse(readFileSync(fileUrl, 'utf-8'));
  } catch {
    return {};
  }
}
