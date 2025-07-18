export const TYPES = {
  // Domain Ports
  ILogger: Symbol.for('ILogger'),
  ISecretProvider: Symbol.for('ISecretProvider'),
  IVariableStore: Symbol.for('IVariableStore'),

  // Application Services
  PullSsmToEnvCommandHandler: Symbol.for('PullSsmToEnvCommandHandler'),
  PushEnvToSsmCommandHandler: Symbol.for('PushEnvToSsmCommandHandler'),
  PushSingleCommandHandler: Symbol.for('PushSingleCommandHandler'),
  DispatchActionCommandHandler: Symbol.for('DispatchActionCommandHandler'),
};
