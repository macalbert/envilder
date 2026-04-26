# Envilder Copilot Instructions

## Project Overview

Envilder is a **multi-runtime secret management platform** that securely
centralizes environment variables from AWS SSM Parameter Store or Azure Key
Vault. The product has two halves:

1. **TypeScript core** — CLI + GitHub Action for pulling/pushing secrets (Hexagonal Architecture, InversifyJS DI)
2. **Runtime SDKs** — Independent libraries (.NET, Python, more planned) that load secrets directly into app processes at startup — no `.env` files, no intermediaries

All components share the **map-file format** as the universal contract (JSON,
Git-versioned, PR-reviewable). Built with **Clean Architecture** principles for
testability and modularity.

## Architecture Layers

### Domain Layer (`src/envilder/core/domain`)

**Pure business logic - NO external dependencies allowed.**

- **Entities**: `EnvironmentVariable` (immutable, with validation and `maskedValue` for safe logging)
- **Ports** (interfaces): `ISecretProvider`, `IVariableStore`, `ILogger`
- **Errors**: Custom domain errors (`InvalidArgumentError`, `ParameterNotFoundError`, etc.) extend `DomainError`
- **Value Objects**: `OperationMode` enum

### Application Layer (`src/envilder/core/application`)

**Use case orchestration using Command/Handler pattern.**

- Each feature = `*Command` + `*CommandHandler` pair (e.g., `PullSecretsToEnvCommand`, `PullSecretsToEnvCommandHandler`)
- `DispatchActionCommandHandler` routes between pull/push modes via switch statement
- Handlers are `@injectable()` and inject dependencies via `@inject(TYPES.X)`
- Commands have static `.create()` factory methods

### Infrastructure Layer (`src/envilder/core/infrastructure`)

**Adapters implementing domain ports.**

- `AwsSsmSecretProvider`: Implements `ISecretProvider` using `@aws-sdk/client-ssm`
- `AzureKeyVaultSecretProvider`: Implements `ISecretProvider` using `@azure/keyvault-secrets`
- `FileVariableStore`: Implements `IVariableStore` for .env and mapping JSON files (supports `$config` section)
- `ConsoleLogger`: Implements `ILogger` with colored output via `picocolors`

### Apps Layer (`src/envilder/apps`)

**Entry points (CLI and GitHub Action).**

- `cli/Cli.ts`: Uses `commander` for CLI parsing
- `gha/Gha.ts`: Reads inputs from `process.env.INPUT_*` (GitHub Actions convention)
- `shared/ContainerConfiguration.ts`: Shared DI setup (provider selection, handler binding) used by both CLI and GHA
- Each has `Startup.ts` that delegates to shared `ContainerConfiguration`

## Dependency Injection (InversifyJS)

**Symbol Registry**: `src/envilder/core/types.ts` exports `DOMAIN`, `APPLICATION`, and legacy `TYPES` objects.

**Container Setup Pattern** (see `src/envilder/apps/shared/ContainerConfiguration.ts`):

```typescript
// Provider selection via factory registry — NOT inline construction
const providerFactories: Record<string, ProviderFactory> = {
  aws: (config) => createAwsSecretProvider(config),
  azure: (config, options) => createAzureSecretProvider(config, options),
};

// In configureInfrastructureServices():
const selectedProvider = config.provider?.toLowerCase() || 'aws';
const factory = providerFactories[selectedProvider];
if (!factory) {
  throw new InvalidArgumentError(`Unsupported provider: ${config.provider}`);
}
container.bind<ISecretProvider>(TYPES.ISecretProvider)
  .toConstantValue(factory(config, options));
```

**Provider Configuration**: CLI reads `$config` from the map file and merges
with CLI flags (`--provider`, `--vault-url`, `--profile`) into a `MapFileConfig`
object passed to `configureInfrastructureServices()`. CLI flags override
`$config` values.

## Key Workflows & Commands

**Package Manager**: `pnpm` (monorepo via `pnpm-workspace.yaml`)

**Development**:

- `pnpm build` — TypeScript compilation
- `pnpm build:gha` — Bundle GitHub Action with `@vercel/ncc` into `github-action/dist/index.js`
- `pnpm verify:gha` — Verify GHA bundle is up-to-date (fails if dist is stale)
- `pnpm local:install` — Build + pack + install globally for local testing
- `pnpm local:test-run` — Run CLI against `tests/sample/param-map.json`

**Quality**:

- `pnpm test` — Vitest with coverage (v8 provider, outputs to `coverage/`)
- `pnpm test:ci` — Adds JUnit reporter for CI pipelines
- `pnpm lint` — Runs Secretlint (credential detection), Biome (format/lint), and `tsc --noEmit`
- `pnpm format:write` — Auto-format with Biome

