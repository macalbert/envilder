import {
  GetParameterCommand,
  PutParameterCommand,
  type SSM,
} from '@aws-sdk/client-ssm';
import { GetCallerIdentityCommand, type STS } from '@aws-sdk/client-sts';
import { injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import { SecretOperationError } from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';

@injectable()
export class AwsSsmSecretProvider implements ISecretProvider {
  private ssm: SSM;
  private logger: ILogger;
  private sts: STS;
  private identityLogged = false;

  constructor(ssm: SSM, logger: ILogger, sts: STS) {
    this.ssm = ssm;
    this.logger = logger;
    this.sts = sts;
  }

  async getSecret(name: string): Promise<string | undefined> {
    await this.logIdentityOnce();
    try {
      const command = new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      });
      const { Parameter } = await this.ssm.send(command);
      return Parameter?.Value;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'ParameterNotFound'
      ) {
        return undefined;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SecretOperationError(
        `Failed to get secret ${EnvironmentVariable.maskSecretPath(name)}: ${errorMessage}`,
      );
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    await this.logIdentityOnce();
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Type: 'SecureString',
      Overwrite: true,
    });
    await this.ssm.send(command);
  }

  private async logIdentityOnce(): Promise<void> {
    if (this.identityLogged) {
      return;
    }
    this.identityLogged = true;
    const region = await this.resolveRegion();
    const account = await this.resolveAccount();
    const profile = process.env.AWS_PROFILE ?? 'default';
    this.logger.info(
      `AWS identity → account=${account} region=${region} profile=${profile}`,
    );
  }

  private async resolveRegion(): Promise<string> {
    try {
      return await this.ssm.config.region();
    } catch {
      return 'unknown';
    }
  }

  private async resolveAccount(): Promise<string> {
    const fromCredentials = await this.tryCredentialsAccount();
    if (fromCredentials) {
      return fromCredentials;
    }
    return this.tryStsAccount();
  }

  private async tryCredentialsAccount(): Promise<string | undefined> {
    try {
      const credentials = await this.ssm.config.credentials();
      return credentials.accountId;
    } catch {
      return undefined;
    }
  }

  private async tryStsAccount(): Promise<string> {
    try {
      const identity = await this.sts.send(new GetCallerIdentityCommand({}));
      return identity.Account ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
