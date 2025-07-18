import { inject, injectable } from 'inversify';
import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import { OperationMode } from '../../domain/OperationMode.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { PullSsmToEnvCommand } from '../pullSsmToEnv/PullSsmToEnvCommand.js';
import type { PullSsmToEnvCommandHandler } from '../pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommand } from '../pushEnvToSsm/PushEnvToSsmCommand.js';
import type { PushEnvToSsmCommandHandler } from '../pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommand } from '../pushSingle/PushSingleCommand.js';
import type { PushSingleCommandHandler } from '../pushSingle/PushSingleCommandHandler.js';
import type { DispatchActionCommand } from './DispatchActionCommand.js';

@injectable()
export class DispatchActionCommandHandler {
  constructor(
    @inject(TYPES.PullSsmToEnvCommandHandler)
    private readonly pullHandler: PullSsmToEnvCommandHandler,
    @inject(TYPES.PushEnvToSsmCommandHandler)
    private readonly pushHandler: PushEnvToSsmCommandHandler,
    @inject(TYPES.PushSingleCommandHandler)
    private readonly pushSingleHandler: PushSingleCommandHandler,
  ) {}

  async handleCommand(command: DispatchActionCommand): Promise<void> {
    switch (command.mode) {
      case OperationMode.PUSH_SINGLE:
        await this.handlePushSingle(command);
        break;
      case OperationMode.PUSH_ENV_TO_SSM:
        await this.handlePush(command);
        break;
      case OperationMode.PULL_SSM_TO_ENV:
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
    if (!command.key || !command.value || !command.ssmPath) {
      throw new InvalidArgumentError(
        'Missing required arguments: --key, --value, and --ssm-path',
      );
    }

    const pushSingleCommand = PushSingleCommand.create(
      command.key,
      command.value,
      command.ssmPath,
    );

    await this.pushSingleHandler.handle(pushSingleCommand);
  }

  private async handlePush(command: DispatchActionCommand): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const pushEnvToSsmCommand = PushEnvToSsmCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.pushHandler.handle(pushEnvToSsmCommand);
  }

  private async handlePull(command: DispatchActionCommand): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const pullSsmToEnvCommand = PullSsmToEnvCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.pullHandler.handle(pullSsmToEnvCommand);
  }

  private validateMapAndEnvFileOptions(command: DispatchActionCommand): void {
    if (!command.map || !command.envfile) {
      throw new InvalidArgumentError(
        'Missing required arguments: --map and --envfile',
      );
    }
  }
}