**E2E Tests**: Located in `e2e/`, use real AWS SSM via LocalStack and Azure Key Vault
via Lowkey Vault (both via TestContainers). Run `pnpm build` + `pack-and-install.ts` before E2E.

## Coding Conventions

### Command/Handler Pattern

1. **Command class**: Data container with validation via static `.create()` method
2. **Handler class**: Decorated with `@injectable()`, injects ports via constructor
3. **Registration**: Add symbol to `TYPES`, bind in `configureApplicationServices()` (`src/envilder/apps/shared/ContainerConfiguration.ts`)
4. **Routing**: Add case to `DispatchActionCommandHandler.handleCommand()` switch

Example (PushSingle):

- Command: `PushSingleCommand.create(key, value, ssmPath)`
- Handler: `PushSingleCommandHandler` injects `ISecretProvider` and `ILogger`
- Dispatched via `OperationMode.PUSH_SINGLE` case

### Error Handling

- **Throw custom errors**: Use `InvalidArgumentError`, `ParameterNotFoundError`, etc. from `src/envilder/core/domain/errors`
- **Never catch generically**: Let errors bubble to entry points (CLI/GHA handle exit codes)

### Logging

- **Always inject** `ILogger` (symbol: `TYPES.ILogger`)
- **Mask secrets**: Use `EnvironmentVariable.maskedValue` for sensitive data (shows last 3 chars)
- **Log levels**: `info()` for success, `warn()` for empty parameters, `error()` for failures

### GitHub Action Constraints

- **Pull-only**: GHA only supports pull mode (no push) — see `Gha.ts` line 20
- **Input convention**: GitHub passes inputs as `INPUT_<UPPERCASE_NAME>` env vars
- **Bundle requirement**: After any code change, run `pnpm build:gha` to update `dist/index.js`

### Test Conventions

- **Framework**: Vitest with built-in mocking (`vi.fn()`, `vi.mock()`)
- **E2E Testing**: TestContainers with `@testcontainers/localstack` for real AWS SSM integration
- **Naming**: Use `Should_<Expected>_When_<Condition>` pattern (e.g., `Should_ThrowError_When_SSMParameterIsNotFound`)
- **Structure**: Follow AAA (Arrange-Act-Assert) pattern with explicit comment markers —
**each marker appears at most once per test** (if you need two Acts or Asserts, write two tests):

  ```typescript
  it('Should_GenerateEnvFile_When_ValidParametersProvided', async () => {
    // Arrange
    const mockData = { KEY: '/ssm/path' };
    mockStore.getMapping.mockResolvedValue(mockData);
    
    // Act
    await handler.handle(command);
    
    // Assert
    expect(mockStore.saveEnvironment).toHaveBeenCalled();
  });
  ```

- **Mocking Ports**: Create test doubles by implementing port interfaces with `vi.fn()` methods

### Code Style (Biome)

- Single quotes, semicolons, 2-space indent, 80-char line width
- Trailing commas enforced
- `unsafeParameterDecoratorsEnabled: true` for InversifyJS decorators

## Data Flow Example (Pull Operation)

1. User runs `envilder --map=map.json --envfile=.env`
2. `Cli.ts` parses options, reads `$config` from map file, merges with CLI flags into `MapFileConfig`
3. `Startup` builds DI container via shared `ContainerConfiguration` (selects provider from config)
4. Dispatcher creates `PullSecretsToEnvCommand` → invokes `PullSecretsToEnvCommandHandler`
5. Handler loads mapping via `IVariableStore.getMapping()` → gets `{"DB_URL": "/app/db"}`
6. For each mapping, handler calls `ISecretProvider.getSecret("/app/db")`
7. Provider adapter fetches the secret (AWS: `GetParameterCommand` with `WithDecryption: true`;
   Azure: `SecretClient.getSecret()`)
8. Handler builds new env vars → calls `IVariableStore.saveEnvironment()`
9. Logs success with masked values

## Adding a New Feature (Step-by-Step)

### Example: Add "validate" command to check SSM parameter existence without pulling

1. **Domain**: Create `src/envilder/core/domain/OperationMode.ts` enum entry: `VALIDATE`
2. **Application**:
   - Create `src/envilder/core/application/validate/ValidateCommand.ts` with `.create()` factory
   - Create `ValidateCommandHandler.ts`, inject `ISecretProvider` + `ILogger`
   - Add `ValidateCommandHandler: Symbol.for('ValidateCommandHandler')` to `APPLICATION` in `types.ts`
3. **DI Setup**: In `configureApplicationServices()` (`src/envilder/apps/shared/ContainerConfiguration.ts`), bind handler with `.inTransientScope()`
4. **Routing**: Add `case OperationMode.VALIDATE:` to `DispatchActionCommandHandler`
5. **CLI**: In `Cli.ts`, add `.option('--validate')` and map to `OperationMode.VALIDATE`
6. **Tests**: Create `tests/envilder/core/application/validate/ValidateCommandHandler.test.ts`, mock ports with `vi.fn()`
7. **E2E**: Add test to `e2e/cli.test.ts` using LocalStack

