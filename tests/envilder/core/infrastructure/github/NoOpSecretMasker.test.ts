import { describe, expect, it } from 'vitest';
import { NoOpSecretMasker } from '../../../../../src/envilder/core/infrastructure/github/NoOpSecretMasker';

describe('NoOpSecretMasker', () => {
  it('Should_ResolveFlush_When_NothingWasRegistered', async () => {
    // Arrange
    const sut = new NoOpSecretMasker();
    sut.mask('ignored-value');

    // Act
    const actual = sut.flush();

    // Assert
    await expect(actual).resolves.toBeUndefined();
  });
});
