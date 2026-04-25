import { describe, expect, it, vi } from 'vitest';
import { AzureKeyVaultSecretProvider } from '../../../../../src/sdks/typescript/src/infrastructure/azure/azure-key-vault-secret-provider.js';

describe('AzureKeyVaultSecretProvider', () => {
  it('Should_ReturnValue_When_SecretExists', async () => {
    // Arrange
    const mockGetSecret = vi.fn().mockResolvedValue({
      value: 'my-secret-value',
    });
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecret('db-url');

    // Assert
    expect(actual).toBe('my-secret-value');
  });

  it('Should_ReturnNull_When_SecretNotFound', async () => {
    // Arrange
    const error = Object.assign(new Error('Not found'), {
      statusCode: 404,
    });
    const mockGetSecret = vi.fn().mockRejectedValue(error);
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecret('missing-secret');

    // Assert
    expect(actual).toBeNull();
  });

  it('Should_ThrowError_When_SecretClientIsNull', () => {
    // Act & Assert
    expect(() => new AzureKeyVaultSecretProvider(null)).toThrow(
      'secretClient cannot be null',
    );
  });

  it('Should_ThrowError_When_NameIsEmpty', async () => {
    // Arrange
    const mockClient = { getSecret: vi.fn() };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act & Assert
    await expect(sut.getSecret('')).rejects.toThrow(
      'Secret name cannot be null or empty',
    );
  });

  it('Should_RethrowError_When_UnexpectedAzureError', async () => {
    // Arrange
    const error = Object.assign(new Error('Forbidden'), {
      statusCode: 403,
    });
    const mockGetSecret = vi.fn().mockRejectedValue(error);
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act & Assert
    await expect(sut.getSecret('db-url')).rejects.toThrow('Forbidden');
  });
});
