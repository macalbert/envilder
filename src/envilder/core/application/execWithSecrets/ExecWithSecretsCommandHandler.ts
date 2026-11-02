import { inject, injectable } from 'inversify';
import { buildChildEnvironment } from '../../domain/ChildEnvironment.js';
import { exitCodeForChild } from '../../domain/ExecExitCode.js';
import {
  ExecInterruptedError,
  ExpiredCredentialsError,
  SsoSessionExpiredError,
} from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { IProcessContext } from '../../domain/ports/IProcessContext.js';
import type { IProcessRunner } from '../../domain/ports/IProcessRunner.js';
import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import { RequiredSecretsResolver } from '../secretResolution/RequiredSecretsResolver.js';
import { formatProgram } from './CommandLineFormatter.js';
import type { ExecWithSecretsCommand } from './ExecWithSecretsCommand.js';

/**
 * Secrets resolved for an exec command, ready to start the child.
 */
export type PreparedExec = {
  readonly command: ExecWithSecretsCommand;
  readonly secrets: Readonly<Record<string, string>>;
};

/**
 * Runs a command with the secrets of a map file in its environment, without
 * writing anything to disk.
 *
 * Exec mode is fail-closed: the child is never started when a secret is
 * missing, empty or unreadable. `handle` is the entry point (reached through
 * the dispatcher): `prepare` resolves every secret and `start` runs the child
 * once. Only `prepare` raises retriable errors, such as an expired SSO
 * session; `start` turns any SSO or credentials error into a non-retriable
 * `ExecInterruptedError`, so retrying `handle` never starts the child twice.
 */
@injectable()
export class ExecWithSecretsCommandHandler {
  private readonly requiredSecrets: RequiredSecretsResolver;

  constructor(
    @inject(TYPES.ISecretProvider)
    secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    variableStore: IVariableStore,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.ISecretMasker)
    private readonly secretMasker: ISecretMasker,
    @inject(TYPES.IProcessRunner)
    private readonly processRunner: IProcessRunner,
    @inject(TYPES.IProcessContext)
    private readonly processContext: IProcessContext,
  ) {
    this.requiredSecrets = new RequiredSecretsResolver(
      secretProvider,
      variableStore,
      logger,
      secretMasker,
      processContext,
    );
  }

  /**
   * Resolves the secrets and runs the child. Returns the exit code Envilder
   * must exit with: the child's code, or `128 + n` when a signal killed it.
   */
  async handle(command: ExecWithSecretsCommand): Promise<number> {
    const prepared = await this.prepare(command);
    return this.start(prepared);
  }

  /**
   * Resolves every secret declared in the map file. Never reads or writes a
   * `.env` file. Throws `SecretsFetchError` when any secret does not resolve.
   */
  async prepare(command: ExecWithSecretsCommand): Promise<PreparedExec> {
    const secrets = await this.requiredSecrets.resolve(command.mapPath);
    return { command, secrets };
  }

  /**
   * Starts the child once with the inherited environment plus the resolved
   * secrets (the map file wins) and waits for it to exit.
   *
   * SSO and credentials errors are only retriable before this point. Raised
   * from here on, they become a non-retriable `ExecInterruptedError` so a
   * caller's recovery never runs the command again.
   */
  async start(prepared: PreparedExec): Promise<number> {
    try {
      return await this.supervise(prepared);
    } catch (error) {
      if (
        error instanceof SsoSessionExpiredError ||
        error instanceof ExpiredCredentialsError
      ) {
        throw new ExecInterruptedError(error);
      }
      throw error;
    }
  }

  private async supervise(prepared: PreparedExec): Promise<number> {
    const { command, secrets } = prepared;
    // The child shares stdout with the mask registrations: start it only
    // once every registration has been written.
    await this.secretMasker.flush();
    const { env, overridden } = buildChildEnvironment(
      this.processContext.environment(),
      secrets,
      this.processContext.platform(),
    );

    if (overridden.length > 0) {
      this.logger.warn(
        `Overriding inherited variables: ${overridden.join(', ')}`,
      );
    }
    this.logger.info(
      ExecWithSecretsCommandHandler.buildSummary(
        Object.keys(secrets).length,
        command,
      ),
    );

    const exit = await this.processRunner.run({
      command: command.command,
      args: [...command.args],
      env,
    });

    return exitCodeForChild(exit, (signal) =>
      this.processContext.signalNumber(signal),
    );
  }

  private static buildSummary(
    count: number,
    command: ExecWithSecretsCommand,
  ): string {
    const noun = count === 1 ? 'secret' : 'secrets';
    const source = command.sourceLabel ? ` (${command.sourceLabel})` : '';
    const commandLine = formatProgram(command.command, command.args);
    return `envilder: ${count} ${noun} resolved${source} \u2192 ${commandLine}`;
  }
}
