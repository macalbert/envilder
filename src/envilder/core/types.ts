export const DOMAIN = {
  ILogger: Symbol.for('ILogger'),
  ISecretProvider: Symbol.for('ISecretProvider'),
  ISecretMasker: Symbol.for('ISecretMasker'),
  IVariableStore: Symbol.for('IVariableStore'),
  IProcessRunner: Symbol.for('IProcessRunner'),
  IProcessContext: Symbol.for('IProcessContext'),
  IEnvironmentExporter: Symbol.for('IEnvironmentExporter'),
};

export const APPLICATION = {
  PullSecretsToEnvCommandHandler: Symbol.for('PullSecretsToEnvCommandHandler'),
  PushEnvToSecretsCommandHandler: Symbol.for('PushEnvToSecretsCommandHandler'),
  PushSingleCommandHandler: Symbol.for('PushSingleCommandHandler'),
  DispatchActionCommandHandler: Symbol.for('DispatchActionCommandHandler'),
  ExecWithSecretsCommandHandler: Symbol.for('ExecWithSecretsCommandHandler'),
  ExportSecretsToEnvironmentCommandHandler: Symbol.for(
    'ExportSecretsToEnvironmentCommandHandler',
  ),
  ValidateMapFileCommandHandler: Symbol.for('ValidateMapFileCommandHandler'),
  ValidateRemoteKeysCommandHandler: Symbol.for(
    'ValidateRemoteKeysCommandHandler',
  ),
};

export const INFRASTRUCTURE = {
  // Currently empty - Infrastructure implements domain ports
  // Add infrastructure-specific services here if needed
};

// Legacy TYPES object for backward compatibility (can be removed once all imports are updated)
export const TYPES = {
  ...DOMAIN,
  ...APPLICATION,
  ...INFRASTRUCTURE,
};
