import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidateMapFileCommand } from '../../../../../src/envilder/core/application/validateMapFile/ValidateMapFileCommand';
import { ValidateMapFileCommandHandler } from '../../../../../src/envilder/core/application/validateMapFile/ValidateMapFileCommandHandler';
import { EnvironmentFileError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

const MAP_PATH = 'config/envilder.json';
const SECRET_LOOKING_VALUE = 'fake-secret-value-4Kd8Np3Xs6Vb';
const SUPPORTED_PROVIDERS = ['aws', 'azure'];

describe('ValidateMapFileCommandHandler', () => {
  let variableStore: IVariableStore;
  let sut: ValidateMapFileCommandHandler;

  beforeEach(() => {
    variableStore = {
      getMapping: vi.fn(),
      getParsedMapping: vi.fn(),
      getEnvironment: vi.fn(),
      saveEnvironment: vi.fn(),
      readMapFileContent: vi.fn(),
      writeMapFileContent: vi.fn(),
      restoreMapFile: vi.fn(),
    };
    sut = new ValidateMapFileCommandHandler(variableStore);
  });

  function givenMapFile(content: string | null): void {
    vi.mocked(variableStore.readMapFileContent).mockResolvedValue(content);
  }

  it('Should_ReturnNoViolation_When_MapFileIsValid', async () => {
    // Arrange
    givenMapFile('{"$config": {"provider": "aws"}, "DB_URL": "/app/db"}');
    const command = ValidateMapFileCommand.create(
      MAP_PATH,
      {},
      SUPPORTED_PROVIDERS,
    );

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportParseErrorWithFilePath_When_MapFileIsNotValidJson', async () => {
    // Arrange
    givenMapFile('{"DB_URL": "/app/db",}');
    const command = ValidateMapFileCommand.create(
      MAP_PATH,
      {},
      SUPPORTED_PROVIDERS,
    );

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toEqual([
      {
        key: '(root)',
        message: expect.stringContaining(
          `Invalid JSON in parameter map file: ${MAP_PATH}`,
        ),
      },
    ]);
  });

  it('Should_NotQuoteFileContent_When_ParseErrorIsReported', async () => {
    // Arrange
    givenMapFile(`{"DB_URL": ${SECRET_LOOKING_VALUE}}`);
    const command = ValidateMapFileCommand.create(
      MAP_PATH,
      {},
      SUPPORTED_PROVIDERS,
    );

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(JSON.stringify(actual)).not.toContain(SECRET_LOOKING_VALUE);
  });

  it('Should_ApplyFlagsOverConfig_When_OverridesAreGiven', async () => {
    // Arrange
    givenMapFile('{"$config": {"provider": "azure"}, "DB_URL": "db-url"}');
    const command = ValidateMapFileCommand.create(
      MAP_PATH,
      { vaultUrl: 'https://my-vault.vault.azure.net' },
      SUPPORTED_PROVIDERS,
    );

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ThrowEnvironmentFileError_When_MapFileDoesNotExist', async () => {
    // Arrange
    givenMapFile(null);
    const command = ValidateMapFileCommand.create(
      MAP_PATH,
      {},
      SUPPORTED_PROVIDERS,
    );

    // Act
    const action = sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow(EnvironmentFileError);
  });
});
