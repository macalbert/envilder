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
import {
  InvalidArgumentError,
  SecretOperationError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { AzureKeyVaultSecretProvider } from '../../../../../src/envilder/core/infrastructure/azure/AzureKeyVaultSecretProvider';

// Constants for integration tests
const LOWKEY_VAULT_IMAGE = 'nagyesta/lowkey-vault:7.1.32';
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
      const actual = await sut.getSecret('non-existent-secret');

      // Assert
      expect(actual).toBeUndefined();
    });

    it('Should_ThrowSecretOperationError_When_OtherErrorOccurs', async () => {
      // Arrange
      const error = new Error('Network error');
      mockGetSecretFn.mockRejectedValueOnce(error);

      // Act
      const action = sut.getSecret('test-secret');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
    });

    it('Should_ThrowSecretOperationError_When_NonErrorObjectIsThrown', async () => {
      // Arrange
      mockGetSecretFn.mockRejectedValueOnce('String error');

      // Act
      const action = sut.getSecret('test-secret');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
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

    it('Should_ReturnUndefined_When_AzureSDKReturnsNull', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce(null);

      // Act
      const actual = await sut.getSecret('some-secret');

      // Assert
      expect(actual).toBeUndefined();
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

  describe('normalizeSecretName', () => {
    it('Should_LowercaseName_When_NameContainsUppercase', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value' });

      // Act
      await sut.getSecret('MY-SECRET-NAME');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-secret-name');
    });
  });

  describe('collision detection', () => {
    it('Should_ThrowSecretOperationError_When_DifferentNamesNormalizeToSameKey', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value1' });
      await sut.getSecret('/app/db-url');

      // Act
      const action = sut.getSecret('/app/db_url');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
      await expect(action).rejects.toThrow(/Secret name collision/);
    });

    it('Should_ThrowSecretOperationError_When_NamesCollideOnlyByCase', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value1' });
      await sut.getSecret('/APP/DB');

      // Act
      const action = sut.getSecret('/app/db');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
      await expect(action).rejects.toThrow(/Secret name collision/);
    });

    it('Should_NotThrow_When_SameOriginalNameIsUsedTwice', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValue({ value: 'value' });
      await sut.getSecret('/app/db-url');

      // Act
      const action = sut.getSecret('/app/db-url');

      // Assert
      await expect(action).resolves.toBe('value');
    });

    it('Should_DetectCollisionOnSetSecret_When_DifferentNamesNormalizeSame', async () => {
      // Arrange
      mockSetSecretFn.mockResolvedValueOnce({});
      await sut.setSecret('/app/db-url', 'value1');

      // Act
      const action = sut.setSecret('/app/db_url', 'value2');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
      await expect(action).rejects.toThrow(/Secret name collision/);
    });
  });

  describe('name validation', () => {
    it('Should_ThrowInvalidArgumentError_When_SecretNameIsEmpty', async () => {
      // Arrange
      // (sut is already created in beforeEach)

      // Act
      const action = sut.getSecret('');

      // Assert
      await expect(action).rejects.toThrow(InvalidArgumentError);
    });

    it('Should_ThrowInvalidArgumentError_When_SecretNameContainsOnlyInvalidChars', async () => {
      // Arrange
      // (sut is already created in beforeEach)

      // Act
      const action = sut.getSecret('@#$%^&');

      // Assert
      await expect(action).rejects.toThrow(InvalidArgumentError);
    });

    it('Should_ThrowInvalidArgumentError_When_NormalizedNameExceeds127Chars', async () => {
      // Arrange
      const longName = `a${'-bcd'.repeat(50)}`;

      // Act
      const action = sut.getSecret(longName);

      // Assert
      await expect(action).rejects.toThrow(InvalidArgumentError);
      await expect(action).rejects.toThrow(/exceeds the 127-character limit/);
    });

    it('Should_AcceptName_When_NameContainsSlashesAndUnderscores', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'db-connection-string' });

      // Act
      const actual = await sut.getSecret('/my/app_config/db_url');

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith('my-app-config-db-url');
      expect(actual).toBe('db-connection-string');
    });

    it('Should_ThrowInvalidArgumentError_When_SecretNameContainsUnexpectedSpecialChars', async () => {
      // Arrange
      const name = '/my/app/db@url!';

      // Act
      const action = sut.getSecret(name);

      // Assert
      await expect(action).rejects.toThrow(InvalidArgumentError);
      await expect(action).rejects.toThrow(/characters not allowed/);
    });
  });
});

// Integration tests with Lowkey Vault
describe('AzureKeyVaultSecretProvider (integration with Lowkey Vault)', () => {
  let container: StartedTestContainer;
  let vaultUrl: string;
  let secretClient: SecretClient;
  let originalTlsRejectUnauthorized: string | undefined;

  beforeAll(async () => {
    // Self-signed cert on a local test container — safe to skip validation
    originalTlsRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // Start Lowkey Vault container (exposes HTTPS 8443 + HTTP 8080 for token endpoint)
    container = await new GenericContainer(LOWKEY_VAULT_IMAGE)
      .withExposedPorts(LOWKEY_VAULT_PORT, 8080)
      .withEnvironment({
        LOWKEY_ARGS: '--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true',
      })
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(LOWKEY_VAULT_PORT);
    const tokenPort = container.getMappedPort(8080);
    vaultUrl = `https://${host}:${port}`;

    // Point DefaultAzureCredential to Lowkey Vault's built-in token endpoint
    process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST = `http://${host}:${tokenPort}`;

    const { SecretClient } = await import('@azure/keyvault-secrets');

    secretClient = new SecretClient(vaultUrl, new DefaultAzureCredential(), {
      disableChallengeResourceVerification: true,
    });

    // Set up initial test secret
    await secretClient.setSecret(SECRET_NAME, SECRET_VALUE);
  }, 120000);

  afterAll(async () => {
    if (container) {
      await container.stop();
    }
    if (originalTlsRejectUnauthorized === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsRejectUnauthorized;
    }
    delete process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST;
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
