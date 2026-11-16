import { inject, injectable } from 'inversify';
import type { EnvValueCheck } from '../../domain/EnvFileComparison.js';
import { EnvironmentFileError } from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import {
  type SecretOutcome,
  SecretResolver,
} from '../secretResolution/SecretResolver.js';
import type { CompareEnvFileValuesCommand } from './CompareEnvFileValuesCommand.js';

/**
 * Compares the local value of each requested variable with its remote value
 * and reports only `matches`, `differs` or `unreadable`. Remote values are
 * read through the same resolver pull and exec use, so they reach the secret
 * masker, and are dropped as soon as they are compared. Neither value ever
 * reaches the result. When a key repeats in the env file, the last assignment
 * is compared, as dotenv would load it.
 */
@injectable()
export class CompareEnvFileValuesCommandHandler {
  private readonly secretResolver: SecretResolver;

  constructor(
    @inject(TYPES.ISecretProvider) secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.ISecretMasker) secretMasker: ISecretMasker,
  ) {
    this.secretResolver = new SecretResolver(
      secretProvider,
      logger,
      secretMasker,
    );
  }

  async handle(command: CompareEnvFileValuesCommand): Promise<EnvValueCheck[]> {
    const mapping = await this.variableStore.getMapping(command.mapPath);
    const entries = await this.variableStore.readEnvironmentEntries(
      command.envFilePath,
    );
    if (entries === null) {
      throw new EnvironmentFileError(
        `Env file not found: ${command.envFilePath}`,
      );
    }
    const localValues = new Map(entries.map(({ key, value }) => [key, value]));
    const requested = new Set(command.variables);
    const selected = Object.fromEntries(
      Object.entries(mapping).filter(([variable]) => requested.has(variable)),
    );

    const { outcomes } = await this.secretResolver.resolve(selected);
    return outcomes.map((outcome) =>
      toValueCheck(
        outcome,
        selected[outcome.envVar],
        localValues.get(outcome.envVar),
      ),
    );
  }
}

function toValueCheck(
  outcome: SecretOutcome,
  path: string,
  localValue: string | undefined,
): EnvValueCheck {
  const variable = outcome.envVar;
  if (outcome.status === 'error') {
    return { variable, path, status: 'unreadable', reason: outcome.reason };
  }
  if (outcome.status === 'warning' && outcome.reason === 'not-found') {
    return { variable, path, status: 'unreadable', reason: 'not found' };
  }
  const remoteValue = outcome.status === 'resolved' ? outcome.value : '';
  return {
    variable,
    path,
    status: localValue === remoteValue ? 'matches' : 'differs',
  };
}
