import { findCaseCollisions } from '../../domain/ChildEnvironment.js';
import {
  InvalidArgumentError,
  SecretsFetchError,
} from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { IProcessContext } from '../../domain/ports/IProcessContext.js';
import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import {
  type FailedSecret,
  SecretResolver,
  type UnresolvedSecret,
} from './SecretResolver.js';

const NUL = '\0';

/**
 * Resolves every secret of a map file into environment variables, fail-closed:
 * it throws instead of returning a partial set.
 *
 * Shared by the modes that hand secrets to processes as environment variables
 * (exec, and the GitHub Action exporting to the job environment), where a
 * missing secret must stop the run instead of leaving a variable unset.
 */
export class RequiredSecretsResolver {
  private readonly secretResolver: SecretResolver;

  constructor(
    secretProvider: ISecretProvider,
    private readonly variableStore: IVariableStore,
    private readonly logger: ILogger,
    secretMasker: ISecretMasker,
    private readonly processContext: IProcessContext,
  ) {
    this.secretResolver = new SecretResolver(
      secretProvider,
      logger,
      secretMasker,
    );
  }

  /**
   * Throws `SecretsFetchError` when any secret is missing, empty or
   * unreadable, and `InvalidArgumentError` when the variables cannot be set
   * on this platform.
   */
  async resolve(mapPath: string): Promise<Record<string, string>> {
    const mappings = await this.variableStore.getMapping(mapPath);
    if (Object.keys(mappings).length === 0) {
      this.logger.warn('Map file declares no variables.');
    }
    this.assertNoCaseCollisions(Object.keys(mappings));

    const { outcomes, resolved } = await this.secretResolver.resolve(mappings);
    const failures = outcomes.filter(
      (outcome): outcome is UnresolvedSecret | FailedSecret =>
        outcome.status !== 'resolved',
    );
    if (failures.length > 0) {
      this.secretResolver.logSecretsSection(resolved, []);
      throw new SecretsFetchError(failures.map(SecretResolver.toFailure));
    }

    const secrets: Record<string, string> = {};
    for (const { envVar, value } of resolved) {
      if (value.includes(NUL)) {
        throw new InvalidArgumentError(
          `Secret for ${envVar} contains a NUL byte and cannot be passed as an environment variable.`,
        );
      }
      secrets[envVar] = value;
    }

    return secrets;
  }

  /**
   * On Windows two mapped names that differ only by case are one variable,
   * so one value would be silently dropped. Refuse before resolving.
   */
  private assertNoCaseCollisions(names: string[]): void {
    const collisions = findCaseCollisions(
      names,
      this.processContext.platform(),
    );
    if (collisions.length === 0) {
      return;
    }
    const listed = collisions.map((group) => group.join(', ')).join('; ');
    throw new InvalidArgumentError(
      `Map file declares variables that differ only by case (${listed}); Windows treats them as the same variable.`,
    );
  }
}
