import { inject, injectable } from 'inversify';
import { EnvironmentFileError } from '../../domain/errors/DomainErrors.js';
import {
  type MapFileViolation,
  validateMapFile,
} from '../../domain/MapFileValidator.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import type { ValidateMapFileCommand } from './ValidateMapFileCommand.js';

/**
 * Checks a map file without calling any provider: the JSON parses, the
 * document matches `spec/map-file.v1.json`, and the provider configuration
 * it resolves to (flags over `$config`) is coherent. Returns every violation
 * found, an empty list when the file is usable. Only the file is read, and no
 * mapped value ever reaches a violation.
 */
@injectable()
export class ValidateMapFileCommandHandler {
  constructor(
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
  ) {}

  async handle(command: ValidateMapFileCommand): Promise<MapFileViolation[]> {
    const content = await this.variableStore.readMapFileContent(
      command.mapPath,
    );
    if (content === null) {
      throw new EnvironmentFileError(
        `Failed to read map file: ${command.mapPath}`,
      );
    }

    let document: unknown;
    try {
      document = JSON.parse(content);
    } catch (error) {
      return [
        {
          key: '(root)',
          message:
            `Invalid JSON in parameter map file: ${command.mapPath}` +
            describeParseLocation(error),
        },
      ];
    }

    return validateMapFile(document, {
      overrides: command.overrides,
      supportedProviders: command.supportedProviders,
    });
  }
}

/**
 * Where parsing stopped, never what it found there: the parser's own message
 * quotes the surrounding text, which can be a mapped value or a secret pasted
 * into the file.
 */
function describeParseLocation(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const lineAndColumn = /line (\d+) column (\d+)/.exec(message);
  if (lineAndColumn !== null) {
    return ` (line ${lineAndColumn[1]}, column ${lineAndColumn[2]})`;
  }
  const position = /at position (\d+)/.exec(message);
  if (position !== null) {
    return ` (at position ${position[1]})`;
  }
  return '';
}
