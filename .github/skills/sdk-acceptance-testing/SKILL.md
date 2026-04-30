---
name: sdk-acceptance-testing
description: >-
  Acceptance testing patterns for Envilder SDKs using TestContainers
  (LocalStack for AWS SSM, Lowkey Vault for Azure Key Vault). Use when
  adding acceptance tests to any SDK, creating container wrappers, or
  updating CI workflows for SDK test infrastructure.
---

# SDK Acceptance Testing

Patterns for acceptance testing Envilder SDKs against real cloud provider
emulators. Applies to all SDKs (.NET, Python, Node.js, Go, Java).

See [ADR-0001](../../../docs/architecture/adr/0001-sdk-acceptance-test-infrastructure.md)
for the architectural decision behind these patterns.

## When to Use

- Adding acceptance tests to a new or existing SDK
- Creating container wrappers for LocalStack or Lowkey Vault
- Updating CI workflows to support SDK acceptance tests
- Adding a new SDK and need to replicate test infrastructure

## Directory Structure

Every SDK test directory follows this layout:

```txt
tests/sdks/{lang}/
├── containers/                   ← Container wrapper modules
│   ├── localstack-container.*
│   └── lowkey-vault-container.*
├── acceptance/                   ← Acceptance test files
│   ├── aws-ssm.acceptance.*
│   └── azure-key-vault.acceptance.*
└── {unit-tests}/                 ← Language-specific unit test dirs
```

## secrets-map.json Pattern

All SDKs reference the **root** `secrets-map.json` at the repository root
directly. Container wrappers navigate to it via a relative path — there are no
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
const SECRETS_MAP = path.resolve(__dirname, '../../../../secrets-map.json');
```

**Fallback pattern:** If the configured provider cannot be created (e.g., Azure
credentials missing in a CI environment that only has AWS OIDC), fall back to
AWS provider to resolve the token.

## LocalStack Container Wrapper

### Requirements

- Image: `localstack/localstack:stable`
- Resolve `LOCALSTACK_AUTH_TOKEN` from `secrets-map.json` before starting
- Throw if token is empty (fail fast)
- Expose: endpoint URL, SSM client, provider instance

### Lifecycle

```txt
1. Parse secrets-map.json with SDK's own MapFileParser
2. Resolve LOCALSTACK_AUTH_TOKEN using SDK's own EnvilderClient
3. Start container with token as environment variable
4. Expose connection URL for SSM client creation
```

## Lowkey Vault Container Wrapper

### Requirements

- Image: `nagyesta/lowkey-vault:7.1.61` (pinned)
- Ports: 8443 (HTTPS vault), 8080 (HTTP token endpoint)
- Args: `--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true`
- Set `IDENTITY_ENDPOINT` and `IDENTITY_HEADER` env vars for
  `DefaultAzureCredential`
- Self-signed TLS: disable certificate verification in test clients
- Restore original env vars on teardown

### Lifecycle

```txt
1. Start container with Lowkey Vault args
2. Wait for HTTPS port to be ready (health check /ping)
3. Set IDENTITY_ENDPOINT = http://{host}:{http_port}/metadata/identity/oauth2/token
4. Set IDENTITY_HEADER = "dummy"
5. Create SecretClient with TLS verification disabled
6. On teardown: restore original IDENTITY_ENDPOINT/IDENTITY_HEADER
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

1. `Should_ResolveSecretFromKeyVault_When_SecretExistsInLowkeyVault`
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
- AWS OIDC credentials for resolving the token from SSM
- Docker socket env vars for TestContainers compatibility on GitHub runners
- Acceptance tests run in the same job as unit tests (no separate workflow)

## Existing Implementations

| SDK        | Container Wrappers                     | Acceptance Tests                                                         |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------ |
| .NET       | `tests/sdks/dotnet/Fixtures/`          | `tests/sdks/dotnet/Infrastructure/`, `tests/sdks/dotnet/EndToEnd/`       |
| Python     | `tests/sdks/python/containers/`        | `tests/sdks/python/infrastructure/`, `tests/sdks/python/end_to_end/`     |
| Node.js    | `tests/sdks/nodejs/containers/`    | `tests/sdks/nodejs/acceptance/`                                      |
