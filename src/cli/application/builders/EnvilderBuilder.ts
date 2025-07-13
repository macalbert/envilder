import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import type { IEnvFileManager } from '../../domain/ports/IEnvFileManager';
import type { ILogger } from '../../domain/ports/ILogger';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider';
import { AwsSsmSecretProvider } from '../../infrastructure/Aws/AwsSsmSecretProvider.js';
import { EnvFileManager } from '../../infrastructure/EnvManager/EnvFileManager.js';
import { ConsoleLogger } from '../../infrastructure/Logger/ConsoleLogger.js';
import { Envilder } from '../EnvilderHandler.js';

export class EnvilderBuilder {
  private provider?: ISecretProvider;
  private fileManager?: IEnvFileManager;
  private logger?: ILogger;

  static build(): EnvilderBuilder {
    return new EnvilderBuilder();
  }

  withDefaultFileManager(): this {
    this.fileManager = new EnvFileManager(this.logger as ILogger);
    return this;
  }

  withEnvFileManager(fileManager: IEnvFileManager): this {
    this.fileManager = fileManager;
    return this;
  }

  withProvider(provider: ISecretProvider): this {
    this.provider = provider;
    return this;
  }

  withLogger(logger: ILogger): this {
    this.logger = logger;
    return this;
  }

  withConsoleLogger(): this {
    this.logger = new ConsoleLogger();
    return this;
  }

  withAwsProvider(profile?: string): this {
    const ssm =
      profile == null
        ? new SSM()
        : new SSM({
            credentials: fromIni({ profile: profile }),
          } as SSMClientConfig);
    this.provider = new AwsSsmSecretProvider(ssm);
    return this;
  }

  create(): Envilder {
    if (!this.provider) {
      throw new Error('Secret provider must be specified');
    }

    if (!this.fileManager) {
      throw new Error('Env file manager must be specified');
    }

    if (!this.logger) {
      throw new Error('Logger must be specified');
    }

    return new Envilder(this.provider, this.fileManager, this.logger);
  }
}
