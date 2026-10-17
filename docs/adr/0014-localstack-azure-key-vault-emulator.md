# ADR-0014: LocalStack for Azure as the Azure Key Vault Emulator

## Status

Accepted. Amends section 3 of
[ADR-0001](./0001-sdk-acceptance-test-infrastructure.md).

## Context

Every test suite that touches Azure Key Vault (TypeScript core, E2E, and the
.NET, Python and Node.js SDKs) ran against
[Lowkey Vault](https://github.com/nagyesta/lowkey-vault). It works, but it is
not a real Azure endpoint:

- It serves a self-signed certificate, so every suite disabled TLS
  verification (`NODE_TLS_REJECT_UNAUTHORIZED=0`, custom transports).
- Its vault URL is `https://localhost:<port>`, so tests disabled the Key Vault
  challenge resource verification and widened the vault host allowlist to
  `localhost`.
- Some SDKs pinned an older Key Vault API version to stay compatible.

[LocalStack for Azure](https://docs.localstack.cloud/azure/services/key-vault/)
emulates the Azure Resource Manager, Microsoft Entra ID and Key Vault APIs
with real-looking endpoints (`https://<vault>.vault.azure.localhost.localstack.cloud`)
and a publicly trusted certificate. The project already licenses LocalStack
for the AWS SSM tests, so the same `LOCALSTACK_AUTH_TOKEN` activates it.

## Decision

Replace Lowkey Vault with LocalStack for Azure
(`localstack/localstack-azure:latest`) in every test suite and in the
development `docker-compose.yml`.

Each container wrapper:

1. Resolves `LOCALSTACK_AUTH_TOKEN` the same way as the AWS wrapper.
2. Binds a free host port `P` to the same container port and sets
   `GATEWAY_LISTEN=0.0.0.0:P` and `LOCALSTACK_HOST=localhost.localstack.cloud:P`.
   Vault URIs embed the gateway port, so a randomly mapped port does not
   reach the vault.
3. Authenticates with the placeholder service principal the emulator accepts
   (all-zero tenant and subscription, `any-app`/`dummy`) through a
   `ClientSecretCredential` with instance discovery disabled.
4. Creates a resource group and a vault through ARM and uses the returned
   `vaultUri`.
5. Serves a local token endpoint that speaks the App Service managed identity
   protocol and points `IDENTITY_ENDPOINT`/`IDENTITY_HEADER` at it, so the
   production `DefaultAzureCredential` authenticates without code changes.
   Competing `AZURE_*` credential variables are cleared while the emulator
   runs, so a developer's own Azure login cannot take precedence.
6. Builds the test `SecretClient` with `DefaultAzureCredential` as well. The
   emulator serves reads without a token, so the writes tests make to seed
   secrets are what prove the token endpoint works.

`DefaultAzureCredential` cannot reach the emulator through
`AZURE_TENANT_ID`/`AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET`/`AZURE_AUTHORITY_HOST`:
MSAL validates any non-Microsoft authority against
`login.microsoftonline.com`, which answers `400 invalid_instance`, and the
Azure SDKs expose no environment variable to disable that check. Reads still
succeed because the emulator serves `GET` requests without a token, which
hides the problem until a test writes a secret.

## Consequences

### Positive

- One emulator vendor and one token for AWS and Azure.
- TLS verification and Key Vault challenge resource verification stay
  enabled, so tests exercise the production client configuration.
- Vault host names follow the Azure pattern (`*.vault.azure.…`).
- Startup is a few seconds.

### Negative

- Azure tests now need `LOCALSTACK_AUTH_TOKEN`; contributors without a
  LocalStack license can no longer run them.
- The host port is fixed per run instead of randomly mapped. A free port is
  picked right before starting the container, which leaves a small race window.
- Each wrapper carries a small managed identity token endpoint.
- The development `docker-compose.yml` service has no such endpoint. Local
  CLI runs against it authenticate through the Azure CLI after
  `lstk az start-interception` (see `dev.env`); unlike Lowkey Vault, the
  token endpoint does not ship with the container.
- The image is used through the `latest` tag: LocalStack publishes no
  versioned tags for it yet.
- The emulator does not enforce data-plane authentication by default, so a
  missing or wrong token is only caught on write operations.

## When to Reconsider

- If LocalStack stops licensing the Azure emulator under the existing token.
- If the Azure SDKs gain a way to disable instance discovery through the
  environment, which would remove the token endpoint.
- If LocalStack publishes versioned image tags: pin one.
