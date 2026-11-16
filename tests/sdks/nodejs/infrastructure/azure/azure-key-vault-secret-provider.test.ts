import type { SecretClient } from '@azure/keyvault-secrets';
import { describe, expect, it, vi } from 'vitest';
import { AzureKeyVaultSecretProvider } from '../../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';

describe('AzureKeyVaultSecretProvider', () => {
  it('Should_ReturnValues_When_SecretsExist', async () => {
    // Arrange
    const mockGetSecret = vi.fn().mockImplementation(async (name: string) => ({
      value: name === 'db-url' ? 'postgres://localhost' : 'sk-123',
    }));
    const mockClient = {
      getSecret: mockGetSecret,
    } as unknown as SecretClient;
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets(['db-url', 'api-key']);

    // Assert
    expect(actual.get('db-url')).toBe('postgres://localhost');
    expect(actual.get('api-key')).toBe('sk-123');
    expect(actual.size).toBe(2);
  });

  it('Should_FetchHyphenatedName_When_ReferenceHasSlashes', async () => {
    // Arrange
    const mockGetSecret = vi.fn().mockResolvedValue({ value: 'fictional' });
    const mockClient = {
      getSecret: mockGetSecret,
    } as unknown as SecretClient;
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets([
      '/myapp/db/password',
      'Database--Password',
    ]);

    // Assert
    expect(mockGetSecret).toHaveBeenCalledWith('myapp-db-password');
    expect(mockGetSecret).toHaveBeenCalledWith('Database--Password');
    expect([...actual.keys()]).toEqual([
      '/myapp/db/password',
      'Database--Password',
    ]);
  });

  it('Should_OmitMissing_When_SecretNotFound', async () => {
    // Arrange
    const mockGetSecret = vi
      .fn()
      .mockResolvedValueOnce({ value: 'found-value' }) // db-url
      .mockRejectedValueOnce(
        Object.assign(new Error('Not found'), { statusCode: 404 }),
      ); // missing
    const mockClient = {
      getSecret: mockGetSecret,
    } as unknown as SecretClient;
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
    const mockClient = {
      getSecret: mockGetSecret,
    } as unknown as SecretClient;
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    await sut.getSecrets(['a', 'b', 'c']);

    // Assert
    expect(mockGetSecret).toHaveBeenCalledTimes(3);
  });

  it('Should_ReturnEmptyMap_When_NamesIsEmpty', async () => {
    // Arrange
    const mockClient = { getSecret: vi.fn() } as unknown as SecretClient;
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets([]);

    // Assert
    expect(actual.size).toBe(0);
    expect(mockClient.getSecret).not.toHaveBeenCalled();
  });

  it('Should_ThrowError_When_SecretClientIsNull', () => {
    // Act
    const act = () =>
      new AzureKeyVaultSecretProvider(null as unknown as SecretClient);

    // Assert
    expect(act).toThrow('secretClient cannot be null');
  });

  it('Should_ThrowError_When_AnyNameIsEmpty', async () => {
    // Arrange
    const mockClient = { getSecret: vi.fn() } as unknown as SecretClient;
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
    const mockClient = {
      getSecret: mockGetSecret,
    } as unknown as SecretClient;
    const sut = new AzureKeyVaultSecretProvider(mockClient);

    // Act
    const act = sut.getSecrets(['db-url']);

    // Assert
    await expect(act).rejects.toThrow('Forbidden');
  });

  describe('checkSecretsExist', () => {
    function clientListing(
      secrets: Array<{ name: string; enabled?: boolean }>,
    ): SecretClient {
      return {
        listPropertiesOfSecrets: vi.fn(async function* () {
          yield* secrets;
        }),
        getSecret: vi.fn(),
      } as unknown as SecretClient;
    }

    it('Should_MatchIgnoringCaseWithoutReadingValues_When_ListingSecrets', async () => {
      // Arrange
      const client = clientListing([
        { name: 'MyApp-Db-Password', enabled: true },
        { name: 'api-key' },
      ]);
      const sut = new AzureKeyVaultSecretProvider(client);

      // Act
      const actual = await sut.checkSecretsExist([
        '/myapp/db/password',
        'api-key',
        'missing-key',
      ]);

      // Assert
      expect(actual).toEqual(
        new Map([
          ['/myapp/db/password', { status: 'exists' }],
          ['api-key', { status: 'exists' }],
          ['missing-key', { status: 'missing' }],
        ]),
      );
      expect(client.listPropertiesOfSecrets).toHaveBeenCalledTimes(1);
      expect(client.getSecret).not.toHaveBeenCalled();
    });

    it('Should_ReportMissing_When_SecretIsDisabled', async () => {
      // Arrange
      const sut = new AzureKeyVaultSecretProvider(
        clientListing([{ name: 'api-key', enabled: false }]),
      );

      // Act
      const actual = await sut.checkSecretsExist(['api-key']);

      // Assert
      expect(actual.get('api-key')).toEqual({ status: 'missing' });
    });

    it.each([
      [{ statusCode: 403 }, 'access_denied'],
      [{ statusCode: 401 }, 'authentication_failed'],
      [{ name: 'CredentialUnavailableError' }, 'authentication_failed'],
      [{ statusCode: 500 }, 'provider_error'],
    ])(
      'Should_MapListingErrorToStatus_When_ListingFails %#',
      async (fields, status) => {
        // Arrange
        const error = Object.assign(new Error('listing failed'), fields);
        const client = {
          // biome-ignore lint/correctness/useYield: fails before yielding
          listPropertiesOfSecrets: vi.fn(async function* () {
            throw error;
          }),
        } as unknown as SecretClient;
        const sut = new AzureKeyVaultSecretProvider(client);

        // Act
        const actual = await sut.checkSecretsExist(['a', 'b']);

        // Assert
        expect(actual.get('a')).toEqual({ status, reason: 'listing failed' });
        expect(actual.get('b')).toEqual({ status, reason: 'listing failed' });
      },
    );

    it('Should_NotCallProvider_When_NoNames', async () => {
      // Arrange
      const client = clientListing([]);
      const sut = new AzureKeyVaultSecretProvider(client);

      // Act
      const actual = await sut.checkSecretsExist([]);

      // Assert
      expect(actual.size).toBe(0);
      expect(client.listPropertiesOfSecrets).not.toHaveBeenCalled();
    });
  });
});
