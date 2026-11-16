import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidateEnvFileKeysCommand } from '../../../../../src/envilder/core/application/validateEnvFile/ValidateEnvFileKeysCommand';
import { ValidateEnvFileKeysCommandHandler } from '../../../../../src/envilder/core/application/validateEnvFile/ValidateEnvFileKeysCommandHandler';
import { EnvironmentFileError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

const MAP_PATH = 'envilder.json';
const ENV_PATH = '.env';

describe('ValidateEnvFileKeysCommandHandler', () => {
  let variableStore: IVariableStore;
  let sut: ValidateEnvFileKeysCommandHandler;

  beforeEach(() => {
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
    sut = new ValidateEnvFileKeysCommandHandler(variableStore);
  });

  it('Should_CompareDeclaredVariablesWithEnvFileKeys_When_BothFilesExist', async () => {
    // Arrange
    vi.mocked(variableStore.getMapping).mockResolvedValue({
      DB_URL: '/app/db-url',
      API_KEY: '/app/api-key',
    });
    vi.mocked(variableStore.readEnvironmentEntries).mockResolvedValue([
      { key: 'DB_URL', value: 'local' },
      { key: 'DEBUG', value: 'true' },
      { key: 'DEBUG', value: 'false' },
    ]);

    // Act
    const actual = await sut.handle(
      ValidateEnvFileKeysCommand.create(MAP_PATH, ENV_PATH),
    );

    // Assert
    expect(actual).toEqual({
      present: ['DB_URL'],
      missing: ['API_KEY'],
      undeclared: ['DEBUG'],
      duplicates: [{ key: 'DEBUG', count: 2 }],
    });
  });

  it('Should_ThrowEnvFileNotFound_When_EnvFileDoesNotExist', async () => {
    // Arrange
    vi.mocked(variableStore.getMapping).mockResolvedValue({ A: '/a' });
    vi.mocked(variableStore.readEnvironmentEntries).mockResolvedValue(null);

    // Act
    const action = sut.handle(
      ValidateEnvFileKeysCommand.create(MAP_PATH, './missing.env'),
    );

    // Assert
    await expect(action).rejects.toThrow(
      new EnvironmentFileError('Env file not found: ./missing.env'),
    );
  });
});
