import { describe, expect, it } from 'vitest';
import {
  DomainError,
  SsoSessionExpiredError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';

describe('SsoSessionExpiredError', () => {
  it('Should_IncludeProfileScopedLoginCommand_When_ProfileNameProvided', () => {
    // Arrange
    const profileName = 'my-profile';

    // Act
    const sut = new SsoSessionExpiredError(profileName);

    // Assert
    expect(sut.message).toContain('aws sso login --profile my-profile');
  });

  it('Should_IncludeBareLoginCommand_When_ProfileNameAbsent', () => {
    // Act
    const sut = new SsoSessionExpiredError();

    // Assert
    expect(sut.message).toContain('aws sso login');
    expect(sut.message).not.toContain('--profile');
  });

  it('Should_ExposeProfileNameAndCause_When_Constructed', () => {
    // Arrange
    const cause = new Error('SSO token load failed');

    // Act
    const sut = new SsoSessionExpiredError('my-profile', cause);

    // Assert
    expect(sut).toBeInstanceOf(DomainError);
    expect(sut.profileName).toBe('my-profile');
    expect(sut.cause).toBe(cause);
  });
});
