import type { SecretClient } from '@azure/keyvault-secrets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AzureKeyVaultSecretProvider } from '../../../../src/envilder/infrastructure/azure/AzureKeyVaultSecretProvider';

// Unit tests with mocks
describe('AzureKeyVaultSecretProvider (unit tests)', () => {
  let mockGetSecretFn: ReturnType<typeof vi.fn>;
  let mockSetSecretFn: ReturnType<typeof vi.fn>;
  let mockClient: SecretClient;
  let sut: AzureKeyVaultSecretProvider;

  beforeEach(() => {
    mockGetSecretFn = vi.fn();
    mockSetSecretFn = vi.fn();
    mockClient = {
      getSecret: mockGetSecretFn,
      setSecret: mockSetSecretFn,
    } as unknown as SecretClient;

    // Create the provider with the mock client
    sut = new AzureKeyVaultSecretProvider(mockClient);
  });

  describe('getSecret', () => {
    it('Should_ReturnValue_When_SecretExists', async () => {
      // Arrange
      const expectedValue = 'test-secret-value';
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'test-param',
        value: expectedValue,
      });

      // Act
      const actual = await sut.getSecret('test-param');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('test-param');
      expect(actual).toBe(expectedValue);
    });

    it('Should_NormalizeSecretName_When_NameContainsSlashes', async () => {
      // Arrange
      const expectedValue = 'test-value';
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'my-app-db-password',
        value: expectedValue,
      });

      // Act
      const actual = await sut.getSecret('/my-app/db/password');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-app-db-password');
      expect(actual).toBe(expectedValue);
    });

    it('Should_ReturnUndefined_When_SecretNotFound', async () => {
      // Arrange
      const error = {
        statusCode: 404,
        message: 'Secret not found',
      };
      mockGetSecretFn.mockRejectedValueOnce(error);

      // Act
      const result = await sut.getSecret('non-existent-param');

      // Assert
      expect(result).toBeUndefined();
    });

    it('Should_ThrowError_When_OtherErrorOccurs', async () => {
      // Arrange
      const error = new Error('Network error');
      mockGetSecretFn.mockRejectedValueOnce(error);

      // Act
      const action = () => sut.getSecret('test-param');

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to get secret test-param: Network error',
      );
    });

    it('Should_HandleNonErrorObject_When_ErrorIsThrown', async () => {
      // Arrange
      mockGetSecretFn.mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.getSecret('test-param');

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to get secret test-param: String error',
      );
    });
  });

  describe('setSecret', () => {
    it('Should_CallSetSecret_When_SettingSecret', async () => {
      // Arrange
      mockSetSecretFn.mockResolvedValueOnce({
        name: 'test-param',
        value: 'test-value',
      });

      // Act
      await sut.setSecret('test-param', 'test-value');

      // Assert
      expect(mockSetSecretFn).toHaveBeenCalledWith('test-param', 'test-value');
    });

    it('Should_NormalizeSecretName_When_SettingSecret', async () => {
      // Arrange
      mockSetSecretFn.mockResolvedValueOnce({
        name: 'my-app-db-password',
        value: 'test-value',
      });

      // Act
      await sut.setSecret('/my-app/db/password', 'test-value');

      // Assert
      expect(mockSetSecretFn).toHaveBeenCalledWith(
        'my-app-db-password',
        'test-value',
      );
    });

    it('Should_PropagateError_When_SetSecretFails', async () => {
      // Arrange
      const error = new Error('Access denied');
      mockSetSecretFn.mockRejectedValueOnce(error);

      // Act
      const action = () => sut.setSecret('test-param', 'test-value');

      // Assert
      await expect(action()).rejects.toThrow('Access denied');
    });
  });

  describe('normalizeSecretName', () => {
    it('Should_ConvertSlashesToHyphens_When_NameContainsSlashes', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'my-app-db-password',
        value: 'test',
      });

      // Act
      await sut.getSecret('/my/app/db/password');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-app-db-password');
    });

    it('Should_ConvertUnderscoresToHyphens_When_NameContainsUnderscores', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'DB-PASSWORD',
        value: 'test',
      });

      // Act
      await sut.getSecret('DB_PASSWORD');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('DB-PASSWORD');
    });

    it('Should_RemoveInvalidCharacters_When_NameContainsSpecialChars', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'secret123',
        value: 'test',
      });

      // Act
      await sut.getSecret('secret@123!');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('secret123');
    });

    it('Should_PrependSecret_When_NameStartsWithNumber', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'secret-123-test',
        value: 'test',
      });

      // Act
      await sut.getSecret('123-test');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('secret-123-test');
    });

    it('Should_RemoveConsecutiveHyphens_When_NameHasMultipleHyphens', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'my-app-test',
        value: 'test',
      });

      // Act
      await sut.getSecret('my---app--test');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-app-test');
    });

    it('Should_TruncateLongNames_When_NameExceeds127Characters', async () => {
      // Arrange
      const longName = 'a'.repeat(200);
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'a'.repeat(127),
        value: 'test',
      });

      // Act
      await sut.getSecret(longName);

      // Assert
      const calledWith = mockGetSecretFn.mock.calls[0][0];
      expect(calledWith.length).toBeLessThanOrEqual(127);
    });

    it('Should_UseDefaultName_When_NameIsEmpty', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({
        name: 'secret',
        value: 'test',
      });

      // Act
      await sut.getSecret('///');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('secret');
    });
  });
});

// Integration tests with real Azure Key Vault (skipped if credentials not available)
describe.skipIf(!process.env.AZURE_KEY_VAULT_URL)(
  'AzureKeyVaultSecretProvider (integration with Azure Key Vault)',
  () => {
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL as string;
    const testSecretName = 'integration-test-secret';
    const testSecretValue = 'integration-test-value';
    const nonExistentSecret = 'non-existent-secret-xyz123';

    it('Should_StoreAndRetrieveSecret_When_UsingRealAzureKeyVault', async () => {
      // Arrange
      const { DefaultAzureCredential } = await import('@azure/identity');
      const { SecretClient } = await import('@azure/keyvault-secrets');
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(vaultUrl, credential);
      const sut = new AzureKeyVaultSecretProvider(client);

      // Act - Set secret
      await sut.setSecret(testSecretName, testSecretValue);

      // Act - Get secret
      const actual = await sut.getSecret(testSecretName);

      // Assert
      expect(actual).toBe(testSecretValue);
    }, 30000);

    it('Should_ReturnUndefined_When_SecretDoesNotExist', async () => {
      // Arrange
      const { DefaultAzureCredential } = await import('@azure/identity');
      const { SecretClient } = await import('@azure/keyvault-secrets');
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(vaultUrl, credential);
      const sut = new AzureKeyVaultSecretProvider(client);

      // Act
      const actual = await sut.getSecret(nonExistentSecret);

      // Assert
      expect(actual).toBeUndefined();
    }, 30000);

    it('Should_UpdateSecretValue_When_SecretAlreadyExists', async () => {
      // Arrange
      const { DefaultAzureCredential } = await import('@azure/identity');
      const { SecretClient } = await import('@azure/keyvault-secrets');
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(vaultUrl, credential);
      const sut = new AzureKeyVaultSecretProvider(client);
      const initialValue = 'initial-value';
      const updatedValue = 'updated-value';

      // Setup initial value
      await sut.setSecret(testSecretName, initialValue);

      // Act
      await sut.setSecret(testSecretName, updatedValue);

      // Get the updated value
      const actual = await sut.getSecret(testSecretName);

      // Assert
      expect(actual).toBe(updatedValue);
    }, 30000);
  },
);
