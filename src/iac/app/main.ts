#!/usr/bin/env node
/**
 * CDK Infrastructure Deployment Entry Point
 */
import { App } from 'aws-cdk-lib';
import type { Environment } from 'aws-cdk-lib';
import { DeployInfrastructureHandler } from '../application/deployInfrastructureHandler';
import { ConsoleLogger } from '../infrastructure/logging/consoleLogger';
import { FileProjectPath } from '../infrastructure/path/fileProjectPath';
import { deploymentConfig } from './deployment.config';

const envFromCli: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const logger = new ConsoleLogger();
const projectPath = new FileProjectPath(deploymentConfig.rootPath);

const deployment = new DeployInfrastructureHandler(
  new App(),
  envFromCli,
  deploymentConfig,
  logger,
  projectPath,
);

deployment.run();
