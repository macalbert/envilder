import { describe, expect, it } from 'vitest';
import { isExpiredCredentialsError } from '../../../../src/sdks/nodejs/src/domain/expired-credentials-error.js';

describe('isExpiredCredentialsError', () => {
  it('Should_ReturnTrue_When_ErrorNameIsExpiredToken', () => {
    // Arrange
    const error = Object.assign(new Error('sts'), { name: 'ExpiredToken' });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_ReturnTrue_When_ErrorNameIsExpiredTokenException', () => {
    // Arrange
    const error = Object.assign(new Error('sts'), {
      name: 'ExpiredTokenException',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_ReturnFalse_When_ErrorNameIsTokenProviderError', () => {
    // Arrange
    const error = Object.assign(new Error('sso'), {
      name: 'TokenProviderError',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_ReturnFalse_When_ErrorNameIsTokenRefreshRequired', () => {
    // Arrange
    const error = Object.assign(new Error('sso'), {
      name: 'TokenRefreshRequired',
    });

    // Act
    const actual = isExpiredCredentialsError(error);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_ReturnFalse_When_ErrorIsNotAnObject', () => {
    // Act
    const actual = isExpiredCredentialsError('not-an-error');

    // Assert
    expect(actual).toBe(false);
  });
});
