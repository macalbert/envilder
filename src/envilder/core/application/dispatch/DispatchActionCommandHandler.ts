import { inject, injectable } from 'inversify';
import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import { OperationMode } from '../../domain/OperationMode.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { TYPES } from '../../types.js';
import { PullSecretsToEnvCommand } from '../pullSecretsToEnv/PullSecretsToEnvCommand.js';
import type { PullSecretsToEnvCommandHandler } from '../pullSecretsToEnv/PullSecretsToEnvCommandHandler.js';
import { PushEnvToSecretsCommand } from '../pushEnvToSecrets/PushEnvToSecretsCommand.js';
import type { PushEnvToSecretsCommandHandler } from '../pushEnvToSecrets/PushEnvToSecretsCommandHandler.js';
import { PushSingleCommand } from '../pushSingle/PushSingleCommand.js';
import type { PushSingleCommandHandler } from '../pushSingle/PushSingleCommandHandler.js';
import type { DispatchActionCommand } from './DispatchActionCommand.js';

@injectable()
export class DispatchActionCommandHandler {
  constructor(
    @inject(TYPES.PullSecretsToEnvCommandHandler)
    private readonly pullHandler: PullSecretsToEnvCommandHandler,
    @inject(TYPES.PushEnvToSecretsCommandHandler)
    private readonly pushHandler: PushEnvToSecretsCommandHandler,
    @inject(TYPES.PushSingleCommandHandler)
    private readonly pushSingleHandler: PushSingleCommandHandler,
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
  ) {}

  async handleCommand(command: DispatchActionCommand): Promise<void> {
    this.validateRequiredArguments(command);

    if (typeof this.secretProvider.logIdentity === 'function') {
      await this.secretProvider.logIdentity();
    }
    switch (command.mode) {
      case OperationMode.PUSH_SINGLE:
        await this.handlePushSingle(command);
        break;
      case OperationMode.PUSH_ENV_TO_SECRETS:
        await this.handlePush(command);
        break;
      case OperationMode.PULL_SECRETS_TO_ENV:
        await this.handlePull(command);
        break;
      default:
        throw new InvalidArgumentError(
          `Unsupported operation mode: ${command.mode}`,
        );
    }
  }

  private validateRequiredArguments(command: DispatchActionCommand): void {
    if (command.mode === OperationMode.PUSH_SINGLE) {
      this.validatePushSingleOptions(command);
      return;
    }

    this.validateMapAndEnvFileOptions(command);
  }

  private async handlePushSingle(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validatePushSingleOptions(command);
    const pushSingleCommand = PushSingleCommand.create(
      command.key,
      command.value,
      command.secretPath,
    );

    await this.pushSingleHandler.handle(pushSingleCommand);
  }

  private async handlePush(command: DispatchActionCommand): Promise<void> {
    this.validateMapAndEnvFileOptions(command);
    const pushEnvToSecretsCommand = PushEnvToSecretsCommand.create(
      command.map,
      command.envfile,
    );

    await this.pushHandler.handle(pushEnvToSecretsCommand);
  }

  private async handlePull(command: DispatchActionCommand): Promise<void> {
    this.validateMapAndEnvFileOptions(command);
    const pullSecretsToEnvCommand = PullSecretsToEnvCommand.create(
      command.map,
      command.envfile,
    );

    await this.pullHandler.handle(pullSecretsToEnvCommand);
  }

  private validatePushSingleOptions(
    command: DispatchActionCommand,
  ): asserts command is DispatchActionCommand & {
    key: string;
    value: string;
    secretPath: string;
  } {
    if (!command.key || !command.value || !command.secretPath) {
      throw new InvalidArgumentError(
        'Missing required arguments: --key, --value, and --secret-path',
      );
    }
  }

  private validateMapAndEnvFileOptions(
    command: DispatchActionCommand,
  ): asserts command is DispatchActionCommand & {
    map: string;
    envfile: string;
  } {
    if (!command.map || !command.envfile) {
      throw new InvalidArgumentError(
        'Missing required arguments: --map and --envfile',
      );
    }
  }
}
