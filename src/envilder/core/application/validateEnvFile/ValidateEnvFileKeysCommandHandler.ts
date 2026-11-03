import { inject, injectable } from 'inversify';
import {
  compareEnvFileKeys,
  type EnvFileKeyComparison,
} from '../../domain/EnvFileComparison.js';
import { EnvironmentFileError } from '../../domain/errors/DomainErrors.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import type { ValidateEnvFileKeysCommand } from './ValidateEnvFileKeysCommand.js';

/**
 * Compares the keys of a local env file with the variables a map file
 * declares, without calling any provider. Only keys are compared: the values
 * the env file holds are read by the parser and then dropped. Run it on a map
 * file that passed offline validation.
 */
@injectable()
export class ValidateEnvFileKeysCommandHandler {
  constructor(
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
  ) {}

  async handle(
    command: ValidateEnvFileKeysCommand,
  ): Promise<EnvFileKeyComparison> {
    const mapping = await this.variableStore.getMapping(command.mapPath);
    const entries = await this.variableStore.readEnvironmentEntries(
      command.envFilePath,
    );
    if (entries === null) {
      throw new EnvironmentFileError(
        `Env file not found: ${command.envFilePath}`,
      );
    }
    return compareEnvFileKeys(Object.keys(mapping), entries);
  }
}
