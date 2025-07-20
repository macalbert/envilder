import * as fs from 'node:fs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { PullSsmToEnvCommand } from '../../../../src/envilder/application/pullSsmToEnv/PullSsmToEnvCommand';
import { PullSsmToEnvCommandHandler } from '../../../../src/envilder/application/pullSsmToEnv/PullSsmToEnvCommandHandler';
import type { ILogger } from '../../../../src/envilder/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/envilder/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../src/envilder/domain/ports/IVariableStore';

const testValues: Record<string, string> = {
  '/path/to/ssm/email': 'mockedEmail@example.com',
  '/path/to/ssm/password': 'mockedPassword',
  '/path/to/ssm/password_no_value': '',
};

describe('PullSsmToEnvCommandHandler', () => {
  let mockSecretProvider: ISecretProvider;
  let mockEnvFileManager: IVariableStore & {
    getMapping: Mock;
    getEnvironment: Mock;
    saveEnvironment: Mock;
  };
  let mockLogger: ILogger;
  let sut: PullSsmToEnvCommandHandler;

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
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    sut = new PullSsmToEnvCommandHandler(
      mockSecretProvider,
      mockEnvFileManager,
      mockLogger,
    );

    fs.writeFileSync(mockMapPath, '{}');
    fs.writeFileSync(mockEnvFilePath, '');
  });

  afterEach(() => {
    if (fs.existsSync(mockMapPath)) {
      fs.unlinkSync(mockMapPath);
    }
    if (fs.existsSync(mockEnvFilePath)) {
      fs.unlinkSync(mockEnvFilePath);
    }
  });

  it('Should_GenerateEnvFileFromSSMParameters_When_ValidSSMParametersAreProvided', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

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

  it('Should_ThrowError_When_SSMParameterIsNotFound', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NON_EXISTENT_PARAM: 'non-existent parameter',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Some parameters could not be fetched',
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error fetching parameter: 'non-existent parameter'",
    );
  });

  it('Should_LogWarning_When_SSMParameterHasNoValue', async () => {
    // Arrange
    const paramMapContent = {
      EMPTY_PARAM: '/path/to/ssm/password_no_value',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

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
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    mockEnvFileManager.getMapping.mockResolvedValue(paramMapContent);
    mockEnvFileManager.getEnvironment.mockResolvedValue({});

    const command = PullSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('PASSWORD=***********ord');
  });
});
