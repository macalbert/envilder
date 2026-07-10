import { describe, expect, it } from 'vitest';
import { presentError } from '../../../../../src/envilder/apps/cli/errors/CliErrorPresenter';
import {
  ExpiredCredentialsError,
  SecretsFetchError,
  SsoSessionExpiredError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, '');
}

describe('CliErrorPresenter', () => {
  it('Should_RenderGameOverSsoBlockWithProfile_When_SsoSessionExpiredErrorHasProfile', () => {
    // Arrange
    const error = new SsoSessionExpiredError('dev');

    // Act
    const actual = stripAnsi(presentError(error));

    // Assert
    expect(actual).toContain('GAME OVER');
    expect(actual).toContain('SSO session expired');
    expect(actual).toContain(
      'Your AWS SSO session for profile "dev" ran out of lives.',
    );
    expect(actual).toContain('CONTINUE?');
    expect(actual).toContain('Run:  aws sso login --profile dev');
    expect(actual).toContain('then re-run your envilder command.');
  });

  it('Should_RenderGameOverSsoBlockWithoutProfile_When_SsoSessionExpiredErrorHasNoProfile', () => {
    // Arrange
    const error = new SsoSessionExpiredError();

    // Act
    const actual = stripAnsi(presentError(error));

    // Assert
    expect(actual).toContain('GAME OVER');
    expect(actual).toContain('SSO session expired');
    expect(actual).toContain('Your AWS SSO session ran out of lives.');
    expect(actual).toContain('Run:  aws sso login');
    expect(actual).not.toContain('--profile');
  });

  it('Should_RenderGameOverCredentialsBlock_When_ExpiredCredentialsError', () => {
    // Arrange
    const error = new ExpiredCredentialsError();

    // Act
    const actual = stripAnsi(presentError(error));

    // Assert
    expect(actual).toContain('GAME OVER');
    expect(actual).toContain('AWS credentials expired');
    expect(actual).toContain('Your security token ran out of time.');
    expect(actual).toContain('CONTINUE?');
    expect(actual).toContain(
      'Refresh your credentials and retry (for SSO: aws sso login).',
    );
  });

  it('Should_RenderWrongPipeFallback_When_GenericError', () => {
    // Arrange
    const error = new Error('boom');

    // Act
    const actual = stripAnsi(presentError(error));

    // Assert
    expect(actual).toContain('GAME OVER');
    expect(actual).toContain('you fell down the wrong pipe!');
    expect(actual).toContain('boom');
  });

  it('Should_RenderGameOverFetchBlock_When_SecretsFetchError', () => {
    // Arrange
    const error = new SecretsFetchError([
      {
        envVar: 'DB_URL',
        path: '/app/db/url',
        reason: 'ParameterNotFound: /app/db/url',
      },
      { envVar: 'API_KEY', path: '/app/api/key', reason: 'AccessDenied' },
    ]);

    // Act
    const actual = stripAnsi(presentError(error));

    // Assert
    expect(actual).toContain('GAME OVER');
    expect(actual).toContain('some secrets could not be fetched');
    expect(actual).toContain('DB_URL');
    expect(actual).toContain('/app/db/url');
    expect(actual).toContain('API_KEY');
    expect(actual).toContain('/app/api/key');
    expect(actual).toContain('WHY?');
    expect(actual).toContain('ParameterNotFound: /app/db/url');
    expect(actual).toContain('AccessDenied');
  });

  it('Should_ListEachDistinctReason_When_FailuresHaveDistinctReasons', () => {
    // Arrange
    const error = new SecretsFetchError([
      { envVar: 'A', path: '/a', reason: 'ParameterNotFound' },
      { envVar: 'B', path: '/b', reason: 'ParameterNotFound' },
      { envVar: 'C', path: '/c', reason: 'AccessDenied' },
    ]);

    // Act
    const actual = stripAnsi(presentError(error));

    // Assert
    expect(actual.split('ParameterNotFound').length - 1).toBe(1);
    expect(actual).toContain('AccessDenied');
  });

  it('Should_HighlightReasonInRed_When_ReasonIsAccessDenied', () => {
    // Arrange
    const error = new SecretsFetchError([
      { envVar: 'API_KEY', path: '/app/api/key', reason: 'AccessDenied' },
    ]);

    // Act
    const actual = presentError(error);

    // Assert
    expect(actual).toContain(`${String.fromCharCode(27)}[31m`);
    expect(stripAnsi(actual)).toContain('AccessDenied');
  });

  it('Should_NotHighlightReasonInRed_When_ReasonIsNotAccessDenied', () => {
    // Arrange
    const error = new SecretsFetchError([
      { envVar: 'DB_URL', path: '/app/db/url', reason: 'ParameterNotFound' },
    ]);

    // Act
    const actual = presentError(error);
    const reasonLine = actual
      .split('\n')
      .find((line) => stripAnsi(line).includes('ParameterNotFound'));

    // Assert
    expect(reasonLine).not.toContain(`${String.fromCharCode(27)}[31m`);
  });
});
