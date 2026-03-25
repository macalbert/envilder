import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { PullSecretsToEnvCommand } from '../../../../src/envilder/application/pullSecretsToEnv/PullSecretsToEnvCommand';
import { PullSecretsToEnvCommandHandler } from '../../../../src/envilder/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler';
import type { ILogger } from '../../../../src/envilder/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/envilder/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../src/envilder/domain/ports/IVariableStore';

const testValues: Record<string, string> = {
  '/path/to/ssm/email': 'mockedEmail@example.com',
  '/path/to/ssm/password': 'mockedPassword',
  '/path/to/ssm/password_no_value': '',
};

describe('PullSecretsToEnvCommandHandler', () => {
  let mockSecretProvider: ISecretProvider;
  let mockEnvFileManager: IVariableStore & {
    getMapping: Mock;
    getEnvironment: Mock;
    saveEnvironment: Mock;
  };
  let mockLogger: ILogger;
  let sut: PullSecretsToEnvCommandHandler;

  const mockMapPath = './tests/param-map.json';
  const mockEnvFilePath = './tests/env-file.env';

  beforeEach(() => {
    mockSecretProvider = {
      getSecret: vi.fn(async (name: string): Promise<string | undefined> => {
        if (Object.hasOwn(testValues, name)) {
          return testValues[name];
        }
        throw new Error(`ParameterNotFound: ${name}`);
      }),
      setSecret: vi.fn(),
    };

    mockEnvFileManager = {
      getMapping: vi.fn().mockResolvedValue({} as Record<string, string>),
      getEnvironment: vi.fn().mockResolvedValue({} as Record<string, string>),
      saveEnvironment: vi.fn().mockImplementation(() => Promise.resolve()),
      getParsedMapping: vi
        .fn()
        .mockResolvedValue({ variables: {}, config: {} }),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    sut = new PullSecretsToEnvCommandHandler(
      mockSecretProvider,
      mockEnvFileManager,
      mockLogger,
    );
  });

  it('Should_GenerateEnvFileFromSecrets_When_ValidSecretsAreProvided', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSecretsToEnvCommand.create(
      mockMapPath,
      mockEnvFilePath,
    );

    // Act
    await sut.handle(command);

    // Assert
    expect(mockEnvFileManager.getMapping).toHaveBeenCalledWith(mockMapPath);
    expect(mockEnvFileManager.getEnvironment).toHaveBeenCalledWith(
      mockEnvFilePath,
    );
    expect(mockSecretProvider.getSecret).toHaveBeenCalledWith(
      '/path/to/ssm/email',
    );
    expect(mockSecretProvider.getSecret).toHaveBeenCalledWith(
      '/path/to/ssm/password',
    );
    expect(mockEnvFileManager.saveEnvironment).toHaveBeenCalledWith(
      mockEnvFilePath,
      {
        NEXT_PUBLIC_CREDENTIAL_EMAIL: 'mockedEmail@example.com',
        NEXT_PUBLIC_CREDENTIAL_PASSWORD: 'mockedPassword',
      },
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Environment File generated at '${mockEnvFilePath}'`,
    );
  });

  it('Should_ThrowError_When_SecretIsNotFound', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NON_EXISTENT_PARAM: 'non-existent parameter',
    };

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSecretsToEnvCommand.create(
      mockMapPath,
      mockEnvFilePath,
    );

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow('Some secrets could not be fetched');
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error fetching secret: 'non-existent parameter'",
    );
  });

  it('Should_LogWarning_When_SecretHasNoValue', async () => {
    // Arrange
    const paramMapContent = {
      EMPTY_PARAM: '/path/to/ssm/password_no_value',
    };

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSecretsToEnvCommand.create(
      mockMapPath,
      mockEnvFilePath,
    );

    // Act
    await sut.handle(command);

    // Assert
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Warning: No value found for: '/path/to/ssm/password_no_value'",
    );
  });

  it('Should_LogMaskedValue_When_SecretIsSet', async () => {
    // Arrange
    const paramMapContent = {
      PASSWORD: '/path/to/ssm/password',
    };

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSecretsToEnvCommand.create(
      mockMapPath,
      mockEnvFilePath,
    );

    // Act
    await sut.handle(command);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('PASSWORD=***********ord');
  });
});
