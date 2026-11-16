import { describe, expect, it } from 'vitest';
import {
  buildPayload,
  changedUrls,
  indexNowEndpoint,
  normalizeHtml,
  parseSitemapUrls,
} from '../../src/website/scripts/indexnow.mjs';

const sitemap = (...urls: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map((u) => `<url><loc>${u}</loc></url>`)
    .join('')}</urlset>`;

describe('parseSitemapUrls', () => {
  it('Should_ReturnEveryLoc_When_SitemapHasUrls', () => {
    // Arrange
    const xml = sitemap('https://envilder.com/', 'https://envilder.com/docs/');

    // Act
    const actual = parseSitemapUrls(xml);

    // Assert
    expect(actual).toEqual([
      'https://envilder.com/',
      'https://envilder.com/docs/',
    ]);
  });

  it('Should_DecodeXmlEntities_When_LocContainsAmpersand', () => {
    // Arrange
    const xml = sitemap('https://envilder.com/?a=1&amp;b=2');

    // Act
    const actual = parseSitemapUrls(xml);

    // Assert
    expect(actual).toEqual(['https://envilder.com/?a=1&b=2']);
  });

  it('Should_ReturnEmpty_When_NoLocPresent', () => {
    // Act
    const actual = parseSitemapUrls('<urlset></urlset>');

    // Assert
    expect(actual).toEqual([]);
  });
});

describe('normalizeHtml', () => {
  it('Should_IgnoreWhitespaceRuns_When_MarkupIsReformatted', () => {
    // Act
    const a = normalizeHtml('<p>Hello\n   world</p>\n');
    const b = normalizeHtml('<p>Hello world</p>');

    // Assert
    expect(a).toBe(b);
  });

  it('Should_IgnoreAssetContentHash_When_AssetNameIsHashed', () => {
    // Act
    const a = normalizeHtml('<link href="/_assets/BaseLayout.C0eM65LQ.css">');
    const b = normalizeHtml('<link href="/_assets/BaseLayout.XyZ12345.css">');

    // Assert
    expect(a).toBe(b);
  });

  it('Should_IgnoreRandomBlockIds_When_TabbedCodeIsRebuilt', () => {
    // Arrange
    const block = (id: string) =>
      `<div class="tabbed-code" data-block-id="${id}"><button id="tab-${id}-0" aria-controls="panel-${id}-0">AWS</button><div id="panel-${id}-0" aria-labelledby="tab-${id}-0">x</div></div>`;

    // Act
    const a = normalizeHtml(block('93fb77fd'));
    const b = normalizeHtml(block('10a89ecc'));

    // Assert
    expect(a).toBe(b);
  });

  it('Should_KeepAssetName_When_OnlyHashIsStripped', () => {
    // Act
    const a = normalizeHtml('<link href="/_assets/BaseLayout.C0eM65LQ.css">');
    const b = normalizeHtml('<link href="/_assets/Other.C0eM65LQ.css">');

    // Assert
    expect(a).not.toBe(b);
  });

  it('Should_DetectDifference_When_TextChanges', () => {
    // Act
    const a = normalizeHtml('<p>one</p>');
    const b = normalizeHtml('<p>two</p>');

    // Assert
    expect(a).not.toBe(b);
  });

  it('Should_DetectDifference_When_WhitespaceInsidePreChanges', () => {
    // Act
    const a = normalizeHtml('<pre class="code">A  B</pre>');
    const b = normalizeHtml('<pre class="code">A B</pre>');

    // Assert
    expect(a).not.toBe(b);
  });

  it('Should_IgnoreWhitespace_When_OnlyOutsidePreChanges', () => {
    // Act
    const a = normalizeHtml('<div>\n  <pre>A  B</pre>\n</div>');
    const b = normalizeHtml('<div> <pre>A  B</pre> </div>');

    // Assert
    expect(a).toBe(b);
  });
});

describe('changedUrls', () => {
  const home = 'https://envilder.com/';
  const docs = 'https://envilder.com/docs/';

  it('Should_ReturnNothing_When_AllPagesMatchLive', () => {
    // Arrange
    const built = { [home]: '<p>a</p>', [docs]: '<p>b</p>' };
    const live = { [home]: '<p>a</p>\n', [docs]: '<p>b</p>' };

    // Act
    const actual = changedUrls([home, docs], built, live);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReturnOnlyChangedUrls_When_OnePageDiffers', () => {
    // Arrange
    const built = { [home]: '<p>a</p>', [docs]: '<p>new</p>' };
    const live = { [home]: '<p>a</p>', [docs]: '<p>old</p>' };

    // Act
    const actual = changedUrls([home, docs], built, live);

    // Assert
    expect(actual).toEqual([docs]);
  });

  it('Should_IncludeUrl_When_LivePageIsMissing', () => {
    // Arrange
    const built = { [home]: '<p>a</p>', [docs]: '<p>b</p>' };
    const live = { [home]: '<p>a</p>', [docs]: null };

    // Act
    const actual = changedUrls([home, docs], built, live);

    // Assert
    expect(actual).toEqual([docs]);
  });

  it('Should_SkipUrl_When_NoBuiltPageExists', () => {
    // Arrange
    const live = { [home]: '<p>a</p>' };

    // Act
    const actual = changedUrls([home], {}, live);

    // Assert
    expect(actual).toEqual([]);
  });
});

describe('buildPayload', () => {
  it('Should_BuildIndexNowBody_When_GivenKeyAndUrls', () => {
    // Act
    const actual = buildPayload({
      siteUrl: 'https://envilder.com',
      key: 'abc123',
      urls: ['https://envilder.com/docs/'],
    });

    // Assert
    expect(actual).toEqual({
      host: 'envilder.com',
      key: 'abc123',
      keyLocation: 'https://envilder.com/abc123.txt',
      urlList: ['https://envilder.com/docs/'],
    });
  });

  it('Should_UseTheIndexNowApiEndpoint', () => {
    // Assert
    expect(indexNowEndpoint).toBe('https://api.indexnow.org/indexnow');
  });
});
