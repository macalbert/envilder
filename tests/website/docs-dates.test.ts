import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  articleText,
  compareManifest,
  hashDocsPages,
  syncManifest,
} from '../../src/website/scripts/docs-dates.mjs';

const distDirectory = resolve(__dirname, '../../src/website/dist');
const manifestFile = resolve(
  __dirname,
  '../../src/website/src/i18n/docs-dates.json',
);

const page = (body: string, chrome = '') =>
  `<html><head><script type="application/ld+json">{"dateModified":"2026-01-01"}</script></head><body>` +
  `<nav class="navbar">Home Docs</nav><main><nav class="breadcrumb">Docs / X</nav>` +
  `<header class="docs-header"><h1>Title</h1><p>Intro</p></header>${body}` +
  `<nav class="docs-pager"><a>Next page</a></nav></main><footer>${chrome}</footer></body></html>`;

describe('articleText', () => {
  it('Should_ReturnOnlyHeaderAndSections_When_PageHasChrome', () => {
    // Arrange
    const html = page('<section><h2>Part</h2><p>Body text</p></section>');

    // Act
    const actual = articleText(html);

    // Assert
    expect(actual).toBe('Title Intro Part Body text');
  });

  it('Should_IgnoreMarkupWhitespaceScriptsAndAttributes_When_TextIsUnchanged', () => {
    // Arrange
    const a = page(
      '<section><p>Run <code data-x="a>b">envilder</code> now</p></section>',
    );
    const b = page(
      '<section>\n  <p class="other">Run   <code>envilder</code>\n now</p><script>var x=1</script><svg><path d="M0"/></svg></section>',
      'different footer',
    );

    // Act
    const actual = [articleText(a), articleText(b)];

    // Assert
    expect(actual[0]).toBe(actual[1]);
  });

  it('Should_Throw_When_ArticleMarkersAreMissing', () => {
    // Arrange
    const html = '<html><body>nothing</body></html>';

    // Act
    const act = () => articleText(html);

    // Assert
    expect(act).toThrow(/docs-header/);
  });
});

describe('syncManifest', () => {
  it('Should_BumpOnlyChangedRoutesAndAddAndDrop_When_HashesDiffer', () => {
    // Arrange
    const manifest = {
      '/docs/a/': { hash: 'h1', dateModified: '2026-01-01' },
      '/docs/b/': { hash: 'h2', dateModified: '2026-01-02' },
      '/docs/gone/': { hash: 'h3', dateModified: '2026-01-03' },
    };
    const hashes = { '/docs/a/': 'h1', '/docs/b/': 'h2x', '/docs/new/': 'h4' };

    // Act
    const actual = syncManifest(manifest, hashes, '2026-02-01');

    // Assert
    expect(actual).toEqual({
      '/docs/a/': { hash: 'h1', dateModified: '2026-01-01' },
      '/docs/b/': { hash: 'h2x', dateModified: '2026-02-01' },
      '/docs/new/': { hash: 'h4', dateModified: '2026-02-01' },
    });
  });
});

describe('compareManifest', () => {
  it('Should_ListChangedMissingAndExtraRoutes_When_ManifestIsStale', () => {
    // Arrange
    const manifest = {
      '/docs/a/': { hash: 'h1', dateModified: '2026-01-01' },
      '/docs/b/': { hash: 'h2', dateModified: '2026-01-02' },
      '/docs/gone/': { hash: 'h3', dateModified: '2026-01-03' },
    };
    const hashes = { '/docs/a/': 'h1', '/docs/b/': 'x', '/docs/new/': 'h4' };

    // Act
    const actual = compareManifest(manifest, hashes);

    // Assert
    expect(actual).toEqual([
      '/docs/b/: content changed',
      '/docs/new/: missing from manifest',
      '/docs/gone/: no longer exists',
    ]);
  });
});

describe('docs dates manifest', () => {
  it('Should_MatchBuiltEnglishDocs_When_DocsContentIsCommitted', () => {
    // Arrange
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8'));

    // Act
    const stale = compareManifest(manifest, hashDocsPages(distDirectory));

    // Assert
    expect(
      stale,
      `docs-dates.json is out of date. Run "pnpm docs:dates" and commit the result.\n${stale.join('\n')}`,
    ).toEqual([]);
  });
});
