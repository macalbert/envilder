import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { Container } from 'inversify';

import { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import { PullSsmToEnvCommandHandler } from '../../envilder/application/pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommandHandler } from '../../envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommandHandler } from '../../envilder/application/pushSingle/PushSingleCommandHandler.js';

import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../envilder/domain/ports/IVariableStore.js';

import { AwsSsmSecretProvider } from '../../envilder/infrastructure/aws/AwsSsmSecretProvider.js';
import { AzureKeyVaultSecretProvider } from '../../envilder/infrastructure/azure/AzureKeyVaultSecretProvider.js';
import { ConsoleLogger } from '../../envilder/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../envilder/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../envilder/types.js';

export class Startup {
  private readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  static build(): Startup {
    return new Startup();
  }

  configureServices(): this {
    this.configureApplicationServices();
    return this;
  }

  /**
   * Configures infrastructure services for the application.
   * @param awsProfile - The AWS profile to use for configuring infrastructure services.
   * @param provider - The cloud provider to use (aws or azure), defaults to aws.
   * @returns The current instance for method chaining.
   */
  configureInfrastructure(awsProfile?: string, provider?: string): this {
    this.configureInfrastructureServices(awsProfile, provider);
    return this;
  }

  create(): Container {
    return this.container;
  }

  getServiceProvider(): Container {
    return this.container;
  }

  private configureInfrastructureServices(
    awsProfile?: string,
    provider?: string,
  ): void {
    this.container
      .bind<ILogger>(TYPES.ILogger)
      .to(ConsoleLogger)
      .inSingletonScope();

    this.container
      .bind<IVariableStore>(TYPES.IVariableStore)
      .to(FileVariableStore)
      .inSingletonScope();

    // Default to AWS if no provider specified
    const selectedProvider = provider?.toLowerCase() || 'aws';

    let secretProvider: ISecretProvider;

    if (selectedProvider === 'azure') {
      // Azure Key Vault configuration
      const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
      if (!vaultUrl) {
        throw new Error(
          'AZURE_KEY_VAULT_URL environment variable is required when using Azure provider',
        );
      }
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(vaultUrl, credential);
      secretProvider = new AzureKeyVaultSecretProvider(client);
    } else if (selectedProvider === 'aws') {
      // AWS SSM configuration
      const ssm = awsProfile
        ? new SSM({ credentials: fromIni({ profile: awsProfile }) })
        : new SSM();
      secretProvider = new AwsSsmSecretProvider(ssm);
    } else {
      throw new Error(
        `Unsupported provider: ${provider}. Supported providers: aws, azure`,
      );
    }

    this.container
      .bind<ISecretProvider>(TYPES.ISecretProvider)
      .toConstantValue(secretProvider);
  }

  private configureApplicationServices(): void {
    this.container
      .bind<PullSsmToEnvCommandHandler>(TYPES.PullSsmToEnvCommandHandler)
      .to(PullSsmToEnvCommandHandler)
      .inTransientScope();

    this.container
      .bind<PushEnvToSsmCommandHandler>(TYPES.PushEnvToSsmCommandHandler)
      .to(PushEnvToSsmCommandHandler)
      .inTransientScope();

    this.container
      .bind<PushSingleCommandHandler>(TYPES.PushSingleCommandHandler)
      .to(PushSingleCommandHandler)
      .inTransientScope();

    this.container
      .bind<DispatchActionCommandHandler>(TYPES.DispatchActionCommandHandler)
      .to(DispatchActionCommandHandler)
      .inTransientScope();
  }
}
