import 'reflect-metadata';
import type { Container } from 'inversify';
import { DispatchActionCommand } from '../../../core/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../../core/application/dispatch/DispatchActionCommandHandler.js';
import { InvalidArgumentError } from '../../../core/domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../../core/domain/MapFileConfig.js';
import type { ILogger } from '../../../core/domain/ports/ILogger.js';
import { ConsoleLogger } from '../../../core/infrastructure/logger/ConsoleLogger.js';
import { readMapFileConfig } from '../../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../../core/types.js';
import { presentGhaError } from '../errors/GhaErrorPresenter.js';
import { Startup } from '../Startup.js';

/**
 * GitHub's own default for `run` steps, so a `command` behaves like a `run`
 * script: errors and failed pipes stop it, and no profile is loaded.
 */
const COMMAND_SHELL = 'bash';
const COMMAND_SHELL_ARGS = ['--noprofile', '--norc', '-eo', 'pipefail', '-c'];

type ActionInputs = {
  mapFile?: string;
  envFile?: string;
  command?: string;
  provider?: string;
  vaultUrl?: string;
};

/**
 * Reads GitHub Actions inputs from environment variables.
 * GitHub Actions passes inputs as INPUT_<NAME> environment variables.
 */
function readInputs(): ActionInputs {
  return {
    mapFile: process.env.INPUT_MAP_FILE || undefined,
    envFile: process.env.INPUT_ENV_FILE || undefined,
    command: process.env.INPUT_COMMAND?.trim() || undefined,
    provider: process.env.INPUT_PROVIDER || undefined,
    vaultUrl: process.env.INPUT_VAULT_URL || undefined,
  };
}

/**
 * Picks the mode from the inputs:
 *
 * - `command`: runs it with the secrets in its environment only.
 * - `env-file`: writes the secrets to that `.env` file.
 * - neither: exports the secrets to the environment of the later steps of
 *   the job.
 */
function buildCommand(
  mapFile: string,
  inputs: ActionInputs,
): DispatchActionCommand {
  if (inputs.command && inputs.envFile) {
    throw new InvalidArgumentError('Use either env-file or command, not both.');
  }
  if (inputs.command) {
    return DispatchActionCommand.forExec(mapFile, COMMAND_SHELL, [
      ...COMMAND_SHELL_ARGS,
      inputs.command,
    ]);
  }
  if (inputs.envFile) {
    return DispatchActionCommand.fromCliOptions({
      map: mapFile,
      envfile: inputs.envFile,
      // The action never pushes
      push: false,
    });
  }
  return DispatchActionCommand.forExport(mapFile);
}

function describeMode(inputs: ActionInputs): string {
  if (inputs.command) {
    return '🚀 Mode: command (secrets only in this step)';
  }
  if (inputs.envFile) {
    return `📄 Mode: env-file (${inputs.envFile})`;
  }
  return '🧠 Mode: job environment (secrets in every later step)';
}

/**
 * Runs the action. Returns the exit code the step must end with: the
 * command's when the `command` input is set, 0 otherwise.
 */
export async function main(): Promise<number> {
  const inputs = readInputs();

  let serviceProvider: Container;
  let logger: ILogger = new ConsoleLogger();

  try {
    const fileConfig = inputs.mapFile
      ? await readMapFileConfig(inputs.mapFile)
      : {};

    const config: MapFileConfig = {
      ...fileConfig,
      ...(inputs.provider && { provider: inputs.provider }),
      ...(inputs.vaultUrl && { vaultUrl: inputs.vaultUrl }),
    };

    const startup = Startup.build();
    startup.configureServices().configureInfrastructure(config);
    serviceProvider = startup.create();
    logger = serviceProvider.get<ILogger>(TYPES.ILogger);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`🚨 Failed to initialize: ${message}`);
    throw error;
  }

  try {
    if (!inputs.mapFile) {
      throw new Error('🚨 Missing required inputs! Please provide map-file.');
    }
    const command = buildCommand(inputs.mapFile, inputs);

    logger.info('🔑 Envilder GitHub Action - Starting...');
    logger.info(`📋 Map file: ${inputs.mapFile}`);
    logger.info(describeMode(inputs));

    const commandHandler = serviceProvider.get<DispatchActionCommandHandler>(
      TYPES.DispatchActionCommandHandler,
    );
    const exitCode = await commandHandler.handleCommand(command);

    if (exitCode !== undefined) {
      return exitCode;
    }
    logger.info('✅ Secrets loaded successfully!');
    return 0;
  } catch (error) {
    for (const line of presentGhaError(error)) {
      logger.error(line);
    }
    throw error;
  }
}
