import { describe, expect, it } from 'vitest';
import {
  SecretValidationError,
  validateSecrets,
} from '../../../../src/sdks/typescript/src/application/secret-validation.js';

describe('validateSecrets', () => {
  it('Should_Pass_When_AllSecretsPresent', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', 'postgres://localhost'],
      ['API_KEY', 'sk-123'],
    ]);

    // Act
    const act = () => validateSecrets(secrets);

    // Assert
    expect(act).not.toThrow();
  });

  it('Should_ThrowError_When_DictionaryIsEmpty', () => {
    // Arrange
    const secrets = new Map<string, string>();

    // Act
    const act = () => validateSecrets(secrets);

    // Assert
    expect(act).toThrow(SecretValidationError);
    expect(act).toThrow('No secrets were resolved');
  });

  it('Should_ThrowError_When_ValueIsEmpty', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', ''],
      ['API_KEY', 'sk-123'],
    ]);

    // Act
    const act = () => validateSecrets(secrets);

    // Assert
    expect(act).toThrow(SecretValidationError);
  });

  it('Should_ThrowError_When_ValueIsWhitespace', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', '   '],
      ['API_KEY', 'sk-123'],
    ]);

    // Act
    const act = () => validateSecrets(secrets);

    // Assert
    expect(act).toThrow(SecretValidationError);
  });

  it('Should_ReportMissingKeys_When_MultipleEmpty', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', ''],
      ['API_KEY', ''],
      ['VALID', 'ok'],
    ]);

    // Act
    const act = () => validateSecrets(secrets);

    // Assert
    expect(act).toThrow(SecretValidationError);
    expect(act).toThrow(
      'The following secrets have empty or missing values: DB_URL, API_KEY',
    );
  });
});
