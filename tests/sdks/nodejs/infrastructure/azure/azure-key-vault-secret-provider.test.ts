import { describe, expect, it, vi } from 'vitest';
import { AzureKeyVaultSecretProvider } from '../../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';

describe('AzureKeyVaultSecretProvider', () => {
  it('Should_ReturnValues_When_SecretsExist', async () => {
    // Arrange
    const mockGetSecret = vi.fn().mockImplementation(async (name: string) => ({
      value: name === 'db-url' ? 'postgres://localhost' : 'sk-123',
    }));
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets(['db-url', 'api-key']);

    // Assert
    expect(actual.get('db-url')).toBe('postgres://localhost');
    expect(actual.get('api-key')).toBe('sk-123');
    expect(actual.size).toBe(2);
  });

  it('Should_OmitMissing_When_SecretNotFound', async () => {
    // Arrange
    const mockGetSecret = vi.fn().mockImplementation(async (name: string) => {
      if (name === 'missing') {
        throw Object.assign(new Error('Not found'), { statusCode: 404 });
      }
      return { value: 'found-value' };
    });
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets(['db-url', 'missing']);

    // Assert
    expect(actual.get('db-url')).toBe('found-value');
    expect(actual.has('missing')).toBe(false);
    expect(actual.size).toBe(1);
  });

  it('Should_FetchInParallel_When_MultipleNames', async () => {
    // Arrange
    const mockGetSecret = vi.fn().mockImplementation(async (name: string) => {
      return { value: `value-${name}` };
    });
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    await sut.getSecrets(['a', 'b', 'c']);

    // Assert
    expect(mockGetSecret).toHaveBeenCalledTimes(3);
  });

  it('Should_ReturnEmptyMap_When_NamesIsEmpty', async () => {
    // Arrange
    const mockClient = { getSecret: vi.fn() };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets([]);

    // Assert
    expect(actual.size).toBe(0);
    expect(mockClient.getSecret).not.toHaveBeenCalled();
  });

  it('Should_ThrowError_When_SecretClientIsNull', () => {
    // Act
    const act = () => new AzureKeyVaultSecretProvider(null);

    // Assert
    expect(act).toThrow('secretClient cannot be null');
  });

  it('Should_ThrowError_When_AnyNameIsEmpty', async () => {
    // Arrange
    const mockClient = { getSecret: vi.fn() };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const act = sut.getSecrets(['valid-name', '']);

    // Assert
    await expect(act).rejects.toThrow('Secret name cannot be null or empty');
  });

  it('Should_RethrowError_When_UnexpectedAzureError', async () => {
    // Arrange
    const error = Object.assign(new Error('Forbidden'), {
      statusCode: 403,
    });
    const mockGetSecret = vi.fn().mockRejectedValue(error);
    const mockClient = { getSecret: mockGetSecret };
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const act = sut.getSecrets(['db-url']);

    // Assert
    await expect(act).rejects.toThrow('Forbidden');
  });
});
