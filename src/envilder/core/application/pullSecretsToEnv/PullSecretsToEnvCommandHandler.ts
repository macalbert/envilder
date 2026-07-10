import { inject, injectable } from 'inversify';
import pc from 'picocolors';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  ExpiredCredentialsError,
  SecretsFetchError,
  SsoSessionExpiredError,
} from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import type { PullSecretsToEnvCommand } from './PullSecretsToEnvCommand.js';

type ResolvedOutcome = { status: 'resolved'; envVar: string; masked: string };
type WarningOutcome = {
  status: 'warning';
  envVar: string;
  path: string;
  reason: 'not-found' | 'empty';
};
type ErrorOutcome = {
  status: 'error';
  envVar: string;
  path: string;
  reason: string;
};
type SecretOutcome = ResolvedOutcome | WarningOutcome | ErrorOutcome;

@injectable()
export class PullSecretsToEnvCommandHandler {
  private static readonly LABEL_WIDTH = 20;
  private static readonly RULE = pc.yellow('\u2501'.repeat(60));

  constructor(
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
  ) {}

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
    const outcomes = await Promise.all(
      Object.entries(paramMap).map(([envVar, secretName]) =>
        this.processSecret(envVar, secretName, existingEnvVariables),
      ),
    );

    const resolved = outcomes.filter(
      (outcome): outcome is ResolvedOutcome => outcome.status === 'resolved',
    );
    const warnings = outcomes.filter(
      (outcome): outcome is WarningOutcome => outcome.status === 'warning',
    );
    const errors = outcomes.filter(
      (outcome): outcome is ErrorOutcome => outcome.status === 'error',
    );

    this.logSecretsSection(resolved, warnings);

    if (errors.length > 0) {
      throw new SecretsFetchError(
        errors.map((error) => ({
          envVar: error.envVar,
          path: error.path,
          reason: error.reason,
        })),
      );
    }

    return {
      variables: existingEnvVariables,
      resolvedCount: resolved.length,
      totalCount: Object.keys(paramMap).length,
    };
  }

  private async processSecret(
    envVar: string,
    secretName: string,
    existingEnvVariables: Record<string, string>,
  ): Promise<SecretOutcome> {
    try {
      const value = await this.secretProvider.getSecret(secretName);
      if (value === undefined) {
        return {
          status: 'warning',
          envVar,
          path: secretName,
          reason: 'not-found',
        };
      }
      if (value === '') {
        return { status: 'warning', envVar, path: secretName, reason: 'empty' };
      }

      existingEnvVariables[envVar] = value;
      const masked = new EnvironmentVariable(envVar, value, true).maskedValue;

      return { status: 'resolved', envVar, masked };
    } catch (error) {
      if (
        error instanceof ExpiredCredentialsError ||
        error instanceof SsoSessionExpiredError
      ) {
        throw error;
      }
      const reason = error instanceof Error ? error.message : String(error);
      return { status: 'error', envVar, path: secretName, reason };
    }
  }

  private logSecretsSection(
    resolved: ResolvedOutcome[],
    warnings: WarningOutcome[],
  ): void {
    if (resolved.length === 0 && warnings.length === 0) {
      return;
    }

    this.logger.info(`\n${pc.bold(pc.yellow('\u{1FA99}  RESOLVING SECRETS'))}`);
    this.logger.info(PullSecretsToEnvCommandHandler.RULE);
    for (const outcome of resolved) {
      this.logger.info(
        `  ${pc.green('\u2713 ')}${pc.bold(
          PullSecretsToEnvCommandHandler.pad(outcome.envVar),
        )}${pc.dim('\u2192 ')}${pc.dim(outcome.masked)}`,
      );
    }
    this.logWarnings(warnings);
  }

  private logWarnings(warnings: WarningOutcome[]): void {
    for (const outcome of warnings) {
      if (outcome.reason === 'not-found') {
        this.logger.warn(
          `  ${pc.red('\u2717 ')}${pc.bold(
            pc.red(PullSecretsToEnvCommandHandler.pad(outcome.envVar)),
          )} ${pc.red(`secret not found (path: ${outcome.path}) \u2014 skipped`)}`,
        );
        continue;
      }
      this.logger.warn(
        `  ${pc.yellow('\u26A0 ')}${pc.bold(
          PullSecretsToEnvCommandHandler.pad(outcome.envVar),
        )} ${pc.dim(`no value found (path: ${outcome.path}) \u2014 skipped`)}`,
      );
    }
  }

  private static pad(name: string): string {
    return name.padEnd(PullSecretsToEnvCommandHandler.LABEL_WIDTH);
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
