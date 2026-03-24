import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import type { Container } from 'inversify';

import { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import { PullSsmToEnvCommandHandler } from '../../envilder/application/pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommandHandler } from '../../envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommandHandler } from '../../envilder/application/pushSingle/PushSingleCommandHandler.js';
import {
  DependencyMissingError,
  InvalidArgumentError,
} from '../../envilder/domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../envilder/domain/ports/IVariableStore.js';
import { AwsSsmSecretProvider } from '../../envilder/infrastructure/aws/AwsSsmSecretProvider.js';
import { AzureKeyVaultSecretProvider } from '../../envilder/infrastructure/azure/AzureKeyVaultSecretProvider.js';
import { ConsoleLogger } from '../../envilder/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../envilder/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../envilder/types.js';

const DEFAULT_VAULT_HOSTS = [
  '.vault.azure.net',
  '.vault.azure.cn',
  '.vault.usgovcloudapi.net',
  '.vault.microsoftazure.de',
];

function validateAzureVaultUrl(vaultUrl: string, allowedHosts: string[]): void {
  let url: URL;
  try {
    url = new URL(vaultUrl);
  } catch {
    throw new InvalidArgumentError('vaultUrl must be a valid URL');
  }
  if (url.protocol !== 'https:') {
    throw new InvalidArgumentError('vaultUrl must use https:// protocol');
  }
  const isAllowedHost = allowedHosts.some((suffix) => {
    const dotSuffix = suffix.startsWith('.') ? suffix : `.${suffix}`;
    return url.hostname === suffix || url.hostname.endsWith(dotSuffix);
  });
  if (!isAllowedHost) {
    throw new InvalidArgumentError(
      `vaultUrl hostname must end with one of: ${allowedHosts.join(', ')}`,
    );
  }
}

export function configureInfrastructureServices(
  container: Container,
  config: MapFileConfig = {},
  allowedVaultHosts: string[] = DEFAULT_VAULT_HOSTS,
): void {
  container.bind<ILogger>(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();

  container
    .bind<IVariableStore>(TYPES.IVariableStore)
    .to(FileVariableStore)
    .inSingletonScope();

  const selectedProvider = config.provider?.toLowerCase() || 'aws';

  let secretProvider: ISecretProvider;

  if (selectedProvider === 'azure') {
    const { vaultUrl } = config;
    if (!vaultUrl) {
      throw new DependencyMissingError(
        'vaultUrl is required when using Azure provider. Set it in $config.vaultUrl in your map file or via --vault-url flag.',
      );
    }
    validateAzureVaultUrl(vaultUrl, allowedVaultHosts);
    const credential = new DefaultAzureCredential();
    const isCustomHosts =
      allowedVaultHosts.length !== DEFAULT_VAULT_HOSTS.length ||
      allowedVaultHosts.some((h, i) => h !== DEFAULT_VAULT_HOSTS[i]);
    const client = new SecretClient(vaultUrl, credential, {
      disableChallengeResourceVerification: isCustomHosts,
    });
    secretProvider = new AzureKeyVaultSecretProvider(client);
  } else if (selectedProvider === 'aws') {
    const ssm = config.profile
      ? new SSM({ credentials: fromIni({ profile: config.profile }) })
      : new SSM();
    secretProvider = new AwsSsmSecretProvider(ssm);
  } else {
    throw new InvalidArgumentError(
      `Unsupported provider: ${config.provider}. Supported providers: aws, azure`,
    );
  }

  container
    .bind<ISecretProvider>(TYPES.ISecretProvider)
    .toConstantValue(secretProvider);
}

export function configureApplicationServices(container: Container): void {
  container
    .bind<PullSsmToEnvCommandHandler>(TYPES.PullSsmToEnvCommandHandler)
    .to(PullSsmToEnvCommandHandler)
    .inTransientScope();

  container
    .bind<PushEnvToSsmCommandHandler>(TYPES.PushEnvToSsmCommandHandler)
    .to(PushEnvToSsmCommandHandler)
    .inTransientScope();

  container
    .bind<PushSingleCommandHandler>(TYPES.PushSingleCommandHandler)
    .to(PushSingleCommandHandler)
    .inTransientScope();

  container
    .bind<DispatchActionCommandHandler>(TYPES.DispatchActionCommandHandler)
    .to(DispatchActionCommandHandler)
    .inTransientScope();
}
