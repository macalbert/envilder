import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../src/apps/cli/Cli';
import { DispatchActionCommandHandlerBuilder } from '../../../src/envilder/application/dispatch/builders/DispatchActionCommandHandlerBuilder';
import { DispatchActionCommand } from '../../../src/envilder/application/dispatch/DispatchActionCommand';
import { OperationMode } from '../../../src/envilder/domain/OperationMode';

function patchBuilderWithMocks() {
  const mockCommandHandler = {
    handleCommand: vi.fn().mockResolvedValue(undefined),
  };

  const mockBuilder = {
    withEnvFileManager: vi.fn().mockReturnThis(),
    withProvider: vi.fn().mockReturnThis(),
    withLogger: vi.fn().mockReturnThis(),
    create: vi.fn().mockReturnValue(mockCommandHandler),
  };

  vi.spyOn(DispatchActionCommandHandlerBuilder, 'build').mockImplementation(
    () => mockBuilder,
  );

  return { mockBuilder, mockCommandHandler };
}

describe('Cli', () => {
  const testProfile = 'test-profile';
  let mocks: ReturnType<typeof patchBuilderWithMocks>;

  beforeEach(() => {
    mocks = patchBuilderWithMocks();
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
    expect(mocks.mockBuilder.withProvider).toHaveBeenCalled();
    expect(mocks.mockCommandHandler.handleCommand).toHaveBeenCalledWith(
      mockCommand,
    );
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
