import { describe, it, expect } from 'vitest';
import { createEnvilder } from '../../../src/cli/domain/EnvilderFactory';

describe('EnvilderFactory', () => {
  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Act
    const sut = createEnvilder();

    // Assert
    expect(sut).toBeDefined();
    expect(typeof sut.run).toBe('function');
  });

  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Arrange
    const profile = 'default';

    // Act
    const actual = createEnvilder(profile);

    // Assert
    expect(actual).toBeDefined();
    expect(typeof actual.run).toBe('function');
  });
});
