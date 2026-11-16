import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompareEnvFileValuesCommand } from '../../../../../src/envilder/core/application/validateEnvFile/CompareEnvFileValuesCommand';
import { CompareEnvFileValuesCommandHandler } from '../../../../../src/envilder/core/application/validateEnvFile/CompareEnvFileValuesCommandHandler';
import { ExpiredCredentialsError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import type { ISecretMasker } from '../../../../../src/envilder/core/domain/ports/ISecretMasker';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

const MAP_PATH = 'envilder.json';
const ENV_PATH = '.env';
const LOCAL_VALUE = 'fake-local-value-8Kd2Lp';
const REMOTE_VALUE = 'fake-remote-value-3Qz7Wn';

describe('CompareEnvFileValuesCommandHandler', () => {
  let secretProvider: ISecretProvider;
  let variableStore: IVariableStore;
  let logger: ILogger;
  let secretMasker: ISecretMasker;
  let sut: CompareEnvFileValuesCommandHandler;

  beforeEach(() => {
    secretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(),
      checkSecretsExist: vi.fn(),
    };
    variableStore = {
      getMapping: vi.fn(),
      getParsedMapping: vi.fn(),
      getEnvironment: vi.fn(),
      readEnvironmentEntries: vi.fn(),
      saveEnvironment: vi.fn(),
      readMapFileContent: vi.fn(),
      writeMapFileContent: vi.fn(),
      restoreMapFile: vi.fn(),
    };
    logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    secretMasker = { mask: vi.fn(), flush: vi.fn() };
    sut = new CompareEnvFileValuesCommandHandler(
      secretProvider,
      variableStore,
      logger,
      secretMasker,
    );
  });

  function givenFiles(
    mapping: Record<string, string>,
    entries: { key: string; value: string }[],
  ): void {
    vi.mocked(variableStore.getMapping).mockResolvedValue(mapping);
    vi.mocked(variableStore.readEnvironmentEntries).mockResolvedValue(entries);
  }

  function givenRemoteValues(values: Record<string, string | undefined>) {
    vi.mocked(secretProvider.getSecret).mockImplementation(
      async (name: string) => values[name],
    );
  }

  it('Should_ReportDiffersWithoutValues_When_LocalAndRemoteValuesDiffer', async () => {
    // Arrange
    givenFiles({ API_KEY: '/app/api-key' }, [
      { key: 'API_KEY', value: LOCAL_VALUE },
    ]);
    givenRemoteValues({ '/app/api-key': REMOTE_VALUE });

    // Act
    const actual = await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['API_KEY']),
    );

    // Assert
    expect(actual).toEqual([
      { variable: 'API_KEY', path: '/app/api-key', status: 'differs' },
    ]);
    expect(JSON.stringify(actual)).not.toContain(LOCAL_VALUE);
    expect(JSON.stringify(actual)).not.toContain(REMOTE_VALUE);
  });

  it('Should_ReportMatches_When_LocalAndRemoteValuesAreEqual', async () => {
    // Arrange
    givenFiles({ DB_URL: '/app/db-url' }, [
      { key: 'DB_URL', value: REMOTE_VALUE },
    ]);
    givenRemoteValues({ '/app/db-url': REMOTE_VALUE });

    // Act
    const actual = await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['DB_URL']),
    );

    // Assert
    expect(actual).toEqual([
      { variable: 'DB_URL', path: '/app/db-url', status: 'matches' },
    ]);
  });

  it('Should_ReadOnlyRequestedVariables_When_SomeAreExcluded', async () => {
    // Arrange
    givenFiles({ DB_URL: '/app/db-url', API_KEY: '/app/api-key' }, [
      { key: 'DB_URL', value: REMOTE_VALUE },
    ]);
    givenRemoteValues({ '/app/db-url': REMOTE_VALUE });

    // Act
    await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['DB_URL']),
    );

    // Assert
    expect(secretProvider.getSecret).toHaveBeenCalledTimes(1);
    expect(secretProvider.getSecret).toHaveBeenCalledWith('/app/db-url');
  });

  it('Should_RegisterRemoteValueWithMasker_When_ValueIsResolved', async () => {
    // Arrange
    givenFiles({ API_KEY: '/app/api-key' }, [
      { key: 'API_KEY', value: LOCAL_VALUE },
    ]);
    givenRemoteValues({ '/app/api-key': REMOTE_VALUE });

    // Act
    await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['API_KEY']),
    );

    // Assert
    expect(secretMasker.mask).toHaveBeenCalledWith(REMOTE_VALUE);
  });

  it('Should_CompareTheLastAssignment_When_EnvFileRepeatsKey', async () => {
    // Arrange
    givenFiles({ API_KEY: '/app/api-key' }, [
      { key: 'API_KEY', value: LOCAL_VALUE },
      { key: 'API_KEY', value: REMOTE_VALUE },
    ]);
    givenRemoteValues({ '/app/api-key': REMOTE_VALUE });

    // Act
    const actual = await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['API_KEY']),
    );

    // Assert
    expect(actual[0].status).toBe('matches');
  });

  it('Should_ReportUnreadable_When_RemoteValueIsNotFound', async () => {
    // Arrange
    givenFiles({ API_KEY: '/app/api-key' }, [
      { key: 'API_KEY', value: LOCAL_VALUE },
    ]);
    givenRemoteValues({});

    // Act
    const actual = await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['API_KEY']),
    );

    // Assert
    expect(actual).toEqual([
      {
        variable: 'API_KEY',
        path: '/app/api-key',
        status: 'unreadable',
        reason: 'not found',
      },
    ]);
  });

  it('Should_ReportUnreadableWithReason_When_ProviderFailsToReadValue', async () => {
    // Arrange
    givenFiles({ API_KEY: '/app/api-key' }, [
      { key: 'API_KEY', value: LOCAL_VALUE },
    ]);
    vi.mocked(secretProvider.getSecret).mockRejectedValue(
      new Error('AccessDeniedException: not allowed to decrypt'),
    );

    // Act
    const actual = await sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['API_KEY']),
    );

    // Assert
    expect(actual[0]).toMatchObject({
      variable: 'API_KEY',
      status: 'unreadable',
      reason: expect.stringContaining('not allowed to decrypt'),
    });
  });

  it('Should_PropagateExpiredCredentials_When_ProviderRejectsThem', async () => {
    // Arrange
    givenFiles({ API_KEY: '/app/api-key' }, [
      { key: 'API_KEY', value: LOCAL_VALUE },
    ]);
    vi.mocked(secretProvider.getSecret).mockRejectedValue(
      new ExpiredCredentialsError(),
    );

    // Act
    const action = sut.handle(
      CompareEnvFileValuesCommand.create(MAP_PATH, ENV_PATH, ['API_KEY']),
    );

    // Assert
    await expect(action).rejects.toBeInstanceOf(ExpiredCredentialsError);
  });
});
