export const docsRouteKeys = [
  'hub',
  'getting-started',
  'guide-ssm-to-env',
  'aws-ssm',
  'azure-key-vault',
  'map-file',
  'cli-pull',
  'cli-push',
  'cli-exec',
  'cli-validate',
  'github-action',
  'sdk-dotnet',
  'sdk-python',
  'sdk-nodejs',
] as const;

export type DocsRouteKey = (typeof docsRouteKeys)[number];
export type DocsArticleRouteKey = Exclude<DocsRouteKey, 'hub'>;

export interface DocsRoute {
  key: DocsRouteKey;
  path: string;
  navGroup:
    | 'gettingStarted'
    | 'guides'
    | 'providers'
    | 'cli'
    | 'githubAction'
    | 'sdks';
  /**
   * Last substantive content change (YYYY-MM-DD), taken from the commit
   * history of the route's section in DocsArticle.astro. Update it when the
   * page content changes. Omitted on the hub, which is not an article.
   */
  dateModified?: string;
  legacyHashes: readonly string[];
}

export const docsRouteManifest = [
  {
    key: 'hub',
    path: '/docs/',
    navGroup: 'gettingStarted',
    legacyHashes: [],
  },
  {
    key: 'getting-started',
    path: '/docs/getting-started/',
    navGroup: 'gettingStarted',
    dateModified: '2026-10-27',
    legacyHashes: ['overview', 'requirements', 'installation'],
  },
  {
    key: 'guide-ssm-to-env',
    path: '/docs/guides/ssm-to-env/',
    navGroup: 'guides',
    dateModified: '2026-11-05',
    legacyHashes: [],
  },
  {
    key: 'aws-ssm',
    path: '/docs/providers/aws-ssm/',
    navGroup: 'providers',
    dateModified: '2026-10-27',
    legacyHashes: ['aws-setup'],
  },
  {
    key: 'azure-key-vault',
    path: '/docs/providers/azure-key-vault/',
    navGroup: 'providers',
    dateModified: '2026-10-27',
    legacyHashes: ['azure-setup'],
  },
  {
    key: 'map-file',
    path: '/docs/map-file/',
    navGroup: 'cli',
    dateModified: '2026-10-27',
    legacyHashes: ['mapping-file', 'config-priority'],
  },
  {
    key: 'cli-pull',
    path: '/docs/cli/pull/',
    navGroup: 'cli',
    dateModified: '2026-11-05',
    legacyHashes: ['pull-command'],
  },
  {
    key: 'cli-push',
    path: '/docs/cli/push/',
    navGroup: 'cli',
    dateModified: '2026-10-29',
    legacyHashes: ['push-command', 'push-single'],
  },
  {
    key: 'cli-exec',
    path: '/docs/cli/exec/',
    navGroup: 'cli',
    dateModified: '2026-10-29',
    legacyHashes: [],
  },
  {
    key: 'cli-validate',
    path: '/docs/cli/validate/',
    navGroup: 'cli',
    dateModified: '2026-11-05',
    legacyHashes: [],
  },
  {
    key: 'github-action',
    path: '/docs/github-action/',
    navGroup: 'githubAction',
    dateModified: '2026-11-01',
    legacyHashes: [],
  },
  {
    key: 'sdk-dotnet',
    path: '/docs/sdks/dotnet/',
    navGroup: 'sdks',
    dateModified: '2026-11-05',
    legacyHashes: ['sdk-dotnet'],
  },
  {
    key: 'sdk-python',
    path: '/docs/sdks/python/',
    navGroup: 'sdks',
    dateModified: '2026-11-05',
    legacyHashes: ['sdk-python'],
  },
  {
    key: 'sdk-nodejs',
    path: '/docs/sdks/nodejs/',
    navGroup: 'sdks',
    dateModified: '2026-11-05',
    legacyHashes: ['sdk-nodejs'],
  },
] as const satisfies readonly DocsRoute[];

/** Docs navigation sections, in display order, shared by the sidebar and the navbar. */
export const docsNavGroups = [
  { key: 'gettingStarted', labelKey: 'navGettingStarted' },
  { key: 'guides', labelKey: 'navGuides' },
  { key: 'providers', labelKey: 'navProviders' },
  { key: 'cli', labelKey: 'sidebarCli' },
  { key: 'githubAction', labelKey: 'sidebarGha' },
  { key: 'sdks', labelKey: 'sidebarSdks' },
] as const satisfies readonly {
  key: DocsRoute['navGroup'];
  labelKey: string;
}[];

export const docsArticleRoutes = docsRouteManifest.filter(
  (route) => route.key !== 'hub',
);

export function getDocsRoute(key: DocsRouteKey) {
  return docsRouteManifest.find((route) => route.key === key);
}

export function getDocsArticleRoute(key: string) {
  return docsRouteManifest.find(
    (
      route,
    ): route is (typeof docsRouteManifest)[number] & {
      key: DocsArticleRouteKey;
    } =>
      (route.key === key || route.path.replace(/^\/docs\/|\/$/g, '') === key) &&
      route.key !== 'hub',
  );
}

export function resolveLegacyDocsHash(hash: string) {
  const normalizedHash = hash.replace(/^#/, '').toLowerCase();

  if (normalizedHash.startsWith('gha-')) {
    return getDocsRoute('github-action');
  }

  return docsRouteManifest.find((route) =>
    route.legacyHashes.includes(normalizedHash),
  );
}
