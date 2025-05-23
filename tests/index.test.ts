import * as fs from 'node:fs';
import { SSM } from '@aws-sdk/client-ssm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { run } from '../src/index';

vi.mock('@aws-sdk/client-ssm', () => {
  return {
    SSM: vi.fn().mockImplementation(() => ({
      send: vi.fn((command) => {
        if (command.input.Name === '/path/to/ssm/email') {
          return Promise.resolve({
            Parameter: { Value: 'mockedEmail@example.com' },
          });
        }

        if (command.input.Name === '/path/to/ssm/password') {
          return Promise.resolve({
            Parameter: { Value: 'mockedPassword' },
          });
        }

        if (command.input.Name === '/path/to/ssm/password_no_value') {
          return Promise.resolve({ Parameter: { Value: '' } });
        }

        return Promise.reject(new Error(`ParameterNotFound: ${command.input.Name}`));
      }),
    })),
    GetParameterCommand: vi.fn().mockImplementation((input) => ({
      input,
    })),
  };
});

describe('Envilder CLI', () => {
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
    await run(mockMapPath, mockEnvFilePath);

    // Assert
    const envFileContent = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(envFileContent).toContain('NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com');
    expect(envFileContent).toContain('NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword');
  });

  it('Should_ThrowError_When_SSMParameterIsNotFound', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: 'non-existent parameter',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    const action = run(mockMapPath, mockEnvFilePath);

    // Assert
    await expect(action).rejects.toThrow('ParameterNotFound: non-existent parameter');
  });

  it('Should_ThrowError_When_ParameterMapIsInvalidJSON', async () => {
    // Arrange
    fs.writeFileSync(mockMapPath, '{ invalid json');

    // Act
    const action = run(mockMapPath, mockEnvFilePath);

    // Assert
    await expect(action).rejects.toThrow(`Invalid JSON in parameter map file: ${mockMapPath}`);
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
    await run(mockMapPath, mockEnvFilePath);

    // Assert
    const updatedEnvFileContent = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(updatedEnvFileContent).toContain('EXISTING_VAR=existingValue');
    expect(updatedEnvFileContent).toContain('NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com');
    expect(updatedEnvFileContent).toContain('NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword');
  });

  it('Should_OverwriteSSMParameters_When_EnvFileContainsSameVariables', async () => {
    // Arrange
    const existingEnvContent = 'NEXT_PUBLIC_CREDENTIAL_EMAIL=oldEmail@example.com';
    fs.writeFileSync(mockEnvFilePath, existingEnvContent);
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await run(mockMapPath, mockEnvFilePath);

    // Assert
    const updatedEnvFileContent = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(updatedEnvFileContent).toContain('NEXT_PUBLIC_CREDENTIAL_EMAIL=mockedEmail@example.com');
    expect(updatedEnvFileContent).toContain('NEXT_PUBLIC_CREDENTIAL_PASSWORD=mockedPassword');
  });

  it('Should_LogWarning_When_SSMParameterHasNoValue', async () => {
    // Arrange
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_PASSWORD: '/path/to/ssm/password_no_value',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));
    const consoleSpy = vi.spyOn(console, 'error');

    // Act
    await run(mockMapPath, mockEnvFilePath);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: No value found for'));
  });

  it('Should_ConfigureSSMClientWithProfile_When_ProfileIsProvided', async () => {
    // Arrange
    const mockProfile = 'test-profile';
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/email',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    await run(mockMapPath, mockEnvFilePath, mockProfile);

    // Assert
    expect(vi.mocked(SSM).mock.calls[0][0]).toEqual(expect.objectContaining({ credentials: expect.anything() }));
  });
});
