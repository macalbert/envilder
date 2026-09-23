import pc from 'picocolors';
import {
  ExpiredCredentialsError,
  SecretsFetchError,
  SsoSessionExpiredError,
} from '../../../core/domain/errors/DomainErrors.js';
import { describeError } from '../../../core/infrastructure/describeError.js';

export function presentError(error: unknown): string {
  if (error instanceof SsoSessionExpiredError) {
    return renderSsoSessionExpired(error);
  }
  if (error instanceof ExpiredCredentialsError) {
    return renderExpiredCredentials();
  }
  if (error instanceof SecretsFetchError) {
    return renderSecretsFetchError(error);
  }
  return renderFallback(error);
}

function gameOver(title: string): string {
  return `\n${pc.bold(pc.red(`\u{1F4A5} GAME OVER \u2014 ${title}`))}`;
}

function renderSsoSessionExpired(error: SsoSessionExpiredError): string {
  const body = error.profileName
    ? `  ${pc.dim('Your AWS SSO session for profile ')}${pc.magenta(`"${error.profileName}"`)}${pc.dim(' ran out of lives.')}`
    : `  ${pc.dim('Your AWS SSO session ran out of lives.')}`;
  const command = error.profileName
    ? `aws sso login --profile ${error.profileName}`
    : 'aws sso login';

  return [
    gameOver('SSO session expired'),
    '',
    body,
    '',
    `  ${pc.bold(pc.yellow('\u2B95 CONTINUE?'))}`,
    `  ${pc.dim('   Run:  ')}${pc.cyan(command)}`,
    `  ${pc.dim('   then re-run your envilder command.')}`,
    '',
  ].join('\n');
}

function renderExpiredCredentials(): string {
  return [
    gameOver('AWS credentials expired'),
    '',
    `  ${pc.dim('Your security token ran out of time.')}`,
    '',
    `  ${pc.bold(pc.yellow('\u2B95 CONTINUE?'))}`,
    `  ${pc.dim('   Refresh your credentials and retry ')}${pc.dim('(for SSO: ')}${pc.cyan('aws sso login')}${pc.dim(').')}`,
    '',
  ].join('\n');
}

function renderFallback(error: unknown): string {
  const message = describeError(error);
  return [
    gameOver('you fell down the wrong pipe!'),
    '',
    `  ${pc.dim(message)}`,
    '',
  ].join('\n');
}

const ACCESS_DENIED_PATTERN = /access.?denied|not authorized|forbidden/i;

function isAccessDeniedReason(reason: string): boolean {
  return ACCESS_DENIED_PATTERN.test(reason);
}

function renderSecretsFetchError(error: SecretsFetchError): string {
  const rule = pc.red('\u2501'.repeat(60));
  const failureLines = error.failures.map(
    (failure) =>
      `  ${pc.red('\u2717 ')}${pc.bold(failure.envVar.padEnd(20))}${pc.dim('\u2192 ')}${pc.dim(failure.path)}`,
  );
  const reasons = [...new Set(error.failures.map((failure) => failure.reason))];
  const reasonLines = reasons.map((reason) =>
    isAccessDeniedReason(reason)
      ? `     ${pc.bold(pc.red(reason))}`
      : `     ${pc.dim(reason)}`,
  );
  return [
    gameOver('some secrets could not be fetched'),
    rule,
    ...failureLines,
    '',
    `  ${pc.bold(pc.yellow('\u2B95 WHY?'))}`,
    ...reasonLines,
    '',
  ].join('\n');
}
