# ADR-0001: SDK Acceptance Test Infrastructure

## Status

Accepted

## Context

Envilder is a multi-runtime secret management platform with SDKs for .NET,
Python, TypeScript (and planned Go, Java). Each SDK implements its own providers
for AWS SSM Parameter Store and Azure Key Vault.

Acceptance tests must exercise real cloud provider interactions against
emulators:

- **AWS SSM** via [LocalStack](https://localstack.cloud/) — requires
  `LOCALSTACK_AUTH_TOKEN` (pro feature: SSM SecureString)
- **Azure Key Vault** via
  [Lowkey Vault](https://github.com/nagyesta/lowkey-vault) — emulates Key Vault
  with `DefaultAzureCredential` support

Each SDK has its own test runner and language, but the infrastructure patterns
must be consistent to reduce cognitive overhead and ensure parity.

## Decision

### 1. Container Wrappers per SDK

Each SDK implements its own container wrapper classes with explicit
`start()`/`stop()` lifecycle (not framework-managed). Two wrappers per SDK:

- **`LocalStackContainer`** — Starts LocalStack, resolves
  `LOCALSTACK_AUTH_TOKEN` from `secrets-map.json`, exposes SSM client and
  provider.
- **`LowkeyVaultContainer`** — Starts Lowkey Vault (`nagyesta/lowkey-vault`),
  configures `IDENTITY_ENDPOINT`/`IDENTITY_HEADER` env vars for
  `DefaultAzureCredential`, exposes SecretClient and provider.

### 2. Root `secrets-map.json` as Single Source of Truth

All SDK test containers resolve `LOCALSTACK_AUTH_TOKEN` from the root
`secrets-map.json` at the repository root. There are no copies — each container
wrapper navigates to the root file via a relative path. This file:

- Has `$config.profile` for local development (e.g., `"mac"`)
- Maps `LOCALSTACK_AUTH_TOKEN` to an SSM parameter path
  (`/envilder/development/localstack/authToken`)
- **In CI**: Profile is ignored. AWS credentials come from OIDC
  (`aws-actions/configure-aws-credentials`). The map file resolves the token
  using the SDK's own `MapFileParser` + `EnvilderClient`.
- **In local dev**: Profile resolves credentials from `~/.aws/credentials`.
- **Fallback pattern**: If the configured provider (from `$config`) can't be
  created (e.g., Azure credentials missing), fall back to AWS provider to
  resolve the token.

> **Note for contributors:** The `LOCALSTACK_AUTH_TOKEN` is a
> [LocalStack](https://localstack.cloud/) license token required for
> SSM SecureString support. The token stored in this project's SSM Parameter
> Store belongs to the project maintainer. If you want to run the AWS acceptance
> tests locally, you need your own LocalStack token — store it in AWS SSM (or
> Azure Key Vault) under a path of your choice, update your personal
> `secrets-map.json` profile and parameter path accordingly, and ensure your AWS
> credentials can resolve it. Without a valid token, LocalStack will start but
> SSM SecureString operations will fail.

### 3. Lowkey Vault Configuration

| Setting     | Value                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Image       | `nagyesta/lowkey-vault:7.1.61` (pinned)                                       |
| Ports       | 8443 (HTTPS), 8080 (HTTP token endpoint)                                      |
| Args        | `--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true`                        |
| Auth        | `IDENTITY_ENDPOINT` set to Lowkey Vault token endpoint                        |
| TLS         | Self-signed; tests must disable certificate verification                       |
| API version | Pinned per SDK (7.2 for .NET, 7.6 for Python)                                 |
| Cleanup     | Restore original `IDENTITY_ENDPOINT`/`IDENTITY_HEADER` values on teardown     |

### 4. CI Workflow Pattern

- AWS OIDC credentials via `aws-actions/configure-aws-credentials`
  (role-to-assume)
- `LOCALSTACK_AUTH_TOKEN` injected as `env` at job level (from
  `secrets.LOCALSTACK_AUTH_TOKEN`)
- Docker socket override for TestContainers:
  `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock`
- Acceptance tests run alongside unit tests in the same job

### 5. Test Directory Structure

```txt
tests/sdks/{lang}/
├── containers/                   ← Container wrappers
│   ├── localstack-container
│   └── lowkey-vault-container
├── acceptance/                   ← Acceptance tests
│   ├── aws-ssm.acceptance.*
│   └── azure-key-vault.acceptance.*
└── {unit tests}/
```

## Consequences

### Positive

- Consistent test infrastructure across all SDKs. Container lifecycle, token
  resolution, and directory layout follow the same pattern regardless of
  language.
- Self-documenting via shared `secrets-map.json`. The same file works for local
  dev (AWS profile) and CI (OIDC) with no changes.
- Each SDK validates its own provider implementations against real emulators,
  catching integration bugs that mocks would miss.

### Negative

- Container startup adds ~10-30s per test run. Mitigated: session-scoped
  fixtures reuse containers across tests.

## Implementations

- **.NET**: `tests/sdks/dotnet/Fixtures/LocalStackFixture.cs`,
  `tests/sdks/dotnet/Fixtures/LowkeyVaultFixture.cs`
- **Python**: `tests/sdks/python/containers/localstack_container.py`,
  `tests/sdks/python/containers/lowkey_vault_container.py`
- **Node.js**: `tests/sdks/nodejs/containers/localstack-container.ts`,
  `tests/sdks/nodejs/containers/lowkey-vault-container.ts`
- **Go**: Planned
- **Java**: Planned
