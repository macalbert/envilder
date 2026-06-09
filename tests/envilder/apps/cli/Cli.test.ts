import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../../src/envilder/apps/cli/Cli';
import { Startup } from '../../../../src/envilder/apps/cli/Startup';
import { DispatchActionCommand } from '../../../../src/envilder/core/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import { OperationMode } from '../../../../src/envilder/core/domain/OperationMode';

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

vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...(actual as object),
    existsSync: vi.fn().mockReturnValue(true),
  };
});

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

describe('Cli', () => {
  const testProfile = 'test-profile';
  let mocks: ReturnType<typeof patchWithMocks>;

  beforeEach(() => {
    mocks = patchWithMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Should_UseInjectedMocksAndCallRun_When_CliIsInvoked', async () => {
    // Arrange
    process.argv = [
      'node',
      'cli.js',
      '--map',
      'map.json',
      '--envfile',
      '.env',
      '--profile',
      testProfile,
    ];

    const mockCommand = {
      map: 'map.json',
      envfile: '.env',
      profile: testProfile,
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

  it('Should_ThrowError_When_ArgumentsAreInvalid', async () => {
    // Arrange
    process.argv = [
      'node',
      'cli.js',
      '--map',
      // missing map file argument
      '--envfile',
      // missing envfile argument
    ];

    vi.spyOn(Command.prototype, 'parseAsync').mockImplementation(async () => {
      throw new Error('Missing required arguments: --map and --envfile');
    });

    // Act
    const action = () => main();

    // Assert
    await expect(action).rejects.toThrow('Missing required arguments');
  });

  it('Should_CreateExportToEnvCommand_When_OptionsAreProvided', () => {
    // Arrange
    const options = {
      map: 'map.json',
      envfile: '.env',
      profile: 'default',
    };

    // Act
    const exportCommand = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(exportCommand.mode).toBe(OperationMode.PULL_SECRETS_TO_ENV);
    expect(exportCommand.map).toBe('map.json');
    expect(exportCommand.envfile).toBe('.env');
  });

  it('Should_PushEnvCommand_When_OptionsAreProvided', () => {
    // Arrange
    const options = {
      map: 'map.json',
      envfile: '.env',
      push: true,
    };

    // Act
    const importCommand = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(importCommand.mode).toBe(OperationMode.PUSH_ENV_TO_SECRETS);
  });

  it('Should_CreateSinglePushCommand_When_OptionsAreProvided', () => {
    // Arrange
    const options = {
      key: 'API_KEY',
      value: 'secret123',
      secretPath: '/my/path',
    };

    // Act
    const pushCommand = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(pushCommand.mode).toBe(OperationMode.PUSH_SINGLE);
    expect(pushCommand.key).toBe('API_KEY');
    expect(pushCommand.value).toBe('secret123');
    expect(pushCommand.secretPath).toBe('/my/path');
  });

  it('Should_PassAllowedVaultHosts_When_EnvVarIsSet', async () => {
    // Arrange
    process.env.ENVILDER_ALLOWED_VAULT_HOSTS = 'localhost,custom.host';
    const infraSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');
    process.argv = ['node', 'cli.js', '--map', 'map.json', '--envfile', '.env'];

    // Act
    await main();

    // Assert
    expect(infraSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        allowedVaultHosts: ['localhost', 'custom.host'],
        disableChallengeResourceVerification: true,
      }),
    );
    delete process.env.ENVILDER_ALLOWED_VAULT_HOSTS;
  });

  it('Should_NotPassInfraOptions_When_EnvVarIsNotSet', async () => {
    // Arrange
    delete process.env.ENVILDER_ALLOWED_VAULT_HOSTS;
    const infraSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');
    process.argv = ['node', 'cli.js', '--map', 'map.json', '--envfile', '.env'];

    // Act
    await main();

    // Assert
    expect(infraSpy).toHaveBeenCalled();
    expect(infraSpy).toHaveBeenCalledWith(expect.any(Object), {});
  });

  it('Should_UseDefaultMapFile_When_MapOptionIsOmittedAndEnvilderJsonExists', async () => {
    // Arrange
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);

    process.argv = ['node', 'cli.js', '--envfile', '.env'];

    const fromCliOptionsSpy = vi.spyOn(DispatchActionCommand, 'fromCliOptions');

    // Act
    await main();

    // Assert
    expect(fromCliOptionsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ map: 'envilder.json' }),
    );
  });

  it('Should_ThrowError_When_MapOptionIsOmittedAndEnvilderJsonDoesNotExist', async () => {
    // Arrange
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);

    process.argv = ['node', 'cli.js'];

    // Act
    const action = () => main();

    // Assert
    await expect(action).rejects.toThrow(
      'No map file found. Provide --map or create envilder.json in the current directory.',
    );
  });

  it('Should_UseDefaultEnvfile_When_EnvfileOptionIsOmitted', async () => {
    // Arrange
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);

    process.argv = ['node', 'cli.js', '--map', 'map.json'];

    const fromCliOptionsSpy = vi.spyOn(DispatchActionCommand, 'fromCliOptions');

    // Act
    await main();

    // Assert
    expect(fromCliOptionsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ envfile: '.env' }),
    );
  });

  it('Should_ThrowError_When_MapOptionIsEmptyString', async () => {
    // Arrange
    process.argv = ['node', 'cli.js', '--map', '   ', '--envfile', '.env'];

    // Act
    const action = () => main();

    // Assert
    await expect(action).rejects.toThrow(
      'Invalid --map value: path must not be empty.',
    );
  });

  it('Should_NotRequireMapFile_When_PushSingleAndEnvilderJsonDoesNotExist', async () => {
    // Arrange
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);

    process.argv = [
      'node',
      'cli.js',
      '--push',
      '--key',
      'API_KEY',
      '--value',
      'secret',
      '--secret-path',
      '/my/path',
    ];

    // Act
    await main();

    // Assert
    expect(mocks.mockCommandHandler.handleCommand).toHaveBeenCalledWith(
      expect.objectContaining({ mode: OperationMode.PUSH_SINGLE }),
    );
  });

  it('Should_ApplyDefaultMapConfig_When_PushSingleAndEnvilderJsonExists', async () => {
    // Arrange
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);
    const { readMapFileConfig } = await import(
      '../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore'
    );
    vi.mocked(readMapFileConfig).mockResolvedValue({
      provider: 'azure',
      vaultUrl: 'https://test.vault.azure.net',
    });
    const infraSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    process.argv = [
      'node',
      'cli.js',
      '--push',
      '--key',
      'API_KEY',
      '--value',
      'secret',
      '--secret-path',
      '/my/path',
    ];

    // Act
    await main();

    // Assert
    expect(infraSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'azure',
        vaultUrl: 'https://test.vault.azure.net',
      }),
      expect.any(Object),
    );
  });
});
