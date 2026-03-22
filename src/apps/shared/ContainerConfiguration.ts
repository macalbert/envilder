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
import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../envilder/domain/ports/IVariableStore.js';
import { AwsSsmSecretProvider } from '../../envilder/infrastructure/aws/AwsSsmSecretProvider.js';
import { AzureKeyVaultSecretProvider } from '../../envilder/infrastructure/azure/AzureKeyVaultSecretProvider.js';
import { ConsoleLogger } from '../../envilder/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../envilder/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../envilder/types.js';

function validateAzureVaultUrl(vaultUrl: string): void {
  let url: URL;
  try {
    url = new URL(vaultUrl);
  } catch {
    throw new InvalidArgumentError('AZURE_KEY_VAULT_URL must be a valid URL');
  }
  if (url.protocol !== 'https:') {
    throw new InvalidArgumentError(
      'AZURE_KEY_VAULT_URL must use https:// protocol',
    );
  }
}

export function configureInfrastructureServices(
  container: Container,
  awsProfile?: string,
  provider?: string,
): void {
  container.bind<ILogger>(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();

  container
    .bind<IVariableStore>(TYPES.IVariableStore)
    .to(FileVariableStore)
    .inSingletonScope();

  const selectedProvider = provider?.toLowerCase() || 'aws';

  let secretProvider: ISecretProvider;

  if (selectedProvider === 'azure') {
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
    if (!vaultUrl) {
      throw new DependencyMissingError(
        'AZURE_KEY_VAULT_URL environment variable is required when using Azure provider',
      );
    }
    validateAzureVaultUrl(vaultUrl);
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);
    secretProvider = new AzureKeyVaultSecretProvider(client);
  } else if (selectedProvider === 'aws') {
    const ssm = awsProfile
      ? new SSM({ credentials: fromIni({ profile: awsProfile }) })
      : new SSM();
    secretProvider = new AwsSsmSecretProvider(ssm);
  } else {
    throw new InvalidArgumentError(
      `Unsupported provider: ${provider}. Supported providers: aws, azure`,
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
