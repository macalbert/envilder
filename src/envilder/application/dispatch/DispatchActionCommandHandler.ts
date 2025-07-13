import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';
import { OperationMode } from '../../domain/OperationMode.js';
import { ExportSsmToEnvCommand } from '../exportSsmToEnv/ExportSsmToEnvCommand.js';
import type { ExportSsmToEnvCommandHandler } from '../exportSsmToEnv/ExportSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommand } from '../pushEnvToSsm/PushEnvToSsmCommand.js';
import type { PushEnvToSsmCommandHandler } from '../pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleVariableCommand } from '../pushSingleVariable/PushSingleVariableCommand.js';
import type { PushSingleVariableCommandHandler } from '../pushSingleVariable/PushSingleVariableCommandHandler.js';
import type { DispatchActionCommand } from './DispatchActionCommand.js';

export class DispatchActionCommandHandler {
  constructor(
    private readonly exportSsmToEnvCommandHandler: ExportSsmToEnvCommandHandler,
    private readonly pushEnvToSsmCommandHandler: PushEnvToSsmCommandHandler,
    private readonly pushSingleVariableCommandHandler: PushSingleVariableCommandHandler,
  ) {}

  async handleCommand(command: DispatchActionCommand): Promise<void> {
    switch (command.mode) {
      case OperationMode.PUSH_SINGLE_VARIABLE:
        await this.handlePushSingleVariable(command);
        break;
      case OperationMode.IMPORT_ENV_TO_SSM:
        await this.handlePushEnvToSsm(command);
        break;
      case OperationMode.EXPORT_SSM_TO_ENV:
        await this.handleExportSsmToEnv(command);
        break;
    }
  }

  private async handlePushSingleVariable(
    command: DispatchActionCommand,
  ): Promise<void> {
    if (!command.key || !command.value || !command.ssmPath) {
      throw new InvalidArgumentError(
        'Missing required arguments: --key, --value, and --ssm-path',
      );
    }

    const pushSingleVariableCommand = PushSingleVariableCommand.create(
      command.key,
      command.value,
      command.ssmPath,
    );

    await this.pushSingleVariableCommandHandler.handle(
      pushSingleVariableCommand,
    );
  }

  private async handlePushEnvToSsm(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const importEnvToSsmCommand = PushEnvToSsmCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.pushEnvToSsmCommandHandler.handle(importEnvToSsmCommand);
  }

  private async handleExportSsmToEnv(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    const exportSsmToEnvCommand = ExportSsmToEnvCommand.create(
      command.map as string,
      command.envfile as string,
    );

    await this.exportSsmToEnvCommandHandler.handle(exportSsmToEnvCommand);
  }

  private validateMapAndEnvFileOptions(command: DispatchActionCommand): void {
    if (!command.map || !command.envfile) {
      throw new InvalidArgumentError(
        'Missing required arguments: --map and --envfile',
      );
    }
  }
}
