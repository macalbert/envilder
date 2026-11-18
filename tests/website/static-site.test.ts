import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  docsArticleRoutes,
  docsRouteManifest,
} from '../../src/website/src/i18n/docs-routes';
import { localizedLanguages } from '../../src/website/src/i18n/utils';

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
const englishDocsPages = localizedDocsPages.filter(
  (page) => page.lang === 'en',
);
const translatedDocsPages = localizedDocsPages.filter(
  (page) => page.lang !== 'en',
);
const indexablePages = [
  { file: 'index.html', path: '/', lang: 'en' },
  { file: 'ca/index.html', path: '/ca/', lang: 'ca' },
  { file: 'es/index.html', path: '/es/', lang: 'es' },
  ...englishDocsPages,
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

function readJsonLd(html: string): string | undefined {
  return html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
}

function getExpectedAlternateUrls(path: string): string[] {
  const localizedPath = path.replace(/^\/(?:ca|es)(?=\/|$)/, '') || '/';
  const route = localizedPath.endsWith('/')
    ? localizedPath
    : `${localizedPath}/`;
  const languages = route.startsWith('/docs/')
    ? ['en']
    : localizedLanguages(route);
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
  const jsonLd = readJsonLd(html);
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
    ...(jsonLd ? [] : [`${file}: missing JSON-LD`]),
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
  it('Should_ExposeParseableJsonLd_When_IndexablePagesAreBuilt', () => {
    // Arrange
    const jsonLdBlocks = indexablePages.map((page) =>
      readJsonLd(readDistFile(page.file)),
    );

    // Act
    const parseAll = () =>
      jsonLdBlocks.map((jsonLd) => JSON.parse(jsonLd ?? ''));

    // Assert
    expect(parseAll).not.toThrow();
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

  it('Should_ExposeTechArticleNode_When_EnglishDocsArticlesAreBuilt', () => {
    // Arrange
    const expected: string[] = [];
    const articlePages = englishDocsPages.filter(
      (page) => page.path !== '/docs/',
    );

    // Act
    const actual = articlePages.flatMap((page) => {
      const html = readDistFile(page.file);
      const jsonLd = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )?.[1];
      const graph = JSON.parse(jsonLd ?? '{}')['@graph'] as Record<
        string,
        unknown
      >[];
      const article = graph.find((node) => node['@type'] === 'TechArticle');
      const dateModified = String(article?.dateModified);
      const modifiedTime = getTags(html, 'meta')
        .find(
          (tag) => getAttribute(tag, 'property') === 'article:modified_time',
        )
        ?.match(/content="([^"]+)"/)?.[1];

      return [
        ...(article ? [] : [`${page.file}: missing TechArticle`]),
        ...(article?.url === `${siteUrl}${page.path}`
          ? []
          : [`${page.file}: invalid TechArticle url`]),
        ...(article?.inLanguage === 'en'
          ? []
          : [`${page.file}: invalid TechArticle inLanguage`]),
        ...(JSON.stringify(article?.isPartOf) ===
        JSON.stringify({ '@id': `${siteUrl}/#website` })
          ? []
          : [`${page.file}: invalid TechArticle isPartOf`]),
        ...(JSON.stringify(article?.publisher) ===
        JSON.stringify({ '@id': `${siteUrl}/#organization` })
          ? []
          : [`${page.file}: invalid TechArticle publisher`]),
        ...(/^\d{4}-\d{2}-\d{2}$/.test(dateModified) &&
        Date.parse(dateModified) <= Date.now()
          ? []
          : [`${page.file}: invalid dateModified`]),
        ...(modifiedTime === dateModified
          ? []
          : [`${page.file}: invalid article:modified_time`]),
      ];
    });

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_OmitTechArticle_When_PageIsDocsHubOrTranslatedDocs', () => {
    // Arrange
    const expected: string[] = [];
    const pages = [{ file: 'docs/index.html' }, ...translatedDocsPages];

    // Act
    const actual = pages
      .filter((page) => readDistFile(page.file).includes('"TechArticle"'))
      .map((page) => page.file);

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_ListEveryEnglishDocsArticle_When_LlmsTxtIsBuilt', () => {
    // Arrange
    const expected: string[] = [];
    const llms = readDistFile('llms.txt');

    // Act
    const actual = docsArticleRoutes
      .map((route) => `${siteUrl}${route.path}`)
      .filter((url) => !llms.includes(`](${url})`));

    // Assert
    expect(actual).toEqual(expected);
    expect(llms.startsWith('# Envilder\n\n> ')).toBe(true);
    expect(llms).toContain('## Docs: Guides');
    expect(llms).toContain(`(${siteUrl}/docs/guides/ssm-to-env/)`);
    expect(llms).toContain(`(${siteUrl}/docs/guides/azure-key-vault-to-env/)`);
    expect(llms).toContain(`(${siteUrl}/docs/guides/github-actions-ssm/)`);
  });

  it('Should_AnswerTheQuestionFirst_When_GitHubActionsSsmGuideIsBuilt', () => {
    // Arrange
    const html = readDistFile('docs/guides/github-actions-ssm/index.html');

    // Act
    const firstParagraph = html.match(
      /<p class="docs-intro"[^>]*>([\s\S]*?)<\/p>/,
    );

    // Assert
    expect(firstParagraph?.[1]).toContain('Envilder');
    expect(firstParagraph?.[1]).toContain('GitHub Actions');
    expect(firstParagraph?.[1]).toContain('SSM');
  });

  it('Should_LocalizeWorkflowComments_When_CatalanGitHubActionsSsmGuideIsBuilt', () => {
    // Arrange
    const html = readDistFile('ca/docs/guides/github-actions-ssm/index.html');

    // Act
    const hasCatalanComment = html.includes(
      'Permet que el job demani un token OIDC',
    );
    const hasEnglishComment = html.includes(
      'Lets the job request an OIDC token',
    );

    // Assert
    expect(hasCatalanComment).toBe(true);
    expect(hasEnglishComment).toBe(false);
  });

  it('Should_AnswerTheQuestionFirst_When_AzureKeyVaultGuideIsBuilt', () => {
    // Arrange
    const html = readDistFile('docs/guides/azure-key-vault-to-env/index.html');

    // Act
    const firstParagraph = html.match(
      /<p class="docs-intro"[^>]*>([\s\S]*?)<\/p>/,
    );

    // Assert
    expect(firstParagraph?.[1]).toContain('Envilder');
    expect(firstParagraph?.[1]).toContain('Azure Key Vault');
    expect(firstParagraph?.[1]).toContain('.env');
  });

  it('Should_LocalizeRoleCommandComments_When_CatalanAzureKeyVaultGuideIsBuilt', () => {
    // Arrange
    const html = readDistFile(
      'ca/docs/guides/azure-key-vault-to-env/index.html',
    );

    // Act
    const hasCatalanComment = html.includes('Pull i exec: llegir secrets');
    const hasEnglishComment = html.includes('Pull and exec: read secrets');

    // Assert
    expect(hasCatalanComment).toBe(true);
    expect(hasEnglishComment).toBe(false);
  });

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

  it('Should_ExposeLocalizedAnchorLabel_When_DocsPagesAreBuilt', () => {
    // Arrange
    const expected: string[] = [];

    // Act
    const actual = localizedDocsPages
      .filter(
        (page) => !/data-anchor-label="[^"]+"/.test(readDistFile(page.file)),
      )
      .map((page) => page.file);

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_NoindexTranslatedDocs_When_StaticSiteIsBuilt', () => {
    // Arrange
    const expected: string[] = [];

    // Act
    const actual = translatedDocsPages
      .filter(
        (page) =>
          !readDistFile(page.file).includes(
            '<meta name="robots" content="noindex,follow">',
          ),
      )
      .map((page) => page.file);

    // Assert
    expect(actual).toEqual(expected);
  });

  it('Should_KeepEnglishDocsIndexable_When_StaticSiteIsBuilt', () => {
    // Arrange
    const expected: string[] = [];

    // Act
    const actual = englishDocsPages
      .filter((page) => readDistFile(page.file).includes('name="robots"'))
      .map((page) => page.file);

    // Assert
    expect(actual).toEqual(expected);
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
      .join('\n')
      .toLowerCase();

    // Act
    const actual = forbiddenClaims.filter((claim) =>
      html.includes(claim.toLowerCase()),
    );

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

  it('Should_MirrorVisibleFaqInStructuredData_When_HomePagesAreBuilt', () => {
    // Arrange
    const homePages = ['index.html', 'ca/index.html', 'es/index.html'];
    const expected = homePages.map((file) => ({ file, matches: true }));

    // Act
    const actual = homePages.map((file) => {
      const html = readDistFile(file);
      const visibleQuestions = [
        ...html.matchAll(/<summary(?:\s[^>]*)?>([\s\S]*?)<\/summary>/g),
      ].map((match) => match[1].trim());
      const faqSchema = [
        ...html.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
        ),
      ]
        .map((match) => JSON.parse(match[1]))
        .find((schema) => schema['@type'] === 'FAQPage');
      const schemaQuestions: string[] = (faqSchema?.mainEntity ?? []).map(
        (question: { name: string }) => question.name,
      );
      const decode = (text: string) =>
        text
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&');
      return {
        file,
        matches:
          schemaQuestions.length > 0 &&
          JSON.stringify(visibleQuestions.map(decode)) ===
            JSON.stringify(schemaQuestions),
      };
    });

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

describe('Static website discoverability metadata', () => {
  const readOrganization = (file: string) => {
    const graph = JSON.parse(readJsonLd(readDistFile(file)) ?? '{}')[
      '@graph'
    ] as Record<string, unknown>[];

    return graph.find((node) => node['@type'] === 'Organization');
  };

  const readSitemapEntries = () => {
    const sitemapIndex = readDistFile('sitemap-index.xml');
    const sitemapFiles = [
      ...sitemapIndex.matchAll(/<loc>.*?\/([^/]+)<\/loc>/g),
    ].map((match) => match[1]);

    return sitemapFiles.flatMap((file) =>
      [...readDistFile(file).matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
        (match) => ({
          loc: match[1].match(/<loc>(.*?)<\/loc>/)?.[1] ?? '',
          lastmod: match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
        }),
      ),
    );
  };

  it('Should_UseDescriptiveFrontLoadedTitle_When_DocsHubIsBuilt', () => {
    // Arrange
    const html = readDistFile('docs/index.html');

    // Act
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
    const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';

    // Assert
    expect(title.startsWith('Envilder docs:')).toBe(true);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain('SSM');
    expect(title).toContain('Key Vault');
    expect(heading).toContain('AWS SSM');
    expect(heading).toContain('Azure Key Vault');
  });

  it('Should_ListRegistryPagesOnSoftwareNode_When_HomePageIsBuilt', () => {
    // Arrange
    const expected = [
      'https://www.npmjs.com/package/envilder',
      'https://www.npmjs.com/package/@envilder/sdk',
      'https://pypi.org/project/envilder/',
      'https://www.nuget.org/packages/Envilder',
      'https://github.com/marketplace/actions/envilder-github-action',
    ];

    // Act
    const graph = JSON.parse(readJsonLd(readDistFile('index.html')) ?? '{}')[
      '@graph'
    ] as Record<string, unknown>[];
    const software = graph.find(
      (node) => node['@type'] === 'SoftwareApplication',
    );
    const organization = readOrganization('index.html');

    // Assert
    expect(software?.sameAs).toEqual(expected);
    expect(organization?.sameAs).toEqual([
      'https://github.com/macalbert/envilder',
    ]);
    expect(typeof organization?.description).toBe('string');
    expect(String(organization?.description).trim().length).toBeGreaterThan(20);
  });

  it('Should_EmitLastmodFromManifest_When_EnglishDocsArticleIsInSitemap', () => {
    // Arrange
    const manifest = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../src/website/src/i18n/docs-dates.json'),
        'utf-8',
      ),
    ) as Record<string, { dateModified: string }>;
    const entries = readSitemapEntries();

    // Act
    const actual = Object.keys(manifest).map((route) => ({
      route,
      lastmod: entries
        .find((entry) => entry.loc === `${siteUrl}${route}`)
        ?.lastmod?.slice(0, 10),
    }));
    const expected = Object.entries(manifest).map(([route, value]) => ({
      route,
      lastmod: value.dateModified,
    }));

    // Assert
    expect(actual.length).toBeGreaterThan(0);
    expect(actual).toEqual(expected);
  });

  it('Should_DateOnlyManifestUrls_When_SitemapIsBuilt', () => {
    // Arrange
    const entries = readSitemapEntries();
    const manifestUrls = Object.keys(
      JSON.parse(
        readFileSync(
          resolve(__dirname, '../../src/website/src/i18n/docs-dates.json'),
          'utf-8',
        ),
      ),
    )
      .map((route) => `${siteUrl}${route}`)
      .sort();

    // Act
    const actual = entries
      .filter((entry) => entry.lastmod !== undefined)
      .map((entry) => entry.loc)
      .sort();

    // Assert
    expect(actual).toEqual(manifestUrls);
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each([
    'docs/providers/aws-ssm/index.html',
    'docs/guides/ssm-to-env/index.html',
  ])('Should_DescribeSsmAsSecretsVault_When_%s_IsBuilt', (file) => {
    // Arrange
    const html = readDistFile(file);

    // Act
    const description = (
      html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
    ).toLowerCase();

    // Assert
    expect(description).toContain('vault');
    expect(description).toContain('parameter store');
    expect(description).toContain('envilder');
  });
});
