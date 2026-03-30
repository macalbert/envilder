import { describe, expect, it } from 'vitest';
import { InvalidArgumentError } from '../../../../../src/envilder/core/domain/errors/DomainErrors.js';
import { validateAzureVaultUrl } from '../../../../../src/envilder/core/infrastructure/azure/AzureVaultUrlValidator.js';

describe('validateAzureVaultUrl', () => {
  it('Should_ThrowInvalidArgumentError_When_VaultUrlIsInvalid', () => {
    // Arrange
    const invalidUrl = 'not-a-url';
    const allowedHosts = ['.vault.azure.net'];

    // Act
    const act = () => validateAzureVaultUrl(invalidUrl, allowedHosts);

    // Assert
    expect(act).toThrowError(InvalidArgumentError);
  });

  it('Should_ThrowInvalidArgumentError_When_VaultUrlUsesNonHttpsProtocol', () => {
    // Arrange
    const httpUrl = 'http://my-vault.vault.azure.net';
    const allowedHosts = ['.vault.azure.net'];

    // Act
    const act = () => validateAzureVaultUrl(httpUrl, allowedHosts);

    // Assert
    expect(act).toThrowError(InvalidArgumentError);
    expect(act).toThrowError('https://');
  });

  it('Should_ThrowInvalidArgumentError_When_VaultUrlHostnameNotAllowed', () => {
    // Arrange
    const evilUrl = 'https://evil.attacker.com';
    const allowedHosts = ['.vault.azure.net'];

    // Act
    const act = () => validateAzureVaultUrl(evilUrl, allowedHosts);

    // Assert
    expect(act).toThrowError(InvalidArgumentError);
    expect(act).toThrowError('hostname must end with');
  });

  it('Should_AcceptVaultUrl_When_HostnameMatchesAllowedSuffix', () => {
    // Arrange
    const validUrl = 'https://my-vault.vault.azure.net';
    const allowedHosts = ['.vault.azure.net'];

    // Act
    const act = () => validateAzureVaultUrl(validUrl, allowedHosts);

    // Assert
    expect(act).not.toThrow();
  });
});
