import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../src/Cli';
import { EnvilderBuilder } from '../src/cli/application/builders/EnvilderBuilder';
import { DispatchActionCommand } from '../src/cli/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../src/cli/application/dispatch/DispatchActionCommandHandler';
import { OperationMode } from '../src/cli/domain/OperationMode';
import type { IEnvFileManager } from '../src/cli/domain/ports/IEnvFileManager';
import type { ISecretProvider } from '../src/cli/domain/ports/ISecretProvider';

function patchBuilderWithMocks(
  mockFileManager: IEnvFileManager,
  mockProvider: ISecretProvider,
  profile: string,
) {
  vi.spyOn(EnvilderBuilder, 'build').mockImplementation(() => {
    const builder = new EnvilderBuilder();
    builder.withEnvFileManager(mockFileManager);
    builder.withAwsProvider(profile);
    builder.withProvider(mockProvider);
    builder.withLogger({ info: vi.fn(), warn: vi.fn(), error: vi.fn() });
    return builder;
  });
}

describe('Cli', () => {
  let mockFileManager: IEnvFileManager;
  let mockProvider: ISecretProvider;
  const testProfile = 'test-profile';

  beforeEach(() => {
    mockFileManager = {
      loadMapFile: vi.fn(async () => ({ FOO: 'BAR' })),
      loadEnvFile: vi.fn(async () => ({})),
      saveEnvFile: vi.fn(async () => {}),
    };
    mockProvider = {
      getSecret: vi.fn(async () => 'secret-value'),
      setSecret: vi.fn(async () => {}),
    };
    patchBuilderWithMocks(mockFileManager, mockProvider, testProfile);
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
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
    vi.spyOn(Envilder.prototype, 'run').mockResolvedValue(undefined);
    const withAwsProviderSpy = vi.spyOn(
      EnvilderBuilder.prototype,
      'withAwsProvider',
    );
    const handleCommandSpy = vi
      .spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
      .mockResolvedValue(undefined);

    // Act
    await main();

    // Assert
    expect(withAwsProviderSpy).toHaveBeenCalledWith('test-profile');
    expect(handleCommandSpy).toHaveBeenCalled();
    const commandArg = handleCommandSpy.mock.calls[0][0];
    expect(commandArg).toBeInstanceOf(DispatchActionCommand);
    expect(commandArg.map).toBe('map.json');
    expect(commandArg.envfile).toBe('.env');

    withAwsProviderSpy.mockRestore();
    handleCommandSpy.mockRestore();
  });

  it('Should_ThrowError_When_ArgumentsAreInvalids', async () => {
    // Arrange
    process.argv = [
      'node',
      'cli.js',
      '--map',
      // missing map file argument
      '--envfile',
      // missing envfile argument
    ];

    // Mock EnvilderBuilder.build to avoid creating actual instances
    const buildSpy = vi
      .spyOn(EnvilderBuilder, 'build')
      .mockImplementation(() => {
        const mockBuilder = {
          withConsoleLogger: vi.fn().mockReturnThis(),
          withDefaultFileManager: vi.fn().mockReturnThis(),
          withAwsProvider: vi.fn().mockReturnThis(),
          create: vi.fn().mockReturnValue({
            run: vi.fn(),
            importEnvFile: vi.fn(),
            pushSingleVariableToSSM: vi.fn(),
          }),
        };
        return mockBuilder as unknown as EnvilderBuilder;
      });

    // Mock the fromCliOptions method to let us verify it was called with invalid options
    const fromCliOptionsSpy = vi.spyOn(DispatchActionCommand, 'fromCliOptions');

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toThrow(
      /Missing required arguments: --map and --envfile/i,
    );
    expect(fromCliOptionsSpy).toHaveBeenCalled();

    // Cleanup
    buildSpy.mockRestore();
    fromCliOptionsSpy.mockRestore();
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
    expect(exportCommand.mode).toBe(OperationMode.EXPORT_SSM_TO_ENV);
    expect(exportCommand.map).toBe('map.json');
    expect(exportCommand.envfile).toBe('.env');
  });

  it('Should_CreateImportEnvCommand_When_OptionsAreProvided', () => {
    // Arrange
    const options = {
      map: 'map.json',
      envfile: '.env',
      import: true,
    };

    // Act
    const importCommand = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(importCommand.mode).toBe(OperationMode.IMPORT_ENV_TO_SSM);
  });

  it('Should_CreateSinglePushCommand_When_OptionsAreProvided', () => {
    // Arrange
    const options = {
      key: 'API_KEY',
      value: 'secret123',
      ssmPath: '/my/path',
    };

    // Act
    const pushCommand = DispatchActionCommand.fromCliOptions(options);

    // Assert
    expect(pushCommand.mode).toBe(OperationMode.PUSH_SINGLE_VARIABLE);
    expect(pushCommand.key).toBe('API_KEY');
    expect(pushCommand.value).toBe('secret123');
    expect(pushCommand.ssmPath).toBe('/my/path');
  });
});
