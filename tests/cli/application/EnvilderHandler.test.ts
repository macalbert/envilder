import * as fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvilderBuilder } from '../../../src/cli/application/builders/EnvilderBuilder';
import type { ILogger } from '../../../src/cli/domain/ports/ILogger';
import type { ISecretProvider } from '../../../src/cli/domain/ports/ISecretProvider';

const testValues: Record<string, string> = {
  '/path/to/ssm/email': 'mockedEmail@example.com',
  '/path/to/ssm/password': 'mockedPassword',
  '/path/to/ssm/password_no_value': '',
};

const mockSecretProvider: ISecretProvider = {
  getSecret: vi.fn(async (name: string): Promise<string | undefined> => {
    if (Object.hasOwn(testValues, name)) {
      return testValues[name];
    }
    throw new Error(`ParameterNotFound: ${name}`);
  }),
  setSecret: vi.fn(async (_name: string, _value: string): Promise<void> => {}),
};

describe('EnvilderHandler', () => {
  let sut: ReturnType<EnvilderBuilder['create']>;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    sut = EnvilderBuilder.build()
      .withLogger(mockLogger)
      .withDefaultFileManager()
      .withProvider(mockSecretProvider)
      .create();
  });

  const mockMapPath = './tests/param-map.json';
  const mockEnvFilePath = './tests/.env.test';

  afterEach(() => {
    vi.clearAllMocks();

    if (fs.existsSync(mockEnvFilePath)) {
      fs.unlinkSync(mockEnvFilePath);
    }

    if (fs.existsSync(mockMapPath)) {
      fs.unlinkSync(mockMapPath);
    }
  });

  it('Should_GenerateEnvFileFromSSMParameters_When_ValidSSMParametersAreProvided', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toContain(
      'NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com',
    );
    expect(actual).toContain('NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword');
  });

  it('Should_ThrowError_When_SSMParameterIsNotFound', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: 'non-existent parameter',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    const action = sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    await expect(action).rejects.toThrow(
      'ParameterNotFound: non-existent parameter',
    );
  });

  it('Should_ThrowError_When_ParameterMapIsInvalidJSON', async () => {
    // Arrange
    fs.writeFileSync(mockMapPath, '{ invalid json');

    // Act
    const action = sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    await expect(action).rejects.toThrow(
      `Invalid JSON in parameter map file: ${mockMapPath}`,
    );
  });

  it('Should_AppendNewSSMParameters_When_EnvFileContainsExistingVariables', async () => {
    // Arrange
    const existingEnvContent = 'EXISTING_VAR=existingValue';
    fs.writeFileSync(mockEnvFilePath, existingEnvContent);
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toContain('EXISTING_VAR=existingValue');
    expect(actual).toContain(
      'NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com',
    );
    expect(actual).toContain('NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword');
  });

  it('Should_OverwriteSSMParameters_When_EnvFileContainsSameVariables', async () => {
    // Arrange
    const existingEnvContent =
      'NEXT_PUBLIC_CREDENTIAL_EMAIL=oldEmail@example.com';
    fs.writeFileSync(mockEnvFilePath, existingEnvContent);
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toContain(
      'NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com',
    );
    expect(actual).toContain('NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword');
  });

  it('Should_LogWarning_When_SSMParameterHasNoValue', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password_no_value',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Warning: No value found for'),
    );
  });

  it('Should_LogMaskedValue_When_SecretIsSet', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('NEXT_PUBLIC_CREDENTIAL_PASSWORD=***********ord'),
    );
  });

  it('Should_SetSecret_When_SecretProviderIsUsed', async () => {
    // Arrange
    const expectedPath = '/path/to/ssm/email';
    const expectedValue = 'test-email-value';

    const paramMapContent = {
      EMAIL_KEY: expectedPath,
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    const envContent = `EMAIL_KEY=${expectedValue}`;
    fs.writeFileSync(mockEnvFilePath, envContent);

    // Act
    await sut.importEnvFile(mockMapPath, mockEnvFilePath);

    // Assert
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(
      expectedPath,
      expectedValue,
    );
  });

  it('Should_Warning_When_ImportsNotMatchesKey', async () => {
    // Arrange
    const expectedPath = '/path/to/ssm/secret';
    const expectedValue = 'the_super_secret_value';

    const paramMapContent = {
      SECRET_KEY: expectedPath,
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    const envContent = `OTHER_SECRET_KEY=${expectedValue}`;
    fs.writeFileSync(mockEnvFilePath, envContent);

    // Act
    await sut.importEnvFile(mockMapPath, mockEnvFilePath);

    // Assert
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Warning: Environment variable SECRET_KEY not found',
      ),
    );
  });
});
