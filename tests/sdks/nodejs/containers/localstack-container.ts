import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SSMClient } from '@aws-sdk/client-ssm';
import {
  LocalstackContainer,
  type StartedLocalStackContainer,
} from '@testcontainers/localstack';
import { EnvilderClient } from '../../../../src/sdks/nodejs/src/application/envilder-client.js';
import { MapFileParser } from '../../../../src/sdks/nodejs/src/application/map-file-parser.js';
import type { MapFileConfig } from '../../../../src/sdks/nodejs/src/domain/map-file-config.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import { AwsSsmSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/aws/aws-ssm-secret-provider.js';
import { createSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/secret-provider-factory.js';

const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

    const suffix = crypto.randomUUID().slice(0, 8);
    this.container = await new LocalstackContainer(LOCALSTACK_IMAGE)
      .withName(`localstack-${suffix}`)
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