## Extension Points

**New Secret Provider** (e.g., HashiCorp Vault):

1. Implement `ISecretProvider` interface in `src/envilder/core/infrastructure/vault/`
2. Add a new case in `configureInfrastructureServices()` (`src/envilder/apps/shared/ContainerConfiguration.ts`)
3. No changes needed to application or domain layers

**Multi-Backend Support**: Already implemented — `configureInfrastructureServices()` selects
provider based on `MapFileConfig.provider` (`aws` or `azure`). To add more providers, extend
the provider selection logic in `ContainerConfiguration.ts`.

## Runtime SDKs (`src/sdks/`)

Independent secret-loading libraries for different runtimes. SDKs share the map-file format
but have **no code dependency** on the TypeScript core.

### .NET SDK (`src/sdks/dotnet/`)

**Architecture**: Layered (Domain → Application → Infrastructure), no DI framework.

- **Domain** (`Domain/`): `ISecretProvider` port (async `GetSecretAsync` + sync `GetSecret`), `MapFileConfig`, `EnvilderOptions`, `ParsedMapFile`, `SecretProviderType` enum
- **Application** (`Application/`):
  - `Envilder` — Static one-liner facade (`Load`, `ResolveFile`, `FromMapFile` + env-routing overloads)
  - `EnvilderBuilder` — Fluent builder (`WithProvider`, `WithProfile`, `WithVaultUrl` → `Resolve`/`Inject`)
  - `EnvilderClient` — Core resolver (resolves mappings, `InjectIntoEnvironment` static method)
  - `MapFileParser` — Parses `$config` + variable mappings from JSON
  - `SecretValidationExtensions` — Opt-in `ValidateSecrets()` extension (throws `SecretValidationException` for empty/missing values)
- **Infrastructure** (`Infrastructure/`):
  - `SecretProviderFactory` (internal) — Creates provider from `MapFileConfig` + optional `EnvilderOptions` overrides. Validates cross-provider config (profile is AWS-only, vaultUrl is Azure-only)
  - `Aws/AwsSsmSecretProvider` — `GetSecretAsync`: `GetParameterAsync(WithDecryption=true)`, catches `ParameterNotFoundException` → `null`. `GetSecret` (sync): wraps in `Task.Run()` to prevent `SynchronizationContext` deadlocks, 60s `CancellationTokenSource` timeout
  - `Azure/AzureKeyVaultSecretProvider` — `GetSecretAsync`: `SecretClient.GetSecretAsync()`, catches `RequestFailedException(404)` → `null`. `GetSecret` (sync): uses native `SecretClient.GetSecret()` (no deadlock risk)
  - `Configuration/` — `ConfigurationBuilderExtensions.AddEnvilder(mapFilePath, options?)` integrates into `IConfigurationBuilder` pipeline; creates provider internally via factory
  - `DependencyInjection/ServiceCollectionExtensions` — `IServiceCollection.AddEnvilder(mapFilePath, options?)` for ASP.NET DI

**AWS credential resolution** (in `SecretProviderFactory`):

1. If `profile` is set → `CredentialProfileStoreChain` (respects `AWS_SHARED_CREDENTIALS_FILE` env var)
2. Region: profile region → `AWS_REGION` env → `AWS_DEFAULT_REGION` env → fallback `us-east-1`
3. No profile → default `AmazonSimpleSystemsManagementClient()` (uses SDK default chain)

**Key patterns**:

- `SecretProviderFactory` is internal — consumers use the facade, builder, or `AddEnvilder()` extensions
- Pull-only — SDKs do not support push mode
- `ISecretProvider.GetSecretAsync()` / `GetSecret()` return `null` for missing secrets (no exceptions)
- `EnvilderClient.ResolveSecretsAsync()` / `ResolveSecrets()` silently omit missing secrets
- `SecretValidationExtensions.ValidateSecrets()` — opt-in post-resolution validation
- Cross-provider validation: profile + Azure → error, vaultUrl + AWS → error

**Tests** (`tests/sdks/dotnet/`): xUnit + NSubstitute + AwesomeAssertions.
Acceptance tests use TestContainers (LocalStack for AWS, Lowkey Vault for Azure).
Naming: `Should_<Expected>_When_<Condition>`. AAA pattern with comment markers.

**Build & test**:

- `dotnet build src/sdks/dotnet/Envilder.sln`
- `dotnet test tests/sdks/dotnet/` (requires Docker for acceptance tests)
- `dotnet format src/sdks/dotnet/Envilder.sln --verify-no-changes` (formatting check)

### Python SDK (`src/sdks/python/`)

