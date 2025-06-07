import { describe, expect, it } from 'vitest';
import { EnvilderBuilder } from '../../../src/cli/domain/EnvilderBuilder';

describe('EnvilderBuilder', () => {
  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Act
    const sut = EnvilderBuilder.build()
      .withDefaultFileManager()
      .withAwsProvider()
      .create();

    // Assert
    expect(sut).toBeDefined();
    expect(typeof sut.run).toBe('function');
  });

  it('Should_ReturnInstance_When_DefaultProfileIsProvided', () => {
    // Arrange
    const profile = 'default';

    // Act
    const actual = EnvilderBuilder.build()
      .withDefaultFileManager()
      .withAwsProvider(profile)
      .create();

    // Assert
    expect(actual).toBeDefined();
    expect(typeof actual.run).toBe('function');
  });

  it('Should_NotThrowError_When_InvalidCustomProfileIsProvided', () => {
    // Arrange
    const invalidProfile = 'non-existent-profile';

    // Act
    const action = EnvilderBuilder.build()
      .withDefaultFileManager()
      .withAwsProvider(invalidProfile);

    // Assert
    expect(() => action.create()).not.toThrow();
  });
});
