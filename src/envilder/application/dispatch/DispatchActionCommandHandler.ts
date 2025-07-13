import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import { OperationMode } from '../../domain/OperationMode.js';
import { PullSsmToEnvCommand } from '../pullSsmToEnv/PullSsmToEnvCommand.js';
import type { PullSsmToEnvCommandHandler } from '../pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommand } from '../pushEnvToSsm/PushEnvToSsmCommand.js';
import type { PushEnvToSsmCommandHandler } from '../pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommand } from '../pushSingle/PushSingleCommand.js';
import type { PushSingleCommandHandler } from '../pushSingle/PushSingleCommandHandler.js';
import type { DispatchActionCommand } from './DispatchActionCommand.js';

export class DispatchActionCommandHandler {
  constructor(
    private readonly pullSsmToEnvCommandHandler: PullSsmToEnvCommandHandler,
    private readonly pushEnvToSsmCommandHandler: PushEnvToSsmCommandHandler,
    private readonly pushSingleCommandHandler: PushSingleCommandHandler,
  ) {}

  async handleCommand(command: DispatchActionCommand): Promise<void> {
    switch (command.mode) {
      case OperationMode.PUSH_SINGLE:
        await this.handlePushSingle(command);
        break;
      case OperationMode.PUSH_ENV_TO_SSM:
        await this.handlePushEnvToSsm(command);
        break;
      default:
        await this.handlePullSsmToEnv(command);
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

    await this.pushSingleCommandHandler.handle(pushSingleCommand);
  }

  private async handlePushEnvToSsm(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const pushEnvToSsmCommand = PushEnvToSsmCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.pushEnvToSsmCommandHandler.handle(pushEnvToSsmCommand);
  }

  private async handlePullSsmToEnv(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const pullSsmToEnvCommand = PullSsmToEnvCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.pullSsmToEnvCommandHandler.handle(pullSsmToEnvCommand);
  }

  private validateMapAndEnvFileOptions(command: DispatchActionCommand): void {
    if (!command.map || !command.envfile) {
      throw new InvalidArgumentError(
        'Missing required arguments: --map and --envfile',
      );
    }
  }
}