**Architecture**: Layered (Domain → Application → Infrastructure), no DI framework.

- **Domain** (`domain/`): `ISecretProvider` Protocol, `MapFileConfig`, `EnvilderOptions`, `ParsedMapFile` dataclasses, `SecretProviderType` enum
- **Application** (`application/`):
  - `Envilder` (facade) — Primary entry point: `load(path)`, `resolve_file(path)`, `from_map_file(path)` fluent builder, plus env-routing overloads `load(env, mapping)` / `resolve_file(env, mapping)`
  - `EnvilderClient` — Core resolver (`resolve_secrets(map_file)` + `inject_into_environment(secrets)` static method sets `os.environ`)
  - `MapFileParser` — Parses `$config` + variable mappings from JSON
  - `secret_validation` — `validate_secrets(dict)` raises `SecretValidationError` for empty/missing values
- **Infrastructure** (`infrastructure/`): `_SecretProviderFactory` (private by convention, not exported in `__all__`), `AwsSsmSecretProvider` (boto3), `AzureKeyVaultSecretProvider`

**Key patterns**:

- Synchronous API — uses `boto3` natively (no async/await)
- Protocol-based ports — Python `Protocol` instead of ABC
- `_SecretProviderFactory` is internal — consumers use the `Envilder` facade
- `Envilder` facade is the primary public API (fluent: `from_map_file().with_provider().with_vault_url().inject()`)
- `ISecretProvider.get_secret()` returns `None` for missing secrets (no exceptions)
- `EnvilderClient.resolve_secrets()` silently omits missing secrets
- `validate_secrets()` — opt-in post-resolution validation
- Cross-provider validation: profile + Azure → error, vault_url + AWS → error

**Tests** (`tests/sdks/python/`): pytest with `Should_<Expected>_When_<Condition>` naming.
Container wrappers follow xxtemplatexx pattern with explicit `start()`/`stop()` lifecycle.
Acceptance tests use TestContainers (LocalStack for AWS, Lowkey Vault for Azure).
AAA pattern with comment markers.

**Build & test** (via Makefile, uses `uv run` with project-local `.venv`):

- `make install-sdk-python` (creates `.venv` and syncs all deps via `uv sync`)
- `make check-sdk-python` (black + isort + mypy strict)
- `make format-sdk-python` (auto-format)
- `make test-sdk-python` (all tests, requires Docker for acceptance)

### TypeScript SDK (`src/sdks/typescript/`)

**Architecture**: Layered (Domain → Application → Infrastructure), no DI framework.

- **Domain** (`src/domain/`): `ISecretProvider` interface (async `getSecrets` batch method), `MapFileConfig`, `EnvilderOptions`, `ParsedMapFile` types, `SecretProviderType` enum
- **Application** (`src/application/`):
  - `Envilder` — Async facade (`load`, `resolveFile`, `fromMapFile` + env-routing overloads)
  - `EnvilderClient` — Core resolver (`resolveSecrets`, `injectIntoEnvironment` static method sets `process.env`)
  - `MapFileParser` — Parses `$config` + variable mappings from JSON
  - `validateSecrets` — Opt-in validation throws `SecretValidationError` for empty/missing values
- **Infrastructure** (`src/infrastructure/`):
  - `createSecretProvider` (not re-exported from barrel) — Creates provider from `MapFileConfig` + optional `EnvilderOptions` overrides
  - `AwsSsmSecretProvider` — `GetParametersCommand` (batch, up to 10 per request) with `WithDecryption: true`, missing parameters silently omitted via `InvalidParameters`
  - `AzureKeyVaultSecretProvider` — `Promise.all` over `SecretClient.getSecret()` calls, catches 404 → omitted

**Key patterns**:

- Async-first — all provider and facade methods return `Promise`
- Interface-based ports — TypeScript `interface` for `ISecretProvider`
- `createSecretProvider` is internal — consumers use the `Envilder` facade
- `Envilder` facade is the primary public API (fluent: `fromMapFile().withProvider().withVaultUrl().inject()`)
- `ISecretProvider.getSecrets(names[])` returns `Map<string, string>` — missing secrets silently omitted
- `EnvilderClient.resolveSecrets()` delegates to `getSecrets()` in a single call
- `validateSecrets()` — opt-in post-resolution validation
- Cross-provider validation: profile + Azure → error, vaultUrl + AWS → error
- `Map<string, string>` used for mappings and resolved secrets

**Tests** (`tests/sdks/typescript/`): Vitest with `Should_<Expected>_When_<Condition>` naming.
AAA pattern with comment markers. `vi.fn()` for mocks.

**Build & test**:

- `cd src/sdks/typescript && pnpm build` (TypeScript compilation)
- `cd tests/sdks/typescript && pnpm vitest run --reporter=verbose` (unit tests)
