import { describe, expect, it, vi } from 'vitest';
import { DependencyMissingError } from '../../../../src/envilder/domain/errors/DomainErrors.js';
import { createAzureSecretProvider } from '../../../../src/envilder/infrastructure/azure/AzureSecretProviderFactory.js';

vi.mock('@azure/identity', () => ({
  DefaultAzureCredential: class {},
}));

vi.mock('@azure/keyvault-secrets', () => ({
  SecretClient: class {},
}));

describe('createAzureSecretProvider', () => {
  it('Should_ThrowDependencyMissingError_When_VaultUrlMissing', () => {
    // Arrange
    const config = { provider: 'azure' };

    // Act
    const act = () => createAzureSecretProvider(config);

    // Assert
    expect(act).toThrowError(DependencyMissingError);
  });

  it('Should_ReturnAzureProvider_When_ValidConfigProvided', () => {
    // Arrange
    const config = {
      provider: 'azure',
      vaultUrl: 'https://my-vault.vault.azure.net',
    };

    // Act
    const result = createAzureSecretProvider(config);

    // Assert
    expect(result).toBeDefined();
  });
});
