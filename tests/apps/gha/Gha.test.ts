import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../src/apps/gha/Gha';
import { Startup } from '../../../src/apps/gha/Startup';
import { DispatchActionCommand } from '../../../src/envilder/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../src/envilder/application/dispatch/DispatchActionCommandHandler';
import type { CliOptions } from '../../../src/envilder/domain/CliOptions';

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
    process.env.AZURE_KEY_VAULT_URL = 'https://my-vault.vault.azure.net';

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith(undefined, 'azure');
  });

  it('Should_DefaultToUndefinedProvider_When_ProviderInputIsNotSet', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    delete process.env.INPUT_PROVIDER;

    const configureSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

    // Act
    await main();

    // Assert
    expect(configureSpy).toHaveBeenCalledWith(undefined, undefined);
  });

  it('Should_ThrowError_When_AzureProviderSelectedButVaultUrlMissing', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    process.env.INPUT_PROVIDER = 'azure';
    delete process.env.AZURE_KEY_VAULT_URL;

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow(
      'AZURE_KEY_VAULT_URL environment variable is required',
    );
  });
});
