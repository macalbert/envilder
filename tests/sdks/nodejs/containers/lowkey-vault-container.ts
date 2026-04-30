import crypto from 'node:crypto';
import https from 'node:https';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { AzureKeyVaultSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';

const LOWKEY_VAULT_IMAGE = 'nagyesta/lowkey-vault:7.1.61';
const HTTPS_PORT = 8443;
const HTTP_PORT = 8080;
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 1000;

export class LowkeyVaultTestContainer {
  private container: StartedTestContainer | null = null;
  private vaultUrl = '';
  private prevIdentityEndpoint: string | undefined;
  private prevIdentityHeader: string | undefined;
  private prevTlsRejectUnauthorized: string | undefined;

  async start(): Promise<LowkeyVaultTestContainer> {
    console.log('\n[LowkeyVault] Starting container...');

    this.prevIdentityEndpoint = process.env.IDENTITY_ENDPOINT;
    this.prevIdentityHeader = process.env.IDENTITY_HEADER;
    this.prevTlsRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    try {
      const suffix = crypto.randomUUID().slice(0, 8);
      this.container = await new GenericContainer(LOWKEY_VAULT_IMAGE)
        .withName(`lowkey-vault-${suffix}`)
        .withExposedPorts(HTTPS_PORT, HTTP_PORT)
        .withEnvironment({
          LOWKEY_ARGS: `--server.port=${HTTPS_PORT} --LOWKEY_VAULT_RELAXED_PORTS=true`,
        })
        .start();

      const host = this.container.getHost();
      const httpsPort = this.container.getMappedPort(HTTPS_PORT);
      const httpPort = this.container.getMappedPort(HTTP_PORT);

      this.vaultUrl = `https://${host}:${httpsPort}`;
      const tokenUrl = `http://${host}:${httpPort}/metadata/identity/oauth2/token`;

      await this.waitUntilReady();

      process.env.IDENTITY_ENDPOINT = tokenUrl;
      process.env.IDENTITY_HEADER = 'dummy';
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    } catch (error) {
      await this.stop();
      throw error;
    }

    console.log(`[LowkeyVault] Ready at: ${this.vaultUrl}`);
    return this;
  }

  async stop(): Promise<void> {
    try {
      if (this.container) {
        console.log('[LowkeyVault] Stopping container...');
        await this.container.stop();
        this.container = null;
      }
    } finally {
      restoreEnv('IDENTITY_ENDPOINT', this.prevIdentityEndpoint);
      restoreEnv('IDENTITY_HEADER', this.prevIdentityHeader);
      restoreEnv(
        'NODE_TLS_REJECT_UNAUTHORIZED',
        this.prevTlsRejectUnauthorized,
      );
    }
  }

  getVaultUrl(): string {
    return this.vaultUrl;
  }

  createSecretClient(): SecretClient {
    return new SecretClient(this.vaultUrl, new DefaultAzureCredential(), {
      disableChallengeResourceVerification: true,
    });
  }

  createProvider(): AzureKeyVaultSecretProvider {
    return new AzureKeyVaultSecretProvider(this.createSecretClient());
  }

  private async waitUntilReady(): Promise<void> {
    const url = `${this.vaultUrl}/ping`;
    const agent = new https.Agent({ rejectUnauthorized: false });

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const ok = await new Promise<boolean>((resolve) => {
          const req = https.get(url, { agent }, (res) => {
            resolve(res.statusCode === 200);
          });
          req.on('error', () => resolve(false));
          req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
          });
        });
        if (ok) {
          return;
        }
      } catch {
        // retry
      }

      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    throw new Error(
      `LowkeyVault did not become ready after ${MAX_RETRIES} attempts`,
    );
  }
}

function restoreEnv(name: string, previous: string | undefined): void {
  if (previous === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = previous;
  }
}
