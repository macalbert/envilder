import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DispatchActionCommand } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import type { PullSecretsToEnvCommandHandler } from '../../../../../src/envilder/core/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler';
import type { PushEnvToSecretsCommandHandler } from '../../../../../src/envilder/core/application/pushEnvToSecrets/PushEnvToSecretsCommandHandler';
import type { PushSingleCommandHandler } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommandHandler';
import { OperationMode } from '../../../../../src/envilder/core/domain/OperationMode';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';

const mockPullHandler = {
  handle: vi.fn(),
} as unknown as PullSecretsToEnvCommandHandler;

const mockPushHandler = {
  handle: vi.fn(),
} as unknown as PushEnvToSecretsCommandHandler;

const mockPushSingleHandler = {
  handle: vi.fn(),
} as unknown as PushSingleCommandHandler;

const mockSecretProvider = {
  getSecret: vi.fn(),
  setSecret: vi.fn(),
  logIdentity: vi.fn(),
} as unknown as ISecretProvider;

describe('DispatchActionCommandHandler', () => {
  const sut = new DispatchActionCommandHandler(
    mockPullHandler,
    mockPushHandler,
    mockPushSingleHandler,
    mockSecretProvider,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should_CallPullSecretsToEnv_When_PullSecretsToEnvModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PULL_SECRETS_TO_ENV,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPullHandler.handle).toHaveBeenCalled();
  });

  it('Should_CallPushEnvToSecrets_When_PushEnvToSecretsModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PUSH_ENV_TO_SECRETS,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushHandler.handle).toHaveBeenCalled();
  });

  it('Should_CallPushSingleToSecretStore_When_PushSingleModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      'TEST_KEY',
      'test-value',
      '/test/path',
      undefined,
      OperationMode.PUSH_SINGLE,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushSingleHandler.handle).toHaveBeenCalled();
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForExportMode', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PUSH_ENV_TO_SECRETS,
    );

    // Act
    const action = () => sut.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForImportMode', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
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

  it('Should_LogIdentity_When_HandlingAnyCommand', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PULL_SECRETS_TO_ENV,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockSecretProvider.logIdentity).toHaveBeenCalled();
  });

  it('Should_NotLogIdentity_When_RequiredArgumentsAreMissing', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
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
    expect(mockSecretProvider.logIdentity).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_UnsupportedModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      'UNKNOWN_MODE' as OperationMode,
    );

    // Act
    const action = () => sut.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Unsupported operation mode: UNKNOWN_MODE',
    );
    expect(mockPullHandler.handle).not.toHaveBeenCalled();
  });
});
