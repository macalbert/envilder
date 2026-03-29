/**
 * Single source of truth for release-specific facts displayed on the website.
 * Update this file when publishing a new version so all locale files stay in sync.
 */
export const releaseMetadata = {
  /** Latest featured release version label */
  releaseVersion: __APP_VERSION__,
  /** ISO date of the featured release */
  releaseDate: '2026-03-22',
  /** Number of non-translatable highlight icons */
  highlightIcons: ['✨', '✨', '✨', '✨', '⚠️'] as const,
};
