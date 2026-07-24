import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import type { Container } from 'inversify';
import pc from 'picocolors';
import { DispatchActionCommand } from '../../../core/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../../core/application/dispatch/DispatchActionCommandHandler.js';
import type { CliOptions } from '../../../core/domain/CliOptions.js';
import type { MapFileConfig } from '../../../core/domain/MapFileConfig.js';
import { OperationMode } from '../../../core/domain/OperationMode.js';
import type { ILogger } from '../../../core/domain/ports/ILogger.js';
import { PackageVersionReader } from '../../../core/infrastructure/package/PackageVersionReader.js';
import { readMapFileConfig } from '../../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../../core/types.js';
import { executeWithSsoRecovery } from '../recovery/SsoLoginRecovery.js';
import { Startup } from '../Startup.js';

const DEFAULT_MAP_FILE = 'envilder.json';
const DEFAULT_ENV_FILE = '.env';

let serviceProvider: Container;

async function executeCommand(options: CliOptions): Promise<void> {
  const commandHandler = serviceProvider.get<DispatchActionCommandHandler>(
    TYPES.DispatchActionCommandHandler,
  );

  const command = DispatchActionCommand.fromCliOptions(options);
  await commandHandler.handleCommand(command);
}

export async function main() {
  const program = new Command();
  const version = await readPackageVersion();

  const banner = `
  ${pc.green('███████╗')}${pc.cyan('███╗   ██╗')}${pc.magenta('██╗   ██╗')}${pc.yellow('██╗')}${pc.red('██╗     ')}${pc.blue('██████╗ ')}${pc.green('███████╗')}${pc.cyan('██████╗ ')}
  ${pc.green('██╔════╝')}${pc.cyan('████╗  ██║')}${pc.magenta('██║   ██║')}${pc.yellow('██║')}${pc.red('██║     ')}${pc.blue('██╔══██╗')}${pc.green('██╔════╝')}${pc.cyan('██╔══██╗')}
  ${pc.green('█████╗  ')}${pc.cyan('██╔██╗ ██║')}${pc.magenta('██║   ██║')}${pc.yellow('██║')}${pc.red('██║     ')}${pc.blue('██║  ██║')}${pc.green('█████╗  ')}${pc.cyan('██████╔╝')}
  ${pc.green('██╔══╝  ')}${pc.cyan('██║╚██╗██║')}${pc.magenta('╚██╗ ██╔╝')}${pc.yellow('██║')}${pc.red('██║     ')}${pc.blue('██║  ██║')}${pc.green('██╔══╝  ')}${pc.cyan('██╔══██╗')}
  ${pc.green('███████╗')}${pc.cyan('██║ ╚████║')}${pc.magenta(' ╚████╔╝ ')}${pc.yellow('██║')}${pc.red('███████╗')}${pc.blue('██████╔╝')}${pc.green('███████╗')}${pc.cyan('██║  ██║')}
  ${pc.green('╚══════╝')}${pc.cyan('╚═╝  ╚═══╝')}${pc.magenta('  ╚═══╝  ')}${pc.yellow('╚═╝')}${pc.red('╚══════╝')}${pc.blue('╚═════╝ ')}${pc.green('╚══════╝')}${pc.cyan('╚═╝  ╚═╝')}
  ${pc.dim('Your secrets, one command away')}          ${pc.dim('aws & azure')}

  ${pc.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
  ${pc.green('WORLD 1-1')} ${pc.dim('— SELECT YOUR MISSION')}
  ${pc.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

  ${pc.green('>')} ${pc.bold('Generate a .env file')}  ${pc.dim('(pull secrets from the cloud)')}
    ${pc.cyan('envilder')}  ${pc.dim('# uses envilder.json → .env by default')}

  ${pc.magenta('>')} ${pc.bold('Sync .env back to cloud')}  ${pc.dim('(push secrets up)')}
    ${pc.cyan('envilder --push')}  ${pc.dim('# uses envilder.json + .env by default')}

  ${pc.red('>')} ${pc.bold('Push a single secret')}
    ${pc.cyan('envilder --push --key=API_KEY --value=s3cret --secret-path=/my/path')}

  ${pc.blue('>')} ${pc.bold('Use Azure Key Vault')}
    ${pc.cyan('envilder --provider=azure --vault-url=https://my-vault.vault.azure.net')}
`;

  program
    .name('envilder')
    .description(banner)
    .version(version)
    .option(
      '--map <path>',
      `Path to the JSON file with environment variable mapping (default: ${DEFAULT_MAP_FILE})`,
    )
    .option(
      '--envfile <path>',
      `Path to the .env file to be generated or imported (default: ${DEFAULT_ENV_FILE})`,
    )
    .option('--profile <name>', 'AWS CLI profile to use (optional)')
    .option(
      '--provider <name>',
      'Cloud provider to use: aws or azure (default: aws)',
    )
    .option(
      '--vault-url <url>',
      'Azure Key Vault URL (overrides $config.vaultUrl in map file)',
    )
    .option('--push', 'Push local .env file back to cloud provider')
    .option(
      '--key <name>',
      'Single environment variable name to push (only with --push)',
    )
    .option(
      '--value <value>',
      'Value of the single environment variable to push (only with --push)',
    )
    .option(
      '--secret-path <path>',
      'Secret path in your cloud provider for the single variable (only with --push)',
    )
    .option(
      '--ssm-path <path>',
      '[DEPRECATED: use --secret-path] Alias for --secret-path',
    )
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.ssmPath) {
        console.warn(
          pc.yellow(
            '⚠️  --ssm-path is deprecated and will be removed in a future release. Use --secret-path instead.',
          ),
        );
        if (!opts.secretPath) {
          thisCommand.setOptionValue('secretPath', opts.ssmPath);
        }
      }
    })
    .action(
      async ({
        provider,
        vaultUrl,
        ...options
      }: CliOptions & { provider?: string; vaultUrl?: string }) => {
        const mode = DispatchActionCommand.determineOperationMode(options);
        const isPushSingle = mode === OperationMode.PUSH_SINGLE;
        const resolvedMap = resolveMapFile(options.map, {
          required: !isPushSingle,
        });
        const resolvedEnvfile = resolveEnvfile(options.envfile);

        const resolvedOptions: CliOptions = {
          ...options,
          map: resolvedMap,
          envfile: resolvedEnvfile,
        };

        const fileConfig = resolvedMap
          ? await readMapFileConfig(resolvedMap)
          : {};

        const config: MapFileConfig = {
          ...fileConfig,
          ...(provider && { provider }),
          ...(vaultUrl && { vaultUrl }),
          ...(options.profile && { profile: options.profile }),
        };

        const infraOptions: Record<string, unknown> = {};
        const extraHosts = process.env.ENVILDER_ALLOWED_VAULT_HOSTS;
        if (extraHosts) {
          infraOptions.allowedVaultHosts = extraHosts
            .split(',')
            .map((h) => h.trim());
          infraOptions.disableChallengeResourceVerification = true;
        }

        serviceProvider = Startup.build()
          .configureServices()
          .configureInfrastructure(config, infraOptions)
          .create();

        if (isPushSingle) {
          const logger = serviceProvider.get<ILogger>(TYPES.ILogger);
          const providerName = config.provider ?? 'aws';
          const vaultInfo = config.vaultUrl ? `, vault=${config.vaultUrl}` : '';
          const source = resolvedMap
            ? `configuration from ${resolvedMap}`
            : 'configuration';
          logger.info(`Using ${source}: provider=${providerName}${vaultInfo}`);
        }

        await executeWithSsoRecovery(() => executeCommand(resolvedOptions));
      },
    );

  await program.parseAsync(process.argv);
}

function resolveMapFile(
  mapOption: string | undefined,
  options: { required: boolean } = { required: true },
): string | undefined {
  if (mapOption !== undefined) {
    const trimmed = mapOption.trim();
    if (trimmed.length === 0) {
      throw new Error('Invalid --map value: path must not be empty.');
    }
    return trimmed;
  }

  const defaultPath = join(process.cwd(), DEFAULT_MAP_FILE);
  if (existsSync(defaultPath)) {
    return DEFAULT_MAP_FILE;
  }

  if (!options.required) {
    return undefined;
  }

  throw new Error(
    `No map file found. Provide --map or create ${DEFAULT_MAP_FILE} in the current directory.`,
  );
}

function resolveEnvfile(envfileOption: string | undefined): string {
  if (envfileOption === undefined) {
    return DEFAULT_ENV_FILE;
  }

  const trimmed = envfileOption.trim();
  if (trimmed.length === 0) {
    throw new Error('Invalid --envfile value: path must not be empty.');
  }

  return trimmed;
}

function readPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../../../../../package.json');

  return new PackageVersionReader().getVersion(packageJsonPath);
}
