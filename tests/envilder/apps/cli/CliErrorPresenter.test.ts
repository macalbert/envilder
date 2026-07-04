import { describe, expect, it } from 'vitest';
import { presentError } from '../../../../src/envilder/apps/cli/CliErrorPresenter';
import {
  ExpiredCredentialsError,
  SsoSessionExpiredError,
} from '../../../../src/envilder/core/domain/errors/DomainErrors';

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
});
