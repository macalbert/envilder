import { OperationMode } from '../../domain/OperationMode.js';

export class DispatchActionCommand {
  constructor(
    public readonly map?: string,
    public readonly envfile?: string,
    public readonly key?: string,
    public readonly value?: string,
    public readonly ssmPath?: string,
    public readonly profile?: string,
    public readonly importEnv?: boolean,
    public readonly mode: OperationMode = OperationMode.EXPORT_SSM_TO_ENV,
  ) {}

  static fromCliOptions(options: {
    map?: string;
    envfile?: string;
    key?: string;
    value?: string;
    ssmPath?: string;
    profile?: string;
    import?: boolean;
  }): DispatchActionCommand {
    const mode = DispatchActionCommand.determineOperationMode(options);
    return new DispatchActionCommand(
      options.map,
      options.envfile,
      options.key,
      options.value,
      options.ssmPath,
      options.profile,
      options.import,
      mode,
    );
  }

  private static determineOperationMode(options: {
    key?: string;
    value?: string;
    ssmPath?: string;
    import?: boolean;
  }): OperationMode {
    if (options.key && options.value && options.ssmPath) {
      return OperationMode.PUSH_SINGLE_VARIABLE;
    }

    if (options.import) {
      return OperationMode.IMPORT_ENV_TO_SSM;
    }

    return OperationMode.EXPORT_SSM_TO_ENV;
  }
}
