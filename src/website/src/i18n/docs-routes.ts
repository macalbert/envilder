export const docsRouteKeys = [
  'hub',
  'getting-started',
  'aws-ssm',
  'azure-key-vault',
  'map-file',
  'cli-pull',
  'cli-push',
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
  navGroup: 'gettingStarted' | 'providers' | 'cli' | 'githubAction' | 'sdks';
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
    legacyHashes: ['overview', 'requirements', 'installation'],
  },
  {
    key: 'aws-ssm',
    path: '/docs/providers/aws-ssm/',
    navGroup: 'providers',
    legacyHashes: ['aws-setup'],
  },
  {
    key: 'azure-key-vault',
    path: '/docs/providers/azure-key-vault/',
    navGroup: 'providers',
    legacyHashes: ['azure-setup'],
  },
  {
    key: 'map-file',
    path: '/docs/map-file/',
    navGroup: 'cli',
    legacyHashes: ['mapping-file', 'config-priority'],
  },
  {
    key: 'cli-pull',
    path: '/docs/cli/pull/',
    navGroup: 'cli',
    legacyHashes: ['pull-command'],
  },
  {
    key: 'cli-push',
    path: '/docs/cli/push/',
    navGroup: 'cli',
    legacyHashes: ['push-command', 'push-single'],
  },
  {
    key: 'github-action',
    path: '/docs/github-action/',
    navGroup: 'githubAction',
    legacyHashes: [],
  },
  {
    key: 'sdk-dotnet',
    path: '/docs/sdks/dotnet/',
    navGroup: 'sdks',
    legacyHashes: ['sdk-dotnet'],
  },
  {
    key: 'sdk-python',
    path: '/docs/sdks/python/',
    navGroup: 'sdks',
    legacyHashes: ['sdk-python'],
  },
  {
    key: 'sdk-nodejs',
    path: '/docs/sdks/nodejs/',
    navGroup: 'sdks',
    legacyHashes: ['sdk-nodejs'],
  },
] as const satisfies readonly DocsRoute[];

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
