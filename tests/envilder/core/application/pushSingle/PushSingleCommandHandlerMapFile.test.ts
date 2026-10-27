import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PushSingleCommand } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommand';
import { PushSingleCommandHandler } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommandHandler';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

describe('PushSingleCommandHandler map file update', () => {
  const MAP_FILE = 'envilder.json';
  const KEY = 'API_KEY';
  const SECRET_VALUE = 'super-secret-value';
  const SECRET_PATH = '/envilder/demo/api-key';
  const AWS = { provider: 'aws' };
  const AZURE = {
    provider: 'azure',
    vaultUrl: 'https://my-vault.vault.azure.net',
  };
  let mockSecretProvider: ISecretProvider;
  let mockLogger: ILogger;
  let mockVariableStore: IVariableStore;
  let sut: PushSingleCommandHandler;

  const commandFor = (target = AWS) =>
    PushSingleCommand.create(KEY, SECRET_VALUE, SECRET_PATH, MAP_FILE, target);

  const allLoggedText = () =>
    [
      ...vi.mocked(mockLogger.info).mock.calls,
      ...vi.mocked(mockLogger.warn).mock.calls,
      ...vi.mocked(mockLogger.error).mock.calls,
    ]
      .map(([message]) => message)
      .join('\n');

  beforeEach(() => {
    mockSecretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(async (): Promise<void> => {}),
    };
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    mockVariableStore = {
      getMapping: vi.fn(),
      getParsedMapping: vi.fn(),
      getEnvironment: vi.fn(),
      saveEnvironment: vi.fn(),
      readMapFileContent: vi.fn(async () => null),
      writeMapFileContent: vi.fn(async (): Promise<void> => {}),
      restoreMapFile: vi.fn(async (): Promise<void> => {}),
    };
    sut = new PushSingleCommandHandler(
      mockSecretProvider,
      mockLogger,
      mockVariableStore,
    );
  });

  it('Should_NotTouchMapFile_When_MapFileIsUndefined', async () => {
    // Arrange
    const command = PushSingleCommand.create(KEY, SECRET_VALUE, SECRET_PATH);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.readMapFileContent).not.toHaveBeenCalled();
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
    expect(mockVariableStore.restoreMapFile).not.toHaveBeenCalled();
    expect(mockSecretProvider.setSecret).toHaveBeenCalledOnce();
  });

  it('Should_CreateMapFileBeforePushing_When_MapFileDoesNotExist', async () => {
    // Arrange
    const command = commandFor();

    // Act
    await sut.handle(command);

    // Assert
    const written = vi.mocked(mockVariableStore.writeMapFileContent);
    expect(written).toHaveBeenCalledOnce();
    expect(written.mock.calls[0][0]).toBe(MAP_FILE);
    expect(JSON.parse(written.mock.calls[0][1])).toEqual({
      [KEY]: SECRET_PATH,
    });
    expect(written.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(mockSecretProvider.setSecret).mock.invocationCallOrder[0],
    );
    expect(allLoggedText()).toContain(`Created ${MAP_FILE}`);
  });

  it('Should_WriteAzureConfig_When_CreatingMapFileForAzure', async () => {
    // Arrange
    const command = commandFor(AZURE);

    // Act
    await sut.handle(command);

    // Assert
    const written = vi.mocked(mockVariableStore.writeMapFileContent);
    expect(JSON.parse(written.mock.calls[0][1]).$config).toEqual(AZURE);
  });

  it('Should_AppendMapping_When_MapFileExistsWithoutKey', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(
      async () => '{\n  "OTHER": "/other"\n}\n',
    );
    const command = commandFor();

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.writeMapFileContent).toHaveBeenCalledWith(
      MAP_FILE,
      `{\n  "OTHER": "/other",\n  "${KEY}": "${SECRET_PATH}"\n}\n`,
    );
    expect(allLoggedText()).toContain(`Added ${KEY} to ${MAP_FILE}`);
  });

  it('Should_NotWriteMapFile_When_MappingAlreadyExistsWithSamePath', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(
      async () => `{"${KEY}":"${SECRET_PATH}"}`,
    );
    const command = commandFor();

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
    expect(mockSecretProvider.setSecret).toHaveBeenCalledOnce();
    expect(allLoggedText()).toContain(
      `${KEY} already mapped in ${MAP_FILE}, no changes`,
    );
  });

  it('Should_FailBeforePushing_When_VariableIsMappedToDifferentPath', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(
      async () => `{"${KEY}":"/very/private/other/path"}`,
    );
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(
      `${KEY} is already mapped to a different secret path in ${MAP_FILE}. Nothing was pushed. Update the mapping manually, or use --no-map-update to push without recording it.`,
    );
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
    expect(allLoggedText()).not.toContain('/very/private/other/path');
  });

  it('Should_FailBeforePushing_When_MapFileHasInvalidJson', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(async () => '{ nope');
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(
      `Invalid JSON in parameter map file: ${MAP_FILE}`,
    );
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
  });

  it('Should_PushAndWarnWithoutWriting_When_MapFileTargetsAnotherProvider', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(async () =>
      JSON.stringify({ $config: AZURE }),
    );
    const command = commandFor(AWS);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockSecretProvider.setSecret).toHaveBeenCalledOnce();
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledOnce();
    expect(vi.mocked(mockLogger.warn).mock.calls[0][0]).toContain(
      `⚠ ${MAP_FILE} targets azure (my-vault), but the secret was pushed to aws. The mapping was not added. Use --map=<file> to record it in a different map file.`,
    );
  });

  it('Should_NameVaultOfPushTarget_When_MapFileTargetsAwsAndPushGoesToAzure', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(async () => '{}');
    const command = commandFor(AZURE);

    // Act
    await sut.handle(command);

    // Assert
    expect(vi.mocked(mockLogger.warn).mock.calls[0][0]).toContain(
      `${MAP_FILE} targets aws, but the secret was pushed to azure (my-vault).`,
    );
  });

  it('Should_NotPushAndRemovePartialFile_When_CreatingMapFileFails', async () => {
    // Arrange
    const writeError = new Error('disk full');
    mockVariableStore.writeMapFileContent = vi.fn(async () => {
      throw writeError;
    });
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(writeError);
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
    expect(mockVariableStore.restoreMapFile).toHaveBeenCalledWith(
      MAP_FILE,
      null,
    );
  });

  it('Should_NotPushAndRestoreOriginal_When_AppendingToMapFileFails', async () => {
    // Arrange
    const original = '{\n  "OTHER": "/other"\n}\n';
    mockVariableStore.readMapFileContent = vi.fn(async () => original);
    const writeError = new Error('disk full');
    mockVariableStore.writeMapFileContent = vi.fn(async () => {
      throw writeError;
    });
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(writeError);
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
    expect(mockVariableStore.writeMapFileContent).toHaveBeenCalledOnce();
    expect(mockVariableStore.restoreMapFile).toHaveBeenCalledWith(
      MAP_FILE,
      original,
    );
  });

  it('Should_RemoveCreatedMapFile_When_PushFails', async () => {
    // Arrange
    const pushError = new Error('access denied');
    mockSecretProvider.setSecret = vi.fn(async () => {
      throw pushError;
    });
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(pushError);
    expect(mockVariableStore.restoreMapFile).toHaveBeenCalledWith(
      MAP_FILE,
      null,
    );
  });

  it('Should_RestoreOriginalContent_When_PushFailsAfterAppending', async () => {
    // Arrange
    const original = '{\r\n    "OTHER": "/other"\r\n}';
    mockVariableStore.readMapFileContent = vi.fn(async () => original);
    const pushError = new Error('access denied');
    mockSecretProvider.setSecret = vi.fn(async () => {
      throw pushError;
    });
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(pushError);
    expect(mockVariableStore.writeMapFileContent).toHaveBeenCalledOnce();
    expect(mockVariableStore.restoreMapFile).toHaveBeenCalledWith(
      MAP_FILE,
      original,
    );
  });

  it('Should_NotRollBack_When_PushFailsAndMappingWasAlreadyPresent', async () => {
    // Arrange
    mockVariableStore.readMapFileContent = vi.fn(
      async () => `{"${KEY}":"${SECRET_PATH}"}`,
    );
    mockSecretProvider.setSecret = vi.fn(async () => {
      throw new Error('access denied');
    });
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow('access denied');
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
    expect(mockVariableStore.restoreMapFile).not.toHaveBeenCalled();
  });

  it('Should_RethrowPushErrorAndTellToCleanUp_When_RollbackFails', async () => {
    // Arrange
    const pushError = new Error('access denied');
    mockSecretProvider.setSecret = vi.fn(async () => {
      throw pushError;
    });
    mockVariableStore.restoreMapFile = vi.fn(async () => {
      throw new Error('locked');
    });
    const command = commandFor();

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(pushError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Could not restore ${MAP_FILE}. Remove ${KEY} from it manually.`,
    );
  });

  it('Should_NeverExposeSecretValue_When_UpdatingMapFile', async () => {
    // Arrange
    const command = commandFor();

    // Act
    await sut.handle(command);

    // Assert
    const written = vi.mocked(mockVariableStore.writeMapFileContent);
    expect(written.mock.calls[0][1]).not.toContain(SECRET_VALUE);
    expect(allLoggedText()).not.toContain(SECRET_VALUE);
  });

  it('Should_NotReadWriteOrPush_When_KeyNameIsInvalid', async () => {
    // Arrange
    const command = PushSingleCommand.create(
      '1 BAD',
      SECRET_VALUE,
      SECRET_PATH,
      MAP_FILE,
      AWS,
    );

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow();
    expect(mockVariableStore.readMapFileContent).not.toHaveBeenCalled();
    expect(mockVariableStore.writeMapFileContent).not.toHaveBeenCalled();
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
  });
});
