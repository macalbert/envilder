export class ValidateRemoteKeysCommand {
  constructor(public readonly mapPath: string) {}

  static create(mapPath: string): ValidateRemoteKeysCommand {
    return new ValidateRemoteKeysCommand(mapPath);
  }
}
