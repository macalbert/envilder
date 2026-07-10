import {
  GetParameterCommand,
  PutParameterCommand,
  type SSM,
} from '@aws-sdk/client-ssm';
import { GetCallerIdentityCommand, type STS } from '@aws-sdk/client-sts';
import { injectable } from 'inversify';
import pc from 'picocolors';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  ExpiredCredentialsError,
  SecretOperationError,
  SsoSessionExpiredError,
} from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { describeError } from '../describeError.js';
import { isExpiredCredentialsError } from './isExpiredCredentialsError.js';
import { isSsoSessionExpiredError } from './isSsoSessionExpiredError.js';

@injectable()
export class AwsSsmSecretProvider implements ISecretProvider {
  private ssm: SSM;
  private logger: ILogger;
  private sts: STS;
  private profile?: string;
  private identityLogged = false;

  constructor(ssm: SSM, logger: ILogger, sts: STS, profile?: string) {
    this.ssm = ssm;
    this.logger = logger;
    this.sts = sts;
    this.profile = profile;
  }

  async getSecret(name: string): Promise<string | undefined> {
    await this.logIdentity();
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
      if (isSsoSessionExpiredError(error)) {
        throw new SsoSessionExpiredError(this.profile, error);
      }
      if (isExpiredCredentialsError(error)) {
        throw new ExpiredCredentialsError(error);
      }
      throw new SecretOperationError(
        `${EnvironmentVariable.maskSecretPath(name)}: ${describeError(error)}`,
      );
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    await this.logIdentity();
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Type: 'SecureString',
      Overwrite: true,
    });
    try {
      await this.ssm.send(command);
    } catch (error) {
      if (isSsoSessionExpiredError(error)) {
        throw new SsoSessionExpiredError(this.profile, error);
      }
      if (isExpiredCredentialsError(error)) {
        throw new ExpiredCredentialsError(error);
      }
      throw error;
    }
  }

  async logIdentity(): Promise<void> {
    if (this.identityLogged) {
      return;
    }
    this.identityLogged = true;
    const [region, account] = await Promise.all([
      this.resolveRegion(),
      this.resolveAccount(),
    ]);
    const profile = this.profile ?? 'default';
    this.logger.info(this.formatIdentityBanner(account, region, profile));
  }

  private formatIdentityBanner(
    account: string,
    region: string,
    profile: string,
  ): string {
    const sep = pc.dim(' · ');
    const accountValue =
      account === 'unknown' ? pc.red(account) : pc.green(account);
    const regionValue =
      region === 'unknown' ? pc.red(region) : pc.yellow(region);
    return (
      '\n' +
      pc.bold(pc.cyan('☁ AWS identity')) +
      sep +
      pc.dim('account=') +
      accountValue +
      sep +
      pc.dim('region=') +
      regionValue +
      sep +
      pc.dim('profile=') +
      pc.magenta(profile)
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
