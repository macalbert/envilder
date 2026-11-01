import { inject, injectable } from 'inversify';
import type { IEnvironmentExporter } from '../../domain/ports/IEnvironmentExporter.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { IProcessContext } from '../../domain/ports/IProcessContext.js';
import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import { RequiredSecretsResolver } from '../secretResolution/RequiredSecretsResolver.js';
import type { ExportSecretsToEnvironmentCommand } from './ExportSecretsToEnvironmentCommand.js';

/**
 * Exports the secrets of a map file as environment variables for the
 * processes the host starts afterwards (the later steps of a GitHub Actions
 * job), without writing a `.env` file.
 *
 * Fail-closed like exec mode: nothing is exported when a secret is missing,
 * empty or unreadable, or when a value could not be registered for masking.
 */
@injectable()
export class ExportSecretsToEnvironmentCommandHandler {
  private readonly requiredSecrets: RequiredSecretsResolver;

  constructor(
    @inject(TYPES.ISecretProvider)
    secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    variableStore: IVariableStore,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.ISecretMasker)
    private readonly secretMasker: ISecretMasker,
    @inject(TYPES.IProcessContext)
    processContext: IProcessContext,
    @inject(TYPES.IEnvironmentExporter)
    private readonly environmentExporter: IEnvironmentExporter,
  ) {
    this.requiredSecrets = new RequiredSecretsResolver(
      secretProvider,
      variableStore,
      logger,
      secretMasker,
      processContext,
    );
  }

  async handle(command: ExportSecretsToEnvironmentCommand): Promise<void> {
    const secrets = await this.requiredSecrets.resolve(command.mapPath);
    // Later steps print whatever they like: export only once every value is
    // registered for masking, and nothing when a registration failed.
    await this.secretMasker.flush();
    await this.environmentExporter.export(secrets);
    this.logger.info(
      ExportSecretsToEnvironmentCommandHandler.buildSummary(
        Object.keys(secrets),
      ),
    );
  }

  private static buildSummary(names: string[]): string {
    const noun = names.length === 1 ? 'secret' : 'secrets';
    const listed = names.length > 0 ? ` (${names.join(', ')})` : '';
    return `envilder: ${names.length} ${noun} exported to the job environment${listed}`;
  }
}
