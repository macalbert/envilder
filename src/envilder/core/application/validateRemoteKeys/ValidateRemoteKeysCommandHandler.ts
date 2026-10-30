import { inject, injectable } from 'inversify';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import type { RemoteKeyCheck } from '../../domain/SecretExistence.js';
import { TYPES } from '../../types.js';
import type { ValidateRemoteKeysCommand } from './ValidateRemoteKeysCommand.js';

/**
 * Checks that every secret path declared in a map file exists in the
 * provider, without reading any value. A path shared by several variables is
 * checked once. Returns one check per variable, in map-file order. Run it on a
 * map file that passed offline validation.
 */
@injectable()
export class ValidateRemoteKeysCommandHandler {
  constructor(
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
  ) {}

  async handle(command: ValidateRemoteKeysCommand): Promise<RemoteKeyCheck[]> {
    const mappings = Object.entries(
      await this.variableStore.getMapping(command.mapPath),
    );
    if (typeof this.secretProvider.logIdentity === 'function') {
      await this.secretProvider.logIdentity();
    }
    const existence = await this.secretProvider.checkSecretsExist([
      ...new Set(mappings.map(([, path]) => path)),
    ]);
    return mappings.map(([variable, path]) => ({
      variable,
      path,
      ...(existence.get(path) ?? {
        status: 'provider_error',
        reason: 'The provider returned no result for this secret.',
      }),
    }));
  }
}
