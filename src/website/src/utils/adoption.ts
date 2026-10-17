/**
 * Public adoption numbers, fetched once per build from the registries'
 * public APIs. Any source that fails or times out is left out, so an
 * offline build still succeeds and never shows a made-up number.
 */
export interface AdoptionStats {
  githubStars: number | null;
  npmLastMonth: number | null;
  pypiLastMonth: number | null;
  nugetTotal: number | null;
}

const TIMEOUT_MS = 5000;

async function getJson(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'envilder-website-build' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

function pickNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function loadAdoptionStats(): Promise<AdoptionStats> {
  const [github, npm, pypi, nuget] = (await Promise.all([
    getJson('https://api.github.com/repos/macalbert/envilder'),
    getJson('https://api.npmjs.org/downloads/point/last-month/envilder'),
    getJson('https://pypistats.org/api/packages/envilder/recent'),
    getJson(
      'https://azuresearch-usnc.nuget.org/query?q=packageid:Envilder&prerelease=true',
    ),
  ])) as [
    { stargazers_count?: unknown } | null,
    { downloads?: unknown } | null,
    { data?: { last_month?: unknown } } | null,
    { data?: { totalDownloads?: unknown }[] } | null,
  ];

  return {
    githubStars: pickNumber(github?.stargazers_count),
    npmLastMonth: pickNumber(npm?.downloads),
    pypiLastMonth: pickNumber(pypi?.data?.last_month),
    nugetTotal: pickNumber(nuget?.data?.[0]?.totalDownloads),
  };
}

let cached: Promise<AdoptionStats> | undefined;

/** Shared across every page of one build, so each API is hit once. */
export function getAdoptionStats(): Promise<AdoptionStats> {
  cached ??= loadAdoptionStats();
  return cached;
}

export function formatCount(value: number, lang: string): string {
  return new Intl.NumberFormat(lang, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
