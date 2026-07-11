import { describe, expect, it } from 'vitest';
import {
  isSsoSessionExpiredError,
  SsoSessionExpiredError,
} from '../../../../src/sdks/nodejs/src/domain/sso-session-expired-error.js';

describe('SsoSessionExpiredError', () => {
  it('Should_IncludeProfileScopedLoginHint_When_ProfileNameProvided', () => {
    // Arrange
    const profileName = 'staging';

    // Act
    const actual = new SsoSessionExpiredError(profileName);

    // Assert
    expect(actual.message).toContain('aws sso login --profile staging');
  });

  it('Should_IncludeBareLoginHint_When_ProfileNameMissing', () => {
    // Act
    const actual = new SsoSessionExpiredError();

    // Assert
    expect(actual.message).toContain('aws sso login');
    expect(actual.message).not.toContain('--profile');
  });

  it('Should_StoreProfileName_When_ProfileNameProvided', () => {
    // Arrange
    const profileName = 'prod';

    // Act
    const actual = new SsoSessionExpiredError(profileName);

    // Assert
    expect(actual.profileName).toBe('prod');
  });

  it('Should_StoreCause_When_CauseProvided', () => {
    // Arrange
    const cause = new Error('underlying');

    // Act
    const actual = new SsoSessionExpiredError('prod', cause);

    // Assert
    expect(actual.cause).toBe(cause);
  });

  it('Should_SetErrorName_When_Constructed', () => {
    // Act
    const actual = new SsoSessionExpiredError();

    // Assert
    expect(actual.name).toBe('SsoSessionExpiredError');
  });
});

describe('isSsoSessionExpiredError', () => {
  it('Should_ReturnTrue_When_ErrorNameIsTokenProviderError', () => {
    // Arrange
    const error = Object.assign(new Error('sso'), {
      name: 'TokenProviderError',
    });

    // Act
    const actual = isSsoSessionExpiredError(error);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_ReturnFalse_When_ErrorNameIsExpiredToken', () => {
    // Arrange
    const error = Object.assign(new Error('sts'), { name: 'ExpiredToken' });

    // Act
    const actual = isSsoSessionExpiredError(error);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_ReturnFalse_When_ErrorIsNotAnObject', () => {
    // Act
    const actual = isSsoSessionExpiredError('not-an-error');

    // Assert
    expect(actual).toBe(false);
  });
});
