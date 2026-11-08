import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../../../src/envilder/apps/gha/entry/Gha';
import { Startup } from '../../../../../src/envilder/apps/gha/Startup';
import { DispatchActionCommand } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import { ValidateMapFileCommandHandler } from '../../../../../src/envilder/core/application/validateMapFile/ValidateMapFileCommandHandler';
import type { CliOptions } from '../../../../../src/envilder/core/domain/CliOptions';
import { SecretsFetchError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { OperationMode } from '../../../../../src/envilder/core/domain/OperationMode';
import { GitHubActionsLogger } from '../../../../../src/envilder/core/infrastructure/github/GitHubActionsLogger';
import * as FileVariableStore from '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore';

vi.mock(
  '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
  async () => {
    const actual = await vi.importActual(
      '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
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

  const validateMapFile = vi
    .spyOn(ValidateMapFileCommandHandler.prototype, 'handle')
    .mockResolvedValue([]);

  return { mockCommandHandler, validateMapFile };
}

describe('GitHubAction', () => {
  let mocks: ReturnType<typeof patchWithMocks>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    mocks = patchWithMocks();
    originalEnv = { ...process.env };
    delete process.env.INPUT_COMMAND;
  });

  function dispatchedCommand(): DispatchActionCommand {
    return mocks.mockCommandHandler.handleCommand.mock
      .calls[0][0] as DispatchActionCommand;
  }

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

  it('Should_ExportToJobEnvironment_When_NeitherEnvFileNorCommandIsSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    delete process.env.INPUT_ENV_FILE;

    // Act
    const exitCode = await main();

    // Assert
    expect(exitCode).toBe(0);
    expect(dispatchedCommand().mode).toBe(OperationMode.EXPORT_TO_ENVIRONMENT);
    expect(dispatchedCommand().map).toBe('test-map.json');
  });

  it('Should_RunCommandWithBashLikeRunSteps_When_CommandIsSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    delete process.env.INPUT_ENV_FILE;
    process.env.INPUT_COMMAND = './deploy.sh --prod';

    // Act
    await main();

    // Assert
    const command = dispatchedCommand();
    expect(command.mode).toBe(OperationMode.EXEC);
    expect(command.command).toBe('bash');
    expect(command.args).toEqual([
      '--noprofile',
      '--norc',
      '-eo',
      'pipefail',
      '-c',
      './deploy.sh --prod',
    ]);
  });

  it('Should_ReturnCommandExitCode_When_CommandIsSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    delete process.env.INPUT_ENV_FILE;
    process.env.INPUT_COMMAND = 'exit 3';
    mocks.mockCommandHandler.handleCommand.mockResolvedValue(3);

    // Act
    const exitCode = await main();

    // Assert
    expect(exitCode).toBe(3);
  });

  it('Should_ExitWithError_When_EnvFileAndCommandAreBothSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    process.env.INPUT_COMMAND = 'pnpm test';
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow(
      'Use either env-file or command, not both.',
    );
    expect(mocks.mockCommandHandler.handleCommand).not.toHaveBeenCalled();
  });

  it('Should_IgnoreBlankCommand_When_CommandInputIsWhitespace', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    delete process.env.INPUT_ENV_FILE;
    process.env.INPUT_COMMAND = '   ';

    // Act
    await main();

    // Assert
    expect(dispatchedCommand().mode).toBe(OperationMode.EXPORT_TO_ENVIRONMENT);
  });

  it('Should_LogFailureListAndThrow_When_SecretsFetchErrorIsThrown', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    const fetchError = new SecretsFetchError([
      { envVar: 'DB_URL', path: '/app/db/url', reason: 'ParameterNotFound' },
    ]);
    mocks.mockCommandHandler.handleCommand.mockRejectedValue(fetchError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toBe(fetchError);
    const loggedLines = consoleSpy.mock.calls.map((call) => call[0] as string);
    expect(loggedLines.some((line) => line.includes('GAME OVER'))).toBe(true);
    expect(loggedLines.some((line) => line.includes('DB_URL'))).toBe(true);
  });

  it('Should_LogGenericGameOverMessageWithoutMarioReference_When_UnknownErrorIsThrown', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    const genericError = new Error('Connection timeout');
    mocks.mockCommandHandler.handleCommand.mockRejectedValue(genericError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toBe(genericError);
    const loggedLines = consoleSpy.mock.calls
      .map((call) => call[0] as string)
      .join('\n');
    expect(loggedLines).toContain('GAME OVER');
    expect(loggedLines).not.toContain('Mario');
  });

  it('Should_UsePullMode_When_EnvFileIsSet', async () => {
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
    expect(capturedOptions).toMatchObject({
      map: 'test-map.json',
      envfile: 'test.env',
      push: false,
    });
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

  describe('map file validation', () => {
    beforeEach(() => {
      vi.mocked(FileVariableStore.readMapFileConfig).mockResolvedValue({});
    });

    it('Should_ValidateMapFileWithInputOverrides_When_ActionRuns', async () => {
      // Arrange
      process.env.INPUT_MAP_FILE = 'test-map.json';
      process.env.INPUT_PROVIDER = 'azure';
      process.env.INPUT_VAULT_URL = 'https://my-vault.vault.azure.net';

      // Act
      await main();

      // Assert
      expect(mocks.validateMapFile).toHaveBeenCalledTimes(1);
      const command = mocks.validateMapFile.mock.calls[0][0];
      expect(command.mapPath).toBe('test-map.json');
      expect(command.overrides).toEqual({
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
      });
      expect(command.supportedProviders).toEqual(['aws', 'azure']);
    });

    it('Should_WarnEachViolationAndStillLoadSecrets_When_MapFileHasViolations', async () => {
      // Arrange
      process.env.INPUT_MAP_FILE = 'test-map.json';
      delete process.env.INPUT_ENV_FILE;
      mocks.validateMapFile.mockResolvedValue([
        { key: '$config.region', message: 'first problem.' },
        { key: 'PORT', message: 'second problem.' },
      ]);
      const warn = vi
        .spyOn(GitHubActionsLogger.prototype, 'warn')
        .mockImplementation(() => {});

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Map file has 2 problems: test-map.json'),
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('first problem.'),
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('second problem.'),
      );
      expect(mocks.mockCommandHandler.handleCommand).toHaveBeenCalledTimes(1);
    });

    it('Should_NotWarn_When_MapFileIsValid', async () => {
      // Arrange
      process.env.INPUT_MAP_FILE = 'test-map.json';
      const warn = vi
        .spyOn(GitHubActionsLogger.prototype, 'warn')
        .mockImplementation(() => {});

      // Act
      await main();

      // Assert
      expect(warn).not.toHaveBeenCalled();
    });

    it('Should_WarnAboutUnknownConfigField_When_RealMapFileHasOne', async () => {
      // Arrange
      const dir = await mkdtemp(join(tmpdir(), 'envilder-gha-'));
      const mapFile = join(dir, 'envilder.json');
      await writeFile(
        mapFile,
        JSON.stringify({
          $config: { region: 'eu-west-1' },
          API_KEY: '/app/key',
        }),
      );
      process.env.INPUT_MAP_FILE = mapFile;
      mocks.validateMapFile.mockRestore();
      const warn = vi
        .spyOn(GitHubActionsLogger.prototype, 'warn')
        .mockImplementation(() => {});

      try {
        // Act
        await main();

        // Assert
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('$config.region'),
        );
        expect(mocks.mockCommandHandler.handleCommand).toHaveBeenCalledTimes(1);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  });
});
