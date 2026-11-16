import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DispatchActionCommand } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import type { ExportSecretsToEnvironmentCommandHandler } from '../../../../../src/envilder/core/application/exportSecretsToEnvironment/ExportSecretsToEnvironmentCommandHandler';
import type { PullSecretsToEnvCommandHandler } from '../../../../../src/envilder/core/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler';
import type { PushEnvToSecretsCommandHandler } from '../../../../../src/envilder/core/application/pushEnvToSecrets/PushEnvToSecretsCommandHandler';
import type { PushSingleCommandHandler } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommandHandler';
import { InvalidArgumentError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { OperationMode } from '../../../../../src/envilder/core/domain/OperationMode';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';

describe('DispatchActionCommandHandler (export to environment)', () => {
  let pullHandle: Mock;
  let exportHandle: Mock;
  let logIdentity: Mock;

  beforeEach(() => {
    pullHandle = vi.fn().mockResolvedValue(undefined);
    exportHandle = vi.fn().mockResolvedValue(undefined);
    logIdentity = vi.fn().mockResolvedValue(undefined);
  });

  function buildSut(
    withExportHandler: boolean = true,
  ): DispatchActionCommandHandler {
    return new DispatchActionCommandHandler(
      { handle: pullHandle } as unknown as PullSecretsToEnvCommandHandler,
      { handle: vi.fn() } as unknown as PushEnvToSecretsCommandHandler,
      { handle: vi.fn() } as unknown as PushSingleCommandHandler,
      {
        getSecret: vi.fn(),
        setSecret: vi.fn(),
        logIdentity,
      } as unknown as ISecretProvider,
      undefined,
      withExportHandler
        ? ({
            handle: exportHandle,
          } as unknown as ExportSecretsToEnvironmentCommandHandler)
        : undefined,
    );
  }

  it('Should_BuildExportMode_When_ForExportIsUsed', () => {
    // Act
    const actual = DispatchActionCommand.forExport('map.json');

    // Assert
    expect(actual.mode).toBe(OperationMode.EXPORT_TO_ENVIRONMENT);
    expect(actual.map).toBe('map.json');
    expect(actual.envfile).toBeUndefined();
  });

  it('Should_DelegateToExportHandler_When_ExportModeIsProvided', async () => {
    // Arrange
    const sut = buildSut();
    const command = DispatchActionCommand.forExport('map.json');

    // Act
    const actual = await sut.handleCommand(command);

    // Assert
    expect(actual).toBeUndefined();
    expect(exportHandle).toHaveBeenCalledWith(
      expect.objectContaining({ mapPath: 'map.json' }),
    );
    expect(pullHandle).not.toHaveBeenCalled();
  });

  it('Should_LogIdentity_When_ExportModeIsProvided', async () => {
    // Arrange
    const sut = buildSut();
    const command = DispatchActionCommand.forExport('map.json');

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(logIdentity).toHaveBeenCalledTimes(1);
  });

  it('Should_ThrowInvalidArgumentError_When_ExportMapIsMissing', async () => {
    // Arrange
    const sut = buildSut();
    const command = DispatchActionCommand.forExport('');

    // Act
    const actual = await sut
      .handleCommand(command)
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect(exportHandle).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_ExportHandlerIsNotAvailable', async () => {
    // Arrange
    const sut = buildSut(false);
    const command = DispatchActionCommand.forExport('map.json');

    // Act
    const actual = await sut
      .handleCommand(command)
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).toMatch(/not available/i);
  });
});
