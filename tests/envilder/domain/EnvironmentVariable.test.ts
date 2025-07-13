import { describe, expect, it } from 'vitest';
import { EnvironmentVariable } from '../../../src/envilder/domain/EnvironmentVariable';

describe('EnvironmentVariable', () => {
  it('Should_CreateEnvironmentVariable_When_ValidInputsProvided', () => {
    // Arrange
    const name = 'TEST_VAR';
    const value = 'test-value';

    // Act
    const sut = new EnvironmentVariable(name, value);

    // Assert
    expect(sut.name).toBe(name);
    expect(sut.value).toBe(value);
    expect(sut.isSecret).toBe(false);
  });

  it('Should_MarkAsSecret_When_IsSecretFlagIsTrue', () => {
    // Arrange
    const name = 'SECRET_VAR';
    const value = 'super-secret-value';

    // Act
    const sut = new EnvironmentVariable(name, value, true);

    // Assert
    expect(sut.isSecret).toBe(true);
    expect(sut.maskedValue).toBe('***************lue');
  });

  it('Should_MaskSecretValuesProperly_When_ValueIsSensitive', () => {
    // Arrange
    const shortSecret = new EnvironmentVariable('SHORT', '1234', true);
    const longSecret = new EnvironmentVariable(
      'LONG',
      '1234567890abcdef',
      true,
    );

    // Act
    const shortMasked = shortSecret.maskedValue;
    const longMasked = longSecret.maskedValue;

    // Assert
    expect(shortMasked).toBe('****');
    expect(longMasked).toBe('*************def');
  });

  it('Should_ThrowError_When_NameIsEmpty', () => {
    // Arrange
    const emptyName = '';
    const whitespaceOnlyName = '   ';
    const value = 'value';

    // Act
    const createWithEmptyName = () => new EnvironmentVariable(emptyName, value);
    const createWithWhitespaceName = () =>
      new EnvironmentVariable(whitespaceOnlyName, value);

    // Assert
    expect(createWithEmptyName).toThrow(
      'Environment variable name cannot be empty',
    );
    expect(createWithWhitespaceName).toThrow(
      'Environment variable name cannot be empty',
    );
  });

  it('Should_ThrowError_When_ValueIsNullOrUndefined', () => {
    // Arrange
    const name = 'NAME';
    const nullValue = null as unknown as string;
    const undefinedValue = undefined as unknown as string;

    // Act
    const createWithNullValue = () => new EnvironmentVariable(name, nullValue);
    const createWithUndefinedValue = () =>
      new EnvironmentVariable(name, undefinedValue);

    // Assert
    expect(createWithNullValue).toThrow(
      'Value for environment variable NAME cannot be null or undefined',
    );
    expect(createWithUndefinedValue).toThrow(
      'Value for environment variable NAME cannot be null or undefined',
    );
  });
});
