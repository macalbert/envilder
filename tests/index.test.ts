import * as fs from 'node:fs';
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

        return Promise.reject(new Error(`ParameterNotFound: ${command.input.Name}`));
      }),
    })),
    GetParameterCommand: vi.fn().mockImplementation((input) => ({
      input,
    })),
  };
});

describe('Envilder CLI', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Should_GenerateEnvFileFromSSMParameters_When_ValidSSMParametersAreProvided', async () => {
    // Arrange
    const mockMapPath = './tests/param_map.json';
    const mockEnvFilePath = './tests/.env.test';
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
    fs.unlinkSync(mockEnvFilePath);
    fs.unlinkSync(mockMapPath);
  });

  it('Should_ThrowError_When_SSMParameterIsNotFound', async () => {
    // Arrange
    const mockMapPath = './tests/param_map.json';
    const mockEnvFilePath = './tests/.env.test';
    const paramMapContent = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: '/path/to/ssm/unknown-email', // Non-existent parameter
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));

    // Act
    const action = run(mockMapPath, mockEnvFilePath);

    // Assert
    await expect(action).rejects.toThrow('ParameterNotFound: /path/to/ssm/unknown-email');
    fs.unlinkSync(mockMapPath);
  });
});
