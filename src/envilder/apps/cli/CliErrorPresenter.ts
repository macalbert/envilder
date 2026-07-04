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

function gameOver(title: string): string {
  return pc.bold(pc.red(`\u{1F4A5} GAME OVER \u2014 ${title}`));
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
  ].join('\n');
}

function renderFallback(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return [
    gameOver('you fell down the wrong pipe!'),
    '',
    `  ${pc.dim(message)}`,
  ].join('\n');
}
