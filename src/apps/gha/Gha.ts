import 'reflect-metadata';
import type { Container } from 'inversify';
import { DispatchActionCommand } from '../../envilder/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { CliOptions } from '../../envilder/domain/CliOptions.js';
import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import { TYPES } from '../../envilder/types.js';
import { Startup } from './Startup.js';

/**
 * Reads GitHub Actions inputs from environment variables.
 * GitHub Actions passes inputs as INPUT_<NAME> environment variables.
 */
function readInputs(): CliOptions {
  const mapFile = process.env.INPUT_MAP_FILE;
  const envFile = process.env.INPUT_ENV_FILE;
  const provider = process.env.INPUT_PROVIDER;

  return {
    map: mapFile,
    envfile: envFile,
    // GitHub Action only supports pull mode
    push: false,
    provider: provider || undefined,
  };
}

async function executeCommand(
  serviceProvider: Container,
  options: CliOptions,
): Promise<void> {
  const commandHandler = serviceProvider.get<DispatchActionCommandHandler>(
    TYPES.DispatchActionCommandHandler,
  );

  const command = DispatchActionCommand.fromCliOptions(options);
  await commandHandler.handleCommand(command);
}

export async function main() {
  const options = readInputs();

  // Initialize the service provider with the selected cloud provider
  const startup = Startup.build();
  startup
    .configureServices()
    .configureInfrastructure(undefined, options.provider);
  const serviceProvider = startup.create();

  const logger = serviceProvider.get<ILogger>(TYPES.ILogger);

  try {
    // Validate required inputs
    if (!options.map || !options.envfile) {
      throw new Error(
        '🚨 Missing required inputs! Please provide map-file and env-file.',
      );
    }

    logger.info('🔑 Envilder GitHub Action - Starting secret pull...');
    logger.info(`📋 Map file: ${options.map}`);
    logger.info(`📄 Env file: ${options.envfile}`);

    await executeCommand(serviceProvider, options);

    logger.info('✅ Secrets pulled successfully!');
  } catch (error) {
    logger.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
    logger.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}
