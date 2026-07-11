import { describe, expect, it } from 'vitest';
import { isSsoSessionExpiredError } from '../../../../../src/envilder/core/infrastructure/aws/isSsoSessionExpiredError';

describe('isSsoSessionExpiredError', () => {
  it('Should_ReturnTrue_When_ErrorNameIsTokenProviderError', () => {
    // Arrange
    const error = Object.assign(new Error('sso resolution failed'), {
      name: 'TokenProviderError',
    });

    // Act
    const actual = isSsoSessionExpiredError(error);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_ReturnFalse_When_ErrorNameIsExpiredToken', () => {
    // Arrange
    const error = Object.assign(new Error('security token expired'), {
      name: 'ExpiredToken',
    });

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
