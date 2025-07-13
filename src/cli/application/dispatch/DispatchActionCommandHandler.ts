// Import the Envilder type and OperationMode from domain

import { OperationMode } from '../../domain/OperationMode.js';
import type { DispatchActionCommand } from './DispatchActionCommand.js';
import type { Envilder } from './../EnvilderHandler.js';

export class DispatchActionCommandHandler {
  constructor(private readonly envilder: Envilder) {}

  async handleCommand(command: DispatchActionCommand): Promise<void> {
    switch (command.mode) {
      case OperationMode.PUSH_SINGLE_VARIABLE:
        await this.handlePushSingleVariable(command);
        break;
      case OperationMode.IMPORT_ENV_TO_SSM:
        await this.handleImportEnvToSsm(command);
        break;
      case OperationMode.EXPORT_SSM_TO_ENV:
        await this.handleExportSsmToEnv(command);
        break;
    }
  }

  private async handlePushSingleVariable(
    command: DispatchActionCommand,
  ): Promise<void> {
    await this.envilder.pushSingleVariableToSSM(
      command.key as string,
      command.value as string,
      command.ssmPath as string,
    );
  }

  private async handleImportEnvToSsm(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    await this.envilder.importEnvFile(
      command.map as string,
      command.envfile as string,
    );
  }

  private async handleExportSsmToEnv(
    command: DispatchActionCommand,
  ): Promise<void> {
    this.validateMapAndEnvFileOptions(command);

    await this.envilder.run(command.map as string, command.envfile as string);
  }

  private validateMapAndEnvFileOptions(command: DispatchActionCommand): void {
    if (!command.map || !command.envfile) {
      throw new Error('Missing required arguments: --map and --envfile');
    }
  }
}
