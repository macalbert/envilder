import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SSMClient } from '@aws-sdk/client-ssm';
import {
  LocalstackContainer,
  type StartedLocalStackContainer,
} from '@testcontainers/localstack';
import { EnvilderClient } from '../../../../src/sdks/typescript/src/application/envilder-client.js';
import { MapFileParser } from '../../../../src/sdks/typescript/src/application/map-file-parser.js';
import type { MapFileConfig } from '../../../../src/sdks/typescript/src/domain/map-file-config.js';
import { SecretProviderType } from '../../../../src/sdks/typescript/src/domain/secret-provider-type.js';
import { AwsSsmSecretProvider } from '../../../../src/sdks/typescript/src/infrastructure/aws/aws-ssm-secret-provider.js';
import { createSecretProvider } from '../../../../src/sdks/typescript/src/infrastructure/secret-provider-factory.js';

const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
const SECRETS_MAP = path.resolve(__dirname, '../../../../secrets-map.json');

export class LocalStackTestContainer {
  private container: StartedLocalStackContainer | null = null;
  private endpointUrl = '';

  async start(): Promise<LocalStackTestContainer> {
    console.log('\n[LocalStack] Starting container...');

    const environment = await loadEnvironment();
    if (!environment.get('LOCALSTACK_AUTH_TOKEN')) {
      throw new Error(
        'LOCALSTACK_AUTH_TOKEN could not be resolved from secrets-map.json',
      );
    }

    const envRecord: Record<string, string> = {};
    for (const [key, value] of environment) {
      envRecord[key] = value;
    }

    this.container = await new LocalstackContainer(LOCALSTACK_IMAGE)
      .withName('localstack')
      .withEnvironment(envRecord)
      .start();

    this.endpointUrl = this.container.getConnectionUri();
    console.log(`[LocalStack] Ready at: ${this.endpointUrl}`);
    return this;
  }

  async stop(): Promise<void> {
    if (this.container) {
      console.log('[LocalStack] Stopping container...');
      await this.container.stop();
      this.container = null;
    }
  }

  getEndpointUrl(): string {
    return this.endpointUrl;
  }

  getSsmClient(): SSMClient {
    return new SSMClient({
      endpoint: this.endpointUrl,
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  createProvider(): AwsSsmSecretProvider {
    return new AwsSsmSecretProvider(this.getSsmClient());
  }
}

async function loadEnvironment(): Promise<Map<string, string>> {
  const json = await readFile(SECRETS_MAP, 'utf-8');
  const parser = new MapFileParser();
  const mapFile = parser.parse(json);
  const client = resolveClient(mapFile.config);
  return client.resolveSecrets(mapFile);
}

function resolveClient(config: MapFileConfig): EnvilderClient {
  try {
    const provider = createSecretProvider(config);
    return new EnvilderClient(provider);
  } catch {
    const fallback = createSecretProvider({
      provider: SecretProviderType.Aws,
    });
    return new EnvilderClient(fallback);
  }
}
