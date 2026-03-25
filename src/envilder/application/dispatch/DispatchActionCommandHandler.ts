import { inject, injectable } from 'inversify';
import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import { OperationMode } from '../../domain/OperationMode.js';
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
  ) {}

  async handleCommand(command: DispatchActionCommand): Promise<void> {
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
        await this.handlePull(command);
        break;
    }
  }

  private async handlePushSingle(
    command: DispatchActionCommand,
  ): Promise<void> {
    if (!command.key || !command.value || !command.secretPath) {
      throw new InvalidArgumentError(
        'Missing required arguments: --key, --value, and --secret-path',
      );
    }

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
      command.map as string,
      command.envfile as string,
    );

    await this.pushHandler.handle(pushEnvToSecretsCommand);
  }

  private async handlePull(command: DispatchActionCommand): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const pullSecretsToEnvCommand = PullSecretsToEnvCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.pullHandler.handle(pullSecretsToEnvCommand);
  }

  private validateMapAndEnvFileOptions(command: DispatchActionCommand): void {
    if (!command.map || !command.envfile) {
      throw new InvalidArgumentError(
        'Missing required arguments: --map and --envfile',
      );
    }
  }
}
