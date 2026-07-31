import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsRouteManifest } from '../../src/website/src/i18n/docs-routes';
import { localizedRoutes } from '../../src/website/src/i18n/localized-routes';

const siteUrl = 'https://envilder.com';
const distDirectory = resolve(__dirname, '../../src/website/dist');
const localizedDocsPages = docsRouteManifest.flatMap((route) =>
  ['en', 'ca', 'es'].map((lang) => {
    const routeDirectory =
      route.path === '/docs/'
        ? 'docs'
        : `docs/${route.path.replace(/^\/docs\/|\/$/g, '')}`;
    const localeDirectory =
      lang === 'en' ? routeDirectory : `${lang}/${routeDirectory}`;
    const path = lang === 'en' ? route.path : `/${lang}${route.path}`;

    return {
      file: `${localeDirectory}/index.html`,
      path,
      lang,
    };
  }),
);
const indexablePages = [
  { file: 'index.html', path: '/', lang: 'en' },
  { file: 'ca/index.html', path: '/ca/', lang: 'ca' },
  { file: 'es/index.html', path: '/es/', lang: 'es' },
  ...localizedDocsPages,
  { file: 'changelog/index.html', path: '/changelog/', lang: 'en' },
];

function readDistFile(file: string): string {
  return readFileSync(resolve(distDirectory, file), 'utf-8');
}

function getAttribute(tag: string, attribute: string): string | undefined {
  return tag.match(new RegExp(`${attribute}="([^"]*)"`))?.[1];
}

function getTags(html: string, tagName: string): string[] {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'g')) ?? [];
}

function findDuplicateValues(values: string[]): string[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts].flatMap(([value, count]) => (count > 1 ? [value] : []));
}

function isValidJsonLd(jsonLd: string | undefined): boolean {
  if (!jsonLd) {
    return false;
  }

  try {
    JSON.parse(jsonLd);
    return true;
  } catch {
    return false;
  }
}

function getExpectedAlternateUrls(path: string): string[] {
  const localizedPath = path.replace(/^\/(?:ca|es)(?=\/|$)/, '') || '/';
  const route = localizedPath.endsWith('/')
    ? localizedPath
    : `${localizedPath}/`;
  const languages = localizedRoutes[route];
  const languageUrls = languages.map((language) =>
    language === 'en' ? `${siteUrl}${route}` : `${siteUrl}/${language}${route}`,
  );

  return [...languageUrls, `${siteUrl}${route}`];
}

