import { randomUUID } from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import {
  ClientSecretCredential,
  DefaultAzureCredential,
} from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import { AzureKeyVaultSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';
import { loadLocalStackEnvironment } from './localstack-container.js';

const LOCALSTACK_AZURE_IMAGE = 'localstack/localstack-azure:latest';
const STARTUP_TIMEOUT_MS = 180_000;

// The emulator accepts any service principal in its single all-zero tenant
// and subscription. These are placeholders, not secrets.
const TENANT_ID = '00000000-0000-0000-0000-000000000000';
const SUBSCRIPTION_ID = '00000000-0000-0000-0000-000000000000';
const CLIENT_ID = 'any-app';
const CLIENT_SECRET = 'dummy';
const RESOURCE_GROUP = 'envilder-tests';
const LOCATION = 'westeurope';

// Variables that would make DefaultAzureCredential pick a credential ahead of
// ManagedIdentityCredential (and possibly reach real Azure). They are cleared
// while the emulator runs and restored on stop().
const COMPETING_AZURE_ENV_VARS = [
  'AZURE_TENANT_ID',
  'AZURE_CLIENT_ID',
  'AZURE_CLIENT_SECRET',
  'AZURE_CLIENT_CERTIFICATE_PATH',
  'AZURE_USERNAME',
  'AZURE_PASSWORD',
  'AZURE_FEDERATED_TOKEN_FILE',
  'AZURE_AUTHORITY_HOST',
  'AZURE_TOKEN_CREDENTIALS',
] as const;
const IDENTITY_ENV_VARS = ['IDENTITY_ENDPOINT', 'IDENTITY_HEADER'] as const;

/**
 * Azure Key Vault test double backed by LocalStack for Azure.
 *
 * Starts the emulator and creates a vault through its Resource Manager API.
 * `DefaultAzureCredential` (used by the SDK factory) reaches the emulator
 * through a local managed identity token endpoint, configured with the
 * `IDENTITY_ENDPOINT`/`IDENTITY_HEADER` variables that {@link stop} restores.
 * Its environment credential cannot be used: MSAL validates the emulator's
 * authority against login.microsoftonline.com, which rejects it.
 */
export class LocalStackAzureTestContainer {
  private container: StartedTestContainer | null = null;
  private tokenServer: http.Server | null = null;
  private credential: ClientSecretCredential | null = null;
  private vaultUrl = '';
  private readonly previousEnv = new Map<string, string | undefined>();

  async start(): Promise<LocalStackAzureTestContainer> {
    console.log('\n[LocalStackAzure] Starting container...');

    const environment = await loadLocalStackEnvironment();
    if (!environment.get('LOCALSTACK_AUTH_TOKEN')) {
      throw new Error(
        'LOCALSTACK_AUTH_TOKEN could not be resolved from envilder.json',
      );
    }

    for (const name of [...COMPETING_AZURE_ENV_VARS, ...IDENTITY_ENV_VARS]) {
      this.previousEnv.set(name, process.env[name]);
    }

    try {
      // Vault URIs embed the gateway port, so the host port must match the
      // port the emulator listens on inside the container.
      const port = await findFreePort();
      const suffix = randomUUID().slice(0, 8);
      this.container = await new GenericContainer(LOCALSTACK_AZURE_IMAGE)
        .withName(`localstack-azure-${suffix}`)
        .withExposedPorts({ container: port, host: port })
        .withEnvironment({
          ...Object.fromEntries(environment),
          GATEWAY_LISTEN: `0.0.0.0:${port}`,
          LOCALSTACK_HOST: `localhost.localstack.cloud:${port}`,
        })
        .withWaitStrategy(Wait.forLogMessage(/Ready\./))
        .withStartupTimeout(STARTUP_TIMEOUT_MS)
        .start();

      const authorityHost = `https://azure.localhost.localstack.cloud:${port}`;
      this.credential = new ClientSecretCredential(
        TENANT_ID,
        CLIENT_ID,
        CLIENT_SECRET,
        { authorityHost, disableInstanceDiscovery: true },
      );
      this.vaultUrl = await createVault(
        this.credential,
        authorityHost,
        `kv-${suffix}`,
      );

      const identityHeader = randomUUID();
      this.tokenServer = await startTokenServer(
        this.credential,
        identityHeader,
      );
      const { port: tokenPort } = this.tokenServer.address() as net.AddressInfo;
      for (const name of COMPETING_AZURE_ENV_VARS) {
        delete process.env[name];
      }
      process.env.IDENTITY_ENDPOINT = `http://127.0.0.1:${tokenPort}/msi/token`;
      process.env.IDENTITY_HEADER = identityHeader;
    } catch (error) {
      await this.stop();
      throw error;
    }

    console.log(`[LocalStackAzure] Vault ready at: ${this.vaultUrl}`);
    return this;
  }

  async stop(): Promise<void> {
    try {
      if (this.tokenServer) {
        const server = this.tokenServer;
        this.tokenServer = null;
        await new Promise((resolve) => server.close(resolve));
      }
      if (this.container) {
        console.log('[LocalStackAzure] Stopping container...');
        await this.container.stop();
        this.container = null;
      }
    } finally {
      for (const [name, previous] of this.previousEnv) {
        if (previous === undefined) {
          delete process.env[name];
        } else {
          process.env[name] = previous;
        }
      }
      this.previousEnv.clear();
    }
  }

  getVaultUrl(): string {
    return this.vaultUrl;
  }

  /**
   * Creates a client that authenticates like production code does, through
   * `DefaultAzureCredential` and the local managed identity token endpoint.
   * The emulator serves reads without a token, so writes made with this
   * client are what exercise that endpoint.
   */
  createSecretClient(): SecretClient {
    if (!this.tokenServer) {
      throw new Error('Container has not been started');
    }
    return new SecretClient(this.vaultUrl, new DefaultAzureCredential());
  }

  createProvider(): AzureKeyVaultSecretProvider {
    return new AzureKeyVaultSecretProvider(this.createSecretClient());
  }
}

/**
 * Serves the App Service managed identity protocol, handing out tokens that
 * the emulator issues to its placeholder service principal.
 */
function startTokenServer(
  credential: ClientSecretCredential,
  identityHeader: string,
): Promise<http.Server> {
  const server = http.createServer(async (request, response) => {
    if (request.headers['x-identity-header'] !== identityHeader) {
      response.writeHead(401).end();
      return;
    }
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const resource = url.searchParams.get('resource') ?? '';
    const scope = resource.endsWith('/.default')
      ? resource
      : `${resource.replace(/\/$/, '')}/.default`;
    try {
      const { token, expiresOnTimestamp } = await credential.getToken(scope);
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({
          access_token: token,
          expires_on: String(Math.floor(expiresOnTimestamp / 1000)),
          resource,
          token_type: 'Bearer',
        }),
      );
    } catch (error) {
      response.writeHead(500).end(String(error));
    }
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function createVault(
  credential: ClientSecretCredential,
  managementUrl: string,
  vaultName: string,
): Promise<string> {
  const { token } = await credential.getToken(
    'https://management.azure.com/.default',
  );
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const groupUrl = `${managementUrl}/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}`;

  await armPut(`${groupUrl}?api-version=2021-04-01`, headers, {
    location: LOCATION,
  });
  const vault = (await armPut(
    `${groupUrl}/providers/Microsoft.KeyVault/vaults/${vaultName}?api-version=2023-07-01`,
    headers,
    {
      location: LOCATION,
      properties: {
        tenantId: TENANT_ID,
        sku: { family: 'A', name: 'standard' },
        accessPolicies: [],
      },
    },
  )) as { properties: { vaultUri: string } };

  return vault.properties.vaultUri.replace(/\/$/, '');
}

async function armPut(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `ARM request failed (${response.status}): ${await response.text()}`,
    );
  }
  return response.json();
}

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
  });
}
