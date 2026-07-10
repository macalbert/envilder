import { SecretsFetchError } from '../../../core/domain/errors/DomainErrors.js';

/**
 * Renders an error into log lines for the GitHub Action, keeping the
 * retro-arcade tone used across Envilder's failure messages. Returns
 * one entry per log line so the caller can emit each via `ILogger.error`.
 */
export function presentGhaError(error: unknown): string[] {
  if (error instanceof SecretsFetchError) {
    return renderSecretsFetchError(error);
  }
  return renderFallback(error);
}

function renderSecretsFetchError(error: SecretsFetchError): string[] {
  const failureLines = error.failures.map(
    (failure) => `  \u2717 ${failure.envVar} \u2192 ${failure.path}`,
  );
  const reasons = [...new Set(error.failures.map((failure) => failure.reason))];

  return [
    '\u{1F4A5} GAME OVER \u2014 some secrets could not be fetched',
    ...failureLines,
    '',
    '\u2B50 WHY?',
    ...reasons.map((reason) => `   ${reason}`),
  ];
}

function renderFallback(error: unknown): string[] {
  const message = error instanceof Error ? error.message : String(error);
  return [
    '\u{1F6A8} GAME OVER \u2014 fell down the wrong pipe! \u{1F344}\u{1F4A5}',
    message,
  ];
}
