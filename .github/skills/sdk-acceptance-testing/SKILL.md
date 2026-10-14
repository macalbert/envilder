---
name: sdk-acceptance-testing
description: >-
  Acceptance testing patterns for Envilder SDKs using TestContainers
  (LocalStack for AWS SSM, LocalStack for Azure for Azure Key Vault). Use when
  adding acceptance tests to any SDK, creating container wrappers, or
  updating CI workflows for SDK test infrastructure.
---

# SDK Acceptance Testing

Patterns for acceptance testing Envilder SDKs against real cloud provider
emulators. Applies to all SDKs (.NET, Python, Node.js, Go, Java).

See [ADR-0001](../../../docs/adr/0001-sdk-acceptance-test-infrastructure.md)
and [ADR-0014](../../../docs/adr/0014-localstack-azure-key-vault-emulator.md)
for the architectural decisions behind these patterns.

## When to Use

- Adding acceptance tests to a new or existing SDK
- Creating container wrappers for LocalStack (AWS or Azure)
- Updating CI workflows to support SDK acceptance tests
- Adding a new SDK and need to replicate test infrastructure

## Directory Structure

Every SDK test directory follows this layout:

```txt
tests/sdks/{lang}/
├── containers/                   ← Container wrapper modules
│   ├── localstack-container.*
│   └── localstack-azure-container.*
├── acceptance/                   ← Acceptance test files
│   ├── aws-ssm.acceptance.*
│   └── azure-key-vault.acceptance.*
└── {unit-tests}/                 ← Language-specific unit test dirs
```

## envilder.json Pattern

All SDKs reference the **root** `envilder.json` at the repository root
directly. Container wrappers navigate to it via a relative path: there are no
copies per SDK test directory.

```json
{
  "$config": {
    "provider": "aws",
    "profile": "mac"
  },
  "LOCALSTACK_AUTH_TOKEN": "/envilder/development/localstack/authToken"
}
```

**Resolution behavior:**

| Environment | How it works |
|-------------|-------------|
| Local dev   | `$config.profile` resolves AWS credentials from `~/.aws/credentials` |
| CI (GitHub Actions) | Profile is ignored; OIDC provides credentials via `aws-actions/configure-aws-credentials` |

**Path resolution example (TypeScript):**

```typescript
// From tests/sdks/nodejs/containers/localstack-container.ts
const SECRETS_MAP = path.resolve(__dirname, '../../../../envilder.json');
```

**Fallback pattern:** If the configured provider cannot be created (e.g., Azure
credentials missing in a CI environment that only has AWS OIDC), fall back to
AWS provider to resolve the token.

## LocalStack Container Wrapper

### Requirements

- Image: `localstack/localstack:stable`
- Resolve `LOCALSTACK_AUTH_TOKEN` from `envilder.json` before starting
- Throw if token is empty (fail fast)
- Expose: endpoint URL, SSM client, provider instance

### Lifecycle

```txt
1. Parse envilder.json with SDK's own MapFileParser
2. Resolve LOCALSTACK_AUTH_TOKEN using SDK's own EnvilderClient
3. Start container with token as environment variable
4. Expose connection URL for SSM client creation
```

## LocalStack for Azure Container Wrapper

### Requirements

- Image: `localstack/localstack-azure:latest`
- Resolve `LOCALSTACK_AUTH_TOKEN` exactly like the AWS wrapper (same token)
- Host port must equal the container port: vault URIs embed the gateway
  port. Pick a free port `P`, bind `P:P`, and set
  `GATEWAY_LISTEN=0.0.0.0:P` and `LOCALSTACK_HOST=localhost.localstack.cloud:P`
- Wait for the `Ready.` log line
- Placeholder credentials the emulator accepts (not secrets): tenant and
  subscription `00000000-0000-0000-0000-000000000000`, client `any-app`,
  secret `dummy`, authority `https://azure.localhost.localstack.cloud:P`
- TLS stays enabled: `*.localhost.localstack.cloud` resolves to `127.0.0.1`
  and the emulator serves a trusted certificate
