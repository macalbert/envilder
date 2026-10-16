import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DispatchActionCommand } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import type { ExecWithSecretsCommandHandler } from '../../../../../src/envilder/core/application/execWithSecrets/ExecWithSecretsCommandHandler';
import type { PullSecretsToEnvCommandHandler } from '../../../../../src/envilder/core/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler';
import type { PushEnvToSecretsCommandHandler } from '../../../../../src/envilder/core/application/pushEnvToSecrets/PushEnvToSecretsCommandHandler';
import type { PushSingleCommandHandler } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommandHandler';
import { InvalidArgumentError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { OperationMode } from '../../../../../src/envilder/core/domain/OperationMode';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';

function execCommand(
  map: string | undefined,
  command: string | undefined,
  args: string[] = [],
): DispatchActionCommand {
  return new DispatchActionCommand(
    map,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    OperationMode.EXEC,
    command,
    args,
  );
}

describe('DispatchActionCommandHandler (exec)', () => {
  let pullHandle: Mock;
  let pushHandle: Mock;
  let pushSingleHandle: Mock;
  let execHandle: Mock;
  let logIdentity: Mock;
  let pullHandler: PullSecretsToEnvCommandHandler;
  let pushHandler: PushEnvToSecretsCommandHandler;
  let pushSingleHandler: PushSingleCommandHandler;
  let execHandler: ExecWithSecretsCommandHandler;
  let secretProvider: ISecretProvider;

  beforeEach(() => {
    pullHandle = vi.fn().mockResolvedValue(undefined);
    pushHandle = vi.fn().mockResolvedValue(undefined);
    pushSingleHandle = vi.fn().mockResolvedValue(undefined);
    execHandle = vi.fn().mockResolvedValue(7);
    logIdentity = vi.fn().mockResolvedValue(undefined);
    pullHandler = {
      handle: pullHandle,
    } as unknown as PullSecretsToEnvCommandHandler;
    pushHandler = {
      handle: pushHandle,
    } as unknown as PushEnvToSecretsCommandHandler;
    pushSingleHandler = {
      handle: pushSingleHandle,
    } as unknown as PushSingleCommandHandler;
    execHandler = {
      handle: execHandle,
    } as unknown as ExecWithSecretsCommandHandler;
    secretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(),
      logIdentity,
    } as unknown as ISecretProvider;
  });

  function buildSut(
    withExecHandler: boolean = true,
  ): DispatchActionCommandHandler {
    return new DispatchActionCommandHandler(
      pullHandler,
      pushHandler,
      pushSingleHandler,
      secretProvider,
      withExecHandler ? execHandler : undefined,
    );
  }

  it('Should_DelegateToExecHandlerAndReturnExitCode_When_ExecModeIsProvided', async () => {
    // Arrange
    const sut = buildSut();
    const command = execCommand('map.json', 'node', ['app.js', '--port', '3']);

    // Act
    const actual = await sut.handleCommand(command);

    // Assert
    expect(actual).toBe(7);
    expect(execHandle).toHaveBeenCalledTimes(1);
    expect(execHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        mapPath: 'map.json',
        command: 'node',
        args: ['app.js', '--port', '3'],
      }),
    );
    expect(pullHandle).not.toHaveBeenCalled();
    expect(pushHandle).not.toHaveBeenCalled();
    expect(pushSingleHandle).not.toHaveBeenCalled();
  });

  it('Should_NotRequireEnvfile_When_ExecModeIsProvided', async () => {
    // Arrange
    const sut = buildSut();
    const command = execCommand('map.json', 'node');

    // Act
    const actual = await sut
      .handleCommand(command)
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBe(7);
    expect(execHandle).toHaveBeenCalledTimes(1);
  });

  it('Should_NotLogIdentity_When_ExecModeIsProvided', async () => {
    // Arrange
    const sut = buildSut();
    const command = execCommand('map.json', 'node');

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(logIdentity).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_ExecHandlerIsNotAvailable', async () => {
    // Arrange
    const sut = buildSut(false);
    const command = execCommand('map.json', 'node');

    // Act
    const actual = await sut
      .handleCommand(command)
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).toMatch(/exec/i);
    expect((actual as Error).message).toMatch(/not available/i);
    expect(pullHandle).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_ExecCommandIsMissing', async () => {
    // Arrange
    const sut = buildSut();
    const command = execCommand('map.json', undefined);

    // Act
    const actual = await sut
      .handleCommand(command)
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).not.toContain('--envfile');
    expect(execHandle).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_ExecMapIsMissing', async () => {
    // Arrange
    const sut = buildSut();
    const command = execCommand(undefined, 'node');

    // Act
    const actual = await sut
      .handleCommand(command)
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).not.toContain('--envfile');
    expect(execHandle).not.toHaveBeenCalled();
  });

  it('Should_ReturnUndefinedAndCallPull_When_PullModeIsProvidedWithExecHandlerBound', async () => {
    // Arrange
    const sut = buildSut();
    const command = new DispatchActionCommand(
      'map.json',
      '.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PULL_SECRETS_TO_ENV,
    );

    // Act
    const actual = await sut.handleCommand(command);

    // Assert
    expect(actual).toBeUndefined();
    expect(pullHandle).toHaveBeenCalledTimes(1);
    expect(execHandle).not.toHaveBeenCalled();
  });

  it('Should_ReturnUndefinedAndCallPush_When_PushModeIsProvidedWithExecHandlerBound', async () => {
    // Arrange
    const sut = buildSut();
    const command = new DispatchActionCommand(
      'map.json',
      '.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PUSH_ENV_TO_SECRETS,
    );

    // Act
    const actual = await sut.handleCommand(command);

    // Assert
    expect(actual).toBeUndefined();
    expect(pushHandle).toHaveBeenCalledTimes(1);
    expect(execHandle).not.toHaveBeenCalled();
  });

  it('Should_KeepEnvfileValidation_When_PullModeHasNoEnvfile', async () => {
    // Arrange
    const sut = buildSut();
    const command = new DispatchActionCommand(
      'map.json',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PULL_SECRETS_TO_ENV,
    );

    // Act
    const action = () => sut.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_PassSourceLabelToExecHandler_When_ExecCommandHasSourceLabel', async () => {
    // Arrange
    const sut = buildSut();
    const command = DispatchActionCommand.forExec(
      'map.json',
      'node',
      ['app.js'],
      'aws, profile=dev',
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(execHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        mapPath: 'map.json',
        command: 'node',
        args: ['app.js'],
        sourceLabel: 'aws, profile=dev',
      }),
    );
  });
});
