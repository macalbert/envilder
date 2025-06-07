import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../src/Cli';
import { Envilder } from '../../src/cli/application/EnvilderHandler';
import { EnvilderBuilder } from '../../src/cli/domain/EnvilderBuilder';
import type { IEnvFileManager } from '../../src/cli/domain/ports/IEnvFileManager';
import type { ISecretProvider } from '../../src/cli/domain/ports/ISecretProvider';

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

describe('Cli main (unit, inject mocks via builder)', () => {
  let mockFileManager: IEnvFileManager;
  let mockProvider: ISecretProvider;
  const testProfile = 'test-profile';

  beforeEach(() => {
    mockFileManager = {
      loadParamMap: vi.fn(() => ({ FOO: 'BAR' })),
      loadExistingEnvVariables: vi.fn(() => ({})),
      writeEnvFile: vi.fn(),
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
});
