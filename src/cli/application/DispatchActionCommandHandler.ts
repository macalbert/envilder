import { EnvilderBuilder } from './builders/EnvilderBuilder.js';

export interface CliOptions {
  map?: string;
  envfile?: string;
  key?: string;
  value?: string;
  ssmPath?: string;
  profile?: string;
  import?: boolean;
}

export enum OperationMode {
  PUSH_SINGLE_VARIABLE = 'PUSH_SINGLE_VARIABLE',
  IMPORT_ENV_TO_SSM = 'IMPORT_ENV_TO_SSM',
  EXPORT_SSM_TO_ENV = 'EXPORT_SSM_TO_ENV',
}

export class DispatchActionCommandHandler {
  async handleCommand(options: CliOptions, mode: OperationMode): Promise<void> {
    switch (mode) {
      case OperationMode.PUSH_SINGLE_VARIABLE:
        await this.handlePushSingleVariable(options);
        break;
      case OperationMode.IMPORT_ENV_TO_SSM:
        await this.handleImportEnvToSsm(options);
        break;
      case OperationMode.EXPORT_SSM_TO_ENV:
        await this.handleExportSsmToEnv(options);
        break;
    }
  }

  private async handlePushSingleVariable(options: CliOptions): Promise<void> {
    const envilder = this.createEnvilder(options);

    await envilder.pushSingleVariableToSSM(
      options.key as string,
      options.value as string,
      options.ssmPath as string,
    );
  }

  private async handleImportEnvToSsm(options: CliOptions): Promise<void> {
    this.validateMapAndEnvFileOptions(options);
    const envilder = this.createEnvilder(options);

    await envilder.importEnvFile(
      options.map as string,
      options.envfile as string,
    );
  }

  private async handleExportSsmToEnv(options: CliOptions): Promise<void> {
    this.validateMapAndEnvFileOptions(options);
    const envilder = this.createEnvilder(options);

    await envilder.run(options.map as string, options.envfile as string);
  }

  private createEnvilder(options: CliOptions) {
    return EnvilderBuilder.build()
      .withConsoleLogger()
      .withDefaultFileManager()
      .withAwsProvider(options.profile)
      .create();
  }

  private validateMapAndEnvFileOptions(options: CliOptions): void {
    if (!options.map || !options.envfile) {
      throw new Error('Missing required arguments: --map and --envfile');
    }
  }
}
