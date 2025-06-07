import { describe, expect, it } from 'vitest';
import { EnvilderBuilder } from '../../../src/cli/domain/EnvilderBuilder';

describe('EnvilderBuilder', () => {
  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Act
    const sut = EnvilderBuilder.build().withAwsProvider().create();

    // Assert
    expect(sut).toBeDefined();
    expect(typeof sut.run).toBe('function');
  });

  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Arrange
    const profile = 'default';

    // Act
    const actual = EnvilderBuilder.build().withAwsProvider(profile).create();

    // Assert
    expect(actual).toBeDefined();
    expect(typeof actual.run).toBe('function');
  });
});
