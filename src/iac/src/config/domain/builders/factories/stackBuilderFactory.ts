import type { App } from 'aws-cdk-lib';
import type { IDeploymentRequest } from '../../../application/deployInfrastructure/models/deploymentRequest';
import { FileProjectPath } from '../../../infrastructure/projectPath/fileProjectPath';
import type { IStackBuilder } from '../../iStackBuilder';
import type { IProjectPath } from '../../ports/iProjectPath';
import { FrontendBuilder } from '../frontendBuilder';
import { SharedBuilder } from '../sharedBuilder';

/**
 * Factory for creating stack builders based on configuration
 */
// biome-ignore lint/complexity/noStaticOnlyClass: factory pattern used across codebase
export class StackBuilderFactory {
  static createStackParts(
    app: App,
    config: IDeploymentRequest,
  ): IStackBuilder[] {
    const stackParts: IStackBuilder[] = [];

    const projectPathResolver: IProjectPath = new FileProjectPath(
      config.rootPath,
    );

    if (config.stacks.frontend) {
      stackParts.push(
        new FrontendBuilder({
          stackName: 'FrontendStack',
          scope: app,
          iacConfig: config,
          projectPathResolver,
        }),
      );
    }

    if (config.stacks.shared) {
      stackParts.push(
        new SharedBuilder({
          stackName: 'SharedStack',
          scope: app,
          iacConfig: config,
        }),
      );
    }

    return stackParts;
  }
}
