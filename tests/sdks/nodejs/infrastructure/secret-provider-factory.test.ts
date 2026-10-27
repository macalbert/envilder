import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import { AzureKeyVaultSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';
import { createSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/secret-provider-factory.js';

const { secretClientSpy } = vi.hoisted(() => ({ secretClientSpy: vi.fn() }));

// Mock the AWS and Azure provider modules so we don't need real cloud SDKs
vi.mock(
  '../../../../src/sdks/nodejs/src/infrastructure/aws/aws-ssm-secret-provider.js',
  () => ({
    AwsSsmSecretProvider: class {
      getSecrets = vi.fn();
    },
  }),
);

vi.mock(
  '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js',
  () => ({
    AzureKeyVaultSecretProvider: class {
      getSecrets = vi.fn();
    },
  }),
);

// Mock AWS SDK
vi.mock('@aws-sdk/client-ssm', () => ({
  SSMClient: class {},
}));

// Mock Azure SDK
vi.mock('@azure/identity', () => ({
  DefaultAzureCredential: class {},
}));

vi.mock('@azure/keyvault-secrets', () => ({
  SecretClient: class {
    constructor(...args: unknown[]) {
      secretClientSpy(...args);
    }
  },
}));

describe('SecretProviderFactory', () => {
  let savedAwsProfile: string | undefined;

  beforeEach(() => {
    savedAwsProfile = process.env.AWS_PROFILE;
    secretClientSpy.mockClear();
  });

  afterEach(() => {
    if (savedAwsProfile === undefined) {
      delete process.env.AWS_PROFILE;
    } else {
      process.env.AWS_PROFILE = savedAwsProfile;
    }
  });

  it('Should_CreateAwsProvider_When_NoProviderSpecified', () => {
    // Arrange
    const config = {};

    // Act
    const actual = createSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
    expect(actual.getSecrets).toBeDefined();
  });

  it('Should_CreateAwsProvider_When_AwsProviderSpecified', () => {
    // Arrange
    const config = { provider: SecretProviderType.Aws };

    // Act
    const actual = createSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
  });

  it('Should_CreateAzureProvider_When_AzureProviderSpecified', () => {
    // Arrange
    const config = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'https://my-vault.vault.azure.net',
    };

    // Act
    const actual = createSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
  });

  it('Should_ThrowError_When_ProfileUsedWithAzure', () => {
    // Arrange
    const config = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'https://my-vault.vault.azure.net',
    };
    const options = { profile: 'staging' };

    // Act
    const act = () => createSecretProvider(config, options);

    // Assert
    expect(act).toThrow(
      'AWS profile cannot be used with Azure Key Vault provider',
    );
  });

  it('Should_ThrowError_When_VaultUrlUsedWithAws', () => {
    // Arrange
    const config = { provider: SecretProviderType.Aws };
    const options = { vaultUrl: 'https://my-vault.vault.azure.net' };

    // Act
    const act = () => createSecretProvider(config, options);

    // Assert
    expect(act).toThrow('Vault URL cannot be used with AWS SSM provider');
  });

  it('Should_ThrowError_When_AzureWithoutVaultUrl', () => {
    // Arrange
    const config = { provider: SecretProviderType.Azure };

    // Act
    const act = () => createSecretProvider(config);

    // Assert
    expect(act).toThrow(
      'Vault URL must be provided for Azure Key Vault provider',
    );
  });

  it('Should_RejectVaultUrl_When_SchemeIsNotHttps', () => {
    // Arrange
    const config = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'http://my-vault.vault.azure.net',
    };

    // Act
    const act = () => createSecretProvider(config);

    // Assert
    expect(act).toThrow('vaultUrl must use https:// protocol');
    expect(secretClientSpy).not.toHaveBeenCalled();
  });

  it.each([
    'https://attacker.example.com',
    'https://my-vault.vault.azure.net.attacker.example.com',
    'https://my-vaultvault.azure.net',
    'https://kv-test.localhost.localstack.cloud:4566',
  ])('Should_RejectVaultUrl_When_HostIsNotAllowed (%s)', (vaultUrl) => {
    // Arrange
    const config = { provider: SecretProviderType.Azure, vaultUrl };

    // Act
    const act = () => createSecretProvider(config);

    // Assert
    expect(act).toThrow('vaultUrl hostname must end with one of');
    expect(secretClientSpy).not.toHaveBeenCalled();
  });

  it('Should_RejectVaultUrl_When_UrlContainsUserInformation', () => {
    // Arrange
    const config = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'https://attacker.example.com@my-vault.vault.azure.net',
    };

    // Act
    const act = () => createSecretProvider(config);

    // Assert
    expect(act).toThrow('vaultUrl must not contain user information');
    expect(secretClientSpy).not.toHaveBeenCalled();
  });

  it('Should_KeepChallengeResourceVerification_When_VaultHostIsDefault', () => {
    // Arrange
    const config = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'https://my-vault.vault.usgovcloudapi.net',
    };

    // Act
    createSecretProvider(config);

    // Assert
    expect(secretClientSpy).toHaveBeenCalledWith(
      'https://my-vault.vault.usgovcloudapi.net',
      expect.anything(),
      { disableChallengeResourceVerification: false },
    );
  });

  it('Should_AcceptCustomVaultHost_When_AllowedThroughOptions', () => {
    // Arrange
    const config = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'https://kv-test.localhost.localstack.cloud:4566',
    };
    const options = { allowedVaultHosts: ['.localhost.localstack.cloud'] };

    // Act
    createSecretProvider(config, options);

    // Assert
    expect(secretClientSpy).toHaveBeenCalledWith(
      'https://kv-test.localhost.localstack.cloud:4566',
      expect.anything(),
      { disableChallengeResourceVerification: true },
    );
  });

  it('Should_ApplyOptionsOverConfig_When_OptionsProvided', () => {
    // Arrange
    const config = { provider: SecretProviderType.Aws };
    const options = {
      provider: SecretProviderType.Azure,
      vaultUrl: 'https://my-vault.vault.azure.net',
    };

    // Act
    const actual = createSecretProvider(config, options);

    // Assert
    expect(actual).toBeInstanceOf(AzureKeyVaultSecretProvider);
  });

  it('Should_NotMutateAwsProfileEnv_When_ProfileProvided', () => {
    // Arrange
    delete process.env.AWS_PROFILE;
    const config = { provider: SecretProviderType.Aws };
    const options = { profile: 'developer' };

    // Act
    createSecretProvider(config, options);

    // Assert
    expect(process.env.AWS_PROFILE).toBeUndefined();
  });
});
