import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../src/Cli';
import { DispatchActionCommandHandlerBuilder } from '../src/cli/application/dispatch/builders/DispatchActionCommandHandlerBuilder';
import { DispatchActionCommand } from '../src/cli/application/dispatch/DispatchActionCommand';
import { OperationMode } from '../src/cli/domain/OperationMode';

function patchBuilderWithMocks() {
  vi.spyOn(DispatchActionCommandHandlerBuilder, 'build').mockImplementation(
    () => {
      const builder = {
        withEnvFileManager: vi.fn().mockReturnThis(),
        withProvider: vi.fn().mockReturnThis(),
        withLogger: vi.fn().mockReturnThis(),
        create: vi.fn().mockReturnValue({
          handleCommand: vi.fn().mockResolvedValue(undefined),
        }),
      };
      return builder;
    },
  );
}

describe('Cli', () => {
  const testProfile = 'test-profile';

  beforeEach(() => {
    patchBuilderWithMocks();
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

    // Create mock instances for each dependency
    const mockCommandHandler = {
      handleCommand: vi.fn().mockResolvedValue(undefined),
    };

    // Mock the builder chain
    const mockBuilder = {
      withLogger: vi.fn().mockReturnThis(),
      withEnvFileManager: vi.fn().mockReturnThis(),
      withProvider: vi.fn().mockReturnThis(),
      create: vi.fn().mockReturnValue(mockCommandHandler),
    };

    vi.spyOn(DispatchActionCommandHandlerBuilder, 'build').mockReturnValue(
      mockBuilder,
    );

    // Mock command creation
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
    expect(mockBuilder.withProvider).toHaveBeenCalled();
    expect(mockCommandHandler.handleCommand).toHaveBeenCalledWith(mockCommand);
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
