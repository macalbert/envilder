import { describe, it, expect } from 'vitest';
import { createEnvilderWithAwsSsm } from '../../../src/cli/domain/EnvilderFactory';

describe('EnvilderFactory', () => {
  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Act
    const sut = createEnvilderWithAwsSsm();

    // Assert
    expect(sut).toBeDefined();
    expect(typeof sut.run).toBe('function');
  });

  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Arrange
    const profile = 'default';

    // Act
    const actual = createEnvilderWithAwsSsm(profile);

    // Assert
    expect(actual).toBeDefined();
    expect(typeof actual.run).toBe('function');
  });
});
