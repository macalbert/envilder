import type { SecretClient } from '@azure/keyvault-secrets';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { EnvironmentVariable } from '../../../../../src/envilder/core/domain/EnvironmentVariable';
import {
  InvalidArgumentError,
  SecretOperationError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { AzureKeyVaultSecretProvider } from '../../../../../src/envilder/core/infrastructure/azure/AzureKeyVaultSecretProvider';
import { LocalStackAzureContainer } from '../../../../support/LocalStackAzureContainer';

// Constants for integration tests
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
      const thrown = await sut
        .getSecret('test-secret')
        .catch((e: unknown) => e);

      // Assert
      expect(thrown).toBeInstanceOf(SecretOperationError);
      expect((thrown as Error).message).toBe('********ret: Network error');
    });

    it('Should_ThrowSecretOperationError_When_NonErrorObjectIsThrown', async () => {
      // Arrange
      mockGetSecretFn.mockRejectedValueOnce('String error');

      // Act
      const action = sut.getSecret('test-secret');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
    });

    it('Should_ReferenceOriginalName_When_NormalizedNameDiffersAndErrorOccurs', async () => {
      // Arrange
      const originalName = '/App/DB_Password';
      mockGetSecretFn.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const thrown = await sut.getSecret(originalName).catch((e: unknown) => e);

      // Assert
      expect((thrown as Error).message).toBe(
        `${EnvironmentVariable.maskSecretPath(originalName)}: Network error`,
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

  describe('toAzureSecretName', () => {
    // The same cases are pinned in the Node.js, Python and .NET SDK tests:
    // every surface must send Key Vault the same secret name.
    it.each([
      'MY-SECRET-NAME',
      'Database--Password',
      '1password-token',
      'my_secret_name',
      'db.url',
    ])('Should_PassNameAsWritten_When_NameHasNoSlash (%s)', async (name) => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value' });

      // Act
      await sut.getSecret(name);

      // Assert
      expect(mockGetSecretFn).toHaveBeenCalledWith(name);
    });

    it.each([
      ['/myapp/db/password', 'myapp-db-password'],
      ['myapp/db_password', 'myapp-db_password'],
      ['/MyApp/Db', 'MyApp-Db'],
      ['//a//b', 'a--b'],
    ])(
      'Should_TurnSlashesIntoHyphens_When_NameHasSlashes (%s)',
      async (name, expected) => {
        // Arrange
        mockGetSecretFn.mockResolvedValueOnce({ value: 'value' });

        // Act
        await sut.getSecret(name);

        // Assert
        expect(mockGetSecretFn).toHaveBeenCalledWith(expected);
      },
    );

    it('Should_PropagateKeyVaultError_When_KeyVaultRejectsName', async () => {
      // Arrange
      mockGetSecretFn.mockRejectedValueOnce(
        Object.assign(new Error('The request URI contains an invalid name'), {
          statusCode: 400,
        }),
      );

      // Act
      const action = sut.getSecret('db.url');

      // Assert
      await expect(action).rejects.toThrow(SecretOperationError);
      await expect(action).rejects.toThrow(/invalid name/);
    });
  });

  describe('collision detection', () => {
    it('Should_ThrowSecretOperationError_When_DifferentNamesResolveToSameName', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value1' });
      await sut.getSecret('/app/db-url');

      // Act
      const action = sut.getSecret('app-db-url');

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

    it('Should_ThrowSecretOperationError_When_NamesResolveToSameNameIgnoringCase', async () => {
      // Arrange
      mockGetSecretFn.mockResolvedValueOnce({ value: 'value1' });
      await sut.getSecret('APP-DB');

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

    it('Should_DetectCollisionOnSetSecret_When_DifferentNamesResolveToSameName', async () => {
      // Arrange
      mockSetSecretFn.mockResolvedValueOnce({});
      await sut.setSecret('/app/db-url', 'value1');

      // Act
      const action = sut.setSecret('app-db-url', 'value2');

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
  });
});

// Integration tests with LocalStack for Azure — requires Docker
describe('AzureKeyVaultSecretProvider (integration with LocalStack)', () => {
  let localStackAzure: LocalStackAzureContainer;
  let secretClient: SecretClient;

  beforeAll(async () => {
    localStackAzure = await new LocalStackAzureContainer().start();
    secretClient = localStackAzure.createSecretClient();

    // Set up initial test secret
    await secretClient.setSecret(SECRET_NAME, SECRET_VALUE);
  }, 240_000);

  afterAll(async () => {
    await localStackAzure?.stop();
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
