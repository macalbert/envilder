import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ExportSecretsToEnvironmentCommand } from '../../../../../src/envilder/core/application/exportSecretsToEnvironment/ExportSecretsToEnvironmentCommand';
import { ExportSecretsToEnvironmentCommandHandler } from '../../../../../src/envilder/core/application/exportSecretsToEnvironment/ExportSecretsToEnvironmentCommandHandler';
import {
  InvalidArgumentError,
  SecretsFetchError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { IEnvironmentExporter } from '../../../../../src/envilder/core/domain/ports/IEnvironmentExporter';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import type { IProcessContext } from '../../../../../src/envilder/core/domain/ports/IProcessContext';
import type { ISecretMasker } from '../../../../../src/envilder/core/domain/ports/ISecretMasker';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

const DB_PASSWORD_PATH = '/app/dev/db-password';
const API_KEY_PATH = '/app/dev/api-key';
const DB_PASSWORD_VALUE = 'fake-db-password-9Lq3Xv7Rt1Mz5Kw2';
const API_KEY_VALUE = 'fake-api-key-value-4Jn8Pc2Ys6Hd0Bf3';
const MAP_PATH = 'envilder.json';

describe('ExportSecretsToEnvironmentCommandHandler', () => {
  let secrets: Record<string, string | undefined>;
  let mockSecretProvider: ISecretProvider & { getSecret: Mock };
  let mockVariableStore: IVariableStore & { getMapping: Mock };
  let mockLogger: ILogger & { info: Mock; warn: Mock; error: Mock };
  let mockSecretMasker: ISecretMasker & { mask: Mock; flush: Mock };
  let mockExporter: IEnvironmentExporter & { export: Mock };
  let platform: string;
  let sut: ExportSecretsToEnvironmentCommandHandler;

  beforeEach(() => {
    secrets = {
      [DB_PASSWORD_PATH]: DB_PASSWORD_VALUE,
      [API_KEY_PATH]: API_KEY_VALUE,
    };
    mockSecretProvider = {
      getSecret: vi.fn(async (name: string) => secrets[name]),
      setSecret: vi.fn(),
    };
    mockVariableStore = {
      getMapping: vi.fn().mockResolvedValue({
        DB_PASSWORD: DB_PASSWORD_PATH,
        API_KEY: API_KEY_PATH,
      }),
      getParsedMapping: vi.fn(),
      getEnvironment: vi.fn(),
      saveEnvironment: vi.fn(),
    } as unknown as IVariableStore & { getMapping: Mock };
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    mockSecretMasker = {
      mask: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };
    mockExporter = { export: vi.fn().mockResolvedValue(undefined) };
    platform = 'linux';
    const fakeProcessContext: IProcessContext = {
      environment: () => ({}),
      platform: () => platform,
      signalNumber: () => 0,
    };

    sut = new ExportSecretsToEnvironmentCommandHandler(
      mockSecretProvider,
      mockVariableStore,
      mockLogger,
      mockSecretMasker,
      fakeProcessContext,
      mockExporter,
    );
  });

  it('Should_ExportEveryResolvedSecret_When_AllSecretsResolve', async () => {
    // Arrange
    const command = ExportSecretsToEnvironmentCommand.create(MAP_PATH);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.getMapping).toHaveBeenCalledWith(MAP_PATH);
    expect(mockExporter.export).toHaveBeenCalledTimes(1);
    expect(mockExporter.export).toHaveBeenCalledWith({
      DB_PASSWORD: DB_PASSWORD_VALUE,
      API_KEY: API_KEY_VALUE,
    });
  });

  it('Should_MaskEveryValue_When_SecretsResolve', async () => {
    // Arrange
    const command = ExportSecretsToEnvironmentCommand.create(MAP_PATH);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockSecretMasker.mask).toHaveBeenCalledWith(DB_PASSWORD_VALUE);
    expect(mockSecretMasker.mask).toHaveBeenCalledWith(API_KEY_VALUE);
  });

  it('Should_LogNamesButNotValues_When_SecretsAreExported', async () => {
    // Arrange
    const command = ExportSecretsToEnvironmentCommand.create(MAP_PATH);

    // Act
    await sut.handle(command);

    // Assert
    const logged = mockLogger.info.mock.calls.map((call) => call[0]).join('\n');
    expect(logged).toContain(
      '2 secrets exported to the job environment (DB_PASSWORD, API_KEY)',
    );
    expect(logged).not.toContain(DB_PASSWORD_VALUE);
    expect(logged).not.toContain(API_KEY_VALUE);
  });

  it('Should_ExportNothing_When_ASecretIsMissing', async () => {
    // Arrange
    secrets[API_KEY_PATH] = undefined;
    const command = ExportSecretsToEnvironmentCommand.create(MAP_PATH);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect(mockExporter.export).not.toHaveBeenCalled();
  });

  it('Should_ExportNothing_When_ASecretIsEmpty', async () => {
    // Arrange
    secrets[API_KEY_PATH] = '';
    const command = ExportSecretsToEnvironmentCommand.create(MAP_PATH);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect(mockExporter.export).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_NamesDifferOnlyByCaseOnWindows', async () => {
    // Arrange
    platform = 'win32';
    mockVariableStore.getMapping.mockResolvedValue({
      API_KEY: API_KEY_PATH,
      api_key: DB_PASSWORD_PATH,
    });
    const command = ExportSecretsToEnvironmentCommand.create(MAP_PATH);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect(mockExporter.export).not.toHaveBeenCalled();
  });
});
