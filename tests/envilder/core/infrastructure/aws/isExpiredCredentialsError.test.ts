import { describe, expect, it } from 'vitest';
import { isExpiredCredentialsError } from '../../../../../src/envilder/core/infrastructure/aws/isExpiredCredentialsError';

describe('isExpiredCredentialsError', () => {
  it('Should_ReturnTrue_When_ErrorNameIsExpiredToken', () => {
    // Arrange
    const error = Object.assign(new Error('security token expired'), {
      name: 'ExpiredToken',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_ReturnTrue_When_ErrorNameIsExpiredTokenException', () => {
    // Arrange
    const error = Object.assign(new Error('security token expired'), {
      name: 'ExpiredTokenException',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_ReturnFalse_When_ErrorNameIsTokenProviderError', () => {
    // Arrange
    const error = Object.assign(new Error('sso resolution failed'), {
      name: 'TokenProviderError',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_ReturnFalse_When_ErrorNameIsTokenRefreshRequired', () => {
    // Arrange
    const error = Object.assign(new Error('token refresh required'), {
      name: 'TokenRefreshRequired',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(false);
  });
});