function getSeoIssues(file: string, path: string, lang: string): string[] {
  const html = readDistFile(file);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const idSet = new Set(ids);
  const duplicateIds = findDuplicateValues(ids);
  const fragmentTargets = [...html.matchAll(/<a\b[^>]*href="#([^"]+)"/g)].map(
    (match) => match[1],
  );
  const brokenFragments = fragmentTargets.filter(
    (target) => !idSet.has(target),
  );
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = getTags(html, 'meta')
    .find((tag) => getAttribute(tag, 'name') === 'description')
    ?.match(/content="([^"]+)"/)?.[1];
  const canonical = getTags(html, 'link')
    .find((tag) => getAttribute(tag, 'rel') === 'canonical')
    ?.match(/href="([^"]+)"/)?.[1];
  const jsonLd = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  const htmlLang = html.match(/<html lang="([^"]+)">/)?.[1];
  const ogLocale = getTags(html, 'meta')
    .find((tag) => getAttribute(tag, 'property') === 'og:locale')
    ?.match(/content="([^"]+)"/)?.[1];
  const expectedOgLocale: Record<string, string> = {
    en: 'en_US',
    ca: 'ca_ES',
    es: 'es_ES',
  };
  const ogImage = getTags(html, 'meta')
    .find((tag) => getAttribute(tag, 'property') === 'og:image')
    ?.match(/content="([^"]+)"/)?.[1];
  const twitterImage = getTags(html, 'meta')
    .find((tag) => getAttribute(tag, 'name') === 'twitter:image')
    ?.match(/content="([^"]+)"/)?.[1];
  const internalRedirectLinks = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((href) => href.startsWith('/') && !href.startsWith('//'))
    .filter((href) => {
      const pathname = href.split(/[?#]/)[0];
      return pathname !== '/' && !pathname.endsWith('/');
    });

  return [
    ...(h1Count === 1 ? [] : [`${file}: expected one h1`]),
    ...(title ? [] : [`${file}: missing title`]),
    ...(description ? [] : [`${file}: missing meta description`]),
    ...(canonical === `${siteUrl}${path}`
      ? []
      : [`${file}: invalid canonical`]),
    ...(htmlLang === lang ? [] : [`${file}: invalid html lang`]),
    ...(ogLocale === expectedOgLocale[lang]
      ? []
      : [`${file}: invalid Open Graph locale`]),
    ...(duplicateIds.length === 0 ? [] : [`${file}: duplicate ids`]),
    ...(brokenFragments.length === 0 ? [] : [`${file}: broken fragments`]),
    ...(isValidJsonLd(jsonLd) ? [] : [`${file}: invalid JSON-LD`]),
    ...(ogImage === `${siteUrl}/og-image.png`
      ? []
      : [`${file}: missing Open Graph image`]),
    ...(twitterImage === `${siteUrl}/og-image.png`
      ? []
      : [`${file}: missing Twitter image`]),
    ...(internalRedirectLinks.length === 0
      ? []
      : [`${file}: internal links missing trailing slash`]),
  ];
}

function getHreflangIssues(file: string, path: string): string[] {
  const html = readDistFile(file);
  const actual = getTags(html, 'link')
    .filter((tag) => getAttribute(tag, 'rel') === 'alternate')
    .map((tag) => getAttribute(tag, 'href'))
    .filter((href): href is string => href !== undefined);
  const expected = getExpectedAlternateUrls(path);

  return JSON.stringify(actual) === JSON.stringify(expected)
    ? []
    : [`${file}: invalid hreflang cluster`];
}

function getSitemapUrls(): string[] {
  const sitemapIndex = readDistFile('sitemap-index.xml');
  const sitemapFiles = [
    ...sitemapIndex.matchAll(/<loc>.*?\/([^/]+)<\/loc>/g),
  ].map((match) => match[1]);

  return sitemapFiles.flatMap((file) =>
    [...readDistFile(file).matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    ),
  );
}

describe('Static website SEO', () => {
  it('Should_ReturnFalse_When_JsonLdIsInvalid', () => {
    // Arrange
    const expected = false;

    // Act
    const actual = isValidJsonLd('{');

    // Assert
    expect(actual).toBe(expected);
  });

  it('Should_ExposeValidSeoMarkup_When_IndexablePagesAreBuilt', () => {
    // Arrange
    const expected: string[] = [];

    // Act
    const actual = indexablePages.flatMap((page) =>
      getSeoIssues(page.file, page.path, page.lang),
    );

    // Assert
    expect(actual).toEqual(expected);
  }, 15_000);

  it('Should_ExposeManifestBackedHreflangClusters_When_IndexablePagesAreBuilt', () => {
    // Arrange
    const expected: string[] = [];

    // Act
    const actual = indexablePages.flatMap((page) =>
      getHreflangIssues(page.file, page.path),
    );

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_ReferenceOnlyIndexablePages_When_SitemapIsBuilt', () => {
    // Arrange
    const expected = indexablePages.map((page) => `${siteUrl}${page.path}`);

    // Act
    const actual = getSitemapUrls().sort();

    // Assert
    expect(actual).toEqual(expected.sort());
  });

  it('Should_KeepRobotsAndNotFoundMetadata_When_StaticSiteIsBuilt', () => {
    // Arrange
    const expected = {
      notFoundIsNoindex: true,
      sitemapIsDeclared: true,
    };

    // Act
    const actual = {
      notFoundIsNoindex: readDistFile('404.html').includes(
        '<meta name="robots" content="noindex,follow">',
      ),
      sitemapIsDeclared: readDistFile('robots.txt').includes(
        'Sitemap: https://envilder.com/sitemap-index.xml',
      ),
    };

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_ExcludeUnavailableClaims_When_IndexablePagesAreBuilt', () => {
    // Arrange
    const expected: string[] = [];
    const forbiddenClaims = [
      'envilder pull',
      '--provider=gcp',
      'ready to use from GitHub Marketplace',
      'sk_live_',
    ];
    const html = indexablePages
      .map((page) => readDistFile(page.file))
      .join('\n');

    // Act
    const actual = forbiddenClaims.filter((claim) => html.includes(claim));

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_NoindexLocalizedChangelogs_When_StaticSiteIsBuilt', () => {
    // Arrange
    const expected = {
      catalanHasAlternates: false,
      catalanIsNoindex: true,
      spanishHasAlternates: false,
      spanishIsNoindex: true,
    };

    // Act
    const catalanChangelog = readDistFile('ca/changelog/index.html');
    const spanishChangelog = readDistFile('es/changelog/index.html');
    const actual = {
      catalanHasAlternates: catalanChangelog.includes('hreflang='),
      catalanIsNoindex: catalanChangelog.includes(
        '<meta name="robots" content="noindex,follow">',
      ),
      spanishHasAlternates: spanishChangelog.includes('hreflang='),
      spanishIsNoindex: spanishChangelog.includes(
        '<meta name="robots" content="noindex,follow">',
      ),
    };

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_DeferDemoMedia_When_HomePageIsBuilt', () => {
    // Arrange
    const expected = {
      hasEagerSource: false,
      hasAutoplay: false,
      hasPoster: true,
      hasPreloadNone: true,
    };

    // Act
    const videoTag = getTags(readDistFile('index.html'), 'video')[0] ?? '';
    const actual = {
      hasEagerSource: /(?:^|\s)src="/.test(videoTag),
      hasAutoplay: videoTag.includes('autoplay'),
      hasPoster: videoTag.includes('poster="/Envilder-demo-poster.webp"'),
      hasPreloadNone: videoTag.includes('preload="none"'),
    };

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_TrackConversionsWithoutSendingCode_When_IndexablePagesAreBuilt', () => {
    // Arrange
    const expected = {
      hasGetStartedEvent: true,
      hasGitHubEvent: true,
      hasPackageEvent: true,
      hasRuntimeEvent: true,
      hasCopyCodeEvent: true,
      hasCopyInstallEvent: true,
      sendsCodeAsAnalyticsLabel: false,
    };
    const html = indexablePages
      .map((page) => readDistFile(page.file))
      .join('\n');

    // Act
    const actual = {
      hasGetStartedEvent: html.includes(
        'data-analytics-event="click_get_started"',
      ),
      hasGitHubEvent: html.includes('data-analytics-event="click_github"'),
      hasPackageEvent: html.includes('data-analytics-event="click_package"'),
      hasRuntimeEvent: html.includes('data-analytics-event="select_runtime"'),
      hasCopyCodeEvent: html.includes('data-analytics-event="copy_code"'),
      hasCopyInstallEvent: html.includes(
        'data-analytics-event="copy_install_command"',
      ),
      sendsCodeAsAnalyticsLabel: html.includes('event_label'),
    };

    // Assert
    expect(actual).toEqual(expected);
  });
});
