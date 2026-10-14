import { inject, injectable } from 'inversify';
import pc from 'picocolors';
import { SecretsFetchError } from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import { SecretResolver } from '../secretResolution/SecretResolver.js';
import type { PullSecretsToEnvCommand } from './PullSecretsToEnvCommand.js';

@injectable()
export class PullSecretsToEnvCommandHandler {
  private readonly secretResolver: SecretResolver;

  constructor(
    @inject(TYPES.ISecretProvider)
    secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.ISecretMasker)
    secretMasker: ISecretMasker,
  ) {
    this.secretResolver = new SecretResolver(
      secretProvider,
      logger,
      secretMasker,
    );
  }

  /**
   * Handles the PullSecretsToEnvCommand which orchestrates the process of fetching
   * environment variable values from a secret store and writing them to a local environment file.
   *
   * @param command - The PullSecretsToEnvCommand containing mapPath and envFilePath
   */
  async handle(command: PullSecretsToEnvCommand): Promise<void> {
    const { requestVariables, currentVariables } =
      await this.loadVariables(command);
    const { variables, resolvedCount, totalCount } = await this.envild(
      requestVariables,
      currentVariables,
    );
    await this.saveEnvFile(command.envFilePath, variables);

    this.logger.info(
      PullSecretsToEnvCommandHandler.buildSummary(
        resolvedCount,
        totalCount,
        command.envFilePath,
      ),
    );
  }

  private async loadVariables(command: PullSecretsToEnvCommand): Promise<{
    requestVariables: Record<string, string>;
    currentVariables: Record<string, string>;
  }> {
    const requestVariables = await this.variableStore.getMapping(
      command.mapPath,
    );
    const currentVariables = await this.variableStore.getEnvironment(
      command.envFilePath,
    );

    return { requestVariables, currentVariables };
  }

  private async saveEnvFile(
    envFilePath: string,
    variables: Record<string, string>,
  ): Promise<void> {
    await this.variableStore.saveEnvironment(envFilePath, variables);
  }

  private async envild(
    paramMap: Record<string, string>,
    existingEnvVariables: Record<string, string>,
  ): Promise<{
    variables: Record<string, string>;
    resolvedCount: number;
    totalCount: number;
  }> {
    const { resolved, warnings, errors } =
      await this.secretResolver.resolve(paramMap);

    for (const outcome of resolved) {
      existingEnvVariables[outcome.envVar] = outcome.value;
    }

    this.secretResolver.logSecretsSection(resolved, warnings);

    if (errors.length > 0) {
      throw new SecretsFetchError(errors.map(SecretResolver.toFailure));
    }

    return {
      variables: existingEnvVariables,
      resolvedCount: resolved.length,
      totalCount: Object.keys(paramMap).length,
    };
  }

  private static buildSummary(
    resolvedCount: number,
    totalCount: number,
    envFilePath: string,
  ): string {
    return `\n${pc.bold(pc.green('\u2B50 LEVEL CLEARED'))}${pc.dim(
      `  \u2014  ${resolvedCount}/${totalCount} secrets loaded \u00B7 `,
    )}${pc.bold(envFilePath)}${pc.dim(' written')}\n`;
  }
}
