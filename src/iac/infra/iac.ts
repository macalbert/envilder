#!/usr/bin/env node
/**
 * CDK Infrastructure Deployment Entry Point
 */
import { App } from 'aws-cdk-lib';
import type { Environment } from 'aws-cdk-lib';
import { DeployInfrastructureHandler } from '../config/application/deployInfrastructure/deployInfrastructureHandler';
import type { IDeploymentConfig } from '../config/domain/model/deploymentConfig';
import { iacConfig } from './iacConfig';

const envFromCli: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const config: IDeploymentConfig = iacConfig;

const deployment = new DeployInfrastructureHandler(
  new App(),
  envFromCli,
  config,
);

deployment.run();
