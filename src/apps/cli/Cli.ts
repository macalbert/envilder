import 'reflect-metadata';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import type { Container } from 'inversify';
import pc from 'picocolors';
import { DispatchActionCommand } from '../../envilder/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { CliOptions } from '../../envilder/domain/CliOptions.js';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
import { PackageVersionReader } from '../../envilder/infrastructure/package/PackageVersionReader.js';
import { readMapFileConfig } from '../../envilder/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../envilder/types.js';
import { Startup } from './Startup.js';

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
    ${pc.cyan('envilder --map=param-map.json --envfile=.env')}

  ${pc.magenta('>')} ${pc.bold('Sync .env back to cloud')}  ${pc.dim('(push secrets up)')}
    ${pc.cyan('envilder --push --map=param-map.json --envfile=.env')}

  ${pc.red('>')} ${pc.bold('Push a single secret')}
    ${pc.cyan('envilder --push --key=API_KEY --value=s3cret --secret-path=/my/path')}

  ${pc.blue('>')} ${pc.bold('Use Azure Key Vault')}
    ${pc.cyan('envilder --provider=azure --map=param-map.json --envfile=.env')}
`;

  program
    .name('envilder')
    .description(banner)
    .version(version)
    .option(
      '--map <path>',
      'Path to the JSON file with environment variable mapping (required for most commands)',
    )
    .option(
      '--envfile <path>',
      'Path to the .env file to be generated or imported (required for most commands)',
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
        const fileConfig = options.map
          ? await readMapFileConfig(options.map)
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

        await executeCommand(options);
      },
    );

  await program.parseAsync(process.argv);
}

function readPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../../../package.json');

  return new PackageVersionReader().getVersion(packageJsonPath);
}