- Never point `DefaultAzureCredential` at the emulator through
  `AZURE_TENANT_ID`/`AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET`: MSAL validates
  the authority against `login.microsoftonline.com`, which rejects it.
  Use a local managed identity token endpoint instead (see lifecycle)
- Restore original env vars on teardown

### Lifecycle

```txt
1. Start container on host port P = container port P
2. Create ClientSecretCredential(placeholders, authority, instance discovery disabled)
3. Create the vault through ARM (token scope https://management.azure.com/.default):
   PUT .../resourceGroups/envilder-tests?api-version=2021-04-01
   PUT .../providers/Microsoft.KeyVault/vaults/kv-{random}?api-version=2023-07-01
4. Vault URL = response properties.vaultUri (trailing slash trimmed)
5. Start a local HTTP token endpoint speaking the App Service managed
   identity protocol; it returns tokens from the ClientSecretCredential
6. Clear competing AZURE_* credential variables, then set
   IDENTITY_ENDPOINT = http://127.0.0.1:{token_port}/msi/token
   and IDENTITY_HEADER = {random value checked by the endpoint}
7. Test clients use DefaultAzureCredential, like production code. The
   emulator serves reads without a token, so test writes (seeding secrets)
   are what exercise the token endpoint
8. On teardown: stop the token endpoint and the container, restore env vars
```

## Acceptance Test Patterns

### Test Naming

Same convention as unit tests: `Should_{Expected}_When_{Condition}`

### Standard Tests per Provider

Every SDK should have at minimum these acceptance tests:

**AWS SSM:**

1. `Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack`
2. `Should_ReturnEmptyForMissingSsmParameter_When_ParameterDoesNotExist`

**Azure Key Vault:**

1. `Should_ResolveSecretFromKeyVault_When_SecretExistsInLocalStack`
2. `Should_ReturnEmptyForMissingKeyVaultSecret_When_SecretDoesNotExist`

### Test Structure (AAA)

```typescript
it('Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack', async () => {
  // Arrange
  await ssmClient.send(new PutParameterCommand({
    Name: '/Test/MySecret',
    Value: 'real-secret-from-localstack',
    Type: 'SecureString',
    Overwrite: true,
  }));
  const sut = new EnvilderClient(provider);
  const mapFile: ParsedMapFile = {
    config: {},
    mappings: new Map([['MY_SECRET', '/Test/MySecret']]),
  };

  // Act
  const actual = await sut.resolveSecrets(mapFile);

  // Assert
  expect(actual.get('MY_SECRET')).toBe('real-secret-from-localstack');
});
```

## CI Workflow Pattern

### Required Steps

```yaml
env:
  LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}

steps:
  - uses: aws-actions/configure-aws-credentials@v6
    with:
      role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
      aws-region: ${{ secrets.AWS_REGION }}

  # ... build steps ...

  - name: Run tests
    run: {test-command}
    env:
      TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: /var/run/docker.sock
      DOCKER_HOST: unix:///var/run/docker.sock
```

### Key Points

- `LOCALSTACK_AUTH_TOKEN` at job level so container wrapper can read it
  (both the AWS and the Azure emulator need it)
- AWS OIDC credentials for resolving the token from SSM
- Docker socket env vars for TestContainers compatibility on GitHub runners
- Acceptance tests run in the same job as unit tests (no separate workflow)

## Existing Implementations

| SDK        | Container Wrappers                     | Acceptance Tests                                                         |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------ |
| .NET       | `tests/sdks/dotnet/Fixtures/`          | `tests/sdks/dotnet/Infrastructure/`, `tests/sdks/dotnet/EndToEnd/`       |
| Python     | `tests/sdks/python/containers/`        | `tests/sdks/python/infrastructure/`, `tests/sdks/python/end_to_end/`     |
| Node.js    | `tests/sdks/nodejs/containers/`    | `tests/sdks/nodejs/acceptance/`                                      |
