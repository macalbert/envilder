import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidateRemoteKeysCommand } from '../../../../../src/envilder/core/application/validateRemoteKeys/ValidateRemoteKeysCommand';
import { ValidateRemoteKeysCommandHandler } from '../../../../../src/envilder/core/application/validateRemoteKeys/ValidateRemoteKeysCommandHandler';
import { SsoSessionExpiredError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';
import type { SecretExistence } from '../../../../../src/envilder/core/domain/SecretExistence';

const MAP_PATH = 'envilder.json';

describe('ValidateRemoteKeysCommandHandler', () => {
  let secretProvider: ISecretProvider;
  let variableStore: IVariableStore;
  let sut: ValidateRemoteKeysCommandHandler;

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
      saveEnvironment: vi.fn(),
      readMapFileContent: vi.fn(),
      writeMapFileContent: vi.fn(),
      restoreMapFile: vi.fn(),
    };
    sut = new ValidateRemoteKeysCommandHandler(secretProvider, variableStore);
  });

  function givenMapping(mapping: Record<string, string>): void {
    vi.mocked(variableStore.getMapping).mockResolvedValue(mapping);
  }

  function givenExistence(existence: Record<string, SecretExistence>): void {
    vi.mocked(secretProvider.checkSecretsExist).mockResolvedValue(
      new Map(Object.entries(existence)),
    );
  }

  it('Should_ReportExists_When_AllRemoteKeysExist', async () => {
    // Arrange
    givenMapping({ DB_URL: '/app/db-url', API_KEY: '/app/api-key' });
    givenExistence({
      '/app/db-url': { status: 'exists' },
      '/app/api-key': { status: 'exists' },
    });

    // Act
    const actual = await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(actual).toEqual([
      { variable: 'DB_URL', path: '/app/db-url', status: 'exists' },
      { variable: 'API_KEY', path: '/app/api-key', status: 'exists' },
    ]);
  });

  it('Should_ReportEachMissingKey_When_RemoteKeysDoNotExist', async () => {
    // Arrange
    givenMapping({
      DB_URL: '/app/db-url',
      API_KEY: '/app/api-key',
      TOKEN: '/app/token',
    });
    givenExistence({
      '/app/db-url': { status: 'missing' },
      '/app/api-key': { status: 'exists' },
      '/app/token': { status: 'missing' },
    });

    // Act
    const actual = await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(actual.filter((check) => check.status === 'missing')).toEqual([
      { variable: 'DB_URL', path: '/app/db-url', status: 'missing' },
      { variable: 'TOKEN', path: '/app/token', status: 'missing' },
    ]);
  });

  it('Should_ReportAccessDenied_When_IdentityCannotReadKey', async () => {
    // Arrange
    givenMapping({ DB_URL: '/app/db-url' });
    givenExistence({
      '/app/db-url': { status: 'access_denied', reason: 'not authorized' },
    });

    // Act
    const actual = await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(actual).toEqual([
      {
        variable: 'DB_URL',
        path: '/app/db-url',
        status: 'access_denied',
        reason: 'not authorized',
      },
    ]);
  });

  it('Should_CheckSharedPathOnce_When_SeveralVariablesMapToIt', async () => {
    // Arrange
    givenMapping({
      DB_URL: '/app/db-url',
      DATABASE_URL: '/app/db-url',
      API_KEY: '/app/api-key',
    });
    givenExistence({
      '/app/db-url': { status: 'exists' },
      '/app/api-key': { status: 'missing' },
    });

    // Act
    const actual = await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(secretProvider.checkSecretsExist).toHaveBeenCalledTimes(1);
    expect(secretProvider.checkSecretsExist).toHaveBeenCalledWith([
      '/app/db-url',
      '/app/api-key',
    ]);
    expect(actual.map((check) => check.status)).toEqual([
      'exists',
      'exists',
      'missing',
    ]);
  });

  it('Should_NotReadSecretValues_When_CheckingRemoteKeys', async () => {
    // Arrange
    givenMapping({ DB_URL: '/app/db-url' });
    givenExistence({ '/app/db-url': { status: 'exists' } });

    // Act
    await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(secretProvider.getSecret).not.toHaveBeenCalled();
  });

  it('Should_ReportProviderError_When_ProviderReturnsNoResultForPath', async () => {
    // Arrange
    givenMapping({ DB_URL: '/app/db-url' });
    givenExistence({});

    // Act
    const actual = await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(actual[0]?.status).toBe('provider_error');
  });

  it('Should_PropagateSsoSessionExpiredError_When_ProviderThrowsIt', async () => {
    // Arrange
    givenMapping({ DB_URL: '/app/db-url' });
    vi.mocked(secretProvider.checkSecretsExist).mockRejectedValue(
      new SsoSessionExpiredError('dev'),
    );

    // Act
    const action = sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    await expect(action).rejects.toBeInstanceOf(SsoSessionExpiredError);
  });

  it('Should_LogIdentity_When_ProviderSupportsIt', async () => {
    // Arrange
    const logIdentity = vi.fn().mockResolvedValue(undefined);
    secretProvider.logIdentity = logIdentity;
    givenMapping({ DB_URL: '/app/db-url' });
    givenExistence({ '/app/db-url': { status: 'exists' } });

    // Act
    await sut.handle(ValidateRemoteKeysCommand.create(MAP_PATH));

    // Assert
    expect(logIdentity).toHaveBeenCalledTimes(1);
  });
});
