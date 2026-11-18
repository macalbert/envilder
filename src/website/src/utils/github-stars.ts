/**
 * GitHub star count for the repository, read once per build. Any failure
 * (offline, rate limited, timeout, unexpected payload) yields null so a build
 * never fails and the header link simply renders without a count.
 */
const REPOSITORY_API_URL = 'https://api.github.com/repos/macalbert/envilder';
const TIMEOUT_MS = 3000;

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export async function fetchStarCount(
  fetcher: Fetcher = fetch,
  token: string | undefined = process.env.GITHUB_TOKEN,
): Promise<number | null> {
  try {
    const response = await fetcher(REPOSITORY_API_URL, {
      headers: {
        'User-Agent': 'envilder-website-build',
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { stargazers_count?: unknown };
    const count = body?.stargazers_count;

    return typeof count === 'number' && Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

let cached: Promise<number | null> | undefined;

/** Shared across every page of one build, so the API is hit once. */
export function getStarCount(): Promise<number | null> {
  cached ??= fetchStarCount();
  return cached;
}

export function formatStarCount(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}
