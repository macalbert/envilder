import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../src/apps/githubAction/GitHubAction';
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
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('Should_ReadInputsFromEnvironmentVariables_When_ActionIsInvoked', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    process.env.INPUT_AWS_PROFILE = 'test-profile';

    const mockCommand = {
      map: 'test-map.json',
      envfile: 'test.env',
      profile: 'test-profile',
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
    expect(mockCommand.profile).toBe('test-profile');
  });

  it('Should_HandleOptionalAwsProfile_When_NotProvided', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = 'test.env';
    // INPUT_AWS_PROFILE not set

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
    expect(mockCommand.profile).toBeUndefined();
  });

  it('Should_ExitWithError_When_RequiredInputsAreMissing', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = undefined;
    process.env.INPUT_ENV_FILE = undefined;

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('process.exit called');
  });

  it('Should_ExitWithError_When_MapFileIsMissing', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = undefined;
    process.env.INPUT_ENV_FILE = 'test.env';

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('process.exit called');
  });

  it('Should_ExitWithError_When_EnvFileIsMissing', async () => {
    // Arrange
    process.env.INPUT_MAP_FILE = 'test-map.json';
    process.env.INPUT_ENV_FILE = undefined;

    // Act
    const action = () => main();

    // Assert
    await expect(action()).rejects.toThrow('process.exit called');
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
});
