import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { PullSecretsToEnvCommand } from '../../../../../src/envilder/core/application/pullSecretsToEnv/PullSecretsToEnvCommand';
import { PullSecretsToEnvCommandHandler } from '../../../../../src/envilder/core/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler';
import {
  ExpiredCredentialsError,
  SsoSessionExpiredError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function strip(value: unknown): string {
  return String(value).replace(ANSI_PATTERN, '');
}

function loggedLines(mock: Mock): string[] {
  return mock.mock.calls.map((call) => strip(call[0]));
}

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
  let mockLogger: ILogger & { info: Mock; warn: Mock; error: Mock };
  let sut: PullSecretsToEnvCommandHandler;

  const mockMapPath = './tests/envilder.json';
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
    const summaryLine = loggedLines(mockLogger.info).find((line) =>
      line.includes('LEVEL CLEARED'),
    );
    expect(summaryLine).toContain('2/2 secrets loaded');
    expect(summaryLine).toContain(mockEnvFilePath);
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
      expect.stringContaining(
        'non-existent parameter: ParameterNotFound: non-existent parameter',
      ),
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
    const warningLine = loggedLines(mockLogger.info).find((line) =>
      line.includes('EMPTY_PARAM'),
    );
    expect(warningLine).toContain('no value found');
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
    const resolvedLine = loggedLines(mockLogger.info).find((line) =>
      line.includes('PASSWORD'),
    );
    expect(resolvedLine).toContain('***********ord');
  });

  it('Should_PropagateExpiredCredentialsError_When_SecretFetchFails', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
    };
    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});
    vi.mocked(mockSecretProvider.getSecret).mockRejectedValue(
      new ExpiredCredentialsError(),
    );
    const command = PullSecretsToEnvCommand.create(
      mockMapPath,
      mockEnvFilePath,
    );

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow(ExpiredCredentialsError);
  });

  it('Should_PropagateSsoSessionExpiredError_When_SecretFetchFails', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
    };
    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});
    vi.mocked(mockSecretProvider.getSecret).mockRejectedValue(
      new SsoSessionExpiredError('developer'),
    );
    const command = PullSecretsToEnvCommand.create(
      mockMapPath,
      mockEnvFilePath,
    );

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow(SsoSessionExpiredError);
  });
});
