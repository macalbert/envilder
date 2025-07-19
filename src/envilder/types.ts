export const DOMAIN = {
  ILogger: Symbol.for('ILogger'),
  ISecretProvider: Symbol.for('ISecretProvider'),
  IVariableStore: Symbol.for('IVariableStore'),
};

export const APPLICATION = {
  PullSsmToEnvCommandHandler: Symbol.for('PullSsmToEnvCommandHandler'),
  PushEnvToSsmCommandHandler: Symbol.for('PushEnvToSsmCommandHandler'),
  PushSingleCommandHandler: Symbol.for('PushSingleCommandHandler'),
  DispatchActionCommandHandler: Symbol.for('DispatchActionCommandHandler'),
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
