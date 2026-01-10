import { DefaultAzureCredential } from '@azure/identity';
import type { SecretClient } from '@azure/keyvault-secrets';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AzureKeyVaultSecretProvider } from '../../../../src/envilder/infrastructure/azure/AzureKeyVaultSecretProvider';

// Constants for integration tests
const LOWKEY_VAULT_IMAGE = 'nagyesta/lowkey-vault:2.5.8';
const LOWKEY_VAULT_PORT = 8443;
const SECRET_NAME = 'test-secret';
const SECRET_VALUE = 'super-secret-value';
const NON_EXISTENT_SECRET = 'non-existent-secret';

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
    sut = new AzureKeyVaultSecretProvider(mockClient);
  });

  describe('getSecret', () => {
    it('Should_ReturnValue_When_SecretExists', async () => {
      // Arrange
      const expectedValue = 'test-secret-value';
      mockGetSecretFn.mockResolvedValueOnce({
        value: expectedValue,
      });

      // Act
      const actual = await sut.getSecret('/test/param');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('test-param');
      expect(actual).toBe(expectedValue);
    });

    it('Should_ReturnUndefined_When_SecretNotFound', async () => {
      // Arrange
      const error = { statusCode: 404 };
      mockGetSecretFn.mockRejectedValueOnce(error);

      // Act
      const result = await sut.getSecret('non-existent-secret');

      // Assert
      expect(result).toBeUndefined();
    });

    it('Should_ThrowError_When_OtherErrorOccurs', async () => {
      // Arrange
      const error = new Error('Network error');
      mockGetSecretFn.mockRejectedValueOnce(error);

      // Act
      const action = () => sut.getSecret('test-secret');

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to get secret test-secret: Network error',
      );
    });

    it('Should_HandleNonErrorObject_When_ErrorIsThrown', async () => {
      // Arrange
      mockGetSecretFn.mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.getSecret('test-secret');

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to get secret test-secret: String error',
      );
    });

    it('Should_NormalizeSecretName_When_NameContainsSlashes', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value' });

      // Act
      await sut.getSecret('/my/app/db/password');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-app-db-password');
    });

    it('Should_NormalizeSecretName_When_NameContainsUnderscores', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value' });

      // Act
      await sut.getSecret('my_secret_name');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-secret-name');
    });

    it('Should_PrefixWithSecret_When_NameStartsWithNumber', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value' });

      // Act
      await sut.getSecret('123-test');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('secret-123-test');
    });
  });

  describe('setSecret', () => {
    it('Should_CallSetSecret_When_SettingSecret', async () => {
      // Arrange
      mockSetSecretFn.mockResolvedValueOnce({});

      // Act
      await sut.setSecret('/test/param', 'test-value');

      // Assert
      expect(mockSetSecretFn).toHaveBeenCalledWith('test-param', 'test-value');
    });

    it('Should_PropagateError_When_SetSecretFails', async () => {
      // Arrange
      const error = new Error('Access denied');
      mockSetSecretFn.mockRejectedValueOnce(error);

      // Act
      const action = () => sut.setSecret('test-secret', 'test-value');

      // Assert
      await expect(action()).rejects.toThrow('Access denied');
    });
  });
});

// Integration tests with Lowkey Vault
describe('AzureKeyVaultSecretProvider (integration with Lowkey Vault)', () => {
  let container: StartedTestContainer;
  let vaultUrl: string;
  let secretClient: SecretClient;

  beforeAll(async () => {
    // Start Lowkey Vault container
    container = await new GenericContainer(LOWKEY_VAULT_IMAGE)
      .withExposedPorts(LOWKEY_VAULT_PORT)
      .withEnvironment('LOWKEY_ARGS', '--server.port=8443')
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(LOWKEY_VAULT_PORT);
    vaultUrl = `https://${host}:${port}`;

    // Create SecretClient with custom endpoint
    // Note: Lowkey Vault uses self-signed certificates
    // In production, use proper certificate validation
    const { SecretClient } = await import('@azure/keyvault-secrets');

    // For testing with self-signed certs, we need to disable TLS validation
    // This should ONLY be done in test environments
    const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    secretClient = new SecretClient(vaultUrl, new DefaultAzureCredential());

    // Set up initial test secret
    try {
      await secretClient.setSecret(SECRET_NAME, SECRET_VALUE);
    } catch (error) {
      console.error('Failed to set up test secret:', error);
      // Restore TLS setting
      if (originalRejectUnauthorized !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
      }
      throw error;
    }
  }, 120000);

  afterAll(async () => {
    if (container) {
      await container.stop();
    }
  });

  it('Should_ReturnSecretValue_When_SecretExists', async () => {
    // Arrange
    const sut = new AzureKeyVaultSecretProvider(secretClient);

    // Act
    const actual = await sut.getSecret(SECRET_NAME);

    // Assert
    expect(actual).toBe(SECRET_VALUE);
  });

  it('Should_ReturnUndefined_When_SecretDoesNotExist', async () => {
    // Arrange
    const sut = new AzureKeyVaultSecretProvider(secretClient);

    // Act
    const actual = await sut.getSecret(NON_EXISTENT_SECRET);

    // Assert
    expect(actual).toBeUndefined();
  });

  it('Should_StoreSecretValue_When_SetSecretIsCalled', async () => {
    // Arrange
    const sut = new AzureKeyVaultSecretProvider(secretClient);
    const secretName = 'new-test-secret';
    const secretValue = 'new-secret-value';

    // Act
    await sut.setSecret(secretName, secretValue);

    // Assert
    const result = await secretClient.getSecret(secretName);
    expect(result.value).toBe(secretValue);
  });

  it('Should_UpdateSecretValue_When_SecretAlreadyExists', async () => {
    // Arrange
    const sut = new AzureKeyVaultSecretProvider(secretClient);
    const secretName = 'update-test-secret';
    const initialValue = 'initial-value';
    const updatedValue = 'updated-value';

    // Setup initial value
    await secretClient.setSecret(secretName, initialValue);

    // Act
    await sut.setSecret(secretName, updatedValue);

    // Assert
    const result = await secretClient.getSecret(secretName);
    expect(result.value).toBe(updatedValue);
  });

  it('Should_HandleNameNormalization_When_SettingAndGettingSecret', async () => {
    // Arrange
    const sut = new AzureKeyVaultSecretProvider(secretClient);
    const originalName = '/my/app/db/password';
    const secretValue = 'normalized-test-value';

    // Act
    await sut.setSecret(originalName, secretValue);
    const actual = await sut.getSecret(originalName);

    // Assert
    expect(actual).toBe(secretValue);
  });
});
