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

    // Act & Assert
    expect(() => validateSecrets(secrets)).not.toThrow();
  });

  it('Should_ThrowError_When_DictionaryIsEmpty', () => {
    // Arrange
    const secrets = new Map<string, string>();

    // Act & Assert
    expect(() => validateSecrets(secrets)).toThrow(SecretValidationError);
    expect(() => validateSecrets(secrets)).toThrow('No secrets were resolved');
  });

  it('Should_ThrowError_When_ValueIsEmpty', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', ''],
      ['API_KEY', 'sk-123'],
    ]);

    // Act & Assert
    expect(() => validateSecrets(secrets)).toThrow(SecretValidationError);
  });

  it('Should_ThrowError_When_ValueIsWhitespace', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', '   '],
      ['API_KEY', 'sk-123'],
    ]);

    // Act & Assert
    expect(() => validateSecrets(secrets)).toThrow(SecretValidationError);
  });

  it('Should_ReportMissingKeys_When_MultipleEmpty', () => {
    // Arrange
    const secrets = new Map([
      ['DB_URL', ''],
      ['API_KEY', ''],
      ['VALID', 'ok'],
    ]);

    // Act
    let error: SecretValidationError | undefined;
    try {
      validateSecrets(secrets);
    } catch (e) {
      error = e as SecretValidationError;
    }

    // Assert
    expect(error).toBeInstanceOf(SecretValidationError);
    expect(error!.missingKeys).toContain('DB_URL');
    expect(error!.missingKeys).toContain('API_KEY');
    expect(error!.missingKeys).not.toContain('VALID');
  });
});
