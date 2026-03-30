import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../../src/envilder/apps/gha/Gha';
import { Startup } from '../../../../src/envilder/apps/gha/Startup';
import { DispatchActionCommand } from '../../../../src/envilder/core/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import type { CliOptions } from '../../../../src/envilder/core/domain/CliOptions';
import * as FileVariableStore from '../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore';

vi.mock(
  '../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
  async () => {
    const actual = await vi.importActual(
      '../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
    );
    return {
      ...(actual as object),
      readMapFileConfig: vi.fn().mockResolvedValue({}),
    };
  },
);

function patchWithMocks() {
  const mockCommandHandler = {
    handleCommand: vi.fn().mockResolvedValue(undefined),
  };

  vi.spyOn(
    DispatchActionCommandHandler.prototype,
    'handleCommand',
  ).mockImplementation(mockCommandHandler.handleCommand);

  return { mockCommandHandler };
}

describe('GitHubAction', () => {
  let mocks: ReturnType<typeof patchWithMocks>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    mocks = patchWithMocks();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('Should_ReadInputsFromEnvironmentVariables_When_ActionIsInvoked', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';

    const mockCommand = {
      map: 'test-map.json',
      envfile: 'test.env',
      profile: undefined,
      push: false,
    };
    vi.spyOn(DispatchActionCommand, 'fromCliOptions').mockReturnValue(
      mockCommand as unknown as DispatchActionCommand,
    );

    // Act
    await main();

    // Assert
    expect(mocks.mockCommandHandler.handleCommand).toHaveBeenCalledWith(
      mockCommand,
    );
    expect(mocks.mockCommandHandler.handleCommand).toHaveBeenCalledTimes(1);
  });

  it('Should_ExitWithError_When_RequiredInputsAreMissing', async () => {
    // Arrange
    delete process.env.INPUT_MAP_FILE;
    delete process.env.INPUT_ENV_FILE;

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('Missing required inputs');
  });

  it('Should_ExitWithError_When_MapFileIsMissing', async () => {
    // Arrange
    delete process.env.INPUT_MAP_FILE;
    process.env.INPUT_ENV_FILE = 'test.env';

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('Missing required inputs');
  });

  it('Should_ExitWithError_When_EnvFileIsMissing', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    delete process.env.INPUT_ENV_FILE;

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('Missing required inputs');
  });

  it('Should_AlwaysUsePullMode_When_ActionIsInvoked', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';

    let capturedOptions: CliOptions | undefined;
    vi.spyOn(DispatchActionCommand, 'fromCliOptions').mockImplementation(
      (options) => {
        capturedOptions = options;
        return {} as DispatchActionCommand;
      },
    );

    // Act
    await main();

    // Assert
    expect(capturedOptions?.push).toBe(false);
  });

  it('Should_ReadProviderFromEnvironment_When_ProviderInputIsSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    process.env.INPUT_PROVIDER = 'azure';
    process.env.INPUT_VAULT_URL = 'https://my-vault.vault.azure.net';

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'azure' }),
    );
  });

  it('Should_DefaultToEmptyConfig_When_ProviderInputIsNotSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    delete process.env.INPUT_PROVIDER;
    delete process.env.INPUT_VAULT_URL;

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith({});
  });

  it('Should_MergeVaultUrlFromInput_When_VaultUrlInputIsSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    process.env.INPUT_PROVIDER = 'azure';
    process.env.INPUT_VAULT_URL = 'https://my-vault.vault.azure.net';

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
      }),
    );
  });

  it('Should_MergeFileConfigWithInputOverrides_When_BothProvided', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    process.env.INPUT_PROVIDER = 'aws';
    delete process.env.INPUT_VAULT_URL;

    vi.mocked(FileVariableStore.readMapFileConfig).mockResolvedValue({
      provider: 'azure',
      vaultUrl: 'https://file-vault.vault.azure.net',
    });

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'aws' }),
    );
  });

  it('Should_UseFileConfigProvider_When_ProviderInputIsNotSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    delete process.env.INPUT_PROVIDER;
    delete process.env.INPUT_VAULT_URL;

    vi.mocked(FileVariableStore.readMapFileConfig).mockResolvedValue({
      provider: 'azure',
      vaultUrl: 'https://file-vault.vault.azure.net',
    });

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'azure',
        vaultUrl: 'https://file-vault.vault.azure.net',
      }),
    );
  });

  it('Should_LogAndThrowError_When_ReadMapFileConfigFails', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'nonexistent-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';

    vi.mocked(FileVariableStore.readMapFileConfig).mockRejectedValue(
      new Error('ENOENT: no such file or directory'),
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('ENOENT: no such file or directory');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to initialize'),
    );
  });
});
