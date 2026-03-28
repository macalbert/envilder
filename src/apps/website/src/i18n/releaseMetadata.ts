/**
 * Single source of truth for release-specific facts displayed on the website.
 * Update this file when publishing a new version so all locale files stay in sync.
 */
export const releaseMetadata = {
  /** Shown next to the Azure provider card (e.g. "v0.8") */
  azureIntroVersion: 'v0.8',
  /** Latest featured release version label */
  releaseVersion: '0.8.0',
  /** ISO date of the featured release */
  releaseDate: '2026-03-22',
  /** Number of non-translatable highlight icons */
  highlightIcons: ['✨', '✨', '✨', '✨', '⚠️'] as const,
};
