import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { Container } from 'inversify';

import { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import { PullSsmToEnvCommandHandler } from '../../envilder/application/pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommandHandler } from '../../envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommandHandler } from '../../envilder/application/pushSingle/PushSingleCommandHandler.js';

import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../envilder/domain/ports/IVariableStore.js';

import { AwsSsmSecretProvider } from '../../envilder/infrastructure/aws/AwsSsmSecretProvider.js';
import { ConsoleLogger } from '../../envilder/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../envilder/infrastructure/variableStore/FileConfigurationRepository.js';
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

  configureInfrastructure(awsProfile?: string): this {
    this.configureInfrastructureServices(awsProfile);
    return this;
  }

  create(): Container {
    return this.container;
  }

  getServiceProvider(): Container {
    return this.container;
  }

  private configureInfrastructureServices(awsProfile?: string): void {
    this.container
      .bind<ILogger>(TYPES.ILogger)
      .to(ConsoleLogger)
      .inSingletonScope();

    this.container
      .bind<IVariableStore>(TYPES.IVariableStore)
      .to(FileVariableStore)
      .inSingletonScope();

    const ssm = awsProfile
      ? new SSM({ credentials: fromIni({ profile: awsProfile }) })
      : new SSM();

    const secretProvider = new AwsSsmSecretProvider(ssm);

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
