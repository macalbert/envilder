import pc from 'picocolors';
import {
  ExpiredCredentialsError,
  SsoSessionExpiredError,
} from '../../core/domain/errors/DomainErrors.js';

export function presentError(error: unknown): string {
  if (error instanceof SsoSessionExpiredError) {
    return renderSsoSessionExpired(error);
  }
  if (error instanceof ExpiredCredentialsError) {
    return renderExpiredCredentials();
  }
  return renderFallback(error);
}

function renderSsoSessionExpired(error: SsoSessionExpiredError): string {
  const body = error.profileName
    ? `Your AWS SSO session for profile "${pc.magenta(error.profileName)}" is missing or has expired.`
    : 'Your AWS SSO session is missing or has expired.';
  const command = error.profileName
    ? `aws sso login --profile ${error.profileName}`
    : 'aws sso login';

  return [
    pc.bold(pc.red('✖ SSO session expired')),
    '',
    `  ${body}`,
    '',
    `  ${pc.bold('How to fix:')}`,
    `  ${pc.dim('→ ')}${pc.cyan(command)}`,
    `  ${pc.dim('then re-run your envilder command.')}`,
  ].join('\n');
}

function renderExpiredCredentials(): string {
  return [
    pc.bold(pc.red('✖ AWS credentials expired')),
    '',
    '  Your security token or session is no longer valid.',
    '',
    `  ${pc.bold('How to fix:')}`,
    `  ${pc.dim('→ ')}Refresh your credentials and retry (for SSO: aws sso login).`,
  ].join('\n');
}

function renderFallback(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return [
    '🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥',
    message,
  ].join('\n');
}
