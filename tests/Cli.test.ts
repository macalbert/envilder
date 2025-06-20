import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../src/Cli.ts';
import { Envilder } from '../src/cli/application/EnvilderHandler.ts';
import { EnvilderBuilder } from '../src/cli/application/builders/EnvilderBuilder';
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
    const envilderSpy = vi.spyOn(Envilder.prototype, 'run');
    const withAwsProviderSpy = vi.spyOn(
      EnvilderBuilder.prototype,
      'withAwsProvider',
    );

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toThrow(
      /required option|process\.exit called|CommanderError/i,
    );
    expect(envilderSpy).not.toHaveBeenCalled();
    expect(withAwsProviderSpy).not.toHaveBeenCalled();
    withAwsProviderSpy.mockRestore();
  });
});
