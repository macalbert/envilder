import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../src/Cli.ts';
import { EnvilderBuilder } from '../src/cli/application/builders/EnvilderBuilder';
import { Envilder } from '../src/cli/application/EnvilderHandler.ts';
import type { IEnvFileManager } from '../src/cli/domain/ports/IEnvFileManager.ts';
import type { ISecretProvider } from '../src/cli/domain/ports/ISecretProvider.ts';

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
    const envilderSpy = vi
      .spyOn(Envilder.prototype, 'run')
      .mockResolvedValue(undefined);
    const withAwsProviderSpy = vi.spyOn(
      EnvilderBuilder.prototype,
      'withAwsProvider',
    );

    // Act
    await main();

    // Assert
    expect(envilderSpy).toHaveBeenCalledWith('map.json', '.env');
    expect(withAwsProviderSpy).toHaveBeenCalledWith('test-profile');
    withAwsProviderSpy.mockRestore();
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

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toThrow(
      /Missing required arguments: --map and --envfile/i,
    );

    buildSpy.mockRestore();
  });
});
