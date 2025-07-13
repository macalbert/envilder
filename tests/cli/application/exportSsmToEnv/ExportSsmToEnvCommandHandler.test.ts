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
import { ExportSsmToEnvCommand } from '../../../../src/cli/application/exportSsmToEnv/ExportSsmToEnvCommand';
import { ExportSsmToEnvCommandHandler } from '../../../../src/cli/application/exportSsmToEnv/ExportSsmToEnvCommandHandler';
import type { IEnvFileManager } from '../../../../src/cli/domain/ports/IEnvFileManager';
import type { ILogger } from '../../../../src/cli/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/cli/domain/ports/ISecretProvider';

const testValues: Record<string, string> = {
  '/path/to/ssm/email': 'mockedEmail@example.com',
  '/path/to/ssm/password': 'mockedPassword',
  '/path/to/ssm/password_no_value': '',
};

describe('ExportSsmToEnvCommandHandler', () => {
  let mockSecretProvider: ISecretProvider;
  let mockEnvFileManager: IEnvFileManager & {
    loadMapFile: Mock;
    loadEnvFile: Mock;
    saveEnvFile: Mock;
  };
  let mockLogger: ILogger;
  let sut: ExportSsmToEnvCommandHandler;

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
      loadMapFile: vi.fn().mockResolvedValue({} as Record<string, string>),
      loadEnvFile: vi.fn().mockResolvedValue({} as Record<string, string>),
      saveEnvFile: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    sut = new ExportSsmToEnvCommandHandler(
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

    mockEnvFileManager.loadMapFile.mockResolvedValue(paramMapContent);
    mockEnvFileManager.loadEnvFile.mockResolvedValue({});

    const command = ExportSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockEnvFileManager.loadMapFile).toHaveBeenCalledWith(mockMapPath);
    expect(mockEnvFileManager.loadEnvFile).toHaveBeenCalledWith(
      mockEnvFilePath,
    );
    expect(mockSecretProvider.getSecret).toHaveBeenCalledWith(
      '/path/to/ssm/email',
    );
    expect(mockSecretProvider.getSecret).toHaveBeenCalledWith(
      '/path/to/ssm/password',
    );
    expect(mockEnvFileManager.saveEnvFile).toHaveBeenCalledWith(
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

    mockEnvFileManager.loadMapFile.mockResolvedValue(paramMapContent);
    mockEnvFileManager.loadEnvFile.mockResolvedValue({});

    const command = ExportSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

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

    mockEnvFileManager.loadMapFile.mockResolvedValue(paramMapContent);
    mockEnvFileManager.loadEnvFile.mockResolvedValue({});

    const command = ExportSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

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

    mockEnvFileManager.loadMapFile.mockResolvedValue(paramMapContent);
    mockEnvFileManager.loadEnvFile.mockResolvedValue({});

    const command = ExportSsmToEnvCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('PASSWORD=***********ord');
  });
});
